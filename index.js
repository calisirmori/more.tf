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
 returnURL: 'https://dev.more.tf/api/auth/steam/return',
 realm: 'https://dev.more.tf',
 apiKey: `${process.env.STEAMKEY || "18D6B8C4F205B3A1BD6608A68EC83C3F"}`
 }, function (identifier, profile, done) {
  process.nextTick(function () {
   profile.identifier = identifier;
   return done(null, profile);
  });
 }
));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Steam login 
app.get('/api/steam', (req, res) => {
 res.send(req.user);
});

app.get('/api/auth/steam', passport.authenticate('steam', {failureRedirect: '/api/steam'}), function (req, res) {
 res.redirect('/api/steam')
});

app.get('/api/auth/steam/return', passport.authenticate('steam', {failureRedirect: '/api/steam'}), function (req, res) {
  res.cookie('userid', res.req.user.id , { maxAge: 900000, httpOnly: true });
  res.redirect(`/profile/${res.req.user.id}`)
});

app.get('/api/myprofile', (req, res) => {
  if (req.cookies.userid !== undefined){
    res.redirect(`/profile/${req.cookies.userid}`)
  } else {
    res.redirect(`/api/auth/steam`)
  }
});

const pool = new Pool({
  username: process.env.PGUSER || "mori",
  password: process.env.PGPASSWORD || "AVNS_Mgjn3GVV2dUH2ho46Nn",
  host: process.env.PGHOST || "moretf-db-do-user-13704767-0.b.db.ondigitalocean.com",
  port: process.env.PGPORT || "25060",
  database: process.env.PGDATABASE || "preload-db",
  ssl: {
    ca: fs.readFileSync("./ca-certificate.crt")
  },
})

// makeSummary();
// rglAPIcalls();

app.get('/api/calendar/:id', (req, response) => {
  let playerId = req.params.id;
  pool.query(`select date from logs
  left join players on players.logid=logs.logid where id64=${playerId}
  order by logs.date desc`)
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
  pool.query(`select class,
  Avg(dpm) as dpm,
  sum(match_length) as time,
  COUNT(match_result) filter (where match_result='W') as W,
  COUNT(match_result) filter (where match_result='L') as L,
  COUNT(match_result) filter (where match_result='T') as T
  From ((Select dpm,logid,match_result,class FROM players where id64=${playerId}) AS T1
  left JOIN (SELECT match_length,logid,date FROM logs where date >0) AS T2
  On t1.logid=t2.logid)
  group by class
  order by time desc`)
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
  pool.query(`SELECT id64,count(id64) as count FROM players WHERE name like'%${playerUserName}%' GROUP BY id64 Order BY count DESC`)
  .then((res) => response.send(res))
  .catch((err) => console.error(err))
});

app.get('/api/peers-search/:id', (req, response) => {
  let playerId = req.params.id;
  
  pool.query(`select id64,Count(id64) as count,
  COUNT(match_result) filter (where match_result='W') as W,
  COUNT(match_result) filter (where match_result='L') as L,
  COUNT(match_result) filter (where match_result='T') as T
  From ((Select logid,match_result,team from players where id64=${playerId}) AS T1
  LEFT JOIN (Select logid,id64,team from players where id64!=${playerId}) AS T2
  On t1.logid=t2.logid and t1.team=t2.team
  Right JOIN (SELECT date,logid FROM logs where date >0) AS T3
  On t1.logid=t3.logid)
  group by id64
  order by count desc`)

  .then((res) => response.send(res))
  .catch((err) => console.error(err))
});

app.get('/api/match-history/:id&class-played=:classPlayed&map=:map&after=:after&format=:format&order=:order&limit=:limit', (req, response) => {

  const playerId = req.params.id;
  const classSearched = req.params.classPlayed === "none" ? "class" : "'" + req.params.classPlayed + "'" ;
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




app.get('/api/steam-info/:id', async(req, res) => {
  const userId = req.params.id;
  var URL = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAMKEY || "18D6B8C4F205B3A1BD6608A68EC83C3F"}&steamids=${userId}`;

  try {
    const logsApiResponse = await fetch(
      URL,
      FetchResultTypes.JSON
    );
    res.send(logsApiResponse);
  } catch (error) {
    res.send("steam error")
  }
  
});

app.get('/api/rgl-profile/:id', async(req, res) => {
  const userId = req.params.id;
  var URL = `https://api.rgl.gg/v0/profile/${userId}`;

  const logsApiResponse = await fetch(
    URL,
    FetchResultTypes.JSON
  );
  res.send(logsApiResponse);
})

app.post('/api/rgl-profile-bulk', async(req, res) => {
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
    `Express server listening on port ${this.address().port} in ${
      app.settings.env
    } mode`
  );
});