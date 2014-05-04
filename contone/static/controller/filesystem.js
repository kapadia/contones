(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .controller('FileSystemCtrl', function($scope, $q, $modal, Api) {
      console.log('FileSystemCtrl');
      
      var path = '';
      
      var dfd = $q.defer();
      dfd.promise.then(function(data) {
        
        $scope.directories = data.filter(function(f) { return f.isDir; });
        $scope.images = data.filter(function(f) { return !f.isDir; });
        
      });
      Api.getFiles(dfd, path);
      
      $scope.onBrowse = function() {
        var modalInstance = $modal.open({
          templateUrl: '/static/views/filesystem.html',
          controller: 'ModalInstanceCtrl',
          resolve: {
            path: function() { return path; },
            directories: function() { return $scope.directories; },
            images: function() { return $scope.images; }
          }
        });
      };
      
    
    });

  angular.module('ContoneApp')
    .controller('ModalInstanceCtrl', function($scope, $rootScope, $q, $modalInstance, $location, $timeout, Api, path, directories, images) {
      
      $scope.path = path;
      $scope.directories = directories;
      $scope.images = images;
      
      function getFiles(path) {
        var dfd = $q.defer();
        dfd.promise.then(function(data) {
          
          $scope.directories = data.filter(function(f) { return f.isDir; });
          $scope.images = data.filter(function(f) { return !f.isDir; });
          
        });
        Api.getFiles(dfd, path);
      }
      
      $scope.onDirectory = function(file) {
        $scope.path = file.path;
        getFiles($scope.path);
      }
      
      $scope.onBack = function() {
        var pathTmp = $scope.path.split('/');
        pathTmp.pop();
        $scope.path = pathTmp.join('/');
        
        getFiles($scope.path);
      }
      
      $scope.onThumbnails = function() {
        var paths = $scope.images.map(function(d) { return d.path; });
        $location.path('/');
        
        $timeout(function() {
          $scope.$emit('thumbnails', paths);
        });
        
      }
      
      $scope.ok = function() {
        $modalInstance.close();
      };
      
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    
    });

})();