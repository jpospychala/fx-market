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
                
                draw($scope.history);
            }).error(function(data, status, headers, config) {
                $scope.rates = {};
                console.log('error');
            });
        };
        
        var get_rates_loop = function() {
            get_rates();
            $timeout(get_rates_loop, 1000);
        };
        
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        
        var x = d3.scale.linear()
            .range([0, width]);
    
        var y = d3.scale.linear()
            .range([height, 0]);
    
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
    
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
    
        var line = d3.svg.line()
            .x(function(d) { return x(d.i); })
            .y(function(d) { return y(d.price); });
    
        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var draw = function(dataset) {
          
          var alldata = [];
          for (data in dataset) {
              alldata = alldata.concat(dataset[data]);
          }
          x.domain(d3.extent(alldata, function(d) { return d.i; }));
          y.domain(d3.extent(alldata, function(d) { return d.price; }));

          svg.selectAll("*").remove();
          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Price");

          for (var data in dataset) {
              svg.append("path")
                  .datum(dataset[data])
                  .attr("class", data)
                  .attr("d", line);              
          }
        };
        
        get_rates_loop();
        
        
});
