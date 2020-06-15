const express = require("express");
const app = express();
const bodyParser = require('body-parser')
const fs = require('fs')

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())

app.post("/", function(req, res) {
  const cpath = __dirname.slice(0, -3) + 'client/project_json/cluster_' + req.body.name + '.json'
  const spath = __dirname.slice(0, -3) + 'client/project_json/seed_' + req.body.name + '.json'
  const clusters = JSON.stringify(req.body.clusters)
  const seeds = JSON.stringify(req.body.seeds)

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

  res.send("Hello");
});

module.exports = {
path: "/api/save_data",
handler: app
};