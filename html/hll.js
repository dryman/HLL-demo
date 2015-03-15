(function(){
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  var x = d3.scale.ordinal().rangeRoundBands([0, width],  .1);
  var y = d3.scale.linear().rangeRound([0,height]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom");
  var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));

  var brush = d3.svg.brush().x(x).on("brush", brushed);

  var svg = d3.select('#chart').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  function render(data) {
    var bar = svg.selectAll(".bar")
                 .data(data)
                 .enter().append("g")
                 .attr("class", "g")
                 .attr("transform", function(d) {return "translate(" + x(d.x) + ",0)";});
    bar.selectAll(".dict_count")
       .data(function(d) {return [d];})
       .enter().append("rect")
       .attr("y", function(d){return y(d.dist_count);})
       .attr("height", function(d){return y(d.intersect)-y(d.dist_count);})
       .attr("class", "dist_count")
       .attr("width", x.rangeBand())
       .attr("y", function(d){return y(d.dist_count);})
       .attr("height", function(d){return y(d.intersect)-y(d.dist_count);})
       .attr("fill", "steelblue")
       .exit().remove();

    bar.selectAll(".intersect")
       .data(function(d) {return [d];})
       .attr("y", function(d){return y(d.intersect);})              // update
       .attr("height", function(d){return height-y(d.intersect)})
       .enter().append("rect")
       .attr("class", "intersect")                                  // create
       .attr("width", x.rangeBand())
       .attr("y", function(d){return y(d.intersect);})
       .attr("height", function(d){return height-y(d.intersect)})
       .attr("fill", "lightseagreen")
       .exit().remove();                                            // delete
  }

  function brushed() {
    brush;
  }

  d3.csv("sticky.csv", function(error, data) {
    var i = 1;
    data.forEach(function(d){
      //console.log(d.hyperloglog);
      d.x = i++;
      d.hll = hll.fromHexString(d.hyperloglog).hllSet;
      //console.log(d.hll.cardinality());
    });
    x.domain(data.map(function(d) { return d.x; }));
    var max = d3.max(data,function(d){return d.hll.cardinality();});
    console.log("max domain:" + max);
    y.domain([0, max]);
    //y.domain([0,10000]);

    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0,"+height+")")
       .call(xAxis);

    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
      .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .style("text-anchor", "end")
       .text("Unique users");

    var idx = svg.selectAll(".idx")
                 .data(data)
                 .enter().append("g")
                 .attr("class", "g")
                 .attr("transform", function(d) {return "translate(" + x(d.x) + ",0)";});
                 //.select("rect")
                 //.enter().append("rect")
                 //.attr("x", function(d) {return x(d.x)})
                 //.attr("width", x.rangeBand())
                 //.style("fill", "steelblue")
                 //.attr("y", function(d) {return y(d.hll.cardinality());})
                 //.attr("height", function(d) {
                 //  var car = d.hll.cardinality();
                 //  console.log(y(car));
                 //  return height -y(car);
                 //});

   idx.selectAll("rect")
      .data(function(d){
        //console.log(d);
        return [d]})
      .enter().append("rect")
      //.attr("transform", function(d) {return "translate(" + x(d.x) + ",0)";})
      //.attr('y', 0)
      .attr("width", x.rangeBand())
      .attr('y', function(d){console.log(d); return y(d.hll.cardinality());})
      //.attr('y', function(d){console.log(y(d)); return y(d);})
      //.attr("height", function(d){return height;})
      .attr("height", function(d){console.log(d); return height - y(d.hll.cardinality());})
      //.attr("height", function(d) {return y(d.hll.cardinality())})
      .style("fill", "steelblue");
  });

})();
