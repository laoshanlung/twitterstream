require([
  'angular'
  , 'apps/starred'
  , 'controllers/starred'
], function(angular){
  angular.bootstrap(document, ['starred']);
});