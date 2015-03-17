(function(){
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 1250 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  var x = d3.scale.ordinal().rangeRoundBands([0, width] );
  var x_time = d3.time.scale().range([0,width]);
  var y = d3.scale.linear().rangeRound([height,0]);

  var xAxis = d3.svg.axis().scale(x_time).orient("bottom");
  var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));
  var color = d3.scale.ordinal().range(['#3182bd', '#e6550d']);

  var brush = d3.svg.brush()
                .x(x_time)
                .on("brush", brushed);

  var svg = d3.select('#chart').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  var raw_data;

  function render(data) {
    var bar = svg.selectAll(".bar")
                 .data(data);
              //,function(d){return d.date;});
    //bar.each( function(d,i) { console.log(i); });
    bar.enter()
       .append("g")
       .attr("class", "bar")
       .attr("transform", function(d) {return "translate(" + x(d.date) + ",0)";});
    //bar.exit().remove();
    var bb = bar.selectAll(".dist_count")
             .data(function(d,i) { return d.bars;});
    bb.attr("height", function(d,i){ return y(d.y0) - y(d.y1);}) ;
    bb.attr("y", function(d,i){ return y(d.y1);}) ;
    bb.enter().append("rect")
      .attr("class", "dist_count")
      .attr("width", x.rangeBand()-1)
      .attr("y", function(d){return y(d.y1);})
      .attr("height", function(d,i){ return y(d.y0) - y(d.y1);})
      .attr("fill", function(d){ return d.color; })
       ;
    bb.exit().remove();
  }

  function brushed() {
    if (!brush.empty()){
      var extent = brush.extent();
      var start = extent[0].getTime();
      var end = extent[1].getTime();
      var filtered = data_raw.filter(function(d) { return (d.time.getTime() > start && d.time.getTime() < end)});
      if (filtered.length != 0) {
        var hllUnion = filtered[0].hll.clone();
        for (i=1; i<filtered.length; i++) {
          hllUnion.union(filtered[i].hll);
        }
        var unionCount = hllUnion.cardinality();
        data_raw.map(function(d) {
          var hllClone = d.hll.clone();
          hllClone.union(hllUnion);
          d.intersection = d.dist_count + unionCount - hllClone.cardinality();
          if (d.intersection < 0 ) {
            console.log("intersection > total count: ", d.intersection);
            d.intersection = 10000;
          }
        });
      } else {
        data_raw.map(function(d) { d.intersection = 0;});
      }
    } else {
      data_raw.map(function(d) { d.intersection = 0;});
    }
    data_raw.map(function(d) {
      // only the dist count data first
      d.bars = [
        {"y0": d.intersection, "y1": d.dist_count,   "color": '#3182bd'},
        {"y0": 0,              "y1": d.intersection, "color": '#2ca02c'}
      ];
    });
    
    render(data_raw);
  }

  d3.csv("sticky.csv", function(error, data_in) {
    data_raw = data_in;
    var i = 1;
    var date_format = d3.time.format("%Y-%m-%d %H:%M:%S");
    data_raw.forEach(function(d){
      d.x = i++;
      d.hll = hll.fromHexString(d.hyperloglog).hllSet;
      d.intersection = 0;
      d.dist_count = d.hll.cardinality();
      d.time = date_format.parse(d.date);
    });
    x.domain(data_raw.map(function(d) { return d.date; }));
    x_time.domain([data_raw[0].time, data_raw[data_raw.length-1].time]);
    var max = d3.max(data_raw,function(d){return d.dist_count;});
    y.domain([0, max]);

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
       .attr("dy", ".71em")
       .style("text-anchor", "end")
       .text("Unique users");

    svg.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", height + 7);
    
    brushed();


  });

})();
