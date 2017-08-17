var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

app.post('/listUsers', function (req, res) {
   fs.readFile( __dirname + "/" + "tweets_20.json", 'utf8', function (err, data) {
       //console.log( data );
       res.end( data );
   });
})

app.post('/getTweetsRelations', function (req, res) {
   var nodes = req.body.nodes;
   fs.readFile( __dirname + "/" + "tweets_" + nodes + ".json", 'utf8', function (err, data) {
       //console.log( data );
       res.end( data );
   });
})

app.get('/d3/d3.min.js', function (req, res) {
   fs.readFile( __dirname + "/" + "d3/d3.min.js", 'utf8', function (err, data) {
       //console.log( data );
       res.end( data );
   });
})
app.get('/jquery/jquery-1.10.2.min.js', function (req, res) {
   fs.readFile( __dirname + "/" + "jquery/jquery-1.10.2.min.js", 'utf8', function (err, data) {
       //console.log( data );
       res.end( data );
   });
})
app.get('/controller.js', function (req, res) {
   fs.readFile( __dirname + "/" + "controller.js", 'utf8', function (err, data) {
       //console.log( data );
       res.end( data );
   });
})
app.get('/style.css', function (req, res) {
   fs.readFile( __dirname + "/" + "style.css", 'utf8', function (err, data) {
       //console.log( data );
       res.writeHead(200, {'Content-Type': 'text/css'});
       res.end( data );
   });
})

app.get('/', function (req, res) {
   fs.readFile( __dirname + "/index.html", 'utf8', function (err, data) {
       //console.log( data );
       res.writeHead(200, {'Content-Type': 'text/html'});
       res.end( data );
   });
})
http.createServer(app).listen(8080);