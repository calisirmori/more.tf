const express = require("express");
const app = express();

const cors = require("cors");
const AdmZip = require("adm-zip");
const logstfApiOrganizer = require("./src/logstfApiOrganizer");
const { summaryObject } = require("./summary");
const seasonSummary = require("./src/seasonSummary.js");
const path = require("path");
const { fetch, FetchResultTypes } = require("@sapphire/fetch");

app.use(express.json());
app.use(cors());

//this is used to create seasonal summary text files
//console.log( seasonSummary.makeSummary())

app.get("/api/season-13-summary", (_, result) => {
  result.json(summaryObject);
});

app.get("/logsplus/:id", async (req, res) => {
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

app.listen(process.env.PORT || 3000, function () {
  console.info(
    `Express server listening on port ${this.address().port} in ${
      app.settings.env
    } mode`
  );
});
