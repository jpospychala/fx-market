'use strict';

angular.module('clientApp')
    .controller('MainCtrl', function ($scope, $http, $timeout) {
        $scope.history = {};
        
        var counter = 0;
        
        var get_rates = function() {
            $http.get('http://127.0.0.1:3000/rates').success(function(data, status, headers, config) {
                var new_rates = data;
                if ($scope.rates) {
                    for (var rate in new_rates) {
                        var new_price = new_rates[rate].price;
                        
                        if ($scope.rates[rate]) {
                            var old_price = $scope.rates[rate].price;
                            new_rates[rate].delta = new_price - old_price;
                        }
                        
                        var h_log = {'i':counter, 'price':new_price};
                        if (! $scope.history[rate]) {
                            $scope.history[rate] = [h_log];
                        } else {
                            $scope.history[rate].push(h_log);
                            $scope.history[rate].splice(0, $scope.history[rate].length - 100);
                        }
                    }
                    counter++;
                }
                $scope.rates = new_rates;
            }).error(function(data, status, headers, config) {
                $scope.rates = {};
                console.log('error');
            });
        };
        
        var get_rates_loop = function() {
            get_rates();
            if (get_rates_loop) {
                $timeout(get_rates_loop, 1000);
            }
        };
        
        get_rates_loop();
        
        $scope.$on('$destroy', function(event, args) {
            get_rates_loop = undefined; 
        });
});
