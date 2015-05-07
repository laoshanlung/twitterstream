var Twitter = require('twitter')
  , config = require('../config')
  , when = require('when')

var client = new Twitter({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token_key: config.twitter.accessToken,
  access_token_secret: config.twitter.accessTokenSecret
});

module.exports = {
  getTweets: function(search) {
    var deferred = when.defer();
    client.get('search/tweets', {q: search}, function(error, tweets, response){
      if (error) {
        deferred.reject(error);
      } else {
        deferred.resolve(tweets);
      }
    });

    return deferred.promise;
  },

  stream: function(topic, cb) {
    client.stream('statuses/filter', {track: topic}, cb);
  }
}