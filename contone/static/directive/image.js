(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .directive('raster', function(Api, $q, $location) {
      
      return {
        restrict: 'C',
        link: function postLink(scope, element, attrs) {
          console.log('linking raster');
          var el = element[0];
          el.width = el.width;
          var context = el.getContext('2d');
          
          
          function updateImage(img) {
            el.width = img.width;
            el.height = img.height;
            context.drawImage(img, 0, 0);
          }
          
          
          scope.$watch('image', function(newValue, oldValue) {
            if (newValue === oldValue) { return; }
            updateImage(newValue);
          });
          
          
          scope.$on("getImageScaled", function(obj, extent) {
            
            extent = extent.map(function(d) { return parseInt(d); });
            $location.search('minimum', extent[0]);
            $location.search('maximum', extent[1]);
            
            var deferred = $q.defer();
            deferred.promise.then(updateImage);
            Api.getRaster(deferred, scope.bandIndex, extent[0], extent[1]);
          });
          
          scope.$on("getSigmoidal", function(obj, threshold, contrast) {
            console.log(threshold, contrast);
            
            var deferred = $q.defer();
            deferred.promise.then(updateImage);
            Api.getSigmoidal(deferred, scope.bandIndex, threshold, contrast, scope.minimum, scope.maximum);
          })
          
          
          scope.$on('getColorComposite', function(obj, colorBands) {
            
            var deferred = $q.defer();
            deferred.promise.then(updateImage);
            Api.getColorRaster(deferred, scope.filename, colorBands);
          })
          
        }
      }
      
    });
  
})();