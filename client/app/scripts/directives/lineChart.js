'use strict';

angular.module('clientApp')
  .directive('lineChart', function () {
    return {
      template: '<div></div>',
      restrict: 'A',
      scope: {lineChart:'=lineChart'},
      controller : function($scope, $timeout) {
          
          $scope.hook_diagram = function(id) {
              var margin = {top: 20, right: 20, bottom: 30, left: 50},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;
              
              $scope.height = height;
          
              $scope.x = d3.scale.linear()
                  .range([0, width]);
          
              $scope.y = d3.scale.linear()
                  .range([height, 0]);
          
              $scope.xAxis = d3.svg.axis()
                  .scale($scope.x)
                  .orient("bottom");
          
              $scope.yAxis = d3.svg.axis()
                  .scale($scope.y)
                  .orient("left");
          
              $scope.line = d3.svg.line()
                  .x(function(d) { return $scope.x(d.i); })
                  .y(function(d) { return $scope.y(d.price); });
          
              $scope.svg = d3.select("#"+id).append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          }
    
          var draw = function(dataset) {
            
            var alldata = [];
            for (data in dataset) {
                alldata = alldata.concat(dataset[data]);
            }
            $scope.x.domain(d3.extent(alldata, function(d) { return d.i; }));
            $scope.y.domain(d3.extent(alldata, function(d) { return d.price; }));
    
            $scope.svg.selectAll("*").remove();
            $scope.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + $scope.height + ")")
                .call($scope.xAxis);
    
            $scope.svg.append("g")
                .attr("class", "y axis")
                .call($scope.yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Price");
    
            for (var data in dataset) {
                $scope.svg.append("path")
                    .datum(dataset[data])
                    .attr("class", data)
                    .attr("d", $scope.line);              
            }
          };
          
          $scope.$watch('lineChart', function() {
              draw($scope.lineChart); 
           }, true);
           
      },
      link: function postLink(scope, element, attrs) {
        scope.hook_diagram(attrs.id);
      }
    };
  });
