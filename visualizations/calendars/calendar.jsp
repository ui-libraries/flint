<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="shortcut icon" href="#" />
<style>
#calendar {
  margin: 20px;
}
.month {
  margin-right: 8px;
}
.month-name {
  font-size: 85%;
  fill: #777;
  font-family: Arial, Helvetica;
}
.day.hover {
  stroke: #6d6E70;
  stroke-width: 2;
}
.day.focus {
  stroke: #ffff33;
  stroke-width: 2;
}
</style>
</head>
<body>

<div id="calendar"></div>

<script src="//d3js.org/d3.v4.min.js"></script>
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
<script>

function drawCalendar(dateData){

  var weeksInMonth = function(month){
    var m = d3.timeMonth.floor(month)
    return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m,1)).length;
  }

  var minDate = d3.min(dateData, function(d) { return new Date(d.day) })
  var maxDate = d3.max(dateData, function(d) { return new Date(d.day) })

  var cellMargin = 2,
      cellSize = 20;

  var day = d3.timeFormat("%w"),
      week = d3.timeFormat("%U"),
      format = d3.timeFormat("%-m/%-d/%Y"),
      titleFormat = d3.utcFormat("%a, %d-%b");
      monthName = d3.timeFormat("%B"),
      months= d3.timeMonth.range(d3.timeMonth.floor(minDate), maxDate);

  var svg = d3.select("#calendar").selectAll("svg")
    .data(months)
    .enter().append("svg")
    .attr("class", "month")
    .attr("height", ((cellSize * 7) + (cellMargin * 8) + 20) )
    .attr("width", function(d) {
      var columns = weeksInMonth(d);
      return ((cellSize * columns) + (cellMargin * (columns + 1)));
    })
    .append("g")

  svg.append("text")
    .attr("class", "month-name")
    .attr("y", (cellSize * 7) + (cellMargin * 8) + 15 )
    .attr("x", function(d) {
      var columns = weeksInMonth(d);
      return (((cellSize * columns) + (cellMargin * (columns + 1))) / 2);
    })
    .attr("text-anchor", "middle")
    .text(function(d) { return monthName(d); })

  var rect = svg.selectAll("rect.day")
    .data(function(d, i) { return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth()+1, 1)); })
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("rx", 3).attr("ry", 3) // rounded corners
    .attr("fill", '#eaeaea') // default light grey fill
    .attr("y", function(d) { return (day(d) * cellSize) + (day(d) * cellMargin) + cellMargin; })
    .attr("x", function(d) { return ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellSize) + ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellMargin) + cellMargin ; })
    .on("mouseover", function(d) {
      d3.select(this).classed('hover', true);
    })
    .on("mouseout", function(d) {
      d3.select(this).classed('hover', false);
    })
    .datum(format);

  rect.append("title")
  .text(function(d) { return titleFormat(new Date(d)); });

var lookup = d3.nest()
  .key(function(d) { return d.day; })
  .rollup(function(leaves) {
    return d3.sum(leaves, function(d){ return parseInt(d.count); });
  })
  .object(dateData);

var scale = d3.scaleLinear()
  .domain(d3.extent(dateData, function(d) { return parseInt(d.count); }))
  .range([0.4,1]); // the interpolate used for color expects a number in the range [0,1] but i don't want the lightest part of the color scheme

rect.filter(function(d) { return d in lookup; })
  .style("fill", function(d) { return d3.interpolatePuBu(scale(lookup[d])); })
  .select("title")
  .text(function(d) { return titleFormat(new Date(d)) + ":  " + lookup[d]; });

}

d3.json("2015_not_all.jsp", function(response){
drawCalendar(response);
})


</script>
</body>
</html>
