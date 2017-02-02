// ---------------------------------
// -------- CONFIGURATION ----------
// ---------------------------------
var confRankChart = {
        currentYear: "2008",
        comparedValue: "diff",
        selection: [],
        dataPath: "data.json",
        DOMcontainer: "body",
        negativeColor: "rgb(255,77,59)",
        positiveColor: "rgb(19,90,178)"
};

function runRankChart(userConf, callbackChangeYear, callbackChangeSelection){
    
    var margin = {top: 10, right: 1, bottom: 10, left: 10},
        width = 700 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom,
        header = 20,
        innerheight = height - header,
        linePadding = 20,
        dataset,
        lookup,
        metricwidth,
        indexCurrentYear,
        callbackChangeYear = callbackChangeYear,
        callbackChangeSelection = callbackChangeSelection;
    
    // ---------------------------------
    // --------------- MAIN ------------
    // ---------------------------------
    if (userConf != undefined){
        
        for (var property in userConf) {
            if (userConf.hasOwnProperty(property)) {
                confRankChart[property] = userConf[property] 
            }
        }
    }
    
    var datasource = d3.json(confRankChart.dataPath,function(error,data){
        if (error) return console.warn(error);
        dataset = data;

        //Adapt data to visualisation
        dataset = orderByRank(dataset, confRankChart.comparedValue)

        indexCurrentYear = findIndexYear(confRankChart.currentYear);

        //TODO Refacto
        //Store regions of the first year
        var metriclist = dataset[indexCurrentYear].regions;
        lookup = [];
        metriclist.forEach(function(rec,idx){
            var o = {};
            o.metric = rec.name;
            o.data = [];
            o[confRankChart.comparedValue] = rec[confRankChart.comparedValue]
            lookup.push(o);
        })

        var regionsPerYear = []
        dataset.forEach(function(record, idx){
            regionsPerYear.push(record.regions)
        })

        metricwidth = width / regionsPerYear.length;


        // build the chart once the data are loaded
        buildRankChart(confRankChart.comparedValue);

        // add colors to lines compare to compared value
        colorizedLines(confRankChart.comparedValue)

        //Auto-select from conf
        confRankChart.selection.forEach(function(val, i){
            selectRegion(val.replace(/\s/g,''), true)
        })

        //Set Watchers
        watchThings()
    });

// ---------------------------------
// ---------------------------------

function watchThings(){
    confRankChart.watch('currentYear', function(property, oldval, val){
        indexCurrentYear = findIndexYear(val);

        rectSlide(indexCurrentYear);
        
        return val;
    })

    confRankChart.watch('comparedValue', function(property, oldval, val){

        dataset = orderByRank(dataset, val)

        updateRankChart(val)
        
        confRankChart.selection.forEach(function(val, i){
            selectRegion(val.replace(/\s/g,''), true)
        })

        return val;
    })

    confRankChart.watch('selection', function(property, oldarray, array){
        lookup.forEach(function(val, i){
            selectRegion(val.metric.replace(/\s/g,''), false)
        })
        
        array.forEach(function(val, i){
            selectRegion(val.replace(/\s/g,''), true)
        })
        
        return array;
    })
    
    //            conf.watch('negativeColor', function(property, oldval, val){
    //
    //            })
    //            
    //            conf.watch('positiveColor', function(property, oldval, val){
    //
    //            })
}

//Function to find index of a given year
function findIndexYear(year){
    var ret;
    dataset.forEach(function(y, i){
        if (y.year == year){
            ret = i
        }
    })
    return ret
}

//Function to order regions by ascending rank into each year
function orderByRank(data, comparedValue){
    data.forEach(function(oneYear, index){
        oneYear.regions.sort(function(a, b){
            return b[comparedValue]-a[comparedValue]
        })
    })
    return data;
}

//Function to order years by descending order
function orderByDescendingYear(data){
    data.sort(function(a,b){
        return parseInt(b.year)-parseInt(a.year)
    })
    return data
}

function setTOPTitle(selector){
    return selector.text(function(year, i){
        return "Classement "+year.year
    })
}

// Add color to lines (use Linear gradient)
function colorizedLines(comparedValue){

    function linearGradient(selector, percentage, color){
        return selector.append("stop")
        .attr("offset", percentage)
        .attr("style", "stop-color:"+color+";stop-opacity:1")
    }

    //create def node for linear gradient definitions
    var colorDefs = d3.select(confRankChart.DOMcontainer+" svg.viz")
    .append("defs")
    .selectAll("linearGradient")
    .data(lookup)
    .enter()
    .append("linearGradient")
    .attr("id", function(region, index){
        return "line" + index;
    })
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")

    //Create array with regions and compared value
    var regionsWithCurrentDiff = [];
    dataset[0].regions.forEach(function(d,i){
        var obj = {}
        obj.name = d.name
        obj[comparedValue] = d[comparedValue]
        regionsWithCurrentDiff.push(obj)
    })

    //Create first color of each line
    regionsWithCurrentDiff.forEach(function(r, i){

        if (r[comparedValue]<0)
            colorDefs.filter(function(line, l){
                if (line.metric==r.name)
                    return true
                    else 
                        return false
                        })
            .call(linearGradient, "0%", confRankChart.negativeColor)

            else
                colorDefs.filter(function(line, l){
                    if (line.metric==r.name)
                        return true
                        else 
                            return false
                            })
                .call(linearGradient, "0%", confRankChart.positiveColor)
                })

    //Create next colors of each line
    dataset.forEach(function(record, i){

        var year = record.year;
        var regions = record.regions;

        regions.forEach(function(region, j){

            lookup.forEach(function(r, k){

                // if we have a match...
                if ( r.metric == region.name ){

                    if (region[comparedValue] < 0 && regionsWithCurrentDiff[k][comparedValue] >=0){

                        var def = colorDefs.filter(function(line, l){
                            if (r.metric==line.metric)
                                return true
                                else 
                                    return false
                                    })

                        def.call(linearGradient, ((100/(dataset.length-1))*i)-5+"%", confRankChart.positiveColor)

                        def.call(linearGradient, ((100/(dataset.length-1))*i)+"%", confRankChart.negativeColor)

                        regionsWithCurrentDiff[k][comparedValue] = region[comparedValue]
                    }
                    else{
                        if (region[comparedValue] >= 0 && regionsWithCurrentDiff[k][comparedValue] < 0){

                            var def = colorDefs.filter(function(line, l){
                                if (r.metric==line.metric)
                                    return true
                                    else 
                                        return false
                                        })

                            def.call(linearGradient, ((100/(dataset.length-1))*i)-5+"%", confRankChart.negativeColor)

                            def.call(linearGradient, ((100/(dataset.length-1))*i)+"%", confRankChart.positiveColor)

                            regionsWithCurrentDiff[k][comparedValue] = region[comparedValue]
                        }
                    }


                }
            })
        })
    })
}

function rectSlide(idx){
    var rect = d3.select(confRankChart.DOMcontainer+" rect");
    rect.transition()
    .attr("x", 10 + (metricwidth * idx));
}

function addOrRemoveSelection(region){
    var newSelection = [],
        regionAlreadySelected = false;
    
    confRankChart.selection.forEach(function(item, i){
        if (item != region) {
            newSelection.push(item)
        }
        else {
            regionAlreadySelected = true;
            callbackChangeSelection(region, false);
        }
    })
    
    if (!regionAlreadySelected){
        newSelection.push(region)
        callbackChangeSelection(region, true);
    }

    confRankChart.selection = newSelection.slice(0)
}

function selectRegion(selector, toggle){
    var value,
        selectorclass = selector.replace(/\s/g,'')
    
    if (toggle == undefined){
        value = !d3.select('.'+selectorclass+'_line').classed("line-click")    
    }
    else{
        value = toggle
    }

    var line = d3.selectAll('.'+selectorclass+'_line');
    line.classed('line-click', value)
    line.classed('line-accent', value)
    line.classed('line-no-accent', !value)

    var labels = d3.selectAll('.'+selectorclass+'_text')
    labels.classed('label-click', value)
    labels.classed('label-accent', value)
    labels.classed('label-no-accent', !value)

    var header = d3.select("."+selectorclass+"_header");
    header.classed('header-click', value)
    header.classed('header-accent', value)
    header.classed('header-no-accent', !value)
    
}

var mouseOver = function(selectorclass){
    d3.selectAll('.'+selectorclass+'_line:not(.line-click)')
    .classed('line-no-accent', false)
    .classed('line-accent', true)
    d3.selectAll('.'+selectorclass+'_text:not(.label-click)')
    .classed('label-no-accent', false)
    .classed('label-accent', true)
    d3.selectAll('.'+selectorclass+'_header:not(.header-click)')
    .classed('header-no-accent', false)
    .classed('header-accent', true)
}
var mouseOut = function(selectorclass){
    d3.selectAll('.'+selectorclass+'_line:not(.line-click)')
    .classed('line-accent', false)
    .classed('line-no-accent', true)
    d3.selectAll('.'+selectorclass+'_text:not(.label-click)')
    .classed('label-no-accent', true)
    .classed('label-accent', false)
    d3.selectAll('.'+selectorclass+'_header:not(.header-click)')
    .classed('header-no-accent', true)
    .classed('header-accent', false)
}
var click = function(selector){
    addOrRemoveSelection(selector)
}

// create the lines from the index values
var pathfunction = function(obj){
    var datavals = obj.data,
        dataLen = datavals.length,
        // new array to store the x/y pairs to build the 'plateaus'
        newArray = [];
    datavals.forEach(function(d,i){
        var x1,y1,x2,y2;
        // if the value isn't null
        if ( d !== null) {
            x1 = metricwidth * i + linePadding; 
            y1 = header + (innerheight / obj.len) * (d + 1);
            x2 = metricwidth * i + metricwidth - linePadding;
            y2 = header + (innerheight / obj.len) * (d + 1);
            newArray.push({x:x1,y:y1});
            newArray.push({x:x2,y:y2});
        } else {
            // blank space in line if null value...
            x1 = y1 = x2 = y2 = null;
            newArray.push({x:x1,y:y1});
            newArray.push({x:x2,y:y2});
        }

    });

    var lineFunction = d3.line()
    .defined(function(d) { return d.y != null; }) // no if null
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })

    // /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\
    //CAUTION HACK -- When straight line doesn't want to be colorized
    //Change a little bit the line to never have straight line
    var retour = lineFunction(newArray)

    for (var i=retour.length-1; i>=0;i--){
        if (retour[i]==',' || retour[i]==' '){
            retour = retour.substring(0,i+1) + (parseInt(retour.substring(i+1,retour.length)) -0.0001)
            break;
        }
    }
    // /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\ /!\

    return retour // send back the line
}

