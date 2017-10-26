var mongo = require('../data/mongo.js');
var d3 = require('d3');
var exports = module.exports = {};

exports.getTopWords = function (searchKeyword, numNodes, startDate, endDate, wordType, cb)
{
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
                nodes[invertedindex[tweet.word1]].cooccurencecount += tweet.portion1 * nodes[invertedindex[tweet.word1]].count;
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
        data.tweets = tweets.tweets;
        cb(data);
    });
}

exports.getWordsTweets = function (searchKeyword, word1, word2 , startDate, endDate, cb){
    mongo.getWordsTweets(searchKeyword, word1, word2 , startDate, endDate, (tweets, err) => {
        cb(tweets);
});
}