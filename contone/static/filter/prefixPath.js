
(function() {

  'use strict';
  
  angular.module('ContoneApp')
    .filter('prefixPath', function () {
      return function (path) {
        return "/" + path;
      };
    });

})();
