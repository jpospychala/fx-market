'use strict';

angular.module('clientApp')
    .controller('MainCtrl', function ($scope, Fxmarket) {
        $scope.history = Fxmarket.history;
        $scope.rates = Fxmarket.rates;
});
