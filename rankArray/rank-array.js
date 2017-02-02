var RANK_ARRAY = {};

RANK_ARRAY.settings = {
    containerId: "#rank-array",
    selectedYear: 0,
    displayValue: "diff",
    sorted: true
};


RANK_ARRAY.rankArray = function(dataset, params) {

    var data;

    var mapToRows = function(selection) {

        var columns = ['name', params.displayValue];

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
        data = dataset[settings.selectedYear]["regions"].sort(sortChoice(params.sorted));

        var table = d3.select(params.containerId);

        var rows = table
            .selectAll('tbody')
            .selectAll('tr')
            .data(data);

        mapToRows(rows)
            .call(rowsPipeLine);


    };

    function sortChoice(sorted){
        if (sorted) {
            return function(a,b){return b[params.displayValue] - a[params.displayValue];};
        } else {
            return function(a,b){return d3.ascending(a.name, b.name);};
        }
    }

    var createArray = function() {

        data = dataset[params.selectedYear]["regions"].sort(sortChoice(params.sorted));

        var header = ['Rang', 'Région', "Valeur"];

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