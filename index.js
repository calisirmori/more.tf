const express = require("express");
const app = express();
const cors = require("cors");
const AdmZip = require("adm-zip");
const path = require("path");
const { fetch, FetchResultTypes, FetchMethods } = require("@sapphire/fetch");
const parser = require("./parser/main.js");
const crypto = require("crypto");
const passport = require('passport');
const session = require('express-session');
const passportSteam = require('passport-steam');
const SteamStrategy = passportSteam.Strategy;
const fs = require('fs');
const { makeSummary, rglAPIcalls } = require("./seasonSummaryMaker.js");
const Pool = require('pg').Pool
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");

require('dotenv').config();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'Whatever_You_Want',
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 31556952000
  }
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
// Required to get data from user for sessions
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new SteamStrategy({
  returnURL: 'https://more.tf/api/auth/steam/return',
  realm: 'https://more.tf',
  apiKey: `${process.env.STEAMKEY}`
}, function (identifier, profile, done) {
  process.nextTick(function () {
    profile.identifier = identifier;
    return done(null, profile);
  });
}
));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Steam login 
app.get('/api/steam', (req, res) => {
  res.send(req.user);
});

app.get('/api/auth/steam', passport.authenticate('steam', { failureRedirect: '/api/steam' }), function (req, res) {
  res.redirect('/api/steam')
});

app.get('/api/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/api/steam' }), function (req, res) {
  try {
    res.cookie('userid', res.req.user.id, { 
      maxAge: 31556952000, // 1 year
      httpOnly: false,
      secure: true, // set to true if serving over https
      SameSite: 'None' // can be set to 'Lax' or 'Strict' as per requirement
    });
    console.log(res.req.user);
    res.redirect(`/profile/${res.req.user.id}`)
  } catch (error) {
    console.log(error);
    res.redirect(`/`)
  }
});

app.get('/api/myprofile', (req, res) => {
  if (req.cookies.userid !== undefined) {
    res.redirect(`/profile/${req.cookies.userid}`)
  } else {
    res.redirect(`/api/auth/steam`)
  }
});

const pool = new Pool({
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: {
    ca: fs.readFileSync("./ca-certificate.crt")
  },
})

// makeSummary();
// rglAPIcalls();

