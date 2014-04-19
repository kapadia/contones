
(function() {

  'use strict';
  
  angular.module('ContoneApp')
    .filter('getBasename', function () {
      return function (path) {
        if (path === undefined) { return; }
      
        var s = path.split('/')
        var basename = s[s.length - 1];
        
        return basename;
      };
    });

})();
