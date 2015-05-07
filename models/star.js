var mongoose = require('./mongoose')
  , Types = mongoose.Schema.Types

var Schema = mongoose.Schema({
  session_id: {type: String, ref: 'Session'},
  tweet_id: {type: Number, ref: 'Tweet'},
  created_at: {type: Date, default: Date.now},
});

Schema.statics.getOrCreate = function(sessionId, tweetId) {
  var self = this;
  return this.findOne({
    session_id: sessionId,
    tweet_id: tweetId
  }).then(function(star){
    if (!star) {
      star = new self({
        session_id: sessionId,
        tweet_id: tweetId
      });
    }

    return star.save();
  });
}

Schema.statics.listBySession = function(sessionId, options) {
  var select = {};
  select['session_id'] = sessionId;

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

module.exports = mongoose.model('Star', Schema);