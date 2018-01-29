var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var application = require('./app/application.js');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

var wordTypes = {};
wordTypes.verbs = [2, 7, 17, 20, 24, 28];
wordTypes.nouns = [6, 9, 18, 34];
//wordTypes.all = [];
var tweetstext;

app.post('/getTopWords', (req, res) => {
    var numNodes = parseInt(req.body.numnodes);
    var startDate = req.body.startdate;
    var endDate = req.body.enddate;
    startDate.replace("T"," ");
    endDate.replace("T"," ");
    var wordType = wordTypes[req.body.wordtype];
    var keyWords = req.body.keywords;
    var searchKeyword = req.body.searchkeyword;
    if (!searchKeyword) {searchKeyword = "Brexit";}
    if (!keyWords) {keyWords = []};
    console.log(JSON.stringify(req.body,null,2));
    console.log(startDate);
    
    console.log(endDate);
    //console.log(wordType);
    console.log(searchKeyword);
    application.getTopWords(searchKeyword, keyWords, numNodes, startDate, endDate, wordType, (tweets, err) => {
        //console.log(tweets);
        tweetstextcounter=0;
        tweetstext = tweets.tweets;
        tweets.tweets = tweets.tweets.slice(0,50);
        tweets.textlength = tweetstext.length;
        //console.log(JSON.stringify(tweets.matrix[0],null,2));
        res.end(JSON.stringify(tweets));

    });
})

app.post('/getWordsTweets', (req, res) => {
    var startDate = req.body.startdate;
    var endDate = req.body.enddate;
    startDate.replace("T"," ");
    endDate.replace("T"," ");
    var keyWords = req.body.keywords;
    if (!keyWords) {keyWords = []};
    var searchKeyword = req.body.searchkeyword;
    if (!searchKeyword) {searchKeyword = "Brexit"};
    var wordType = wordTypes[req.body.wordtype];
    var word1 = req.body.word1;
    var word2 = req.body.word2;
    console.log(startDate);
    console.log(endDate);
    console.log(searchKeyword);
    console.log(word1 + " word1");
    console.log(word2);
    application.getWordsTweets(searchKeyword,keyWords, word1, word2, startDate, endDate, wordType, (results, err) => {
        tweetstext = results;
        results[0].tweetslength = results.length;
        console.log(JSON.stringify(results.slice(0,2)));
        res.end(JSON.stringify(results.slice(0,50)));
    });
})

/*
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
*/

app.post('/getMoreText',function (req, res) {
    var reqtweetscounter = parseInt(req.body.index);
    if (reqtweetscounter < 0) reqtweetscounter = 0;
    res.end(JSON.stringify(tweetstext.slice(reqtweetscounter,reqtweetscounter+50)));
});

app.get('/', function (req, res) {
    fs.readFile(__dirname + "/index.html", 'utf8', function (err, data) {
        //console.log( data );
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
})


http.createServer(app).listen(8080);