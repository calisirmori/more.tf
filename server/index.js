const express = require('express');
const app = express();

const cors = require('cors');
const http = require("http");
const AdmZip = require('adm-zip');
const logstfApiOrganizer = require('./src/logstfApiOrganizer')
const axios = require('axios');
const { summaryObject } = require('./summary');
const seasonSummary = require('./src/seasonSummary.js');


app.use(express.json());
app.use(cors());

//this is used to create seasonal summary text files
//console.log( seasonSummary.makeSummary())

app.get('/api/season-13-summary',(req,result) => {
  result.json(summaryObject);
});

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

app.use(express.static(path.join(__dirname, "/client/build")));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

