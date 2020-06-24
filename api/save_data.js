const express = require("express");
const app = express();
//const bodyParser = require('body-parser')
const AWS = require('aws-sdk')

AWS.config.update({
  "accessKeyId": process.env.ACESSKEYID,
  "secretAccessKey": process.env.SECRETACCESSKEY,
  "region": "ap-northeast-1"
})

//app.use(bodyParser.urlencoded({
//  extended: true
//}));
//app.use(bodyParser.json())

app.get("/presined", async (req, res) => {
  const s3 = new AWS.S3({
    signatureVersion: 'v4'
  })
  const params = {
    Bucket: 'clustra',
    Key: req.query.project_name +'/' + req.query.file_name,
    Expires: 60
  }
  const uploadUrl = await s3.getSignedUrl('putObject', params);
  res.send(uploadUrl)
});

module.exports = {
path: "/api/save_data",
handler: app
};