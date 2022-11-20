const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require("http");
const AdmZip = require('adm-zip');
const inputToJson = require('./inputToJson');
const PlayerDamageParser = require('./src/PlayerDamageParser');
const logstfApiOrganizer = require('./src/logstfApiOrganizer')
const axios = require('axios');

app.use(express.json());
app.use(cors());

let matchId = 3304362;

async function logstfCalls(){
  let logsApiResponse = await axios.get(`https://logs.tf/api/v1/log/${matchId}`);
  
  

  http.get(`http://logs.tf/logs/log_${matchId}.log.zip`, function(res) {
    var data = [], dataLen = 0; 
    
    res.on('data', function(chunk) {

      data.push(chunk);
      dataLen += chunk.length;
  
    }).on('end', function() {

      var buf = Buffer.alloc(dataLen);
      
      for (var i = 0, len = data.length, pos = 0; i < len; i++) { 
        data[i].copy(buf, pos); 
        pos += data[i].length; 
      } 

      var zip = new AdmZip(buf);
      var zipEntries = zip.getEntries();

      var textFile = zipEntries[0].getData().toString();
      //console.log(inputToJson.stringToObject(textFile));
      //console.log(PlayerDamageParser.damageParser(textFile))
      console.log(logstfApiOrganizer.organize(logsApiResponse,textFile,matchId))
    });
  });
}

logstfCalls();


app.get('/logsplus/:id', (req, result, next) => {
  const matchId = req.params.id;
  matchId = 3306523;
  const url = `http://logs.tf/logs/log_${matchId}.log.zip`

  http.get(url, function(res) {
    var data = [], dataLen = 0; 
    
    res.on('data', function(chunk) {

      data.push(chunk);
      dataLen += chunk.length;
  
    }).on('end', function() {

      var buf = Buffer.alloc(dataLen);
  
      for (var i = 0, len = data.length, pos = 0; i < len; i++) { 
        data[i].copy(buf, pos); 
        pos += data[i].length; 
      } 

      var zip = new AdmZip(buf);
      var zipEntries = zip.getEntries();

      var textFile = zipEntries[0].getData().toString();
      console.log(inputToJson.stringToObject(textFile));
      result.json(inputToJson.stringToObject(textFile));
    });
  });
});

app.listen(8080, () => console.log('Server is running on : 8080'));