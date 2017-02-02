var CHART = {};

CHART.settings = {
    w: 600,
    h: 600,
    padding: 50,
    wAxeY: 50,
    hAxeX: 180,
    containerId: "#chart-container",
    sorted: false,
    selectedYear: 0,
    colorCriteria: "diff",
    duration: 500,
    title: "Default title",
    axeYTitle: "Kilo tonne d’équivalent pétrole",
    selectedElement: [],
    displaySelectedOnly: false
};

CHART.chart = function(dataset, params) {

    var xScale;

    var yScale;

    var xAxis;

    var yAxis;

    var data;

    function toggleSelection(name) {
         var index = params.selectedElement.indexOf(name);

        var actionAdd;
        if (index == -1) {
            params.selectedElement.push(name);
            actionAdd = true;
        } else {
            params.selectedElement.splice(index, 1);
            actionAdd = false;
        }

        if (params.selectionCallback) {
            params.selectionCallback(name, actionAdd);
        }
    }

    function handleBars() {
        //Define key function
        var key = function(d){return d.name};

        var svg = d3.select(params.containerId).select("#chart");

        var barPositionPipeline = function(selection) {
            selection.attr("class", function(d, id){
                    var classes = d[params.colorCriteria] < 0 ? "negative" : "positive";

                    if (params.selectedElement.indexOf(data[id].name) > -1) {
                        classes += " selected";
                    }
                    return classes
            })
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

        var bars = svg.selectAll("rect")
                    .data(data, key);

        bars.enter()
            .append("rect")
            .call(barPositionPipeline)
            .on('click', function(elt) {
                toggleSelection(elt.name);
                obj.update(params);
            });

        bars.exit()
            .remove();

        bars.transition()
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
                .attr("transform", "translate("+ (params.wAxeY + params.padding) + ",0)")
                .call(yAxis);
        }

        var xAxisDom = svg.select(".x-axis");
        var labels;

        labels = xAxisDom
            .attr("transform", "translate(0, "+ yScale(0) + ")")

            .transition()
            .duration(params.duration)
            .call(xAxis)
            .selectAll("text")
            .style("alignment-baseline", "middle")
            .attr("transform", "rotate(-90)")
            .attr("dy", "10");

        xAxisDom.selectAll("text")
            .on('click', function() {
                toggleSelection($(this).text());
                obj.update(params);
            });

        labels.attr('class', function(name) {
            var classes = "";
            if (params.selectedElement.indexOf(name) > -1) {
                classes = "selected";
            }
            return classes;
        });

        function isPositive(i) {
            for (var elt in data) {
                if (data[elt].name == i) {
                    return data[elt][params.displayValue] >= 0.0;
                }
            }
        }

        labels.filter(function(d) {
            return isPositive(d);
        })
            .style("text-anchor", "end")
            .attr("dx", -10);

        labels.filter(function(d) { return !isPositive(d); })
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
            yRangeBegin = params.h + params.padding;
        }

        // closest thousand up
        yDomain[1] = Math.ceil(yDomain[1] / 1000) * 1000;

        //Scale function for axes and radius
        yScale = d3.scalePow()
            .domain(yDomain)
            .range([yRangeBegin, params.padding]);

        xScale = d3.scaleBand()
                .rangeRound([params.wAxeY + params.padding, params.w + params.padding])
                .padding(0.1)
                .domain(data.map(function(d){ return d.name;}));


        //Create y axis
        yAxis = d3.axisLeft().scale(yScale);

        xAxis = d3.axisTop().scale(xScale);

        d3.select(params.containerId)
            .select(".axe-y-title")
            .transition()
            .duration(params.duration)
            .attr("transform", "translate("+ (params.padding/2) +","+((yRangeBegin + params.padding) / 2) +")rotate(-90)")
            .text(params.axeYTitle);
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

        if (params.selectedElement.length) {
            if (params.selectedOnly) {
                data = data.filter(function(elt) {
                    return params.selectedElement.indexOf(elt.name) > -1;
                });
            }
        }

        updateAxisScale();

        handleBars();

        handleAxes();

        d3.select(params.containerId)
            .select("h1")
            .classed("bar-chart-title", true)
            .text(params.title);


    };

    var createChart = function() {
        //Create svg element
        var padding = 2 * params.padding;

        var container = d3.select(params.containerId);

        container.append("h1")
            .text(params.title);

        container.append("svg")
            .attr("width", params.w + padding).attr("height", params.h + padding)
            .attr("id", "chart")
            .append("text")
            .classed("axe-y-title", true)
            .attr("text-anchor", "middle");


        container.select("#chart")
            .append("g")
            .attr("class", "x-axis");

        return this;
    };

    var obj = {
        update: updateChart,
        create: createChart,
        getConf: function() {
            return params;
        },
        getData: function() {
            return dataset;
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

    function createTitle() {
        var displayedValue = {
            "prod": "Production",
            "cons": "Consommation",
            "diff": "Excédent"
        };

        var conf = chart.getConf();
        var title = displayedValue[conf.displayValue];

        var year = chart.getData()[conf.selectedYear].year;
        title += " en " + year;

        conf.title = title;
    }

    createTitle();

    $(queries.comparedValue).on('change', function() {
        var conf = chart.getConf();
        conf.displayValue = $(this).val();
        createTitle();
        chart.update(conf);
    });

    $(queries.sorted).on('change', function() {
        var conf = chart.getConf();
        conf.sorted = $(this).is(':checked');
        createTitle();
        chart.update(conf);
    });

    $(queries.selectedOnly).on('change', function() {
        var conf = chart.getConf();
        conf.selectedOnly = $(this).is(':checked');
        createTitle();
        chart.update(conf);
    });

    $(queries.years).on('change', function() {
        var conf = chart.getConf();
        conf.selectedYear = $(this).val();
        createTitle();
        chart.update(conf);
    });
};
