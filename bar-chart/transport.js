var dataset;

var settings = {
    w: 600,
    h: 600,
    wAxeY: 100,
    hAxeX: 200,
    containerId: "#chart-container",
    sorted: false
};

var conf;


function createChart(settings) {
    //Create svg element
    d3.select(settings.containerId).append("svg")
        .attr("width", settings.w).attr("height", settings.h)
        .attr("id", "chart");
    //    .attr("viewBox", "0 0 "+w+ " "+h)
    //    .attr("preserveAspectRatio", "xMinYMin");

    //Define tooltip for hover-over info windows
    /*var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    */
}

//Define bar chart function
function barChart(data, settings){
    //Set width and height as fixed variables
    var w = settings.w;
    var h = settings.h;
    var wAxeY = settings.wAxeY;
    var hAxeX = settings.hAxeX;
    var displayValue = settings.displayValue;

    data = data.sort(sortChoice(settings.sorted));

    var yDomain = d3.extent(data, function(d){ return d[displayValue] });
    
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
            .domain(data.map(function(d){ return d.name;}));


    //Create y axis
    var yAxis = d3.axisLeft().scale(yScale);

    var xAxis = d3.axisTop().scale(xScale);

    //Define key function
    var key = function(d){return d.name};

    //Initialize state of chart according to drop down menu

    var svg = d3.select(settings.containerId).select("#chart");
    //Create bar chart

    var barPositionPipeline = function(selection) {
        selection.attr("class", function(d){return d[displayValue] < 0 ? "negative" : "positive";})
            .attr("x", function(d){
                    return xScale(d.name);
                })

            .attr("y", function(d){
                    return yScale(Math.max(0, d[displayValue]));
                })
            .attr("width", xScale.bandwidth())
            // .transition()
            // .duration(500)
            .attr("height", function(d){
                    return Math.abs(yScale(d[displayValue]) - yScale(0));
            });
    };


    svg.selectAll("rect")
        .data(data, key)
        .enter()
        .append("rect")
        .call(barPositionPipeline);

    svg.selectAll("rect")
        .data(data, key)
        .call(barPositionPipeline);


    var yAxisDom = svg.select(".y-axis");
    if (yAxisDom.size()) {
        yAxisDom.call(yAxis)
    } else {
        //Add y-axis
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate("+ wAxeY + ",0)")
            .call(yAxis);
    }

    var xAxisDom = svg.select(".x-axis");
    var labels;
    if (xAxisDom.size()) {
        labels = xAxisDom
            .attr("transform", "translate(0, "+ yScale(0) + ")")
            .call(xAxis)
            .selectAll("text");
    } else {
        labels = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0, "+ yScale(0) + ")")
            .call(xAxis)
            .selectAll("text")
            .style("alignment-baseline", "middle")
            .attr("transform", "rotate(-90)")
            .attr("dy", 10);
    }


    function isPositive(i) {
        return data[i][displayValue]>= 0.0
    }

    labels.filter(function(d, i) { return isPositive(i)})
        .style("text-anchor", "end")
        .attr("dx", -10);


    labels.filter(function(d, i) { return !isPositive(i); })
        .style("text-anchor", "start")
        .attr("dx", 10);

    //Function to sort data when sort box is checked
    function sortChoice(sorted){
        if (sorted) {
            return function(a,b){return b[displayValue] - a[displayValue];};
        } else {
            return function(a,b){return d3.ascending(a.name, b.name);};
        }
    }
}




//Load data and call bar chart function
d3.json("diff.json", function(error,data){
    dataset = data;
    if(error){
        console.log(error);
    }else{
        conf = $.extend({}, settings);
        conf.displayValue = d3.select('input[name="choice"]:checked').attr('value');

        createChart(conf);
        barChart(data[1]["regions"], conf);
    }

    $('input[name="choice"]').on('change', function() {
        conf.displayValue = $(this).attr('value');
        barChart(data[1]["regions"], conf);
    });

    $('.checkbox').on('change', function() {
        conf.sorted = $(this).is(':checked');
        barChart(data[1]["regions"], conf);
    });
});
