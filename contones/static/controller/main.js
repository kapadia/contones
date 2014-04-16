(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .controller('MainCtrl', function($scope, $q, Api) {
      console.log('MainCtrl');
    
      // Get a list of files from the API
      var deferred = $q.defer();
      deferred.promise.then(function(data) {
        $scope.files = data;
      })
    
      Api.getFiles(deferred);
  
    });

})();
