'use strict';

angular.module('clientApp')
  .controller('BrokersCtrl', function ($scope, Fxmarket) {
      $scope.brokers_log = Fxmarket.brokers_log;
  });
