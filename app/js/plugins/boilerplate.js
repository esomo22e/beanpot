var margin = {
    top: 50,
    right: 200,
    bottom: 100,
    left: 125
};
var width = window.innerWidth - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
var svg = d3.select("#beanpot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var cfg = {
    strokeWidth: 5
};
var colour = d3.scaleOrdinal(["#808285", "#D41B2C", "#2D2926", "#B29D6C"]);
var list_schools = ["rank_harvard", "rank_nu", "rank_bu", "rank_bc"];
svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height + cfg.strokeWidth);
var x = d3.scaleLinear()
    .range([0, width]);
var y = d3.scaleLinear()
    .range([0, height]);
var line = d3.line()
    .x(function(d) {
        // console.log(x(d.year));
        return x(d.year);
    })
    .y(function(d) {
        return y(d.rank);
    });
d3.json("/interactive/2018/10/bubble/data/beanpot_schoolrank.json", function(error, data) {
    if (error) throw error;

    var parsedData = [];
    data.forEach(function(d) {
        // console.log(d);
        var dataObject = {
            school: d.school,
            ranks: []
        };
        for (var year in d) {
            // console.log(year);
            if (year != "school") {
                if (d[year] != 0) {
                    // console.log(d[year]);
                    dataObject.ranks.push({
                        year: +year,
                        rank: +d[year],
                        school: dataObject
                    });
                    // console.log(+year);sf
                }
            }
        }
        parsedData.push(dataObject);
        //
    });
    // console.log(parsedData);
    var xTickNo = parsedData[0].ranks.length;
    // console.log(xTickNo);
    x.domain(d3.extent(parsedData[0].ranks, function(d) {
        return d.year;
    }));
    colour.domain(data.map(function(d) {
        return d.school;
    }));
    //Ranks
    var ranks = 4;
    y.domain([0.5, ranks]);
    var axisMargin = 20;
    var xAxis = d3.axisBottom(x)
        .tickFormat(function(d, i) {
            // return i%3 !== 0 ? " ": d;
            if (i % 3 != 0) {
                return "";
            } else {
                return d;
            }
        })
        .ticks(xTickNo)
        .tickSize(0);
    var yAxis = d3.axisLeft(y)
        .ticks(ranks)
        .tickSize(0);
    //
    var xGroup = svg.append("g");
    var xAxisElem = xGroup.append("g")
        .attr("transform", "translate(" + [0, height + axisMargin * 1.2] + ")")
        .attr("class", "x-axis")
        .call(xAxis);
    xGroup.append("g").selectAll("line")
        .data(x.ticks(xTickNo))
        .enter().append("line")
        .attr("class", "grid-line")
        .attr("y1", 0)
        .attr("y2", height + 10)
        .attr("x1", function(d) {
            return x(d);
        })
        .attr("x2", function(d) {
            return x(d);
        });
    var yGroup = svg.append("g");
    var yAxisElem = yGroup.append("g")
        .attr("transform", "translate(" + [-axisMargin, 0] + ")")
        .attr("class", "y-axis")
        .call(yAxis);
    yAxisElem.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90) translate(" + [-height / 2, -margin.left / 3] + ")");
    yGroup.append("g").selectAll("line")
        .data(y.ticks(ranks))
        .enter().append("line")
        .attr("class", "grid-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", function(d) {
            return y(d);
        })
        .attr("y2", function(d) {
            return y(d);
        });
    // console.log(y.ticks(ranks));
    var lines = svg.append("g")
        .selectAll("path")
        .data(parsedData)
        .enter().append("path")
        .attr("class", "rank-line")
        .attr("d", function(d) {
            d.line = this;
            // console.log(d.line);
            return line(d.ranks);
        })
        // .attr("clip-path", "url(#clip)")
        .style("stroke", function(d) {
            return colour(d.school);
        })
        .style("stroke-width", cfg.strokeWidth)
        .style("opacity", 1);
        var endLabels = svg.append("g")
                            .attr("class", "end-labels")
                            .selectAll("text")
                            .data(parsedData.filter(function(d){
                                return list_schools.includes(d.school);
                            }))
                            .enter().append("text")
                            .attr("class", "end-label")
                            .attr("x", function(d){
                                return x(d.ranks[d.ranks.length-1].year);
                            })
                            .attr("y", function(d){
                                return y(d.ranks[d.ranks.length-1].rank);
                            })
                            .attr("dx", 20)
                            .attr("dy", cfg.strokeWidth / 2)
                            .text(function(d){
                                return d.school;
                            })
                            .style("opacity", 0)
                            .transition().duration(500).delay(function(d){
                                return (list_schools.indexOf(d.school) + 1) * 500;
                            })
                            .style("opacity",1);
    $(function() {
        $("#slider").slider({
            range: false,
            min: 1952,
            max: 2019,
            step: 1,
            // values:[1952, 2019],
            value: 1952,
            slide: function(event, ui) {
                // var begin = d3.min([ui.value[2], data.length]);
                // console.log(ui.value);
                // console.log("sliiiide!!!!");
                updateLine(parsedData, ui.value);
            }
        });
    });
    function updateLine(dataset, year) {
        // console.log(year);
        var data_line = dataset;
        var basic_line = data_line.map(function(item){
          return item;
        });
        var unique_line = basic_line.filter(function(item,index){
          return basic_line.indexOf(item) >= index;
        });
        // console.log(unique_line);
        var cfg = {
            strokeWidth: 5
        };
        var colour = d3.scaleOrdinal(d3.schemeCategory20);
        var line = d3.line()
            .x(function(d) {
                // console.log(x(year));
                return x(year);
            })
            .y(function(d) {
                return y(d.rank);
            });
        //                         var yGroup = svg.append("g");
        //
        //                         var yAxisElem = yGroup.append("g")
        //                         .attr("transform", "translate(" + [-axisMargin, 0] + ")")
        //                         .attr("class", "y-axis")
        //                         .call(yAxis);
        //
        //                         yAxisElem.append("text")
        //                         .attr("class", "y-label")
        //                         .attr("text-anchor", "middle")
        //                         .attr("transform", "rotate(-90) translate(" + [-height / 2, -margin.left / 3] + ")");
        //
        //                         yGroup.append("g").selectAll("line")
        //                         .data(y.ticks(ranks))
        //                         .enter().append("line")
        //                         .attr("class", "grid-line")
        //                         .attr("x1", 0)
        //                         .attr("x2", width)
        //                         .attr("y1", function(d){
        //                             return y(d);
        //                         })
        //                         .attr("y2", function(d){
        //                             return y(d);
        //                         });
        //
        //                         // console.log(y.ticks(ranks));
        var lines = svg.append("g")
                     .selectAll("path")
                     .data(dataset)
                     .enter().append("path")
                     .attr("class", "rank-line")
                     .attr("d", function(d){
                         console.log(dataset[ranks-1].ranks);
                         d.line = this;
                          // console.log(d.line);
                         return line(d.ranks);
                     })
                     // .attr("clip-path", "url(#clip)")
                     .style("stroke", function(d){
                         return colour(d.school);
                     })
                     .style("stroke-width", cfg.strokeWidth)
                     .style("opacity", 1);
    }
});
// .transition().duration(500).delay(function(d){
//     return (list_schools.indexOf(d.school) + 1) * 500;
// })
// .style("opacity", function(d){
//      return (list_schools.indexOf(d.school) + 1) ? 1 : 0.1;
// });
// d3.select("#beanpot").selectAll("*").remove();
// var minValue = Math.min.apply(Math, pa);
// parsedData[0] = "rank_bu";
// console.log(parsedData[1].school);
// console.log(parsedDa);
    // .transition().duration(500).delay(function(d){
    //     return (list_schools.indexOf(d.school) + 1) * 500;
    // })
    // .style("opacity",1);
    // .enter().append("path")
    // .attr("class", "rank-line")
    // .attr("d", function(d) { d.line = this; return line(d.ranks)})
    // .attr("clip-path", "url(#clip)")
    // .style("stroke", function(d){
    //     colour(d.school);
    // })
    // .style("stroke-width", cfg.strokeWidth)
    // .style("opacity", 0.1)
    // .transition().duration(500).delay(function(d){
    //     return (list_schools.indexOf(d.school) + 1) * 50
    // });
