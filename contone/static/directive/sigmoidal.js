(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .directive('sigmoidal', function($rootScope, $q, $location, Api) {
      
      return {
        restrict: 'C',
        templateUrl: "/static/views/sigmoidal.html",
        link: function postLink(scope, element, attrs) {
          console.log('sigmoidal directive');
          
          scope.$watch('threshold', _.debounce(function() {
            $rootScope.$broadcast("getSigmoidal", scope.threshold, scope.contrast);
          }, 800))
          
          scope.$watch('contrast', _.debounce(function() {
            $rootScope.$broadcast("getSigmoidal", scope.threshold, scope.contrast);
          }, 800));
        }
      }
      
    });
  
})();