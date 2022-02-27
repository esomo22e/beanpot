<<<<<<< HEAD
function beanpotMen(data_men, targetElement, targetSlide, gameresults) {

    var startDate = new Date("1952-12-26"),
        endDate = new Date("2019-02-19");

    var formatDate = d3.timeFormat("%b %Y");

    var margin = {
        top: 0,
        right: 35,
        bottom: 100,
        left: 35
    };
    // var formatDateIntoYear = d3.timeFormat("%y");
    var width = d3.select(targetElement).node().getBoundingClientRect().width - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    var svg = d3.select(targetElement).append("svg")
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
        .domain([startDate, endDate])
        .range([0, width])
        .clamp(true);

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

   var tooltip = d3.select(targetElement)
          .append("div")
          .style("opacity", 0)
          .attr("class", "tooltip")

       var mouseover = function(d) {
             tooltip
               .style("opacity", 1)
           }
        var mousemove = function(d) {
           for (var g=0; g<gameresults.length; g++)
            if (gameresults[g].year == Math.round(x.invert(d3.mouse(this)[0]))) {
               tooltip
                 .html(
                    "<h3>" + Math.round(x.invert(d3.mouse(this)[0])) + " Men's Beanpot</h3>" +
                    "<span class='ttsubhed'>Final</span>" +
                    gameresults[g].final_winner_team + " <strong>" + gameresults[g].final_winner_score + "</strong>, " + gameresults[g].final_loser_team + " <strong>" + gameresults[g].final_loser_score +
                    "</strong><span class='ttsubhed'>Third-Place Game</span>" +
                    gameresults[g].thirdplace_winner_team + " <strong>" + gameresults[g].thirdplace_winner_score + "</strong>, " + gameresults[g].thirdplace_loser_team + " <strong>" + gameresults[g].thirdplace_loser_score + "</strong>"
                 )
                 .style("left", (d3.event.x + 10) + "px")
                 .style("top", (d3.event.y + 10) + "px")
            }

        }
        var mouseleave = function(d) {
          tooltip
            .style("opacity", 0)
        }

        var parsedData = [];
    data_men.forEach(function(d) {
        // console.log(d);
        var dataObject = {
            school: d.school,
            ranks: []
        };
        for (var year in d) {
            // console.log(year);
            if (year != "school") {
                if (d[year] != 0) {

                    if (d.school != "final_winner_score" && d.school != "final_loser_score" &&
                        d.school != "thirdplace_loser_score" && d.school != "thirdplace_winner_score") {


                        // console.log(d.school);
                        dataObject.ranks.push({
                            year: +year,
                            rank: +d[year],
                            school: dataObject
                        });
                        // console.log(+year);sf
                    }
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
        // console.log(d);
        return d.year;
    }));

    colour.domain(data_men.map(function(d) {
        return d.school;
    }));
    //Ranks
    var ranks = 4;

    y.domain([0.75, ranks]);

    var axisMargin = 20;

    var xAxis = d3.axisBottom(x)
        .tickFormat(function(d, i) {
            // return i%3 !== 0 ? " ": d;
            if (i % 5 != 3) {
                return "";
            } else {
                // console.log(d);
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
        .attr("font-size", "12px")
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
        .style("opacity", 0.2);

    var endDots = svg.append("g")
        .selectAll(".end-circle")
        .data(parsedData.filter(function(d) {
            return list_schools.includes(d.school);
        }));

    endDots.enter().append("circle")
        .attr("class", "end-circle")
        .attr("cx", function(d) {

            return x(d.ranks[0].year);
        })
        .attr("cy", function(d) {

            return y(d.ranks[0].rank);
        })
        .attr("r", 7)
        .style("fill", function(d) {
            return colour(d.school);
        })
        .style("opacity", 0.2);

   var tooltipgrid = svg.append("rect")
        .attr("class","tooltip-grid")
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", 0)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)




    var heightSlider = 50;
    var svgSlider = d3.select(targetSlide)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", heightSlider);

    var slider = svgSlider.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + heightSlider / 5 + ")");
    // .attr("transform", "translate(0,0)");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() {
                slider.interrupt();
            })
            .on("start drag", function() {
                moveSlider(x.invert(d3.event.x));
            }));


    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(10))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) {
            return d;
        });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);
    // .attr("width", 10)
    // .attr("height", 10);

    var label = slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text("1952")
        .attr("transform", "translate(0," + (-25) + ")");