function buildLineText(comparedValue){
    var textGroup = d3.select(confRankChart.DOMcontainer+" svg.viz")
    .selectAll("textgroup")
    .data(dataset)
    .enter()
    .append("g");

    textGroup
    .each(function(record,i){

        var metric = d3.select(this)
        .selectAll("text")
        .data(record.regions)
        .enter()
        .append("text")
        .attr('class',function(d, idx){
            return d.name.replace(/\s/g,'') + '_text';})
        .classed('label', true)
        .classed("label-no-accent", true)
        .attr("x", function(d, idx){
            if ( d ) {
                return metricwidth * i + linePadding;
            }
        })
        .attr("y", function(d, idx){
            if ( d ) {
                return header + (innerheight / record.regions.length) * (idx + 1) - 5;
            }
        })
        .text(function(d, idx){
            var rank = idx + 1;
            if (d[comparedValue] != null) {
                return '#' + String(rank)
            }
        })
        .on("mouseover", function(d){mouseOver(d.name.replace(/\s/g,''))})
        .on("mouseout", function(d){mouseOut(d.name.replace(/\s/g,''))})
        .on("click", function(d){click(d.name)})
    })
}

function buildLines(){
    // build the lines
    var paths = d3.select(confRankChart.DOMcontainer+" svg.viz")
    .selectAll("paths")
    // bind lookup to lines
    .data(lookup)
    .enter()
    .append("path")
    .attr("class",function(d){ return d.metric.replace(/\s/g,'')+'_line'}) // use class attr to add login to class assignment
    .classed("line", true) // add additional classes with classed
    .classed("line-no-accent", true)
    // call path function on data, passing in array length for y measure
    .attr("d",function(d,i){return pathfunction({len:lookup.length,data:d.data})})
    .attr("stroke", function(d,i){
        return "url(#line"+i+")"
    })
    .on("mouseover", function(d){mouseOver(d.metric.replace(/\s/g,''))})
    .on("mouseout", function(d){mouseOut(d.metric.replace(/\s/g,''))})
    .on("click", function(d){click(d.metric)})
}


