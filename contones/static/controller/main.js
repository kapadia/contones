(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .controller('MainCtrl', function($scope, $rootScope, $q, $location, Api) {
      console.log('MainCtrl');
      
      $scope.thumbnails = [];
      $rootScope.$on("thumbnails", function(obj, files) {
        
        $scope.thumbnails = files.map(function(f) {
          return "/api/thumbnail/" + f;
        });
        
      });
      
    });

})();
