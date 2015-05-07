define([
  'underscore'
  , 'apps/home'
], function(_, app){

  var Controller = function($interval, $window, $rootScope, $scope, Tweets) {
    var self = this;
    this.tweets = [];

    var polling = $interval(function(){
      var tweet = _.first(self.tweets)
      if (!tweet) {
        return;
      }

      Tweets.list({
        gt: tweet.created_at
      }).$promise.then(function(tweets){
        self.tweets = _.union(tweets.data, self.tweets);
      });
    }, 20000);

    $scope.$on('$destroy', function(){
      $interval.cancel(polling);
    });

    var updateTweets = function(tweets) {
      this.tweets = _.union(this.tweets, tweets);
      this.tweets = _.uniq(this.tweets, function(tweet){
        return tweet._id;
      });
    }.bind(this);

    $rootScope.$on('serverError', function(e, error){
      $window.alert(error.error || error);
    });

    Tweets.list().$promise.then(function(tweets){
      updateTweets(tweets.data);
    });

    this.onClickStar = function(tweet) {
      Tweets.star({
        id: tweet._id
      });
      tweet.is_starred = true;
    }

    this.onClickUnstar = function(tweet) {
      Tweets.unstar({
        id: tweet._id
      });
      tweet.is_starred = false;
    }

    this.onLoadMore = function() {
      var tweet = _.last(self.tweets);
      if (tweet) {
        Tweets.list({
          lt: tweet.created_at 
        }).$promise.then(function(tweets){
          updateTweets(tweets.data);
        });
      }
    }
  }

  app.controller('MainController', ['$interval', '$window', '$rootScope', '$scope', 'Tweets', Controller]);
});