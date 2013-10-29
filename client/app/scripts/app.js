'use strict';

angular.module('clientApp', [
  'ngResource'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/brokers', {
        templateUrl: 'views/brokers.html',
        controller: 'BrokersCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
