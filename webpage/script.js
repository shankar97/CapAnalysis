//js script for analysis
var datalog = [];

d3.csv("../scripts/analysisNew.csv").then(function(data) {
	data.forEach(function(d){
		d.Risk = parseFloat(d.Risk);
		d.ROI = parseFloat(d.ROI);
		d.empId = d.empId;
		d.color_risk = +d.color_risk;
		d.Risk = Math.round(d.Risk*100)/100;
	  });
	datalog = data;
    var margin = { top: 40, right: 40, bottom: 30, left: 30 };
    	width = 900 - margin.left - margin.right,
    	height = 480 - margin.top - margin.bottom;
    var color = d3.scaleOrdinal(d3.schemeCategory10)
    			.domain([0,1,2,3]);
    var xpoint = "Risk";
    var ypoint = "ROI";
    var ccode = "color_risk";

    var x = d3.scaleLinear()          
          .range([0, width])
          .nice();

    var y = d3.scaleLinear()
        .range([height, 0])
        .nice();

    var xAxis = d3.axisBottom(x).ticks(12),
        yAxis = d3.axisLeft(y).ticks(12 * height / width);
 
    var svg = d3.select("#plot").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var zoom = d3.zoom()
			    .scaleExtent([.5, 20])
			    .extent([[0, 0], [width, height]])
			    .on("zoom", zoomed);

	//Margins for clippings rect
	var rect_l = -5;
	var rect_r = 5;

	// Clipping region allocation
	svg.append("rect")
	    .attr("width", width)
	    .attr("height", height)
	    .style("fill", "none")
	    .style("pointer-events", "all")
	    .attr('transform', 'translate(' + rect_r + ',' + rect_l + ')')
	    .call(zoom);


	// Create clipping area so when zooming only required points show
	svg.append("defs").append("clipPath")
	    .attr("id", "clip")
	  .append("rect")
	    .attr("width", width)
	    .attr("height", height);

    var xExtent = d3.extent(datalog, function (d) { return d[xpoint]; });
    var yExtent = d3.extent(datalog, function (d) { return d[ypoint]; });
    x.domain(d3.extent(datalog, function (d) { return d[xpoint]; })).nice();
    y.domain(d3.extent(datalog, function (d) { return d[ypoint]; })).nice();

    var points_g = svg.append("g")
	  .attr("clip-path", "url(#clip)")
	  .attr("id", "scatterplot")
	  .classed("points_g", true);

    var points = points_g.selectAll(".dot")
        .data(datalog)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("id", function(d){return RiskScore(d["color_risk"]);})
        .attr("r", 2.5)
        .attr("cx", function (d) { return x(d[xpoint]); })
        .attr("cy", function (d) { return y(d[ypoint]); })
        .attr("opacity", 0.5)
        .style("fill", function (d) {return color(d["color_risk"]);})
        .on("click",function (d) {displayEmployeeInfo(d);});

    var gX = svg.append("g")
       .attr("class", "x axis")
       .attr('id', "axis--x")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis);

    svg.append("text")
     .style("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 8)
     .text("Risk");

    // y axis
    var gY = svg.append("g")
        .attr("class", "y axis")
        .attr('id', "axis--y")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("Work Output");

    var legend = svg.selectAll(".legend")
	      .data(color.domain())
	    .enter().append("g")
	      .classed("legend", true)
	      .attr("transform", function(d, i) { return "translate(-180," + i * 20 + ")"; });

	legend.append("circle")
	      .attr("r", 5)
	      .attr("cx", width + 20)
	      .attr("fill", color);

	legend.append("text")
	      .attr("x", width + 26)
	      .attr("dy", ".35em")
	      .text(function(d) {return RiskScore(d);})
	      .on("click", function(d) {displayinfo(d);});

	function RiskScore(a){
		if (a == 0)
			return "Low Risk";
		if (a == 1)
			return "High Output, Low Risk"
		if (a == 2)
			return "Highly talented, Low output"
		if (a == 3)
			return "High Risk"
	}

    function brushended() {

        var s = d3.event.selection;
        if (!s) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
            x.domain(d3.extent(datalog, function (d) { return d[xpoint]; })).nice();
            y.domain(d3.extent(datalog, function (d) { return d[ypoint]; })).nice();
        } else {
            
            x.domain([s[0][0], s[1][0]].map(x.invert, x));
            y.domain([s[1][1], s[0][1]].map(y.invert, y));
            scatter.select(".brush").call(brush.move, null);
        }
        zoom2();
    }

    function zoomed() {
		// create new scale ojects based on event
		    var new_xScale = d3.event.transform.rescaleX(x);
		    var new_yScale = d3.event.transform.rescaleY(y);
		// update axes
		    gX.call(xAxis.scale(new_xScale));
		    gY.call(yAxis.scale(new_yScale));
		    points.data(data)
		     .attr('cx', function(d) {return new_xScale(d[xpoint])})
		     .attr('cy', function(d) {return new_yScale(d[ypoint])});
		}

    var axisAppend = [true,true,true,true];
    var data_points = document.getElementsByClassName("dot");

    function displayinfo(val){
    	if(val == 0)
    		axisAppend[0] = axisAppend[0] ? false : true;
    	if(val == 1)
    		axisAppend[1] = axisAppend[1] ? false : true;
    	if(val == 2)
    		axisAppend[2] = axisAppend[2] ? false : true;
    	if(val == 3)
    		axisAppend[3] = axisAppend[3] ? false : true;

    	for (var i = 0; i < data_points.length; i++) {
    		if(data_points[i].id == RiskScore(val)){
        		if(val == 0)
        			data_points[i].style.opacity = opacityFill(axisAppend[0]);
	        	if(val == 1)
	        		data_points[i].style.opacity = opacityFill(axisAppend[1]);
	        	if(val == 2)
	        		data_points[i].style.opacity = opacityFill(axisAppend[2]);
	        	if(val == 3)
	        		data_points[i].style.opacity = opacityFill(axisAppend[3]);
        }
    	}

    }

    function opacityFill(n){
    	return (n ? 0.5 : 0);
    }

    var tableSelection = document.getElementById("employee-list")
    function displayEmployeeInfo(data_row){
    	console.log("test");
    	$("#employee-list").append('<tr><td>' + data_row.empId + '</td>' +
    								'<td>' + data_row.satisfaction_level + '</td>' +
    								'<td>' + data_row.last_evaluation + '</td>' +
    								'<td>' + data_row.number_project + '</td>' + 
    								'<td>' + data_row.average_montly_hours + '</td>' + 
    								'<td>' + data_row.time_spend_company + '</td>' + 
    								'<td>' + data_row.salary + '</td>' + 
    								'<td>' + data_row.sales + '</td>' + 
    								'<td>' + data_row.ROI + '</td>' + 
    								'<td>' + data_row.Risk + '</td></tr>');

    }
});

var svg = d3.select("#graph").append("svg")
            .attr("width",960)
            .attr("height",600),
    width = 960,
    height = 600;

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));
d3.json("../scripts/datagraph.json").then(function(graph) {
  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return d.value; });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group*10); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
