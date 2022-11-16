const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
var http = require("http"),
    zlib = require("zlib");
var yauzl = require("yauzl");
var request = require('request');

app.use(express.json());
app.use(cors());

var file_url = 'http://logs.tf/logs/log_3303850.log.zip';

var AdmZip = require('adm-zip');
var request = require('request');


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
    console.log(zipEntries.length)

    for (var i = 0; i < zipEntries.length; i++) {
      console.log(zipEntries[i].getData().toString())
      if (zipEntries[i].entryName.match(/readme/))
        console.log(zip.readAsText(zipEntries[i]));
    }
  });
});

app.listen(8080, () => console.log('Server is running on : 8080'));