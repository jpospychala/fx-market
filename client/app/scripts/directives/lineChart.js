'use strict';

angular.module('clientApp')
  .directive('lineChart', function () {
    return {
      template: '<div></div>',
      restrict: 'A',
      scope: {lineChart:'=lineChart'},
      controller : function($scope, $timeout) {
          
          $scope.hook_diagram = function(id, elem) {
              var margin = {top: 20, right: 200, bottom: 30, left: 50},
              width = elem[0].offsetWidth - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;
              
              $scope.height = height;
              $scope.width = width;
          
              $scope.x = d3.time.scale()
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
                  .x(function(d) { return $scope.x(d.x); })
                  .y(function(d) { return $scope.y(d.y); });
          
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
            $scope.x.domain(d3.extent(alldata, function(d) { return d.x; }));
            $scope.y.domain(d3.extent(alldata, function(d) { return d.y; }));
    
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
    
            var c = 0;
            for (var data in dataset) {
                var color = d3.hsl(c*30, 1.0/(c+1), 0.50);
                $scope.svg.append("path")
                    .datum(dataset[data])
                    .attr("class", "line")
                    .attr("style", "stroke: "+color)
                    .attr("d", $scope.line)
                    .attr('id', 'path'+data);
                
                $scope.svg.append("rect")
                    .attr("x", $scope.width + 5)
                    .attr("y", c*25 + 20)
                    .attr("width", 15)
                    .attr("height", 15)
                    .style("fill", color);
                    
                $scope.svg.append("text")
                    .attr("x", $scope.width + 25)
                    .attr("y", c*25 + 32)
                    .attr("width", 15)
                    .attr("height", 15)
                    .style("fill", color)
                    .text(data);
                c++;
            }
          };
          
          $scope.$watch('lineChart', function() {
              draw($scope.lineChart); 
           }, true);
           
      },
      link: function postLink(scope, element, attrs) {
        scope.hook_diagram(attrs.id, element);
      }
    };
  });
