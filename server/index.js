const express = require("express");
const app = express();
const cors = require("cors");
const AdmZip = require("adm-zip");
const path = require("path");
const { fetch, FetchResultTypes } = require("@sapphire/fetch");
const parser = require("./parser/main.js");

async function testCall(logId){
  try {
    const buffer = await fetch(
      `http://logs.tf/logs/log_${logId}.log.zip`,
      FetchResultTypes.Buffer
    );

    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const textFile = zipEntries[0].getData().toString();

    console.log(parser.parse(textFile));

  } catch (error) {
    console.error(error);
    res.status(500).json({ errorCode: 500, message: "Internal Server Error" });
  }
}

for (let index = 0; index < 1; index++) {
  testCall(3353745);
}


app.use(express.json());
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
  var URL = ` https://api.rgl.gg/v0/profile/${userId}`;

  const logsApiResponse = await fetch(
    URL,
    FetchResultTypes.JSON
  );
  res.send(logsApiResponse);
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
      await logstfApiOrganizer.organize(logsApiResponse, textFile, matchId)
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

app.listen(process.env.PORT || 8080, function () {
  console.info(
    `Express server listening on port ${this.address().port} in ${
      app.settings.env
    } mode`
  );
});