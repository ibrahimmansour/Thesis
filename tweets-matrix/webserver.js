var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var d3 = require('d3');
var app = express();
var mongo = require('./data/mongo.js');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/getTopWords', (req, res) => {
    var numNodes = parseInt(req.body.numnodes);
    var startDate = req.body.startdate;
    var endDate = req.body.enddate;
    var wordType = req.body.wordtype.map(Number);
    var searchKeyword = req.body.searchkeyword;
    console.log(numNodes);
    console.log(startDate);
    console.log(endDate);
    console.log(wordType);
    console.log(searchKeyword);
    mongo.getTopWords(searchKeyword, numNodes, startDate, endDate, wordType, (tweets, err) => {
        console.log( tweets );
        //tweets = JSON.parse(tweets);
        var matrix = [], nodesdummy = [], nodes = tweets.nodes.slice(0, numNodes), mincount = 0, maxcount = 0, maxrelcount = 0, orders,
            n = nodes.length, invertedindex = {};
        // Compute index per node.
        nodes.forEach(function (node, i) {
            nodesdummy[i] = node.name;
            node.index = i;
            node.cooccurencecount = 0;
            node.similaritycount = 0;
            invertedindex[node.name] = i;
            matrix[i] = d3.range(n).map(function (j) {
                return { x: j, y: i };
            });
            if (node.count < mincount) mincount = node.count;
            if (node.count > maxcount) maxcount = node.count;
        });

        // Convert links to matrix; count character occurrences.
        tweets.links.forEach(function (tweet) {

            if (nodesdummy.includes(tweet.word1) && nodesdummy.includes(tweet.word2)) {
                //console.log(tweet.word1);
                matrix[invertedindex[tweet.word1]][invertedindex[tweet.word2]]
                    .cooccurence = tweet.portion1;
                matrix[invertedindex[tweet.word1]][invertedindex[tweet.word2]]
                    .cooccurencecount =
                    tweet.portion1 * nodes[invertedindex[tweet.word1]].count;
                matrix[invertedindex[tweet.word1]][invertedindex[tweet.word2]]
                    .similarity = tweet.portion2;
                nodes[invertedindex[tweet.word1]].cooccurencecount += tweet.portion1;
                nodes[invertedindex[tweet.word1]].similaritycount += tweet.portion2;
                var relcount = tweet.portion1 * nodes[invertedindex[tweet.word1]].count;
                if (maxrelcount < relcount) maxrelcount = relcount;
            }
        });

        // Precompute the orders.
        orders = {
            name: d3.range(n).sort(function (a, b) {
                return d3.ascending(nodes[a].name, nodes[b].name);
            }),
            count: d3.range(n).sort(function (a, b) {
                return nodes[b].count - nodes[a].count;
            }),
            cooccurence: d3.range(n).sort(function (a, b) {
                return nodes[b].cooccurencecount - nodes[a].cooccurencecount;
            }),
            similarity: d3.range(n).sort(function (a, b) {
                return nodes[b].similaritycount - nodes[a].similaritycount;
            })
        };

        var data = {};
        data.invertedindex = invertedindex;
        data.nodes = nodes;
        data.matrix = matrix;
        data.mincount = mincount;
        data.maxcount = maxcount;
        data.maxrelcount = maxrelcount;
        data.orders = orders;
        res.end(JSON.stringify(data));
    });
})

app.post('/getTweetsRelations', function (req, res) {
    var selected_nodes = req.body.nodes;
    fs.readFile(__dirname + "/data/" + "tweets_100.json", 'utf8', function (err, tweets) {
        //console.log( data );
        tweets = JSON.parse(tweets);
        var matrix = [], nodesdummy = [], nodes = tweets.nodes.slice(0, selected_nodes), mincount = 0, maxcount = 0, maxrelcount = 0, orders,
            n = nodes.length, invertedindex = {};
        // Compute index per node.
        nodes.forEach(function (node, i) {
            nodesdummy[i] = node.name;
            node.index = i;
            node.cooccurencecount = 0;
            node.similaritycount = 0;
            invertedindex[node.name] = i;
            matrix[i] = d3.range(n).map(function (j) {
                return { x: j, y: i };
            });
            if (node.count < mincount) mincount = node.count;
            if (node.count > maxcount) maxcount = node.count;
        });

        // Convert links to matrix; count character occurrences.
        tweets.links.forEach(function (tweet) {

            if (nodesdummy.includes(tweet.word1) && nodesdummy.includes(tweet.word2)) {
                console.log(tweet.word1);
                matrix[invertedindex[tweet.word1]][invertedindex[tweet.word2]]
                    .cooccurence = tweet.portion1;
                matrix[invertedindex[tweet.word1]][invertedindex[tweet.word2]]
                    .cooccurencecount =
                    tweet.portion1 * nodes[invertedindex[tweet.word1]].count;
                matrix[invertedindex[tweet.word1]][invertedindex[tweet.word2]]
                    .similarity = tweet.portion2;
                nodes[invertedindex[tweet.word1]].cooccurencecount += tweet.portion1;
                nodes[invertedindex[tweet.word1]].similaritycount += tweet.portion2;
                var relcount = tweet.portion1 * nodes[invertedindex[tweet.word1]].count;
                if (maxrelcount < relcount) maxrelcount = relcount;
            }
        });

        // Precompute the orders.
        orders = {
            name: d3.range(n).sort(function (a, b) {
                return d3.ascending(nodes[a].name, nodes[b].name);
            }),
            count: d3.range(n).sort(function (a, b) {
                return nodes[b].count - nodes[a].count;
            }),
            cooccurence: d3.range(n).sort(function (a, b) {
                return nodes[b].cooccurencecount - nodes[a].cooccurencecount;
            }),
            similarity: d3.range(n).sort(function (a, b) {
                return nodes[b].similaritycount - nodes[a].similaritycount;
            })
        };

        var data = {};
        data.invertedindex = invertedindex;
        data.nodes = nodes;
        data.matrix = matrix;
        data.mincount = mincount;
        data.maxcount = maxcount;
        data.maxrelcount = maxrelcount;
        data.orders = orders;

        res.end(JSON.stringify(data));
    });
})

app.get('/d3/d3.min.js', function (req, res) {
    fs.readFile(__dirname + "/" + "d3/d3.min.js", 'utf8', function (err, data) {
        //console.log( data );
        res.end(data);
    });
})

app.get('/jquery/jquery-1.10.2.min.js', function (req, res) {
    fs.readFile(__dirname + "/" + "jquery/jquery-1.10.2.min.js", 'utf8', function (err, data) {
        //console.log( data );
        res.end(data);
    });
})
app.get('/controller.js', function (req, res) {
    fs.readFile(__dirname + "/" + "controller.js", 'utf8', function (err, data) {
        //console.log( data );
        res.end(data);
    });
})
app.get('/style.css', function (req, res) {
    fs.readFile(__dirname + "/" + "style.css", 'utf8', function (err, data) {
        //console.log( data );
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
    });
})

app.get('/', function (req, res) {
    fs.readFile(__dirname + "/index.html", 'utf8', function (err, data) {
        //console.log( data );
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
})
http.createServer(app).listen(8080);