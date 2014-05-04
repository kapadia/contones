(function() {
  'use strict';

  
  angular.module('ContoneApp')
    .controller('ImageCtrl', function($scope, $routeParams, $q, $location, Api) {
      var colorBands = [];
      
      $scope.filename = $routeParams.filename;
      $scope.bandIndex = parseInt($routeParams.bandIndex) || 0;
      $scope.colorComposite = ($scope.bandIndex === 0) ? true : false;
      
      var dfd1 = $q.defer();
      var dfd2 = $q.defer();
      
      $q.all([dfd1.promise, dfd2.promise]).then(function() {
        var dfd = $q.defer();
        dfd.promise.then(function(data) { $scope.image = data; });
        Api.getRaster(dfd, $scope.filename, $scope.bandIndex, $scope.minimum, $scope.maximum);
      });
      
      Api.setFile(dfd1, $scope.filename, $scope.bandIndex);
      
      dfd2.promise.then(function(data) {
        var dtype = data["dtype"];
        
        $scope.bitdepth = (data.dtype.contains('uint8') ? 8 : 16);
        $scope.count = data.count;
        
        $scope.minimum = parseInt($routeParams.minimum) || 0;
        $scope.maximum = parseInt($routeParams.maximum) || (data.dtype.contains('uint8') ? 255 : 65535);
        $scope.bands = Array.apply(null, {length: data.count}).map(function(d, i) { return i + 1}, Number);
        
        $scope.colorBands = $scope.bands.reduce(
          function(previous, current) { previous[current] = false; return previous;}, {}
        );
        $scope.colorOrder = data.count === 3 ? [1, 2, 3] : [3, 2, 1];
        
      });
      Api.getMetadata(dfd2, $scope.filename);
      
      
      //
      // UI Handlers
      //
      
      $scope.onBand = function(index) {
        var dfd = $q.defer();
        
        dfd.promise.then(function(data) {
          $scope.image = data;
          $scope.bandIndex = index;
          $location.search('bandIndex', index);
        });
        Api.getRaster(dfd, $scope.filename, index, $scope.minimum, $scope.maximum);
      }
      
      
      $scope.onColor = function() {
        $scope.colorComposite = $scope.colorComposite ? false : true;
        
        if ($scope.colorComposite && $scope.colorOrder.length === 3) {
          $scope.$broadcast("getColorComposite", $scope.colorOrder);
        } else {
          $scope.onBand($scope.bandIndex);
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