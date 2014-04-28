(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .directive('raster', function(Api, $q, $location) {
      
      return {
        restrict: 'C',
        link: function postLink(scope, element, attrs) {
          var el = element[0];
          var context = el.getContext('2d');
          
          
          function updateImage(img) {
            el.width = img.width;
            el.height = img.height;
            context.drawImage(img, 0, 0);
          }
          
          
          scope.$watch('bandIndex', function(newValue, oldValue) {
            if (newValue === oldValue) { return; }
            
            var deferred = $q.defer();
            deferred.promise.then(updateImage);
            Api.getRaster(deferred, scope.filename, scope.bandIndex, scope.minimum, scope.maximum);
          });
          
          
          scope.$on("getImageScaled", function(obj, extent) {
            extent = extent.map(function(d) { return parseInt(d); });
            $location.search('minimum', extent[0]);
            $location.search('maximum', extent[1]);
            
            var deferred = $q.defer();
            deferred.promise.then(updateImage);
            Api.getRaster(deferred, scope.filename, scope.bandIndex, extent[0], extent[1]);
          });
          
          
          scope.$on('getColorComposite', function(obj, colorBands) {
            
            var deferred = $q.defer();
            deferred.promise.then(updateImage);
            Api.getColorRaster(deferred, scope.filename, colorBands);
          })
          
        }
      }
      
    });
  
})();