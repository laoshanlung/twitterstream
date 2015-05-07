var mongoose = require('./mongoose')
  , _ = require('underscore')
  , when = require('when')
  , Star = require('./star')
  , Session = require('./session')

var Schema = mongoose.Schema({
  _id: Number,
  created_at: {type: Date, default: Date.now},
  fetched_at: {type: Date, default: Date.now},
  text: String,
  user: {
    name: String,
    profile_image_url: String
  },
  starred_by: {type: Array, default: []}
});

Schema.methods.apiData = function(sessionId) {
  var tweet = JSON.parse(JSON.stringify(this));

  if (sessionId && _.indexOf(tweet.starred_by, sessionId) != -1) {
    tweet.is_starred = true;
  } else {
    tweet.is_starred = false;
  }
  
  delete tweet['starred_by'];

  return tweet;
}

Schema.methods.starredBySession = function(sessionId) {
  var self = this;

  return Session.findById(sessionId).then(function(session){
    if (!session) {
      throw "Invalid session"
    }

    self.starred_by = _.union(self.starred_by, [sessionId]);
    return when.all([
      self.save(),
      Star.getOrCreate(sessionId, self._id)
    ]).then(function(results){
      return results[1]
    });
  });
}

Schema.methods.unstarredBySession = function(sessionId) {
  this.starred_by = _.without(this.starred_by, sessionId);

  return when.all([
    this.save(),
    Star.remove({
      session_id: sessionId,
      tweet_id: this.id
    })
  ]).then(function(results){
    return results[0]
  });
}

Schema.statics.list = function(options) {
  options = options || {};
  var select = {};
  if (options.lte) {
    select['created_at'] = {$lte: options.lte};
  }

  if (options.gte) {
    select['created_at'] = {$gte: options.gte};
  }

  return this.find(select).sort('-created_at').limit(20);
}

Schema.statics.listStarredBySession = function(sessionId, options) {
  var self = this;

  return Star.listBySession(sessionId, options).then(function(stars){
    var ids = _.pluck(stars, 'tweet_id');

    return self.find({'_id': {'$in': ids}}).limit(20).then(function(tweets){
      return _.map(tweets, function(tweet){
        tweet = tweet.apiData();
        var star = _.findWhere(stars, {
          tweet_id: tweet._id
        });

        tweet.starred_at = star.created_at;
        tweet.is_starred = true;
        return tweet;
      });
    });
  });
}

module.exports = mongoose.model('Tweet', Schema);