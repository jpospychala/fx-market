'use strict';

angular.module('clientApp')
    .controller('MainCtrl', function ($scope, Fxmarket) {
        $scope.history = Fxmarket.history;
        $scope.rates = Fxmarket.rates;
        
        $scope.$watch('history', function() {
            for (var k in $scope.history) {
                if ($scope.history[k].is_selected === undefined) {
                    $scope.history[k].is_selected = true;
                }
            } 
         }, true);
         
         $scope.select = function(name) {
             $scope.history[name].is_selected = true;
         } 
         
         $scope.selectAll = function(val) {
             for (var k in $scope.history) {
                 $scope.history[k].is_selected = val;
             } 
         }
});
