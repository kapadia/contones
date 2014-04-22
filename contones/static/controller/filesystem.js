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
        
        // modalInstance.result.then(function(selectedItem) {
        //   $scope.selected = selectedItem;
        // }, function() {
        //   $log.info('Modal dismissed');
        // });
        
      };
    
    });

  angular.module('ContoneApp')
    .controller('ModalInstanceCtrl', function($scope, $modalInstance, files) {
      console.log('ModalInstanceCtrl');
      
      $scope.files = files;
      
      
      $scope.ok = function() {
        $modalInstance.close();
      };
      
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    
    });

})();