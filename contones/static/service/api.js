
(function() {
  'use strict';

  angular.module('ContoneApp')
    .service('Api', function Api($rootScope, $q, $http) {
      
      var api = {};
      
      api.getFiles = function(deferred, path) {
        var url = ['', 'api', 'files', path];
        
        $http.get(url.join('/'))
          .success(function(data, status, headers, config) {
            api.files = data;
            deferred.resolve(data);
          })
          .error(function(data, status, headers, config) {
            console.log('whoops');
          });
      }
      
      
      api.getMetadata = function(deferred, filename) {
        var url = ['', 'api', 'metadata', filename];
        
        $http.get(url.join('/'))
          .success(function(data, status, headers, config) {
            deferred.resolve(data);
          })
          .error(function(data, status, headers, config) {
            console.log('whoops');
          })
      }
      
      
      api.getRaster = function(deferred, filename, band, minimum, maximum) {
        var url = ['', 'api', 'raster', filename, minimum, maximum];
        url = url.filter(function(d) { return d !== undefined });
        if (band > 0) { url.splice(4, 0, band); }
        
        var img = new Image();
        img.onload = function() { deferred.resolve(img); }
        img.src = url.join('/');
      }
      
      api.getColorRaster = function(deferred, filename, bands) {
        var url = ['', 'api', 'raster', filename, 'color'].concat(bands);
        
        var img = new Image();
        img.onload = function() {deferred.resolve(img); }
        img.src = url.join('/');
      }
      
      
      api.getHistogram = function(deferred, filename, band) {
        var url = ['', 'api', 'stats', 'histogram', filename, band].join('/');
        
        // Temporary spoof an empty response. Make this better.
        if (band === 0) { deferred.resolve({"bin_edges": [], "counts": []}); }
        
        $http.get(url)
          .success(function(data, status, headers, config) {
            if (data.hasOwnProperty('error')) { return; }
            deferred.resolve(data);
          })
          .error(function(data, status, headers, config) {
            console.log('whoops');
          });
      }
      
      return api;
    });

})();