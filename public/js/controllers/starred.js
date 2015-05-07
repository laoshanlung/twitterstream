define([
  'underscore'
  , 'apps/starred'
], function(_, app){

  var Controller = function($window, $rootScope, Tweets) {
    var self = this;
    this.tweets = [];
    var updateTweets = function(tweets) {
      this.tweets = _.union(this.tweets, tweets);
      this.tweets = _.uniq(this.tweets, function(tweet){
        return tweet._id;
      });
    }.bind(this);

    $rootScope.$on('serverError', function(e, error){
      $window.alert(error.error || error);
    });

    Tweets.listStarred().$promise.then(function(tweets){
      updateTweets(tweets.data);
    });

    this.onClickUnstar = function(tweet) {
      Tweets.unstar({
        id: tweet._id
      });
      tweet.is_starred = false;
      self.tweets = _.filter(self.tweets, function(t){
        return t._id != tweet._id;
      });
    }

    this.onLoadMore = function() {
      var tweet = _.last(self.tweets);
      if (tweet) {
        Tweets.listStarred({
          lte: tweet.starred_at 
        }).$promise.then(function(tweets){
          updateTweets(tweets.data);
        });
      }
    }
  }

  app.controller('MainController', ['$window', '$rootScope', 'Tweets', Controller]);
});