app.get('/api/activity/:id', (req, response) => {
  let playerId = req.params.id;
  pool.query(`select date from logs
  left join players on players.logid=logs.logid where id64=${playerId}
  order by logs.date desc`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/calendar/:id', (req, response) => {
  let playerId = req.params.id;
  pool.query(`
  WITH DateSeries AS (
    SELECT generate_series(
      DATE '2018-01-01', 
      CURRENT_DATE, 
      '1 day'
    ) AS match_date
  ),
  MatchStats AS (
    SELECT 
      DATE(to_timestamp(logs.date)) AS match_date,
      COUNT(*) AS matches_per_day,
      SUM(CASE WHEN players >= 11 AND players <= 15 THEN 1 ELSE 0 END) AS sixes_matches,
      SUM(CASE WHEN players >= 16 AND players <= 21 THEN 1 ELSE 0 END) AS highlander_matches,
      SUM(CASE WHEN players < 11 OR players > 21 THEN 1 ELSE 0 END) AS other_matches,
      COUNT(CASE WHEN match_result = 'W' THEN 1 ELSE 0 END) AS wins,
      COUNT(CASE WHEN match_result = 'L' THEN 1 ELSE 0 END) AS losses
    FROM 
      logs
    JOIN players ON logs.logid = players.logid 
    WHERE 
      players.id64 = ${playerId} AND
      logs.date >= EXTRACT(EPOCH FROM DATE '2018-01-01')::INT
    GROUP BY 
      match_date
  ),
  MaxMatchCount AS (
    SELECT 
      MAX(matches_per_day) AS max_matches
    FROM 
      MatchStats
  )
  SELECT 
    ds.match_date,
    CASE
      WHEN EXTRACT(DOW FROM ds.match_date) = 0 THEN 7
      ELSE EXTRACT(DOW FROM ds.match_date)
    END AS day_of_week_numeric,
    COALESCE(ms.matches_per_day, 0) AS matches_per_day,
    COALESCE(ms.sixes_matches, 0) AS sixes_matches,
    COALESCE(ms.highlander_matches, 0) AS highlander_matches,
    COALESCE(ms.other_matches, 0) AS other_matches,
    COALESCE(ms.wins, 0) AS wins,
    COALESCE(ms.losses, 0) AS losses,
    mmc.max_matches,
    COALESCE(((ms.matches_per_day::FLOAT / GREATEST(mmc.max_matches, 1)) * 100)::NUMERIC(5, 2), 0) AS percentage_of_max
  FROM 
    DateSeries ds
  LEFT JOIN MatchStats ms ON ds.match_date = ms.match_date
  CROSS JOIN MaxMatchCount mmc
  ORDER BY 
    ds.match_date;
  
  `)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/findcookie/:id', (req, response) => {
  let playerId = req.params.id;
  pool.query(`select steamid from cookies where uuid="${playerId}"`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/officials', (req, response) => {
  pool.query(`select matchid,matches.seasonid,team1.region,team1.league,matches.division,team1,team1.teamname as team1_name,team1.teamtag as team1_tag ,team2,team2.teamname as team2_name,team2.teamtag as team2_tag,day_played,isforfeit,team1.format,match_name,map2,map3,map1
    from matches
    JOIN teams AS team1 ON matches.team1 = team1.teamid
    JOIN teams AS team2 ON matches.team2 = team2.teamid
    ORDER BY day_played`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/per-class-stats/:id', (req, response) => {
  let playerId = req.params.id;
  pool.query(`SELECT class,
  Avg(dpm) as dpm,
  COALESCE(sum(match_length), 0) as time,
  COUNT(match_result) filter (WHERE match_result = 'W') as W,
  COUNT(match_result) filter (WHERE match_result = 'L') as L,
  COUNT(match_result) filter (WHERE match_result = 'T') as T
  FROM (
    (SELECT dpm, logid, match_result, class FROM players WHERE id64 = ${playerId}) AS T1
    LEFT JOIN (
      SELECT match_length, logid, date FROM logs WHERE date > 0 AND match_length IS NOT NULL
    ) AS T2
    ON T1.logid = T2.logid
  )
  GROUP BY class
  ORDER BY COUNT(match_result) DESC`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/per-format-stats/:id', (req, response) => {
  let playerId = req.params.id;
  pool.query(`select format,
  sum(match_length) as time,
  COUNT(match_result) filter (where match_result='W') as W,
  COUNT(match_result) filter (where match_result='L') as L,
  COUNT(match_result) filter (where match_result='T') as T
  From ((Select logid,match_result,class FROM players where id64=${playerId}) AS T1
  left JOIN (SELECT match_length,logid,date,format FROM logs where date >0) AS T2
  On t1.logid=t2.logid)
  group by format
  order by time desc`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});



app.get('/api/leaderboard-stats', async (req, response) => {
  try {
    const queryText = `
    select *
    FROM
    (SELECT *, 
            (cbt + eff + eva + imp + spt + srv) / 6.0 AS avg_score
        FROM player_card_info
        WHERE seasonid = 147 AND format = 'HL'
        ORDER BY avg_score DESC) as T1
  INNER JOIN
    (SELECT tf2gamers.steamid, teams.teamname, teams.teamid, tf2gamers.rglname
        FROM playerteams
        INNER JOIN tf2gamers ON tf2gamers.steamid = playerteams.steamid
        INNER JOIN teams ON playerteams.teamid = teams.teamid
        WHERE date_left=-1
        AND playerteams.seasonid=147) as playerinfo
  ON T1.id64 = playerinfo.steamid`;

    const result = await pool.query(queryText);

    if (result.rows.length === 0) {
      response.status(404).json({ error: 'Player not found' });
    } else {
      response.json(result.rows);
    }
  } catch (err) {
    console.error(err);
    response.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.get('/api/playercard-stats/:id', async (req, response) => {
  try {
    const playerId = req.params.id;
    const queryText = 'SELECT * FROM player_card_info WHERE id64 = $1 AND seasonid = 147';

    // Use a parameterized query to prevent SQL injection
    const result = await pool.query(queryText, [playerId]);

    // Check if any rows were returned
    if (result.rows.length === 0) {
      response.status(404).json({ error: 'Player not found' });
    } else {
      response.json(result.rows);
    }
  } catch (err) {
    console.error(err);
    response.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.get('/api/per-map-stats/:id', (req, response) => {
  let playerId = req.params.id;
  pool.query(`select map,
  sum(match_length) as time,
  COUNT(match_result) filter (where match_result='W') as W,
  COUNT(match_result) filter (where match_result='L') as L,
  COUNT(match_result) filter (where match_result='T') as T
  From ((Select logid,match_result FROM players where id64=${playerId}) AS T1
  left JOIN (SELECT match_length,logid,date,map FROM logs where date >0) AS T2
  On t1.logid=t2.logid)
  group by map
  order by time desc`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/peers-page/:id', (req, response) => {
  // Extract parameters from the request
  let playerId = req.params.id;
  let playerClass = req.query.class === "none" ? "class" : "'" + req.query.class + "'"; // Parameter for class
  let map = req.query.map === "none" ? "" : req.query.map;         // Parameter for map
  let startDate = req.query.startDate; // Parameter for start date
  let endDate = req.query.endDate === 0 ? "class" : '3000000000';   // Parameter for end date
  let format = req.query.format === "none" ? "format" : "'" + req.query.format + "'";     // Parameter for format

  // The SQL query with placeholders for parameters
  let query = `with enemy_count as (
    SELECT
      players.id64 AS peer_id64,
      COUNT(players.id64) AS count,
      COUNT(T1.match_result) FILTER (WHERE T1.match_result = 'W') AS W,
      COUNT(T1.match_result) FILTER (WHERE T1.match_result = 'L') AS L,
      COUNT(T1.match_result) FILTER (WHERE T1.match_result = 'T') AS T
    FROM (
      SELECT players.id64, players.logid, players.match_result, players.team, players.class, logs."date", logs."map", logs.format
      FROM players
      INNER JOIN logs ON players.logid = logs.logid
      WHERE players.id64 = ${playerId}
      AND players.class = ${playerClass}
      AND logs.map LIKE '%${map}%'
      AND logs."date" > ${startDate}
      AND logs."date" < ${endDate}
      AND logs.format = ${format}
    ) AS T1
    INNER JOIN players ON T1.logid = players.logid AND T1.team <> players.team
    WHERE players.id64 <> T1.id64
    GROUP BY players.id64
    ORDER BY count DESC
  ),
  teamate_count as (
    SELECT
      players.id64 AS peer_id64,
      COUNT(players.id64) AS count,
      COUNT(T1.match_result) FILTER (WHERE T1.match_result = 'W') AS W,
      COUNT(T1.match_result) FILTER (WHERE T1.match_result = 'L') AS L,
      COUNT(T1.match_result) FILTER (WHERE T1.match_result = 'T') AS T
    FROM (
      SELECT players.id64, players.logid, players.match_result, players.team, players.class, logs."date", logs."map", logs.format
      FROM players
      INNER JOIN logs ON players.logid = logs.logid
      WHERE players.id64 = ${playerId}
      AND players.class = ${playerClass}
      AND logs.map LIKE '%${map}%'
      AND logs."date" > ${startDate}
      AND logs."date" < ${endDate}
      AND logs.format = ${format}
    ) AS T1
    INNER JOIN players ON T1.logid = players.logid AND T1.team = players.team
    WHERE players.id64 <> T1.id64
    GROUP BY players.id64
    ORDER BY count DESC
  )
  SELECT
    si.name,
    si.avatar,
    teamate_count.peer_id64,
    teamate_count.count as teamate_count,
    teamate_count.peer_id64,
    enemy_count.peer_id64,
    teamate_count.W as teamate_wins,
    teamate_count.L as teamate_lose,
    teamate_count.T as teamate_tie,
    enemy_count.count as enemy_count,
    enemy_count.W as enemy_wins,
    enemy_count.L as enemy_lose,
    enemy_count.T as enemy_tie
    FROM enemy_count
    full outer JOIN teamate_count ON enemy_count.peer_id64 = teamate_count.peer_id64
    inner  JOIN steam_info si ON si.id64 = teamate_count.peer_id64 or si.id64 = enemy_count.peer_id64
    WHERE
    COALESCE(teamate_count.count, 0) + COALESCE(enemy_count.count, 0) > 5
    ORDER BY
    teamate_count.count DESC
    `;
      console.log(query);
  // Execute the query with parameters
  pool.query(query)
    .then((res) => response.send(res))
    .catch((err) => {
      console.error(err);
      response.status(500).send('Error executing the query');
    });
});


app.get('/api/season-summary/:id', (req, response) => {
  let seasonID = req.params.id;
  pool.query(`WITH rglinfo AS (
    SELECT tf2gamers.steamid, teams.teamname, teams.teamid, tf2gamers.rglname, playerteams.date_joined
    FROM playerteams
    INNER JOIN tf2gamers ON tf2gamers.steamid = playerteams.steamid
    INNER JOIN teams ON playerteams.teamid = teams.teamid
    WHERE teams.seasonid = ${seasonID}
),
week_info AS (
    SELECT id64, division, classid,
           SUM(kills) AS kills,
           SUM(assist) AS assist,
           SUM(deaths) AS deaths,
           SUM(damage) AS dmg,
           SUM(damage_taken) AS dt,
           SUM(headshots) AS hs,
           SUM(backstabs) AS bs,
           SUM(airshots) AS airshots,
           SUM(spy_kills) AS spykills,
           SUM(heals_received) AS hr,
           SUM(bleed_dmg) AS bleed,
           SUM(sentry_dmg) AS sentry_dmg,
           SUM(heals) AS heals,
           SUM(ubers) AS ubers,
           SUM(ubers_dropped) AS drops,
           SUM(crossbows_hit) AS crossbow,
           SUM(playtime) AS time,
           SUM(avg_uber_build) AS avg_uber_build,
           ROUND(AVG(acc), 1) AS acc
    FROM season_combined sc 
    WHERE seasonid = ${seasonID}
    GROUP BY id64, classid, division
)
, playerinfo AS (
    SELECT t1.*
    FROM rglinfo AS t1
    INNER JOIN (
        SELECT steamid, MAX(date_joined) AS max_date_joined
        FROM rglinfo
        GROUP BY steamid
    ) AS t2
    ON t1.steamid = t2.steamid AND t1.date_joined = t2.max_date_joined
)
SELECT playerinfo.*, week_info.*
FROM playerinfo
INNER JOIN week_info
ON playerinfo.steamid::BIGINT = week_info.id64`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/lastweek-season-summary/:id', (req, response) => {
  let seasonID = req.params.id;
  pool.query(`
      select *
  from
      (SELECT tf2gamers.steamid, teams.teamname, teams.teamid, tf2gamers.rglname
FROM playerteams
INNER JOIN tf2gamers ON tf2gamers.steamid = playerteams.steamid
INNER JOIN teams ON playerteams.teamid = teams.teamid
 where date_left=-1
 and playerteams.seasonid=${seasonID}) as playerinfo
  inner join    
      (select id64,division,classid,
      sum(kills) as kills,
      sum(assist) as assist,
      sum(deaths) as deaths,
      sum(damage) as dmg,
      sum(damage_taken) as dt,
      sum(headshots) as hs,
      sum(backstabs) as bs,
      sum(airshots) as airshots,
      sum(spy_kills) as spykills,
      sum(heals_received) as hr,
      sum(bleed_dmg) as bleed,
      sum(sentry_dmg) as sentry_dmg,
      sum(heals) as heals,
      sum(ubers) as ubers,
      sum(ubers_dropped) as drops,
      sum(crossbows_hit) as crossbow,
      sum(playtime) as time,
      sum(avg_uber_build) as avg_uber_build,
      ROUND(avg(acc), 1) as acc
      from season_combined sc 
      where seasonid=${seasonID}
      and week_num!= (select max(week_num) from season_combined sc where seasonid=${seasonID})
      group by id64,classid,division
      order by classid,division) as weekinfo
  on
      playerinfo.steamid::BIGINT=weekinfo.id64`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/current-week/:id', (req, response) => {
  let seasonID = req.params.id;
  pool.query(`select max(week_num) from season_combined sc where seasonid=${seasonID}`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/db-try', (req, response) => {
  let playerId = req.params.id;
  pool.query(`select map,
  sum(match_length) as time,
  COUNT(match_result) filter (where match_result='W') as W,
  COUNT(match_result) filter (where match_result='L') as L,
  COUNT(match_result) filter (where match_result='T') as T
  From ((Select logid,match_result FROM players where id64=${playerId}) AS T1
  left JOIN (SELECT match_length,logid,date,map FROM logs where date >0) AS T2
  On t1.logid=t2.logid)
  group by map
  order by time desc`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/username-search/:username', (req, response) => {
  let playerUserName = req.params.username;
  pool.query(`WITH ranked_names AS (
    SELECT
      id64,
      name,
      count,
      ROW_NUMBER() OVER (PARTITION BY id64 ORDER BY count DESC) AS rn
    FROM name_search
    WHERE name LIKE '%${playerUserName}%' 
  )
  SELECT si.id64,si.avatar,ranked_names.name,si.name, count
  FROM ranked_names
  inner join steam_info si on si.id64=ranked_names.id64 WHERE rn = 1
  order by count desc
  LIMIT 5`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/peers-search/:id', (req, response) => {
  let playerId = req.params.id;

  pool.query(` select * from peer_table pt where main_id64=${playerId} order by count desc`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/enemies-search/:id', (req, response) => {
  let playerId = req.params.id;

  pool.query(` select * from enemy_table pt where main_id64=${playerId} order by count desc`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/log-search/:id', (req, response) => {
  let logID = req.params.id;

  pool.query(`SELECT * FROM logs WHERE logid=${logID}`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/match-history/:id&class-played=:classPlayed&map=:map&after=:after&format=:format&order=:order&limit=:limit', (req, response) => {

  const playerId = req.params.id;
  const classSearched = req.params.classPlayed === "none" ? "class" : "'" + req.params.classPlayed + "'";
  const mapSearched = req.params.map === "none" ? "" : req.params.map;
  const dateAfter = req.params.after === "none" ? "0" : req.params.after;
  const format = req.params.format === "none" ? "format" : "'" + req.params.format + "'";
  const orderBy = req.params.order === "none" ? "date" : req.params.order;
  const limit = req.params.limit === "none" ? "10000" : req.params.limit;

  pool.query(`select * from
  (select id64,kills,assists,deaths,dpm,dtm,heals,map,date,match_length,class,title,match_result,format,logs.logid from logs
  left join players on players.logid=logs.logid) as T1
  where id64=${playerId} and class=${classSearched} and map like '%${mapSearched}%' and date > ${dateAfter} and format=${format}
  order by ${orderBy} desc
  limit ${limit}`)

    .then((res) => response.send(res))
    .catch((err) => console.error(err))

});

app.get('/api/steam-info', async (req, res) => {
    await SteamAPICall(req,res);
});

async function SteamAPICall(req,res, maxRetries = 5, attemptNumber = 1){
  
  const userIds = req.query.ids;

  if (!userIds) {
    return res.status(400).send("No IDs provided");
  }
  const URL = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAMKEY}&steamids=${userIds}`;

  try {
    const logsApiResponse = await fetch(URL, FetchResultTypes.JSON);
    res.send(logsApiResponse);
  } catch (error) {
    if(attemptNumber >= maxRetries){
      console.log(error);
      res.status(500).send("steam error");
    } else {
      const delayInSeconds = Math.pow(1.2, attemptNumber);
      const variance = 0.3; // 20% variance (10% in either direction)
      const randomFactor = 1 - variance / 2 + Math.random() * variance; // This will generate a number between 0.9 and 1.1
      const randomizedDelayInSeconds = delayInSeconds * randomFactor;
      await new Promise((resolve) => setTimeout(resolve, randomizedDelayInSeconds * 1000));
      await SteamAPICall(req,res, maxRetries, attemptNumber + 1)
    }
  }
}

app.get('/api/rgl-profile/:id', async (req, res) => {
  const userId = req.params.id;
  var URL = `https://api.rgl.gg/v0/profile/${userId}`;
  try {
    const logsApiResponse = await fetch(
      URL,
      FetchResultTypes.JSON
    );
    res.send(logsApiResponse);
  } catch (error) {

  }

})

app.post('/api/rgl-profile-bulk', async (req, res) => {
  const rglApiResponse = await fetch(
    "https://api.rgl.gg/v0/profile/getmany",
    {
      method: FetchMethods.Post,
      body: req.body
    },
    FetchResultTypes.JSON
  );
  res.send(rglApiResponse);
})

app.post('/api/upload', (req, res) => {
  // Assuming the request body will have title, map, key, uploader, and optionally updatelog
  const { title, map, key, uploader, updatelog } = req.body;

  // Print the received info to the console
  console.log("Received upload info:");
  console.log("Title:", title);
  console.log("Map:", map);
  console.log("Key:", key);
  console.log("Uploader:", uploader);
  if (updatelog) console.log("Update Log:", updatelog);

  // Respond to the client
  res.json({
    message: "Information received",
    data: req.body
  });
});

app.get("/api/log/:id", async (req, res) => {
  let matchId = req.params.id;
  matchId = parseInt(matchId);

  if (isNaN(matchId) || matchId > Number.MAX_SAFE_INTEGER) {
    return res
      .status(400)
      .json({ errorCode: 400, message: "Bad logs ID", error: "Bad Request" });
  }

  // Check if the log information exists in the logs table
  const logApiExistsQuery = 'SELECT logid, map, title FROM logs WHERE logid = $1';
  const logApiExistsValues = [matchId];

  try {
    // Attempt to get log metadata from your database
    const logApiExistsResult = await pool.query(logApiExistsQuery, logApiExistsValues);
    let logsApiResponse;

    if (logApiExistsResult.rows.length > 0) {
      // Metadata exists in the logs table, use it
      logsApiResponse = logApiExistsResult.rows[0];
    } else {
      // Metadata does not exist in the logs table, fetch from logs.tf API
      const externalApiResponse = await fetch(`https://logs.tf/api/v1/log/${matchId}`);
      logsApiResponse = await externalApiResponse.json();
    }

    // Check if the raw log data exists in your logcache table
    const rawLogExistsQuery = 'SELECT raw_log FROM logcache WHERE logid = $1';
    const rawLogExistsResult = await pool.query(rawLogExistsQuery, logApiExistsValues);

    if (rawLogExistsResult.rows.length > 0) {
      // Raw log data exists, parse and respond
      const rawLogData = rawLogExistsResult.rows[0].raw_log;
      const zip = new AdmZip(rawLogData);
      const zipEntries = zip.getEntries();
      const textFile = zipEntries[0].getData().toString('utf8');
      const parsedData = await parser.parse(textFile, matchId, logsApiResponse);
      return res.json({ ...parsedData, source: 'database' });
    }

    // Raw log data does not exist, fetch the raw logs from logs.tf
    const buffer = await fetch(
      `http://logs.tf/logs/log_${matchId}.log.zip`,
      FetchResultTypes.Buffer
    );
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const textFile = zipEntries[0].getData().toString('utf8');

    const insertDate = Date.now(); // Current timestamp in milliseconds
    const insertQuery = 'INSERT INTO logcache(logid, insert_date, raw_log) VALUES($1, $2, $3)';
    const values = [matchId, insertDate, buffer];
    
    await pool.query(insertQuery, values);

    // Parse the fetched logs and respond
    const parsedData = await parser.parse(textFile, matchId, logsApiResponse);
    return res.json({ ...parsedData, source: 'logs.tf' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ errorCode: 500, message: "Internal Server Error" });
  }
});

//badge

app.post('/api/badges', (req, res) => {
  const { id64, badge_id } = req.body;
  // Ensure id64 and badge_id are not undefined or null
  if (!id64 || !badge_id) {
    return res.status(400).send("Steam ID and Badge ID are required");
  }

  const query = 'INSERT INTO Badges (id64, badge_id) VALUES ($1, $2)';
  const values = [id64, badge_id];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error adding badge');
    }
    res.status(201).send('Badge added successfully');
  });
});

app.put('/api/badges', (req, res) => {
  const { id64, badge_id, new_badge_id } = req.body;
  // Correct the placeholder syntax for PostgreSQL
  const query = 'UPDATE Badges SET badge_id = $1 WHERE id64 = $2 AND badge_id = $3';
  const values = [new_badge_id, id64, badge_id];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error updating badge');
    }
    res.send('Badge updated successfully');
  });
});

app.delete('/api/badges', (req, res) => {
  const { id64, badge_id } = req.body;
  // Correct the placeholder syntax for PostgreSQL
  const query = 'DELETE FROM Badges WHERE id64 = $1 AND badge_id = $2';
  const values = [id64, badge_id];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error removing badge');
    }
    res.send('Badge removed successfully');
  });
});

app.get('/api/badges/user', (req, res) => {
  const { id64 } = req.query;  // Retrieve the Steam ID from the query parameters
  const query = 'SELECT * FROM Badges WHERE id64 = $1';
  const values = [id64];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving badges');
    }
    res.send(result.rows);
  });
});

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "/client/dist", "index.html"));
});

app.listen(port, function () {
  console.info(
    `Express server listening on port ${this.address().port} in ${app.settings.env
    } mode`
  );
});
