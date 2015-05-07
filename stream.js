var twitterService = require('./services/twitter')
  , Tweet = require('./models/tweet')
  , _ = require('underscore')
  , moment = require('moment')

twitterService.stream('eCommerce, CRO', function(stream){
  stream.on('data', function(tweet) {
    var params = {
      _id: tweet.id
    }

    _.extend(params, _.pick(tweet, 'created_at', 'text'));
    params.created_at = moment(params.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY').toDate();
    params.user = _.pick(tweet.user, 'name', 'profile_image_url');

    var t = new Tweet(params);

    t.save();
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});