=======
// using d3 for convenience
var main = d3.select('main')
var scrolly = main.select('#scrolly');
var figure = scrolly.select('figure');
var article = scrolly.select('article');
var step = article.selectAll('.step');



d3.json('/interactive/2020/02/science-gender-gap/scrolly-graph/data/metrics-wos2017-l-1A.json')
// d3.json('http://huskynunews.wpengine.com/interactive/2020/02/gender-gap_scroll/data/metrics-wos2017-l-1A.json')
    .then(function(data) {
        // d3.json('/interactive/2020/02/science-gender-gap/scrolly-graph/data/gender_gap.json')
        //   .then(function(data) {

        var dataFilter = data.filter(function(num) {
            // return num.year >= 1955;
            return num.year >= 1954 && num.year < 2007;
        });
        // console.log(dataFilter);
        //  console.log(data[0]);
        // console.log(d3.keys(data[0]).filter(function (key) { return key !== "year"; }));

        // console.log(keys);
        // var keys = data.columns.slice(1)
        //create width and height and the margins of the d3 graphic
        var width = scrolly.node().getBoundingClientRect().width;
        var height = window.innerHeight;
        var margin = {
            top: 20,
            bottom: 40,
            left: 50,
            right: 40,
        };

        var svg = scrolly.select("figure")
            .append("svg")
            .attr("class", "chart_container")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var figureHeight = height * 2 / 3;
        var figureMarginTop = (height - figureHeight) * 2 / 3;


        var dataMax = d3.extent(dataFilter, function(d) {
            // console.log(d);
            return d.year;
            // if(d.year >= 1955){
            // return d.year;
            // }
        });

        function canvas_clear() {

            svg
                .selectAll(".stackLayers")
                .remove();

        }

        var keys = d3.keys(data[0]).filter(function(key) {

            return key !== "year" && key !== "unknown";

        });

        var x = d3.scaleLinear()
            .domain(dataMax)
            .range([0, width * 0.90]);
        var xAxis = d3.axisBottom(x)
            .ticks(10)
            .tickFormat(d3.format("d"));
        // .tickSize(0);
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(" + margin.left + "," + (figureHeight + 5) + ")")
            .call(xAxis);

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) {
                return +d.male;
            }) * 1 / 3])
            .range([figureHeight, 0]);

        var yAxis = d3.axisLeft(y)
            .tickSize(0);
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + margin.left + ",5)")
            .call(yAxis);

        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(['#e41a1c', '#377eb8']);

        var keyLabels = ["Male", "Female"];

        var circle = svg.selectAll("circle")
            .enter().append("circle")
            .attr("r", 10);

        circle.data(keyLabels.reverse())
            .enter().append("circle")
            .attr("class", "label-circle")
            .attr("cx", function(d, i) {
                return (width / 2 - margin.left) + i * 100;
            })
            .attr("cy", function(d, i) {
                return 10;
            })
            .attr("r", 10)
            .attr("fill", function(d) {
                return color(d);
            });

        svg.selectAll("myLabels")
            .data(keyLabels)
            .enter().append("text")
            .attr("x", function(d, i) {
                return ((width / 2 - margin.left) + 20) + i * 100;
            })
            .attr("y", function(d, i) {
                return 15;
            })
            .style("fill", function(d) {
                return color(d);
            })
            .text(function(d) {
                return d;
            })
            .attr("font-weight", 600)
            .attr("font-size", "16px")
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");


        var stackedData = d3.stack()
            .keys(keys)
            (dataFilter);

        svg
            .selectAll("myLayers")
            .data(stackedData.reverse())
            .enter()
            .append("path")
            .attr("class", "stackLayers")
            .attr("fill", function(d) {
                // console.log(color(d.key));
                return color(d.key);
            })
            .attr("stroke", "none")
            .attr("transform", "translate(" + margin.left + ",5)")
            .attr("d", d3.area()
                .x(function(d, i) {

                    return x(d.data.year);
                })
                .y0(function(d) {
                    return y(d[0]);
                })
                .y1(function(d) {
                    return y(d[1]);
                })
            );


        function sec_1() {
            canvas_clear();
            console.log("section 1");

            svg
                .selectAll("myLayers")
                .data(stackedData.reverse())
                .enter()
                .append("path")
                .attr("class", "stackLayers")
                .attr("fill", function(d) {
                    // console.log(color(d.key));
                    return color(d.key);
                })
                .attr("stroke", "none")
                .attr("transform", "translate(" + margin.left + ",5)")
                .attr("d", d3.area()
                    .x(function(d, i) {

                        return x(d.data.year);
                    })
                    .y0(function(d) {
                        return y(d[0]);
                    })
                    .y1(function(d) {
                        return y(d[1]);
                    })
                );


>>>>>>> af72b014df0a06ee00d283653eb1881a9cc64de7




<<<<<<< HEAD
    // drawData(parsedData, 2020);

    function drawData(data_test, yearLimit) {


        d3.select(".tooltip-grid").remove();

        var lines = svg.append("g")
            .selectAll("path")
            .data(data_test)
            .enter().append("path")
            .attr("class", "rank-line")
            .attr("d", function(d) {
                d.line = this;
                // console.log(d);
                return line(d.ranks);
            })
            // .attr("clip-path", "url(#clip)")
            .style("stroke", function(d) {
                return colour(d.school);
            })
            .style("stroke-width", cfg.strokeWidth)
            .style("opacity", 0.2);

        var lines = svg.append("g")
            .selectAll("path")
            .data(data_test)
            .enter().append("path")
            .attr("class", "rank-line")
            .attr("d", function(d) {
                d.line = this;
                // console.log(d.ranks.filter(function(f){
                //    console.log(f);
                //    return f.year <= yearLimit;
                //  }));
                // console.log(yearLimit);
                return line(d.ranks.filter(function(f) {
                    // console.log(f.year);
                    return f.year <= yearLimit;
                }));
            })
            .style("stroke", function(d) {
                return colour(d.school);
            })
            .style("stroke-width", cfg.strokeWidth)
            .style("opacity", 1);

        var endDots = svg.append("g")
            .selectAll(".end-circle")
            .data(data_test.filter(function(d) {
                return list_schools.includes(d.school);
            }));

        endDots.enter().append("circle")
            .attr("class", "end-circle")
            .attr("cx", function(d) {

                var ranks_length_filter = d.ranks.filter(function(f) {
                    return f.year <= yearLimit;
                }).length;

                return x(d.ranks[ranks_length_filter - 1].year);
            })
            .attr("cy", function(d) {
                var ranks_length_filter = d.ranks.filter(function(f) {
                    return f.year <= yearLimit;
                }).length;
                return y(d.ranks[ranks_length_filter - 1].rank);
            })
            .attr("r", 7)
            .style("fill", function(d) {
                return colour(d.school);
            })
            .style("opacity", 1);

            var tooltipgrid = svg.append("rect")
                 .attr("class","tooltip-grid")
                 .attr("width", width)
                 .attr("height", height)
                 .attr("opacity", 0)
                 .on("mouseover", mouseover)
                 .on("mousemove", mousemove)
                 .on("mouseleave", mouseleave)
    }

    function moveSlider(h) {
        if (h < 1952) { h = 1952 };
        if (h > 2019) { h = 2019};
        h = Math.round(h);
        handle.attr("cx", x(h));
        label
            .attr("x", x(h))
            .text(h);
        svg.selectAll("path").remove();
        svg.selectAll(".end-circle").remove();
        // console.log(parsedData);
        drawData(parsedData, h);

        if (window.innerWidth < 768) {
           for (var g=0; g<gameresults.length; g++)
            if (gameresults[g].year == h) {
               tooltip
               .style("opacity", 1)
                 .html(
                    "<h3>" + h + " Men's Beanpot</h3>" +
                    "<span class='ttsubhed'>Final</span>" +
                    gameresults[g].final_winner_team + " <strong>" + gameresults[g].final_winner_score + "</strong>, " + gameresults[g].final_loser_team + " <strong>" + gameresults[g].final_loser_score +
                    "</strong><span class='ttsubhed'>Third-Place Game</span>" +
                    gameresults[g].thirdplace_winner_team + " <strong>" + gameresults[g].thirdplace_winner_score + "</strong>, " + gameresults[g].thirdplace_loser_team + " <strong>" + gameresults[g].thirdplace_loser_score + "</strong>"
                 )
                 .style("left", (d3.event.x + 10) + "px")
                 .style("top", (d3.event.y + 10) + "px")
            }
         }
    }


}

