(function() {
  'use strict';

  
  angular.module('ContoneApp')
    .controller('ContoneCtrl', function($scope, $routeParams, $q, $location, Api) {
      console.log('ContoneCtrl');
      
      var fname = $routeParams.filename;
      $scope.filename = fname;
      // TODO: These are only good for uint16 data
      $scope.minimum = $routeParams.minimum || 0;
      $scope.maximum = $routeParams.maximum || 65535;
      $scope.band = {selected: null}
      var colorBands = [];
      
      var deferred = $q.defer();
      deferred.promise.then(function(data) {
        $scope.metadata = data;
        $scope.bands = Array.apply(null, {length: data.count}).map(function(d, i) { return i + 1}, Number);
        $scope.bandIndex = $routeParams.bandIndex;
        
        $scope.colorBands = $scope.bands.reduce(
          function(previous, current) { previous[current] = false; return previous;}, {}
        );
        
        $scope.colorOrder = data.count === 3 ? [1, 2, 3] : [3, 2, 1];
      });
      Api.getMetadata(deferred, fname);
      
      
      $scope.onBand = function(index) {
        $location.search('bandIndex', index);
        $scope.bandIndex = index;
      }
      
      $scope.onColor = function() {
        $scope.colorComposite = $scope.colorComposite ? false : true;
        
        if ($scope.colorComposite && $scope.colorOrder.length === 3) {
          $scope.$broadcast("getColorComposite", $scope.colorOrder);
        } else {
          $scope.bandIndex = $scope.bandIndex;
        }
        
      }
      
      $scope.onColorBand = function(index) {
        
        if ($scope.colorOrder.length === 3) {
          $scope.colorOrder.length = 0;
        }
        if ($scope.colorOrder.indexOf(index) > -1) { return; }
        
        $scope.colorOrder.push(index);
        
        if ($scope.colorOrder.length === 3) {
          $scope.$broadcast("getColorComposite", $scope.colorOrder);
        }
      }
      
    });

})();