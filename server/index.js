const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require("http");
const AdmZip = require('adm-zip');
const inputToJson = require('./inputToJson');

app.use(express.json());
app.use(cors());

var file_url = 'http://logs.tf/logs/log_3302577.log.zip';

// http.get(file_url, function(res) {
//   var data = [], dataLen = 0; 

//   res.on('data', function(chunk) {
//     data.push(chunk);
//     dataLen += chunk.length;

//   }).on('end', function() {
//     var buf = Buffer.alloc(dataLen);

//     for (var i = 0, len = data.length, pos = 0; i < len; i++) { 
//       data[i].copy(buf, pos); 
//       pos += data[i].length; 
//     } 

//     var zip = new AdmZip(buf);
//     var zipEntries = zip.getEntries();

//     for (var i = 0; i < zipEntries.length; i++) {
//       var textFile = zipEntries[i].getData().toString();
//       console.log(inputToJson.stringToObject(textFile));
//       if (zipEntries[i].entryName.match(/readme/))
//         console.log(zip.readAsText(zipEntries[i]));
//     }

//   });
// });
app.get('/', (req, res, next) => {
  res.json("lmao")
});
app.get('/logsplus/:id', (req, result, next) => {
  const matchId = req.params.id;
  const url = `http://logs.tf/logs/log_${matchId}.log.zip`
  var output = {};
  http.get(file_url, function(res) {
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
  
      for (var i = 0; i < zipEntries.length; i++) {
        var textFile = zipEntries[i].getData().toString();
        
        result.json(inputToJson.stringToObject(textFile));
        console.log(output)
        if (zipEntries[i].entryName.match(/readme/))
          console.log(zip.readAsText(zipEntries[i]));
      }
  
    });
  });
  
});

app.listen(8080, () => console.log('Server is running on : 8080'));