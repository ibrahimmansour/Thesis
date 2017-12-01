var MongoClient = require('mongodb').MongoClient;
const async = require('async');
var url = "mongodb://localhost:27017/mydb";
var similarity = require('../app/similarity.js');
var exports = module.exports = {};

function getRelationCount(searchKeyword, keyWords, word1, word2, startDate, endDate, wordType, db, cb) {
    //function connection(err, db) {
        var relquery = [{
            "Tokens": {
                $elemMatch: {
                    Word: word1,
                    Type_Id: { $in: wordType }
                }
            }
        },
        {
            "Tokens": {
                $elemMatch: {
                    Word: word2,
                    Type_Id: { $in: wordType }
                }
            }
        }];
        var i;
        for (i=0;i<keyWords.length;i++)
        {
            relquery.push(
                {
                    "Tokens": {
                        $elemMatch: {
                            Word: keyWords[i],
                            Type_Id: { $in: wordType }
                        }
                    }
                }
            );
        }
    db.collection("Tweets_Main").find({
        Search_Keyword: searchKeyword,
        $and: relquery,
        Tweet_Date: { $gt: startDate, $lt: endDate }
    }, { Text: 1, _id: 0 }).toArray((err, results) => { if (err) { cb(err); } else { cb(results); } });
    //};
    //MongoClient.connect(url, connection);
    //return;
}

exports.getTopWords = function (searchKeyword, keyWords, numNodes, startDate, endDate, wordType, cb) {
    function connection(err, db) {
        var matchquery = {Search_Keyword: searchKeyword, Tweet_Date: { $gt: startDate, $lt: endDate }};
        if ( keyWords.length > 0 ) {
            var allarr = [];
            var i;
            for (i=0;i<keyWords.length;i++)
            {
                var arrelem = {
                    $elemMatch: {
                        Word: keyWords[i],
                        Type_Id: { $in: wordType }
                    }
                }
                allarr.push(arrelem);
            }
            matchquery.Tokens = { $all: allarr};
        }
        keyWords.push(searchKeyword.toLowerCase());
        var query = [
            {
                $match: matchquery
            },
            {
                $unwind: "$Tokens"
            },
            {
                $match: {
                    "Tokens.Word": { $nin: keyWords },
                    //"Tokens.Word": { $not: new RegExp("Brexit", "i") },
                    "Tokens.Type_Id": { $in: wordType }
                }
            },
            {
                $group: {
                    _id: { Polarity: "$Polarity", Word: "$Tokens.Word" },
                    avgCon: { $avg: "$Polarity_Confidence" },
                    polcount: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.Word",
                    polaritys: {
                        $push: {
                            polarity: "$_id.Polarity",
                            confidence: "$avgCon",
                            count: "$polcount"
                        },
                    },
                    count: { $sum: "$polcount" }
                }
            },
            {
                $sort: {
                    count: -1,
                    "polaritys.polarity": -1
                }
            },
            {
                $limit: numNodes
            },
            {
                $project: {
                    "polaritys.polarity": 0
                }
            },
            {
                $project: {
                    first: { $arrayElemAt: ["$polaritys", 0] },
                    second: { $arrayElemAt: ["$polaritys", 1] },
                    third: { $arrayElemAt: ["$polaritys", 2] },
                    count: 1
                }
            },
            {
                $project: {
                    name: "$_id",
                    semCountPo: "$first.count",
                    semConfValPo: "$first.confidence",
                    semCountNt: "$second.count",
                    semConfValNt: "$second.confidence",
                    semCountNe: "$third.count",
                    semConfValNe: "$third.confidence",
                    count: 1
                }
            },
            {
                $project: {
                    "_id": 0
                }
            }
        ];
        db.collection("Tweets_Main").aggregate(query).toArray((err, nodes) => {
            if (err) {
                cb(err);
            }
            else {
                var relations = {};
                let links = [];
                var tweets = [];
                async.each(nodes, (node1, eachCb1) => {
                    async.each(nodes, (node2, eachCb2) => {
                        //console.log(nodes.indexOf(node2));
                        if (nodes.indexOf(node1) <= nodes.indexOf(node2)) {
                            if (node1.name == node2.name) {
                                var link = {};
                                link.word1 = node1.name;
                                link.word2 = node2.name;
                                link.portion1 = 0;
                                link.portion2 = 0;
                                links.push(link);
                                eachCb2();
                            }
                            else {
                                getRelationCount(searchKeyword, keyWords, node1.name, node2.name, startDate, endDate, wordType, db, (texts, err) => {
                                    //console.log(node1.name + " " + node2.name + " " + relcount);
                                        similarity.getSimilarity(node1.name,node2.name, (res) => {
                                            var relcount = texts.length;
                                            var link1 = {};
                                            link1.word1 = node1.name;
                                            link1.word2 = node2.name;
                                            link1.portion1 = relcount / node1.count;
                                            link1.portion2 = res;
                                            var link2 = {};
                                            link2.word1 = node2.name;
                                            link2.word2 = node1.name;
                                            link2.portion1 = relcount / node2.count;
                                            link2.portion2 = res;
                                            links.push(link1);
                                            links.push(link2);
                                            var i;
                                            for (i = 0; i < relcount; i++) {
                                                tweets.push(texts[i]);
                                            }
                                            //eachCb2();
                                         });
                                         eachCb2();                                
                                });
                            }
                        }
                        else {
                            eachCb2();
                        }
                    }, () => { eachCb1(); });
                }, () => {
                    relations.links = links;
                    relations.nodes = nodes;
                    relations.tweets = tweets;
                    //console.log(relations);
                    cb(relations);
                    db.close();
                });
            }
        });
    };
    MongoClient.connect(url, connection);
    return;
}

exports.getWordsTweets = function (searchKeyword, keyWords, word1, word2, startDate, endDate, cb) {
    function connection(err, db) {
        var relquery = [{
            "Tokens": {
                $elemMatch: {
                    Word: word1
                }
            }
        },
        {
            "Tokens": {
                $elemMatch: {
                    Word: word2
                }
            }
        }];
        var i;
        for (i=0;i<keyWords.length;i++)
        {
            relquery.push(
                {
                    "Tokens": {
                        $elemMatch: {
                            Word: keyWords[i]
                        }
                    }
                }
            );
        }
        db.collection("Tweets_Main").find({
            Search_Keyword: "Brexit",
            Tweet_Date: { $gt: startDate, $lt: endDate },
            $and: relquery,
        }, { _id: 0, Text: 1 }).toArray((err, results) => {
            cb(results);
            db.close();
        });
    }
    MongoClient.connect(url, connection);
    return;
}

/*
exports.getWordsTweets("Brexit", "uk", "hangover", "2016-07-01", "2016-07-10", (results, err) => {
    console.log(results);
}
);
*/
/*
exports.getTopWords("Brexit", [] , 20, "2016-07-01T00:00", "2016-07-10T23:59", [6, 9, 18, 34], (results, err) => {
    console.log(results.nodes);
}
);
*/
/*
getRelationCount("Brexit", "europe", "europe", "2016-07-01", "2016-07-10", [6, 9, 18, 34], (results, err) => { console.log(results); });
*/