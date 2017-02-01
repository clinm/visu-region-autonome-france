var RANK_ARRAY = {};

RANK_ARRAY.settings = {
    containerId: "#rank-array",
    selectedYear: 0,
    comparedValue: "diff",
    sorted: true
};


RANK_ARRAY.rankArray = function(dataset, params) {

    var data;

    var sortedDataset;

    var currentDataset;

    var mapToRows = function(selection) {

        var columns = ['name'];

        return selection.selectAll('td')
            .data(function (row, id) {

                var res = columns.map(function (column) {
                    return {column: column, value: row[column]};
                });

                res.unshift({column: "rank", value: id + 1});
                return res;
            });
    };

    var rowsPipeLine = function(selection) {
         selection.text(function (d) { return d.value; });
    };

    var updateArray = function(settings) {
        params = settings;
        pickDataset();

        data = currentDataset[params.selectedYear].regions;

        var table = d3.select(params.containerId);

        var rows = table.append('tbody')
            .selectAll('tr')
            .data(data);

        mapToRows(rows).call(rowsPipeLine);


    };

    var pickDataset = function() {
        if (params.sorted) {
            console.log("sorted");
            currentDataset = sortedDataset;
        } else {
            console.log("dataset");
            currentDataset = dataset;
        }
    };

    // Duplicate rankChart
    function orderByRank(data, comparedValue){
        JSON.parse(JSON.stringify(nodesArray)).forEach(function(oneYear){
            oneYear.regions.sort(function(a, b){
                return b[comparedValue] - a[comparedValue];
            })
        });
        return data;
    }

    var createArray = function() {
        //TODO remove side effect when sorting
        sortedDataset = orderByRank(dataset, params.comparedValue);

        pickDataset();

        data = currentDataset[params.selectedYear].regions;

        var header = ['Rang', 'Région'];

        var table = d3.select(params.containerId)
            .append('table')
            .classed('table', true);


        table.append('thead')
            .append('tr')
            .selectAll('th')
            .data(header)
            .enter()
            .append('th')
            .text(function(d) { return d});


        var rows = table.append('tbody')
            .selectAll('tr')
            .data(data)
            .enter()
            .append('tr');

        mapToRows(rows)
            .enter()
            .append('td')
            .call(rowsPipeLine);

        updateArray(params);
    };

    var obj = {
        create: createArray,
        update: updateArray,
        getConf: function() {
            return params;
        }
    };

    obj.create();


    return obj;

};