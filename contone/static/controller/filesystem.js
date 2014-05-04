(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .controller('FileSystemCtrl', function($scope, $q, $modal, Api) {
      console.log('FileSystemCtrl');
      
      var path = '';
      
      var deferred = $q.defer();
      deferred.promise.then(function(data) {
        $scope.files = data;
      });
      Api.getFiles(deferred, path);
      
      $scope.onBrowse = function() {
        var modalInstance = $modal.open({
          templateUrl: '/static/views/filesystem.html',
          controller: 'ModalInstanceCtrl',
          resolve: {
            files: function() { return $scope.files; }
          }
        });
      };
      
    
    });

  angular.module('ContoneApp')
    .controller('ModalInstanceCtrl', function($scope, $rootScope, $q, $modalInstance, $location, $timeout, Api, files) {
      var path = null;
      $scope.files = files;
      
      function getFiles(path) {
        var deferred = $q.defer();
        deferred.promise.then(function(data) {
          $scope.files = data;
        });
        Api.getFiles(deferred, path);
      }
      
      $scope.onFile = function(file) {
        
        if (file.isDir) {
          path = file.path;
          getFiles(path);
        } else {
          var url = ['contone', file.path].join('/');
          $location.path(url);
          $modalInstance.close();
        }
      }
      
      $scope.onBack = function() {
        var pathTmp = path.split('/');
        pathTmp.pop();
        path = pathTmp.join('/');
        
        getFiles(path);
      }
      
      $scope.onThumbnails = function() {
        var files = $scope.files.filter(function(f) { return !f.isDir; });
        var paths = files.map(function(d) { return d.path; });
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