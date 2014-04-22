(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .controller('MainCtrl', function($scope, $q, $location, Api) {
      console.log('MainCtrl');
      
      $scope.relpath = [];
      
      // Get a list of files from the API
      var deferred = $q.defer();
      deferred.promise.then(function(data) {
        $scope.files = data;
      });
      Api.getFiles(deferred, '');
      
      $scope.onFile = function(file) {
        
        $scope.relpath = file.path.split('/');
        
        if (file.isDir) {
          
          // Navigate to next directory
          var deferred = $q.defer();
          deferred.promise.then(function(data) {
            $scope.files = data;
          });
          Api.getFiles(deferred, file.path);
          
        } else {
          
          // Render image
          console.log(file.path);
          var path = file.path.split('.')[0];
          var bandIndex = 1;
          var route = ['/contone', path, 'view', bandIndex].join('/');
          console.log("route", route);
          $location.path(route);
          
        }
      }
      
      $scope.onParent = function() {
        var index = $scope.relpath.length - 2;
        
        $scope.relpath = $scope.relpath.filter(function(d, i) {
          if (i <= index) { return true; }
        });
        
        var deferred = $q.defer();
        deferred.promise.then(function(data) {
          $scope.files = data;
        });
        Api.getFiles(deferred, $scope.relpath.join('/'));
        
      }
  
    });

})();