function assignRankToRegion(comparedValue){
    //Assign to each region his rank for each year 
    dataset.forEach(function(record,index){

        var metric = record.year;
        var vals = record.regions;

        vals.forEach(function(rec,idx){

            lookup.forEach(function(r,i){

                // if we have a match...
                if ( r.metric == rec.name ){

                    if (rec[comparedValue] != null) {
                        lookup[i].data[index] = idx;

                    } else {
                        lookup[i].data[index] = null;
                    }

                }
            })
        })
    })
}

function buildEndLineHeader(){
    var lineHeader = d3.select(confRankChart.DOMcontainer)
    .append("svg")
    .classed("titleHeader", true)
    .selectAll('.lineHeader')
    .data(dataset[dataset.length-1].regions)
    .enter()
    .append("text")
    .attr("class", function(r,i){
        return r.name.replace(/\s/g,'')+"_header"
    })
    .classed("lineHeader", true)
    .attr("x", function(d, idx){
        return 0;
    })
    .attr("y", function(d, idx){
        return header + (innerheight / dataset[0].regions.length) * (idx + 1);
    })
    .text(function(d,i){
        return d.name
    })
    .on("mouseover", function(d){mouseOver(d.name.replace(/\s/g,''))})
    .on("mouseout", function(d){mouseOut(d.name.replace(/\s/g,''))})
    .on("click", function(d){click(d.name)})
    
}

