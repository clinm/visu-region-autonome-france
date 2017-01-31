var CHART = {};

CHART.settings = {
    w: 600,
    h: 600,
    wAxeY: 100,
    hAxeX: 200,
    containerId: "#chart-container",
    sorted: false,
    selectedYear: 0,
    duration: 500
};

CHART.chart = function(dataset, params) {

    var xScale;

    var yScale;

    var xAxis;

    var yAxis;

    var data;

    function handleBars() {
        //Define key function
        var key = function(d){return d.name};

        var svg = d3.select(params.containerId).select("#chart");

        var barPositionPipeline = function(selection) {
            selection.attr("class", function(d){return d[params.displayValue] < 0 ? "negative" : "positive";})
                .attr("x", function(d){
                        return xScale(d.name);
                    })

                .attr("y", function(d){
                        return yScale(Math.max(0, d[params.displayValue]));
                    })
                .attr("width", xScale.bandwidth())
                .attr("height", function(d){
                        return Math.abs(yScale(d[params.displayValue]) - yScale(0));
                });
        };


        svg.selectAll("rect")
            .data(data, key)
            .enter()
            .append("rect")
            .call(barPositionPipeline);

        svg.selectAll("rect")
            .data(data, key)
            .transition()
            .duration(params.duration)
            .call(barPositionPipeline);

    }

    function handleAxes() {
        var svg = d3.select(params.containerId).select("#chart");
        var yAxisDom = svg.select(".y-axis");
        if (yAxisDom.size()) {
            yAxisDom.call(yAxis)
        } else {
            //Add y-axis
            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate("+ params.wAxeY + ",0)")
                .call(yAxis);
        }

        var xAxisDom = svg.select(".x-axis");
        var labels;
        if (xAxisDom.size()) {
            labels = xAxisDom
                .attr("transform", "translate(0, "+ yScale(0) + ")")
                .transition()
                .duration(params.duration)
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
            return data[i][params.displayValue] >= 0.0;
        }

        labels.filter(function(d, i) { return isPositive(i)})
            .style("text-anchor", "end")
            .attr("dx", -10);


        labels.filter(function(d, i) { return !isPositive(i); })
            .style("text-anchor", "start")
            .attr("dx", 10);
    }

    function updateAxisScale() {
              //
        // returns an array of arrays where each element represents [min, max] for
        // the given year
        var extentEach = d3.extent(dataset, function(d) {
            return d3.extent(d["regions"], function(a) {
                return a[params.displayValue];
            });
        });

        // merges arrays and retrieves global [min, max]
        var yDomain = d3.extent(d3.merge(extentEach));

        var yRangeBegin = 0;
        if(yDomain[0] >= 0){
            yRangeBegin = params.h - params.hAxeX;
            yDomain[0] = 0;
        }else {
            yRangeBegin = params.h;
        }
        //Scale function for axes and radius
        yScale = d3.scalePow()
            .domain(yDomain)
            .range([yRangeBegin, 0]);

        xScale = d3.scaleBand()
                .rangeRound([params.wAxeY, params.w])
                .padding(0.1)
                .domain(data.map(function(d){ return d.name;}));


        //Create y axis
        yAxis = d3.axisLeft().scale(yScale);

        xAxis = d3.axisTop().scale(xScale);
    }

    function sortChoice(sorted){
        if (sorted) {
            return function(a,b){return b[params.displayValue] - a[params.displayValue];};
        } else {
            return function(a,b){return d3.ascending(a.name, b.name);};
        }
    }

    var updateChart = function(settings) {
        params = settings;

        data = dataset[settings.selectedYear]["regions"].sort(sortChoice(settings.sorted));

        updateAxisScale();

        handleBars();

        handleAxes();

    };

    var createChart = function() {
        //Create svg element
        d3.select(params.containerId).append("svg")
            .attr("width", params.w).attr("height", params.h)
            .attr("id", "chart");

        return this;
    };

    var obj = {
        update: updateChart,
        create: createChart,
        getConf: function() {
            return params;
        },
        createSelect: function(selectID) {
            d3.select(selectID)
                .selectAll('option')
                .data(dataset)
                .enter()
                .append('option')
                .attr('value', function(d, i) {return i})
                .text(function(d) {return d.year});
        }
    };

    return obj.create();

};

CHART.bindToDom = function(queries, chart) {
    $(queries.display_value).on('change', function() {
        var conf = chart.getConf();
        conf.displayValue = $(this).attr('value');
        chart.update(conf);
    });

    $(queries.sorted).on('change', function() {
        var conf = chart.getConf();
        conf.sorted = $(this).is(':checked');
        chart.update(conf);
    });

    $(queries.years).on('change', function() {
        var conf = chart.getConf();
        conf.selectedYear = $(this).val();
        chart.update(conf);
    });
};
