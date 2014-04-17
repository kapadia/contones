(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .directive('raster', function(Api, $q) {
      
      return {
        restrict: 'C',
        link: function postLink(scope, element, attrs) {
          console.log('raster directive');
          
          var el = element[0];
          var context = el.getContext('2d');
          
          function updateImage(img) {
            el.width = img.width;
            el.height = img.height;
            context.drawImage(img, 0, 0);
          }
          
          scope.$watch('filename', function(filename) {
            
            var deferred = $q.defer();
            deferred.promise.then(updateImage);
            Api.getRaster(deferred, scope.filename, scope.bandIndex, 0, 65535);
          });
          
          scope.$watch('bandIndex', function(bandIndex) {
            
            var deferred = $q.defer();
            deferred.promise.then(updateImage);
            Api.getRaster(deferred, scope.filename, scope.bandIndex, 0, 65535);
          });
          
          scope.$on("getImageScaled", function(obj, extent) {
            
            var deferred = $q.defer();
            deferred.promise.then(updateImage);
            Api.getRaster(deferred, scope.filename, scope.bandIndex, extent[0], extent[1]);
          })
        }
      }
      
    });
  
})();