function beanpotWomen(data_women, targetElement2, targetSlide2, gameresults) {

    var startDate = new Date("1952-12-26"),
        endDate = new Date("2019-02-19");

    var formatDate = d3.timeFormat("%b %Y");

    var margin = {
        top: 0,
        right: 35,
        bottom: 100,
        left: 35
    };
    // var formatDateIntoYear = d3.timeFormat("%y");
    var width = d3.select(targetElement2).node().getBoundingClientRect().width - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    var svg2 = d3.select(targetElement2).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cfg = {
        strokeWidth: 5
    };
    var colour = d3.scaleOrdinal(["#808285", "#D41B2C", "#2D2926", "#B29D6C"]);

    var list_schools = ["rank_harvard", "rank_nu", "rank_bu", "rank_bc"];

    svg2.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height + cfg.strokeWidth);

    var x = d3.scaleLinear()
        .domain([startDate, endDate])
        .range([0, width])
        .clamp(true);

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

     var tooltip2 = d3.select(targetElement2)
           .append("div")
           .style("opacity", 0)
           .attr("class", "tooltip")

        var mouseover = function(d) {
              tooltip2
                .style("opacity", 1)
            }
         var mousemove = function(d) {
            for (var g=0; g<gameresults.length; g++)
             if (gameresults[g].thirdplace_winner_team !== "" && gameresults[g].year == Math.round(x.invert(d3.mouse(this)[0]))) {
                tooltip2
                  .html(
                     "<h3>" + Math.round(x.invert(d3.mouse(this)[0])) + " Women's Beanpot</h3>" +
                     "<span class='ttsubhed'>Final</span>" +
                     gameresults[g].final_winner_team + " <strong>" + gameresults[g].final_winner_score + "</strong>, " + gameresults[g].final_loser_team + " <strong>" + gameresults[g].final_loser_score +
                     "</strong><span class='ttsubhed'>Third-Place Game</span>" +
                     gameresults[g].thirdplace_winner_team + " <strong>" + gameresults[g].thirdplace_winner_score + "</strong>, " + gameresults[g].thirdplace_loser_team + " <strong>" + gameresults[g].thirdplace_loser_score + "</strong>"
                  )
                  .style("left", (d3.event.x + 10) + "px")
                 .style("top", (d3.event.y + 10) + "px")
             } else if (gameresults[g].year == Math.round(x.invert(d3.mouse(this)[0]))) {
                tooltip2
                  .html(
                     "<h3>" + Math.round(x.invert(d3.mouse(this)[0])) + " Women's Beanpot</h3>" +
                     "<span class='ttsubhed'>Final</span>" +
                     gameresults[g].final_winner_team + " <strong>" + gameresults[g].final_winner_score + "</strong>, " + gameresults[g].final_loser_team + " <strong>" + gameresults[g].final_loser_score +
                     "</strong><span class='ttsubhed'>No Third-Place Game</span>"
                  )
                  .style("left", (d3.event.x + 10) + "px")
                  .style("top", (d3.event.y + 10) + "px")
             }

       }
       var mouseleave = function(d) {
         tooltip2
           .style("opacity", 0)
       }

    var parsedData = [];
    data_women.forEach(function(d) {
        // console.log(d);
        var dataObject = {
            school: d.school,
            ranks: []
        };
        for (var year in d) {
            // console.log(year);
            if (year != "school") {
                if (d[year] != 0) {

                    if (d.school != "final_winner_score" && d.school != "final_loser_score" &&
                        d.school != "thirdplace_loser_score" && d.school != "thirdplace_winner_score") {


                        // console.log(d.school);
                        dataObject.ranks.push({
                            year: +year,
                            rank: +d[year],
                            school: dataObject
                        });
                        // console.log(+year);sf
                    }
                }
            }
        }
        parsedData.push(dataObject);
        //
    });

    console.log(parsedData);
    // console.log(parseData);
    var xTickNo = parsedData[0].ranks.length;
    // console.log(xTickNo);

    x.domain(d3.extent(parsedData[0].ranks, function(d) {
        // console.log(d);
        return d.year;
    }));

    colour.domain(data_women.map(function(d) {
        return d.school;
    }));

    var ranks = 4;

    y.domain([0.75, ranks]);

    var axisMargin = 20;

    var xAxis = d3.axisBottom(x)
        .tickFormat(function(d, i) {
            // return i%3 !== 0 ? " ": d;
            if (i % 5 != 3) {
                return "";
            } else {
                // console.log(d);
                return d;
            }
        })
        .ticks(xTickNo)
        .tickSize(0);

    var yAxis = d3.axisLeft(y)
        .ticks(ranks)
        .tickSize(0);
    //
    var xGroup = svg2.append("g");

    var xAxisElem = xGroup.append("g")
        .attr("transform", "translate(" + [0, height + axisMargin * 1.2] + ")")
        .attr("class", "x-axis")
        .attr("font-size", "12px")
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

    var yGroup = svg2.append("g");

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

    var lines = svg2.append("g")
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
        .style("opacity", 0.2);


    var endDots = svg2.append("g")
        .selectAll(".end-circle")
        .data(parsedData.filter(function(d) {
            return list_schools.includes(d.school);
        }));

    endDots.enter().append("circle")
        .attr("class", "end-circle")
        .attr("cx", function(d) {

            return x(d.ranks[0].year);
        })
        .attr("cy", function(d) {

            return y(d.ranks[0].rank);
        })
        .attr("r", 7)
        .style("fill", function(d) {
            return colour(d.school);
        })
        .style("opacity", 0.2);

        var tooltip2grid = svg2.append("rect")
            .attr("class","tooltip2-grid")
            .attr("width", width)
            .attr("height", height)
            .attr("opacity", 0)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    var heightSlider = 50;
    var svg2Slider = d3.select(targetSlide2)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", heightSlider);

    var slider = svg2Slider.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + heightSlider / 5 + ")");
    // .attr("transform", "translate(0,0)");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() {
                slider.interrupt();
            })
            .on("start drag", function(d) {
                // console.log(d3.event.x);
                // drawData(parsedData, 2020);
                console.log(x.invert(d3.event.x));
                moveSlider(x.invert(d3.event.x));
            }));


    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(10))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) {
            return d;
        });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);
    // .attr("width", 10)
    // .attr("height", 10);

    var label = slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text("1952")
        .attr("transform", "translate(0," + (-25) + ")");




    // drawData(parsedData, 2020);

    function drawData(data_test, yearLimit) {


        d3.select(".tooltip2-grid").remove();

        var lines = svg2.append("g")
            .selectAll("path")
            .data(data_test)
            .enter().append("path")
            .attr("class", "rank-line")
            .attr("d", function(d) {
                d.line = this;
                // console.log(d);
                return line(d.ranks);
            })
            // .attr("clip-path", "url(#clip)")
            .style("stroke", function(d) {
                return colour(d.school);
            })
            .style("stroke-width", cfg.strokeWidth)
            .style("opacity", 0.2);

        var lines = svg2.append("g")
            .selectAll("path")
            .data(data_test)
            .enter().append("path")
            .attr("class", "rank-line")
            .attr("d", function(d) {
                d.line = this;
                // console.log(d.ranks.filter(function(f){
                //    console.log(f);
                //    return f.year <= yearLimit;
                //  }));
                // console.log(yearLimit);
                return line(d.ranks.filter(function(f) {
                    // console.log(f.year);
                    return f.year <= yearLimit;
                }));
            })
            .style("stroke", function(d) {
                return colour(d.school);
            })
            .style("stroke-width", cfg.strokeWidth)
            .style("opacity", 1);

        var endDots = svg2.append("g")
            .selectAll(".end-circle")
            .data(data_test.filter(function(d) {
                return list_schools.includes(d.school);
            }));

        endDots.enter().append("circle")
            .attr("class", "end-circle")
            .attr("cx", function(d) {

                var ranks_length_filter = d.ranks.filter(function(f) {
                    return f.year <= yearLimit;
                }).length;

                return x(d.ranks[ranks_length_filter - 1].year);
            })
            .attr("cy", function(d) {
                var ranks_length_filter = d.ranks.filter(function(f) {
                    return f.year <= yearLimit;
                }).length;
                return y(d.ranks[ranks_length_filter - 1].rank);
            })
            .attr("r", 7)
            .style("fill", function(d) {
                return colour(d.school);
            })
            .style("opacity", 1);

            var tooltipgrid = svg2.append("rect")
                .attr("class","tooltip2-grid")
                .attr("width", width)
                .attr("height", height)
                .attr("opacity", 0)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
    }

    function moveSlider(h) {

        if (h < 1952) { h = 1952 };
        if (h > 2019) { h = 2019};
        h = Math.round(h);
        handle.attr("cx", x(h));
        label
            .attr("x", x(h))
            .text(h);
        svg2.selectAll("path").remove();
        svg2.selectAll(".end-circle").remove();
        // console.log(parsedData);
        drawData(parsedData, h);

        if (window.innerWidth < 768) {
           for (var g=0; g<gameresults.length; g++)
           if (gameresults[g].thirdplace_winner_team !== "" && gameresults[g].year == h) {
               tooltip2
               .style("opacity", 1)
                 .html(
                    "<h3>" + h + " Women's Beanpot</h3>" +
                    "<span class='ttsubhed'>Final</span>" +
                    gameresults[g].final_winner_team + " <strong>" + gameresults[g].final_winner_score + "</strong>, " + gameresults[g].final_loser_team + " <strong>" + gameresults[g].final_loser_score +
                    "</strong><span class='ttsubhed'>Third-Place Game</span>" +
                    gameresults[g].thirdplace_winner_team + " <strong>" + gameresults[g].thirdplace_winner_score + "</strong>, " + gameresults[g].thirdplace_loser_team + " <strong>" + gameresults[g].thirdplace_loser_score + "</strong>"
                 )
                 .style("left", (d3.event.x + 10) + "px")
                .style("top", (d3.event.y + 10) + "px")
           } else if (gameresults[g].year == h) {
               tooltip2
               .style("opacity", 1)
                 .html(
                    "<h3>" + Math.round(x.invert(d3.mouse(this)[0])) + " Women's Beanpot</h3>" +
                    "<span class='ttsubhed'>Final</span>" +
                    gameresults[g].final_winner_team + " <strong>" + gameresults[g].final_winner_score + "</strong>, " + gameresults[g].final_loser_team + " <strong>" + gameresults[g].final_loser_score +
                    "</strong><span class='ttsubhed'>No Third-Place Game</span>"
                 )
                 .style("left", (d3.event.x + 10) + "px")
                 .style("top", (d3.event.y + 10) + "px")
           }
         }
    }


}

