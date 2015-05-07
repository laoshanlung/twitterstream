define([
  'angular'
  , 'moment'
  , 'text!templates/tweet.html'
], function(angular, moment, template){

  var directive = function($window) {
    return {
      link: function($scope, $element, $attr) {
        $scope.fromNow = function(input) {
          return moment(input).fromNow();
        }
      },
      scope: {
        'tweet': '=',
        'onClickStar': '&',
        'onClickUnstar': '&'
      },
      template: template,
      restrict: 'E'
    };
  }

  return angular.module('singletweet', []).directive('singletweet', ['$window', directive]);
});