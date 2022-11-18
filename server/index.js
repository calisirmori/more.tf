const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require("http");
const AdmZip = require('adm-zip');
const inputToJson = require('./inputToJson');

app.use(express.json());
app.use(cors());

app.get('/logsplus/:id', (req, result, next) => {

  const matchId = req.params.id;
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
      result.json(inputToJson.stringToObject(textFile));

    });
  });
});

app.listen(8080, () => console.log('Server is running on : 8080'));