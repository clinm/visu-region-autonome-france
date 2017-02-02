var RANK_ARRAY = {};

RANK_ARRAY.settings = {
    containerId: "#rank-array",
    selectedYear: 0,
    displayValue: "diff",
    sorted: false,
    selectedItems: []
};


RANK_ARRAY.rankArray = function(dataset, params) {

    var data;

    var mapToRows = function(selection) {

        var columns = ['rank', 'name'];

        return selection.selectAll('td')
            .data(function (row) {

                var elts=  columns.map(function (column) {
                    return {value: row[column]};
                });

                // handling if glyphicon for status
                var value;
                if (row[params.displayValue] >= 0) {
                    value = '<span class="glyphicon glyphicon-ok text-success" aria-hidden="true"></span>';
                } else {
                    value = '<span class="glyphicon glyphicon-remove text-danger" aria-hidden="true"></span>';
                }
                elts.push({'value': value});

                return elts;

            });
    };

    var rowsPipeLine = function(selection) {
         selection.html(function (d) { return d.value; });
    };

    var updateArray = function(settings) {
        params = settings;

        data = dataset[settings.selectedYear]["regions"].sort(sortChoice(true));
        for (var i in data) {
            data[i].rank = parseInt(i) + 1;
        }
        // avoid useless sort
        if (params.sorted == false) {
            data = dataset[settings.selectedYear]["regions"].sort(sortChoice(false));
        }

        var table = d3.select(params.containerId);

        var rows = table
            .selectAll('tbody')
            .selectAll('tr')
            .data(data)
            .classed('selected', function(elt) {
                return params.selectedItems.indexOf(elt.name) > -1;
            });

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
            .append('tr')
            .on('click', function(elt) {
                $(this).toggleClass('selected');
                var index = params.selectedItems.indexOf(elt.name);
                var actionAdd;
                if (index == -1) {
                    params.selectedItems.push(elt.name);
                    actionAdd = true;
                } else {
                    params.selectedItems.splice(index, 1);
                    actionAdd = false;
                }
                if (params.selectionCallback) {
                    params.selectionCallback(elt.name, actionAdd);
                }
            });

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