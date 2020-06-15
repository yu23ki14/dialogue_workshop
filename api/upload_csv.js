const express = require('express');
const app = express();
const axios = require('axios');
const multer = require('multer');
const csvtojson = require('csvtojson')
const fs = require('fs');
var upload = multer({ dest: 'tmp' }).single('file');

app.post("/", (req, res) => {
  upload(req, res, (err) => {
    if(err) {
      res.send("Failed to write " + req.file.destination + " with " + err)
    } else {
      const name = req.body.name
      const shuffle = req.body.shuffle
      const filePath = req.file.path
      const Fshuffle = ([...array]) => {
        for (let i = array.length - 1; i >= 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }
      csvtojson().fromFile(filePath).then((jsonObj)=>{
        let i = 0
        if (shuffle == 'true') {
          jsonObj = Fshuffle(jsonObj)
        }
        const cpath = __dirname.slice(0, -3) + 'client/project_json/cluster_' + name + '.json'
        const spath = __dirname.slice(0, -3) + 'client/project_json/seed_' + name + '.json'
        const clusters = JSON.stringify([])
        const seeds = JSON.stringify(jsonObj)

        fs.writeFile(cpath, clusters, function (err) {
          if (err) {
            res.send(err)
          }
        })
      
        fs.writeFile(spath, seeds, function (err) {
          if (err) {
            res.send(err)
          }
        })
        
        fs.unlink(filePath, () => {
          res.send("ok")
        })
      })
    }
  });
})

module.exports = {
path: "/api/upload_csv",
handler: app
};