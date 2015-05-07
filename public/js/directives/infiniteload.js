define([
  'underscore'
  , 'angular'
], function(_, angular){

  var directive = function($window, $document, $timeout) {
    var timeout = {};

    var runOnce = function(id, fn, delay) {
      delay = delay || 500;
      
      if (timeout[id]) {
        $timeout.cancel(timeout[id]);
      }

      timeout[id] = $timeout(function(){
        fn();
        delete timeout[id];
      }, delay);
    }

    return {
      link: function($scope, $element, $attr) {
        var threshold = $scope.threshold || 500;
        var onLoad = $scope.onLoad;
        var $w = angular.element($window);

        var onScroll = function() {
          runOnce($scope.$id, function(){
            if  ( (angular.element($document).height() - $w.height()) - $w.scrollTop() < threshold ){
                onLoad();
            }
          });
        }

        $scope.$on('$destroy', function(){
          $w.unbind(onScroll);
        });

        $w.bind('scroll', onScroll);
      },
      scope: {
        'onLoad': '&',
        'threshold': '='
      }
    };
  }

  return angular.module('infiniteload', []).directive('infiniteload', ['$window', '$document', '$timeout', directive]);

});