(function() {
  'use strict';
  
  angular.module('ContoneApp', ['ngRoute', 'mm.foundation'])
    .config(function($routeProvider, $locationProvider) {
      
      $routeProvider
        .when('/', {
          templateUrl: '/static/views/main.html',
          controller: 'MainCtrl'
        })
        .when('/contone/:filename*', {
          templateUrl: '/static/views/contone.html',
          controller: 'ContoneCtrl',
          reloadOnSearch: false
        })
        .otherwise({
          redirectTo: '/'
        });
        
        $locationProvider.html5Mode(true);
    });

})();
