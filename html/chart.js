(function() {
  nv.addGraph(function() {
    var chart = nv.models.lineChart()
                  //.margin({top: 10, bottom: 30, left: 40, right: 10})
                  .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                  .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                  .showYAxis(true)        //Show the y-axis
                  .showXAxis(true)        //Show the x-axis
                  .forceY([-3,3])
    ;
  chart.xAxis.tickFormat(d3.format(',s'));
  chart.yAxis.tickFormat(d3.format(',.5f'));
    var data;
    d3.json("precision.json", function(error, json) {
      data = json;
      console.log(data);
      d3.select('#chart svg')
        .datum(data)
        .call(chart);
    });
    nv.utils.windowResize(function() {chart.update() });
    return chart;
  });
})();
