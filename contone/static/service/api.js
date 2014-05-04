
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
          });
      }
      
      
      api.setFile = function(deferred, filepath) {
        var url = ['', 'api', 'raster', filepath];
        console.log('setFile', url.join('/'));
        $http.post(url.join('/'))
          .success(function(data, status, headers, config) {
            deferred.resolve(data);
          })
          .error(function(data, status, headers, config) {
            console.log('whoops');
          });
      }
      
      
      api.getRaster = function(deferred, filepath, band, minimum, maximum) {
        
        // var random = Math.random().toString(36).substr(2, 6);
        var url = ['', 'api', 'raster', filepath, band, minimum, maximum];
        var img = new Image();
        img.onload = function() {
          deferred.resolve(img);
        }
        console.log('img src', url.join('/'));
        img.src = url.join('/');
      }
      
      
      api.getSigmoidal = function(deferred, band, alpha, beta, minimum, maximum) {
        
        var url = ['', 'api', 'raster', 0, 'sigmoidal', alpha, beta, minimum, maximum];
        var img = new Image();
        img.onload = function() {
          deferred.resolve(img);
        }
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