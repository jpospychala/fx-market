'use strict';

angular.module('clientApp')
  .controller('BrokersCtrl', function ($scope, Fxmarket) {
      $scope.brokers_log = Fxmarket.brokers_log;
      
      $scope.$watch('brokers_log', function() {
         for (var k in $scope.brokers_log) {
             if ($scope.brokers_log[k].is_selected === undefined) {
                 $scope.brokers_log[k].is_selected = true;
             }
         } 
      }, true);
      
      $scope.select = function(name) {
          $scope.brokers_log[name].is_selected = true;
      } 
      
      $scope.selectAll = function(val) {
          for (var k in $scope.brokers_log) {
              $scope.brokers_log[k].is_selected = val;
          } 
      }
  });
