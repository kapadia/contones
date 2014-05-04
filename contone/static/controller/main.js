(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .controller('MainCtrl', function($scope, $rootScope, $q, $location, Api) {
      console.log('MainCtrl');
      
      $scope.files = [];
      
      $rootScope.$on("thumbnails", function(obj, files) {
        $scope.files = files;
      });
      
    });

})();
