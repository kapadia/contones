
(function() {
  'use strict';

  angular.module('ContoneApp')
    .service('Api', function Api($rootScope, $q, $http) {
      
      var api = {};
      
      api.getFiles = function(deferred) {
        $http.get('/rasters')
          .success(function(data, status, headers, config) {
            api.files = data;
            deferred.resolve(data);
          })
          .error(function(data, status, headers, config) {
            console.log('whoops');
          })          
      }
      
      api.getRaster = function(deferred, filename, band) {
        var url = ['', 'raster', filename];
        if (band > 0) { url.push(band); }
        
        var img = new Image();
        img.onload = function() { deferred.resolve(img); }
        img.src = url.join('/');
      }
      
      return api;
    });

})();