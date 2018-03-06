var wordnet = require('wordnet');
var stringSimilarity = require('string-similarity');
var exports = module.exports = {};

exports.getSimilarity = function (word1,word2,cb)
{
    wordnet.lookup(word1, function(err, definitions) {
    if (definitions)
      {
        definitions.forEach(function(definition) {
          var words = JSON.stringify(definition.meta.words, null, 2 );
          if (words.toLowerCase().indexOf(word2) !== -1)
          {   
             //console.log(word1 + " " + word2 + " " + 1);
             cb(1);
          }
          else 
          {
              var similarity = stringSimilarity.compareTwoStrings(word1, word2);
              //console.log(word1 + " " + word2 + " " + similarity);
              cb(similarity);
          }
        });
      }
      else
      {
        var similarity = stringSimilarity.compareTwoStrings(word1, word2);
        //console.log(word1 + " " + word2 + " " + similarity);
        cb(similarity);
      }
    });
}


exports.getSimilarity("business", "thanks", (results) => {console.log(results);} );

/*
wordnet.lookup('britain', function(err, definitions) {
    
      definitions.forEach(function(definition) {
        //console.log('  words: %s', words.trim());
        //console.log('  %s', JSON.stringify(definition, null, 2));
        var words = JSON.stringify(definition.meta.words, null, 2 )
        console.log('  %s', words.indexOf("UK."));
      });
    });
*/