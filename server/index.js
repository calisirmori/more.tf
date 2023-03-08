const express = require("express");
const app = express();
const cors = require("cors");
const AdmZip = require("adm-zip");
const path = require("path");
const { fetch, FetchResultTypes, FetchMethods } = require("@sapphire/fetch");
const parser = require("./parser/main.js");

const passport = require('passport');
const session = require('express-session');
const passportSteam = require('passport-steam');
const SteamStrategy = passportSteam.Strategy;
const fs = require('fs');
const Pool = require('pg').Pool

app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'Whatever_You_Want',
  saveUninitialized: true,
  resave: false,
  cookie: {
   maxAge: 3600000
  }
 }))
app.use(passport.initialize());
app.use(passport.session());

 // Required to get data from user for sessions
passport.serializeUser((user, done) => {
  done(null, user);
 });
 passport.deserializeUser((user, done) => {
  done(null, user);
 });

passport.use(new SteamStrategy({
 returnURL: 'http://localhost:' + 8082 + '/api/auth/steam/return',
 realm: 'http://localhost:' + 8082 + '/',
 apiKey: '18D6B8C4F205B3A1BD6608A68EC83C3F'
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
app.get('/', (req, res) => {
 res.send(req.user);
});
app.get('/api/auth/steam', passport.authenticate('steam', {failureRedirect: '/'}), function (req, res) {
 res.redirect('/')
});
app.get('/api/auth/steam/return', passport.authenticate('steam', {failureRedirect: '/'}), function (req, res) {
 res.redirect('/')
});

const pool = new Pool({
  username: 'mori',
  password: 'AVNS_Mgjn3GVV2dUH2ho46Nn',
  host: 'moretf-db-do-user-13704767-0.b.db.ondigitalocean.com',
  port: 25060,
  database: 'preload-db',
  ssl: {
    ca: fs.readFileSync("C:\\Users\\mori\\Documents\\GitHub\\more.tf\\server\\ca-certificate.crt")
  },
})

app.get('/api/players/:id', (req, response) => {
  let playerId = req.params.id;

  pool.query(`SELECT * FROM Players WHERE id64=${playerId}`)
  .then((res) => response.send(res))
  .catch((err) => console.error(err))
})

app.get('/api/steam-info/:id', async(req, res) => {
  const userId = req.params.id;
  var URL = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=18D6B8C4F205B3A1BD6608A68EC83C3F&steamids=${userId}`;

  const logsApiResponse = await fetch(
    URL,
    FetchResultTypes.JSON
  );

  res.send(logsApiResponse);
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
  console.log(req)
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

app.listen(process.env.PORT || 8082, function () {
  console.info(
    `Express server listening on port ${this.address().port} in ${
      app.settings.env
    } mode`
  );
});