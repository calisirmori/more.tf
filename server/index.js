const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require("http");
const AdmZip = require('adm-zip');
const logstfApiOrganizer = require('./src/logstfApiOrganizer')
const axios = require('axios');

app.use(express.json());
app.use(cors());

app.get('/logsplus/:id', async (req, result, next) => {

  const matchId = req.params.id;
  let logsApiResponse = await axios.get(`https://logs.tf/api/v1/log/${matchId}`);

  http.get(`http://logs.tf/logs/log_${matchId}.log.zip`, function(res) {
    let data = [], dataLen = 0; 
    
    res.on('data', function(chunk) {

      data.push(chunk);
      dataLen += chunk.length;
  
    }).on('end', async function() {

      let buf = Buffer.alloc(dataLen);
  
      for (let i = 0, len = data.length, pos = 0; i < len; i++) { 
        data[i].copy(buf, pos); 
        pos += data[i].length; 
      } 

      let zip = new AdmZip(buf);
      let zipEntries = zip.getEntries();
      let textFile = zipEntries[0].getData().toString();

      result.json(await logstfApiOrganizer.organize(logsApiResponse,textFile,matchId));

    });
  });
});

app.listen(8080, () => console.log('Server is running on : 8080'));

