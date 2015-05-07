define([
  'angular'
  , 'services/apis'
  , 'directives/singletweet'
  , 'directives/infiniteload'
], function(angular){
  var deps = ['apis', 'ngResource', 'singletweet', 'infiniteload'];

  return angular.module('starred', deps);
});