// var endLabels = svg.append("g")
//                     .attr("class", "end-labels")
//                     .selectAll("text")
//                     .data(parsedData.filter(function(d){
//                         return list_schools.includes(d.school);
//                     }))
//                     .enter().append("text")
//                     .attr("class", "end-label")
//                     .attr("x", function(d){
//                         return x(d.ranks[d.ranks.length-1].year);
//                     })
//                     .attr("y", function(d){
//                         return y(d.ranks[d.ranks.length-1].rank);
//                     })
//                     .attr("dx", 20)
//                     .attr("dy", cfg.strokeWidth / 2)
//                     .text(function(d){
//                         return d.school;
//                     })
//                     .style("opacity", 0)
//                     .transition().duration(500).delay(function(d){
//                         return (list_schools.indexOf(d.school) + 1) * 500;
//                     })
//                     .style("opacity",1);
// var endDots = svg.append("g")
//     .selectAll("circle")
//     .data(parsedData.filter(function(d) {
//         return list_schools.includes(d.school);
//     }))
//     .enter().append("circle")
//     .attr("class", "end-circle")
//     .attr("cx", function(d) {
//         return x(d.ranks[d.ranks.length - 1].year);
//     })
//     .attr("cy", function(d) {
//         return y(d.ranks[d.ranks.length - 1].rank);
//     })
//     .attr("r", cfg.strokeWidth)
//     .style("fill", function(d) {
//         return colour(d.school);
//     })
//     .style("opacity", 1);
