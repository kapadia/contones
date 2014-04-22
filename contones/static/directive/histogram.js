(function() {
  'use strict';
  
  angular.module('ContoneApp')
    .directive('histogram', function($rootScope, $q, Api, debounce) {
      
      return {
        restrict: 'C',
        link: function postLink(scope, element, attrs) {
          console.log('histogram directive');
          
          var width = element[0].offsetWidth;
          var height = width * 9 / 16;
          element[0].style.height = height + 'px';
          
          var margin = {top: 0, right: 0, bottom: 20, left: 30};
          var x = d3.scale.linear();
          var y = d3.scale.linear();
          var xAxis = d3.svg.axis().orient('bottom');
          var yAxis = d3.svg.axis().orient('left');
        
          var svg = d3.select(element[0])
              .append('svg')
            .attr("width", width)
            .attr("height", height);
          
          width = width - margin.left - margin.right;
          height = height - margin.top - margin.bottom;
          
          var histogramEl = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
          var xAxisEl = histogramEl.append('g').attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')');
          var yAxisEl = histogramEl.append('g').attr('class', 'y axis');
          
          function updateHistogram(data) {
            console.log(data);
            histogramEl.selectAll(".bin").remove();
            svg.select(".brush").remove();
            
            var binEdges = data["bin_edges"];
            var counts = data["counts"];
            
            var minimum = binEdges[0];
            var maximum = binEdges[binEdges.length - 1];
            
            var histogram = counts.map(function(d, i) {
              return {
                count: d,
                xmin: binEdges[i],
                xmax: binEdges[i + 1]
              };
            });
            
            x.domain([minimum, maximum]).range([0, width]);
            y.domain([1, d3.max(counts)]).range([height, 0]);
            
            xAxis.scale(x);
            yAxis.scale(y);
            xAxisEl.call(xAxis);
            yAxisEl.call(yAxis);
            
            var bins = histogramEl.selectAll(".bin")
                .data(histogram)
              .enter().append("g")
                .attr("class", "bin")
                .attr("transform", function(d, i) {
                  return "translate(" + x(d.xmin) + "," + y(d.count) + ")";
                });
            
            bins.append("rect")
                .attr("x", 1)
                .attr("width", function(d) {
                  return x(minimum + d.xmax - d.xmin);
                })
                .attr("height", function(d) {
                  var rectHeight = height - y(d.count);
                  return (rectHeight > 0) ? rectHeight : 0;
                });
            
            // Brushing interaction
            svg.append("g")
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
              .attr('width', width)
              .attr('height', height)
              .attr('class', 'brush')
              .call(d3.svg.brush().x(x)
                .on('brushend', function() {
                  $rootScope.$broadcast("getImageScaled", d3.event.target.extent());  
                })
              )
              .selectAll('rect')
              .attr('height', height);
            
          }
          
          scope.$watch('bandIndex', function(newValue, oldValue) {
            if (newValue === oldValue) { return; }
            
            var deferred = $q.defer();
            deferred.promise.then(updateHistogram);
            Api.getHistogram(deferred, scope.filename, scope.bandIndex);
          });
        }
      }
      
    });
  
})();