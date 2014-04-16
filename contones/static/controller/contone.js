(function() {
  'use strict';

  
  angular.module('ContoneApp')
    .controller('ContoneCtrl', function($scope, $routeParams, $q, Api) {
      console.log('ContoneCtrl');
      
      var fname = $routeParams.filename;
      
      $scope.bandIndex = 1;
      $scope.filename = fname;
      
      var metadata = Api.files[fname + '.tif'];
      $scope.bands = Array.apply(null, {length: metadata.count}).map(function(d, i) { return i + 1}, Number);
      
      $scope.onBand = function(bandIndex) {
        $scope.bandIndex = bandIndex;
      }
      
    });

})();