var dataset;
var par;

//Define bar chart function
function barChart(dataset, par){
    //Set width and height as fixed variables
    var w = 600;
    var h = 600;
    var padding = 50;
    var wAxeY = 100;
    var hAxeX = 200;

    var yDomain = d3.extent(dataset, function(d){ return d[par] });
    
    var yRangeBegin = 0;
    if(yDomain[0] >= 0){
        yRangeBegin = h - hAxeX;
        yDomain[0] = 0;
    }else {
        yRangeBegin = h;
    }
    //Scale function for axes and radius
    var yScale = d3.scalePow()
        .domain(yDomain)
        .range([yRangeBegin, 0]);

    var xScale = d3.scaleBand()
            .rangeRound([wAxeY, w])
            .padding(0.1)
            .domain(dataset.map(function(d){ return d.name;}));


    //Create y axis
    var yAxis = d3.axisLeft().scale(yScale);

    var xAxis = d3.axisTop().scale(xScale);

    //Define key function
    var key = function(d){return d.name};

    //Define tooltip for hover-over info windows
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //Create svg element
    var svg = d3.select("#chart-container").append("svg")
        .attr("width", w).attr("height", h)
        .attr("id", "chart")
    //    .attr("viewBox", "0 0 "+w+ " "+h)
    //    .attr("preserveAspectRatio", "xMinYMin");


    //Initialize state of chart according to drop down menu
    var state = d3.selectAll("option");

    //Create barchart
    svg.selectAll("rect")
        .data(dataset, key)
        .enter()
        .append("rect")
        .attr("class", function(d){return d[par] < 0 ? "negative" : "positive";})
        .attr("x", function(d){
                return xScale(d.name);
            })
        .attr("y", function(d){
                return yScale(Math.max(0, d[par]));
            })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d){
                return Math.abs(yScale(d[par]) - yScale(0));
            });

    //Add y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate("+ wAxeY + ",0)")
        .call(yAxis);

    var labels = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0, "+ yScale(0) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("alignment-baseline", "middle")
        .attr("transform", "rotate(-90)")
        .attr("dy", 10);

    labels.filter(function(d, i) { return dataset[i][par]>= 0.0})
        .style("text-anchor", "end")
        .attr("dx", -10);


    labels.filter(function(d, i) { return !(dataset[i][par]>= 0.0)})
        .style("text-anchor", "start")
        .attr("dx", 10);

    //Sort data when sort is checked
    d3.selectAll(".checkbox").
    on("change", function(){
        var x0 = xScale.domain(dataset.sort(sortChoice())
            .map(function(d){return d.name}))
            .copy();

        var transition = svg.transition().duration(750);
        var delay = function(d, i){return i*10;};

        transition.selectAll("rect")
            .delay(delay)
            .duration(500)
            .attr("x", function(d){return x0(d.name);});


        svg.select('.x-axis').selectAll('.tick')
            .transition()
            .delay(delay)
            .duration(500)
            .attr("transform", function(d){ return "translate("+ (x0(d) + (x0.bandwidth() / 2)) + ", 0)";});
    });

    //Function to sort data when sort box is checked
    function sortChoice(){
        var state = d3.selectAll("option");
        var sort = d3.select(".checkbox");

        if (sort.node().checked) {
            return function(a,b){return b[par] - a[par];};
        } else {
            return function(a,b){return d3.ascending(a.name, b.name);};
        }
    }
}




//Load data and call bar chart function
d3.json("diff.json", function(error,data){
    if(error){
        console.log(error);
    }else{
        var val = d3.select('input[name="choice"]:checked').attr('value')
        barChart(data[1]["regions"], val);
    }
});
