(function() {
  'use strict';

  
  angular.module('ContoneApp')
    .controller('ContoneCtrl', function($scope, $routeParams, $q, $location, $timeout, Api) {
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
        
      });
      Api.getMetadata(deferred, fname);
      
      
      $scope.$watch('band.selected', function(newValue, oldValue) {
        $location.search('bandIndex', newValue);
        $scope.bandIndex = newValue;
      })
      
      
      $scope.onColorBand = function(index) {
        
        $timeout(function() {
          
          if ($scope.colorBands[index] === true) {
            colorBands.push(index);
          } else {
            var i = colorBands.indexOf(index);
            colorBands.splice(i, 1);
          }
          
          if (colorBands.length === 3) {
            console.log("REQUEST COLOR", colorBands);
            $scope.$broadcast("getColorComposite", colorBands);
            
            // Reset the array
            $scope.colorBands = $scope.bands.reduce(
              function(previous, current) { previous[current] = false; return previous;}, {}
            );
            colorBands = [];
          }
        }, 0)
      }
      
    });

})();