define([
  'underscore'
  , 'angular'
], function(_, angular){
  var apis = angular.module('apis', []);

  var prefix = '/api';

  apis.config(['$httpProvider', function ($httpProvider) {
    var interceptor = ['$rootScope', '$q', function($rootScope, $q){
      return {
        request: function(config) {
          var url = config.url;
          if (url.charAt(0) != '/') {
            url = '/' + url;
          }

          config.url = prefix + url;
          return config;
        },

        responseError: function(response) {
          $rootScope.$broadcast('serverError', response.data.error);
          return $q.reject(response.data.error);
        }
      };
    }];

    $httpProvider.interceptors.push(interceptor);
  }]);

  var Tweets = function($resource){
    var url = 'tweets/:id';
    return $resource(url, {
      'id': '@id'
    }, {
      'list': {
        method: 'GET'
      },
      'listStarred': {
        method: 'GET',
        url: url + '/starred'
      },
      'star': {
        method: 'POST',
        url: url + '/star'
      },
      'unstar': {
        method: 'POST',
        url: url + '/unstar'
      }
    })
  }

  apis.factory('Tweets', ['$resource', Tweets]);

  return apis;
});