d3.queue()
   .defer(d3.json, "/interactive/2020/02/beanpot/data/beanpot.json")
   .defer(d3.json, "/interactive/2020/02/beanpot/data/beanpots_women.json")
   .defer(d3.json, "/interactive/2020/02/beanpot/data/gameresults.json")
   .defer(d3.json, "/interactive/2020/02/beanpot/data/results_women.json")
   .await(function(error, mdata, wdata, gameresults, wgameresults) {
      if (error) throw error;


            beanpotMen(mdata, "#beanpot_chart_men", "#slider_men", gameresults);
             beanpotWomen(wdata, "#beanpot_chart_women", "#slider_women", wgameresults);

             document.getElementById("beanpot_chart_women").style.display="none";
             document.getElementById("slider_women").style.display="none";


});

document.getElementById("men").addEventListener("click", function menButton(){

    document.getElementById("beanpot_chart_men").style.display="block";
    document.getElementById("slider_men").style.display="block";

    document.getElementById("beanpot_chart_women").style.display="none";
    document.getElementById("slider_women").style.display="none";
});


document.getElementById("women").addEventListener("click", function menButton(){


    document.getElementById("beanpot_chart_women").style.display="block";
    document.getElementById("slider_women").style.display="block";

     document.getElementById("beanpot_chart_men").style.display="none";
     document.getElementById("slider_men").style.display="none";

});
=======
        }

        function sec_2() {
            console.log("section 2");

            canvas_clear();
            svg
                .selectAll("myLayers")
                .data(stackedData.reverse())
                .enter()
                .append("path")
                .attr("class", "stackLayers")
                .attr("fill", function(d) {
                    // console.log(color(d.key));
                    return color(d.key);

                })
                .attr("stroke-width", function(d) {
                    // console.log(d.key)
                    if (d.key === "female") {
                        return 5;
                    }

                })
                .attr("stroke", "white")
                .attr("transform", "translate(" + margin.left + ",5)")
                .attr('opacity', 1)
                .transition()
                .ease(d3.easeLinear)
                .duration(1000)
                .attr('opacity', function(d) {
                    if (d.key === "female") {
                        return 1;
                    } else {
                        return 0.2;

                    }
                })

                .attr("d", d3.area()
                    .x(function(d, i) {

                        return x(d.data.year);

                    })
                    .y0(function(d) {
                        return y(d[0]);
                    })
                    .y1(function(d) {
                        return y(d[1]);
                    })
                );

            svg.append("line")
                .data(stackedData.reverse())
                .attr("class", "stackLayers")
                .attr("stroke", "#000")
                .attr("stroke-dasharray", "6,6")
                .attr("stroke-width", 2)
                .attr("x1", function(d) {


                    // return d.year === 1955;
                    return x(d[1].data.year) + margin.left;
                })
                .attr("y1", 0)
                .attr("x2", function(d) {
                    return x(d[1].data.year) + margin.left;
                })
                .attr("y2", figureHeight);



            circle
                .data(stackedData.reverse())
                .enter()
                .append("circle")
                .attr("id", "dot")
                .attr("r", 7)
                .attr("stroke", "white")
                .attr("class", "stackLayers")
                .attr("cx", function(d) {

                    return x(d[1].data.year) + margin.left;
                })
                .transition()
                .duration(2000)
                .attr("cy", function(d) {

                    return y(d[1].data.female);
                });


            var annotations = [{
                type: d3.annotationCalloutCircle,
                note: {

                    title: "1955",
                    label: "12.3% authors are female."
                },
                connector: {
                    end: "arrow" // 'dot' also available
                },
                //settings for the subject, in this case the circle radius
                subject: {
                    radius: 20
                },
                x: x(dataFilter[1].year) + margin.left,
                y: y(dataFilter[1].female),
                dy: -57,
                dx: 162
            }].map(function(d) {
                console.log(d);

                d.color = "#000";
                return d
            });

            var makeAnnotations = d3.annotation()
                .type(d3.annotationLabel)
                .annotations(annotations);

            svg
                .append("g")
                .attr("class", "stackLayers")
                .attr("id", "annotation-group")
                .call(makeAnnotations);


        }

        function sec_3() {
            console.log("section 3");


            canvas_clear();
            svg
                .selectAll("myLayers")
                .data(stackedData.reverse())
                .enter()
                .append("path")
                .attr("class", "stackLayers")
                .attr("fill", function(d) {
                    // console.log(color(d.key));
                    return color(d.key);
                })
                .attr("stroke-width", function(d) {
                    // console.log(d.key)
                    if (d.key === "female") {
                        return 5;
                    }


                })
                .attr("opacity", function(d) {
                    if (d.key === "female") {
                        return 1;
                    } else {
                        return 0.2;

                    }
                })
                .attr("stroke", "white")
                .attr("transform", "translate(" + margin.left + ",5)")
                .attr("d", d3.area()
                    .x(function(d, i) {

                        return x(d.data.year);

                    })
                    .y0(function(d) {
                        return y(d[0]);
                    })
                    .y1(function(d) {
                        return y(d[1]);
                    })
                );

            // console.log(stackedData)

            svg.append("line")
                .data(stackedData.reverse())
                .attr("class", "stackLayers")
                .attr("stroke", "#000")
                .attr("stroke-dasharray", "6,6")
                .attr("stroke-width", 2)
                .attr("x1", function(d) {

                    // console.log(d.length);
                    // return d.year === 1955;
                    return x(d[d.length - 2].data.year) + margin.left;
                })
                .attr("y1", 0)
                .attr("x2", function(d) {
                    return x(d[d.length - 2].data.year) + margin.left;
                })
                .attr("y2", figureHeight);

            // svg.selectAll("circle")
            circle
                .data(stackedData.reverse())
                .enter()
                .append("circle")
                .attr("id", "dot")
                .attr("r", 7)
                .attr("stroke", "white")
                .attr("class", "stackLayers")
                .attr("cx", function(d) {

                    return x(d[d.length - 2].data.year) + margin.left;
                })
                .transition()
                .duration(2000)
                .attr("cy", function(d) {

                    return y(d[d.length - 2].data.female) + 5;
                });

            var annotations = [{
                type: d3.annotationCalloutCircle,
                note: {

                    title: "2005",
                    label: "35.4% authors are female."
                },
                connector: {
                    end: "arrow" // 'dot' also available
                },
                //settings for the subject, in this case the circle radius
                subject: {
                    radius: 20
                },
                x: x(dataFilter[dataFilter.length - 2].year) + margin.left,
                y: y(dataFilter[dataFilter.length - 2].female) + 5,
                dy: -87,
                dx: -180
            }].map(function(d) {
                d.color = "#000";
                return d
            })

            var makeAnnotations = d3.annotation()
                .type(d3.annotationLabel)
                .annotations(annotations);

            svg
                .append("g")
                .attr("class", "stackLayers")
                .attr("id", "annotation-group")
                .call(makeAnnotations);
        }

        function sec_4() {
            console.log("section 4");
            canvas_clear();

            var initialarea = d3.area()
              .x(function(d) { return x(d.data.year); })
              .y0(figureHeight + 5)
              .y1(figureHeight + 5);


            var area =  d3.area()
                .x(function(d, i) {

                    return x(d.data.year);
                })
                .y0(function(d) {
                    return y(d[0]);
                })
                .y1(function(d) {
                    return y(d[1]);
                });

            svg
                .selectAll("myLayers")
                .data(stackedData.reverse())
                .enter()
                .append("path")
                .attr("class", "stackLayers")
                .attr("fill", function(d) {
                    // console.log(color(d.key));
                    return color(d.key);
                })
                .attr("stroke", "none")
                .attr("transform", "translate(" + margin.left + ",5)")
                .attr("d", initialarea)
                .transition()
    .duration(2000)
                .attr("d", area);


            svg.append("text")
                .data(stackedData.reverse())
                .attr("x", function(d) {
                    console.log(d);
                    return x(d[d.length - 2].data.year) * 7.5 / 8;
                })
                .attr("y", function(d) {
                    return height - (y(d[d.length - 1].data.female) * 4 / 5);
                    // return  height - (y(d[d.length -1].data.female)/2);
                })
                .transition()
                .delay(3000)
                .duration(3000)
                .attr("class", "stackLayers")
                .attr("id", "text-label-fem")
                .attr("fill", "#fff")
                // .attr("font-size", "30px")
                // .attr("font-weight", 600)
                .text("27.1%");

            svg.append("text")
                .data(stackedData.reverse())
                .attr("x", function(d) {
                    console.log(d);
                    return x(d[d.length - 2].data.year) * 7.5 / 8;
                })
                .attr("y", function(d) {
                    return y(d[d.length - 1].data.male);
                })
                .transition()
                .delay(2000)
                .duration(3000)
                .attr("class", "stackLayers")
                .attr("id", "text-label-male")
                // .attr("dy", "0.71em")
                .attr("fill", "#fff")
                // .attr("font-size", "30px")
                // .attr("font-weight", 600)
                .text("72.9%");


        }

        // initialize the scrollama
        var scroller = scrollama();

        var activateFunctions = [];
        activateFunctions[0] = sec_1;
        activateFunctions[1] = sec_2;
        activateFunctions[2] = sec_3;
        activateFunctions[3] = sec_4;

        // generic window resize listener event
        function handleResize() {
            // 1. update height of step elements
            var stepH = Math.floor(height * 0.75);
            step.style('height', stepH + 'px');



            figure
                .style('height', figureHeight + 'px')
                .style('top', figureMarginTop + 'px');


            // 3. tell scrollama to update new element dimensions
            scroller.resize();
        }

        // scrollama event handlers
        function handleStepEnter(response) {
            // console.log(response)
            // response = { element, direction, index }

            // add color to current step only
            step.classed('is-active', function(d, i) {
                return i === response.index;
            })

            // update graphic based on step
            figure.select('p').text(response.index + 1);
            figure.call(activateFunctions[response.index]);
        }

        function setupStickyfill() {
            d3.selectAll('.sticky').each(function() {
                Stickyfill.add(this);
            });
        }

        function init() {
            setupStickyfill();

            // 1. force a resize on load to ensure proper dimensions are sent to scrollama
            handleResize();

            // 2. setup the scroller passing options
            // 		this will also initialize trigger observations
            // 3. bind scrollama event handlers (this can be chained like below)
            scroller.setup({
                    step: '#scrolly article .step',
                    offset: 0.33,
                    debug: false,
                    // debug: false,
                })
                .onStepEnter(handleStepEnter)


            // setup resize event
            window.addEventListener('resize', handleResize);
        }

        // kick things off
        init();
    }).catch(function(error) {
        // handle error
    });
>>>>>>> af72b014df0a06ee00d283653eb1881a9cc64de7
