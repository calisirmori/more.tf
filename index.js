const express = require('express');
const app = express();

const cors = require('cors');
const AdmZip = require('adm-zip');
const logstfApiOrganizer = require('./src/logstfApiOrganizer')
const { summaryObject } = require('./summary');
const seasonSummary = require('./src/seasonSummary.js');
const path = require('path');
const { fetch, FetchResultTypes } = require('@sapphire/fetch');


app.use(express.json());
app.use(cors());

//this is used to create seasonal summary text files
//console.log( seasonSummary.makeSummary())

app.get('/api/season-13-summary', (req, result) => {
  result.json(summaryObject);
});

app.get('/logsplus/:id', async (req, res) => {
  const matchId = req.params.id;
  const logsApiResponse = await fetch(`https://logs.tf/api/v1/log/${matchId}`, FetchResultTypes.JSON);

  const buffer = await fetch(`http://logs.tf/logs/log_${matchId}.log.zip`, FetchResultTypes.Buffer);

  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();
  const textFile = zipEntries[0].getData().toString();

  res.json(await logstfApiOrganizer.organize(logsApiResponse, textFile, matchId));
});

app.use(express.static(path.join(__dirname, "/client/build")));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

