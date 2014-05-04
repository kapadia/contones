(function() {
  'use strict';

  
  angular.module('ContoneApp')
    .controller('ContoneCtrl', function($scope, $routeParams, $q, $location, Api) {
      console.log('ContoneCtrl');
      
      var colorBands = [];
      
      $scope.filename = $routeParams.filename;
      $scope.bandIndex = $routeParams.bandIndex || 0; // Default to color
      
      // Create deferred objects for multiple requests
      var dfd1 = $q.defer();
      var dfd2 = $q.defer();
      
      $q.all([dfd1.promise, dfd2.promise]).then(function() {
        
        // Called when the file and band(s) have been set
        // and metadata retrieved.
        
        var dfd = $q.defer();
        // Get the image
        dfd.promise.then(function(data) {
          $scope.image = data;
        });
        Api.getRaster(dfd, $scope.bandIndex, $scope.minimum, $scope.maximum);
        
      });
      
      // Set the file
      Api.setFile(dfd1, $scope.filename, $scope.bandIndex);
      
      // Get metadata
      dfd2.promise.then(function(data) {
        var dtype = data["dtype"];
        
        $scope.minimum = parseInt($routeParams.minimum) || 0;
        $scope.maximum = parseInt($routeParams.maximum) || (data.dtype.contains('uint8') ? 255 : 65535);
        $scope.threshold = 100.0;
        $scope.contrast = 100.0;
        $scope.bands = Array.apply(null, {length: data.count}).map(function(d, i) { return i + 1}, Number);
        
        $scope.colorBands = $scope.bands.reduce(
          function(previous, current) { previous[current] = false; return previous;}, {}
        );
        $scope.colorOrder = data.count === 3 ? [1, 2, 3] : [3, 2, 1];
        
      });
      Api.getMetadata(dfd2, $scope.filename);
      
      
      $scope.onBand = function(index) {
        var deferred = $q.defer();
        
        deferred.promise.then(function(data) {
          $scope.image = data;
          $scope.bandIndex = index;
          $location.search('bandIndex', index);
        });
        Api.getRaster(deferred, index, $scope.minimum, $scope.maximum);
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