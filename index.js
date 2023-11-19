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

//makeSummary();
//rglAPIcalls()
require('dotenv').config();
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
    res.redirect(`/`)
    console.log(error);
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
      from (SELECT *, 
              (cbt + eff + eva + imp + spt + srv) / 6.0 AS avg_score
            FROM player_card_info
            WHERE seasonid = 16 AND format = 'HL'
            ORDER BY avg_score DESC) as T1
      inner join player_rgl_info pri on T1.id64=pri.id64`;

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
    const queryText = 'SELECT * FROM player_card_info WHERE id64 = $1';

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

app.get('/api/season-summary', (req, response) => {
  pool.query(`select *
  from
      (select id64,teamname,teamid,name
      from player_rgl_info ) as playerinfo
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
      sum(playtime) as time
      from season_combined sc 
      where seasonid=16
      group by id64,classid,division
      order by classid,division) as weekinfo
  on
      playerinfo.id64=weekinfo.id64`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

app.get('/api/lastweek-season-summary', (req, response) => {
  pool.query(`select *
  from
      (select id64,teamname,teamid,name
      from player_rgl_info ) as playerinfo
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
      sum(playtime) as time
      from season_combined sc 
      where seasonid=16
      and week_num!= (select max(week_num) from season_combined sc)
      group by id64,classid,division
      order by classid,division) as weekinfo
      on
      playerinfo.id64=weekinfo.id64`)
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
  SELECT id64, name, count
  FROM ranked_names
  WHERE rn = 1
  order by count desc
  LIMIT 5`)
    .then((res) => response.send(res))
    .catch((err) => console.error(err))
});

// app.get('/api/peers-search/:id', (req, response) => {
//   let playerId = req.params.id;

//   pool.query(`select id64,Count(id64) as count,
//   COUNT(T1.match_result) filter (where T1.match_result='W') as W,
//   COUNT(T1.match_result) filter (where T1.match_result='L') as L,
//   COUNT(T1.match_result) filter (where T1.match_result='T') as T
//   from (Select logid,match_result,team from players where id64=${playerId}) as T1
//   inner join players on T1.logid=players.logid and T1.team=players.team
//   where id64<>${playerId}
//   group by id64
//   order by count desc
//   limit 5`)
//     .then((res) => response.send(res))
//     .catch((err) => console.error(err))
// });

app.get('/api/peers-search/:id', (req, response) => {
  let playerId = req.params.id;

  pool.query(` select * from peer_table pt where main_id64=${playerId}`)
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

async function SteamAPICall(req,res, maxRetries = 10, attemptNumber = 1){
  
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
      res.status(500).send("steam error");
    } else {
      const delayInSeconds = Math.pow(1.2, attemptNumber);
      const variance = 0.2; // 20% variance (10% in either direction)
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

app.get("/api/log/:id", async (req, res) => {
  let matchId = req.params.id;
  matchId = parseInt(matchId);

  if (isNaN(parseInt(matchId, 10)) || matchId > Number.MAX_SAFE_INTEGER) {
    return res
      .status(400)
      .json({ errorCode: 400, message: "Bad logs ID", error: "Bad Request" });
  }

  try {
    const logsApiResponse = await fetch(
      `https://logs.tf/api/v1/log/${matchId}`,
      FetchResultTypes.JSON
    );
    const buffer = await fetch(
      `http://logs.tf/logs/log_${matchId}.log.zip`,
      FetchResultTypes.Buffer
    );

    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const textFile = zipEntries[0].getData().toString();

    res.json(
      await parser.parse(textFile, matchId, logsApiResponse)
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorCode: 500, message: "Internal Server Error" });
  }
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