//Main function to build Rank chart
function buildRankChart(comparedValue){

    function buildYearText(){

        // pull put keys only for headers
        var keys = [];
        dataset.forEach(function(record, idx){
            keys.push(record.year)
        })

        var headerText = svg
        .selectAll(".headertext")
        // bind data
        .data(keys)
        .enter()
        .append("text")
        .attr("class","headertext")
        .attr("x", function(key, i){
            return metricwidth * i + linePadding;
        })
        .attr("y", function(key, i){
            return 30;
        })
        .text(function(key, i){
            return key;})
        .on("click", function(d,i){
            var newYear = d3.select(this).text();
            confRankChart.currentYear = newYear;
            callbackChangeYear(newYear);
            rectSlide(i);
        })    
    }

    function drawCurrentYearRectangle(){
        //Draw the Rectangle
        var rectangle = svg.append("rect")
        .attr("x", 10 + (metricwidth * indexCurrentYear))
        .attr("y", margin.top)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width", metricwidth)
        .attr("height", height)
        .attr("stroke", "lightgrey")
        .attr("stroke-width",2)
        .attr("fill","white")
    }

    function buildLineHeader(){
        var lineHeader = d3.select(confRankChart.DOMcontainer)
        .append("svg")
        .classed("rankHeader", true)
        .selectAll(".rankHeader")
        .data(dataset[0].regions)
        .enter()
        .append("text")
        .classed("lineHeader", true)
        .attr("x", function(d, idx){
            return 0;
        })
        .attr("y", function(d, idx){
            return header + (innerheight / dataset[0].regions.length) * (idx + 1);
        })
        .text(function(d,i){
            return "#"+(i+1)
        })    
    }

    function createMainSVG(){
        return d3.select(confRankChart.DOMcontainer)
        .append("svg")
        .attr("class","viz")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    }

    buildLineHeader()

    var svg = createMainSVG()

    drawCurrentYearRectangle()

    assignRankToRegion(comparedValue)

    buildLines()

    buildEndLineHeader()

    buildYearText()

    buildLineText(comparedValue)

}

function updateRankChart(comparedValue){

    //Erase old values
    d3.selectAll(confRankChart.DOMcontainer+" svg.viz path").remove()
    d3.selectAll(confRankChart.DOMcontainer+" svg.viz g").remove()
    d3.selectAll(confRankChart.DOMcontainer+" svg.titleHeader").remove()
    d3.selectAll(confRankChart.DOMcontainer+" div.topYear").remove()

    assignRankToRegion(comparedValue)

    buildLines()

    buildEndLineHeader()

    buildLineText(comparedValue)
}
}