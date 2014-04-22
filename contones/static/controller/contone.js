(function() {
  'use strict';

  
  angular.module('ContoneApp')
    .controller('ContoneCtrl', function($scope, $routeParams, $q, $timeout, Api) {
      console.log('ContoneCtrl');
      
      var fname = $routeParams.filename + '.tif';
      $scope.filename = fname;
      
      var deferred = $q.defer();
      deferred.promise.then(function(data) {
        $scope.metadata = data;
        $scope.bands = Array.apply(null, {length: data.count}).map(function(d, i) { return i + 1}, Number);
        $scope.bandIndex = $routeParams.bandIndex;
      });
      Api.getMetadata(deferred, fname);
      
      $scope.onBand = function(bandIndex) {
        $scope.bandIndex = bandIndex;
      }
      
    });

})();