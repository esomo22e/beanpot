//Array of Colors for Heatmap
var colors = ['#023858', '#045a8d', '#0570b0', '#3690c0', '#74a9cf', '#a6bddb', '#d0d1e6', '#ece7f2', '#fff7fb', '#FFFFFF', '#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'];

//collection of dataset for both heatmap and network
var dataset;
var dataset2;

//Start of development
$(document).ready(function() {


//Data collected in mm10 gene.
  var jsonText = $.ajax({
    datatype: 'json',
    url: 'resources/mm10_refgene_synonyms.json',
    async: false
  }).responseText;
  var temp = JSON.parse(jsonText);

//Gene and hash variables
  var gene_info = [];
  var gene_info_synonyms = [];
  var hashtable = new Object();
  var hashtable_synonyms = new Object();

//Hashtable
  for (var k in temp) {
    var keyname = temp[k]['name'];
    //var keyname = temp[k]['name'] + " (" + temp[k]['desc'] + ")";
    gene_info.push(keyname);
    hashtable[keyname] = [temp[k]['chr'], temp[k]['start'], temp[k]['end'], temp[k]['tss']];
    if (temp[k]['tss'] == 'NA') {
      hashtable_synonyms[keyname] = keyname;
      gene_info_synonyms.push(keyname);
    } else if (temp[k]['synonyms'].search(/\|/i) == -1) {
      hashtable_synonyms[temp[k]['synonyms']] = keyname;
      hashtable_synonyms[keyname] = keyname;
      gene_info_synonyms.push(keyname);
      gene_info_synonyms.push(temp[k]['synonyms']);
    } else if (temp[k]['synonyms'].search(/\|/i) > 0) {
      var res = temp[k]['synonyms'].split("|");
      for (var s in res) {
        hashtable_synonyms[res[s]] = keyname;
        gene_info_synonyms.push(res[s]);
      }
      hashtable_synonyms[keyname] = keyname;
      gene_info_synonyms.push(keyname);
    }
  }

//Random gene created from gene info
  var random_gene = gene_info[Math.floor(Math.random() * gene_info.length)];




//Typeahead which contains data from gene symbol
  var genes = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: gene_info
  });

  //Typeahaed  where you dropdown on the gene name
  $('#gene_list .typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    name: 'genes',
    limit: 100,
    source: genes
  }).on('typeahead:select', function(e, datum) {

    ////////BEGINNING - NETWORK/////////////////////////////////////////////////////////////////////////////////////

    //dropdown netowrk container which will show a new network with new gene symbol
    document.getElementById("network_container").style.display = "flex";
    d3.select("#network").selectAll("*").remove();


    //initial slopegraph when you dropdown
    var jsonText_init = $.ajax({

      type: 'POST',
      url: "slopegraph_enhancerControl_init.php",
      data: {
        "genesymbol": datum
      },
      async: false

    }).responseText
    dataset_init = JSON.parse(jsonText_init);


    //minimum value and maximum value of the array
    var minValue = Math.min.apply(Math, dataset_init.value);
    var maxValue = Math.max.apply(Math, dataset_init.value);

    //minimum and maximum tf count
    var minCount = Math.min.apply(Math, dataset_init.tfCount);
    var maxCount = Math.max.apply(Math, dataset_init.tfCount);


    //midvalue of the array to the 2nd decimal
    var midValue = Math.round(((maxValue+minValue)/2) *100)/100;
    var range = (maxValue- minValue);
    var quarterRange = (range/4);

    //mid value of tf count
    var midCount = Math.floor((minCount + maxCount)/2);

    // console.log("Start Value:" + startValue);

    //initial value of network
      update(datum, midValue, midCount);
      // update(datum, startValue,0);


//TF Value shown in text above range slider
  var output = document.getElementById("min_value");
  output.innerHTML = midValue;

//TF Motif shown in text above range slider
  var output_count = document.getElementById("min_count");
    output_count.innerHTML = midCount;

//Range slider determined by TF Value
    $("#range_slider_value").slider({
        range: "min",
        min: minValue,
        max: maxValue,
        step:0.1,
        value:midValue,
        slide: function(event,ui){


          //initial tf count
          var slider_minCount = $("#range_slider_count").slider("value");
          // var slider_maxCount = $("#range_slider_count").slider("values", 1);

          //text change
          output.innerHTML = ui.value;

          //the TF newtowrk change  dependent on TF Value
          update(datum, ui.value, slider_minCount);

        }

    });


//Range slider determine by TF Motif
    $("#range_slider_count").slider({
        range: "min",
        min:minCount,
        max: maxCount,
        step:1,
        value:midCount,
        slide: function(event,ui){

          //initial tf value
          var slider_minVal = $("#range_slider_value").slider("value");

          //text that changes when slider moves
          output_count.innerHTML = ui.value;

          //the TF newtowrk change  dependent on TF Count
          update(datum,  slider_minVal,  ui.value);


        }


    });



//function that draws the TF network with D3
    function update(data, minVal, minCnt){

      //Thhe second dataset that will redraw with the slider
      //This dataset will change dependent on the value of the slider
      var jsonText3 = $.ajax({

        type: 'POST',
        url: "slopegraph_enhancerControl.php",
        data: {
          "genesymbol": data,
          "min_value": minVal,
          "min_count": minCnt
        },
        async: false

      }).responseText
      dataset2 = JSON.parse(jsonText3);


      //Size of the window and the element container
      var w = window,
          d = document,
          e = d.documentElement,
          g =  d.getElementsByTagName('body')[0];

      //This determines the height and width of the network
      var margin = {
          top: 20,
          right: -70,
          bottom: 30,
          left: -70
        },
         wth = window.innerWidth || window.documentElment.clientWidth || window.getElementByID('#network')[0].clientWidth,
        test_width = wth - margin.left - margin.right- (window.innerWidth- 700),
        width = parseInt(d3.select("#network").style("width")) - margin.left - margin.right,
        height =(w.innerHeight|| e.clientHeight|| g.clientHeight) - margin.top - margin.bottom - 355;


        console.log("Network Width:" + width);
        console.log("Client Width:" + e.clientWidth);
        console.log("Window width:" + window.innerWidth);
      // Build the X scale -> it find the best position for each Y axis
      var x = d3.scalePoint().rangeRound([0, width]).padding(1),
        // For each dimension, I build a linear scale. I store all in a y object
        y = {},
        dragging = {};

      //The line draw from Enhancer Network and TF Motif
      var line = d3.line(),
        // background,
        foreground,
        extents;

        //Removes and redraws everytime you use the slider
        d3.select("#network").selectAll("*").remove();

      //The container holding the network with the width and height
      var container = d3.select("#network").append("div")
        .attr('class', "parcoords")
        .style("width", width )
        .style("height", height + margin.top + margin.bottom + "px");

      //The SVG that draws the network
      var svg = container.append('svg')
        .attr("width", width )
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //The console log showing the values of both EnhancerID and TFMotif
      //If the aluue is a null or blank value
      var quant_p = function(v) {

        return (parseFloat(v) == v) || (v = "")
      };


      //the data showcasing the elements in the EnhancerID point to which Transcription Factor
      var slopeData = dataset2.netData;
      //the name of arrays for the network: EnhancerID, TranscriptionFactors
      var dimensions = d3.keys(slopeData[0]);

      // Extract the list of dimensions and create a scale for each.
      x.domain(dimensions);

      // function provides the element once for each element in the array
      dimensions.forEach(function(d) {

      //The values for each element in the EnhancerID and Transcription Factor array
        var vals = slopeData.map(function(p) {

          return p[d];

        });


        //if its a new elmeent add onto the network
        if (vals.every(quant_p)) {

          y[d] = d3.scaleLinear()
            .domain(d3.extent(slopeData, function(p) {
                // console.log(+p[d]);
              return +p[d];
            }))
            .range([height, 0]);



        }
        //if an array element in the EnhancerID and TranscriptionFactors element is repeated then filter out
         else {


          y[d] = d3.scalePoint()
            .domain(vals.filter(function(v, i) {


              return vals.indexOf(v) == i;
            }))
            .range([height, 0], 1);
        }

        // console.log(y[d]);
      })


      //The connection between Enhancer ID and Transciption Factor in each element
      extents = slopeData.map(function(p) {
        return [0, 0]
      });


      //SVG that draws the line between the EnhancerID and the TransciptionFactor
      foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(slopeData)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("stroke",

        //change the line colors based on enhancer values
          function(d, i) {
            // console.log("foreground: " + d);
            if (dataset2.value[i] >= 0 && dataset2.value[i] < 7.35) {
              return "#fed976";
            } else if (dataset2.value[i] >= 7.35 && dataset2.value[i] < 8.62){
                return "#fc4e2a";
            }
            else if (dataset2.value[i] >= 8.62 && dataset2.value[i] <= 22.52){

              return "#800026";
            }

          })
          //the line width
        .style("stroke-width",
          function(d, i) {
              return 1;
          }
        );


      //draws the text for both TransciptionFactor and EnhancerID
      var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class",function(d){
          return "dimension";
        })
        .attr("transform", function(d) {

          // console.log(d);
          return "translate(" + x(d)*1.06  + ")";

        }
      )
      .attr("font-family", "Arial")
      .attr("font-weight", 600)


      //draws the dimension
      var g = svg.selectAll(".dimension");
      g.append("g")
        .attr("class", function(d){
          return "axis" +d;
        })
          .each(function(d) {
          d3.select(this).call(d3.axisLeft(y[d]));

        })



        //Variable of the gene score array
        var score = dataset2.testScore;

        //retrieve the items in the array
        var basicScore = score.map(function(item){
          return item;
        });
        // console.log(basicScore)

        //filter the repeats seen within the array
        var uniqueScore = basicScore.filter(function(item,index){
          return basicScore.indexOf(item) >= index;
        });

        // console.log(uniqueScore);

        //style the EnhancerID with colors dependent  on enhancer gene score
        svg.selectAll(".axisEnhancerID text")
            .style("fill", function(d, i){

                if (uniqueScore[i] >= 0 && uniqueScore[i] < 10) {
                  return "blue";
                } else if (uniqueScore[i] >= 10 && uniqueScore[i] < 15) {
                  return "green";
                } else if (uniqueScore[i] >= 15) {
                  return "red";
                }
                else{
                  return "blue";
                }


            })
            //font size
            .style("font-size",
              function(d){

                if(width <= 600){
                  return "12px";
                }
                else{
                    return "17px";
                }

              }


            );


      //styling of Transcription Factor
      svg.selectAll(".axisTransciptionFactor text")
            .style("font-weight", "600")
            .style("font-size", "13px");


      //The position of the x znd y coordinates in the array
      function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
      }


      // Returns the path for a given data point.
      function path(d) {
        return line(dimensions.map(function(p) {
          return [position(p), y[p](d[p])];
        }));
      }

      //this function handles a brush event, toggling the display of foreground lines.
      //it calculates the length of the lines between each dimension element
      function brush_parallel() {


        //go through each dimension length
        console.log(dimensions.length);
        for (var i = 0; i < dimensions.length; ++i) {

          //specify the selected region using brush
          if (d3.event.target == y[dimensions[i]].brush) {


            //variables that showcase the elements in the EnhancerID and TranscriptionFactor on the y axis
            var yScale = y[dimensions[i]];

            //identify the selected regions in the
            var selected = yScale.domain().filter(function(d) {
              // var s = d3.event.target.extent();
              var s = d3.event.selection;


              //return array elements, and the way EnhancerID and TransciptionFactor are connected
              return (s[0] <= yScale(d)) && (yScale(d) <= s[1])

            });

            //sort the values alphabetically and by value
            var temp = selected.sort();
            extents[i] = [temp[temp.length - 1], temp[0]];


          }

        }

        //styling of the lines
        foreground.style("display", function(d) {
          return dimensions.every(function(p, i) {
            if (extents[i][0] == 0 && extents[i][0] == 0) {
              return true;
            }
            //var p_new = (y[p].ticks)?d[p]:y[p](d[p]);
            //return extents[i][1] <= p_new && p_new <= extents[i][0];
            return extents[i][1] <= d[p] && d[p] <= extents[i][0];
          }) ? null : "none";
        });
      }


      //******************************Begin: the function allows for a redraw of the network dependent on window size**************************************
      function resizeNet(){

        console.log("resize network");

        test_width = wth - margin.left - margin.right- (window.innerWidth- 700),
        width = parseInt(d3.select("#network").style("width")) - margin.left - margin.right,
        height =(w.innerHeight|| e.clientHeight|| g.clientHeight) - margin.top - margin.bottom - 355;

        x.rangeRound([0, width],1);

        var line = d3.line(),
          // background,
          foreground,
          extents;
        d3.select("#network").selectAll("*").remove();
        var container = d3.select("#network").append("div")
          .attr('class', "parcoords")
          .style("width", width )
          .style("height", height + margin.top + margin.bottom + "px");

        var svg = container.append('svg')
          .attr("width", width )
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var quant_p = function(v) {
          // console.log(v);

          return (parseFloat(v) == v) || (v = "")
        };

        var slopeData = dataset2.netData;
        var dimensions = d3.keys(slopeData[0]);


        // Extract the list of dimensions and create a scale for each.
        x.domain(dimensions);
        // console.log(x.domain(dimensions));
        // console.log(dimensions[0]);
      var test_netdata =  dimensions.forEach(function(d) {

          var vals = slopeData.map(function(p) {


            return p[d];

          });

          if (vals.every(quant_p)) {

            y[d] = d3.scaleLinear()
              .domain(d3.extent(slopeData, function(p) {
                  // console.log(+p[d]);
                return +p[d];
              }))
              .range([height, 0]);



          } else {

            y[d] = d3.scalePoint()
              .domain(vals.filter(function(v, i) {

                return vals.indexOf(v) == i;
              }))
              .range([height, 0], 1);
          }


        })


        extents = slopeData.map(function(p) {
          return [0, 0]
        });



        foreground = svg.append("g")
          .attr("class", "foreground")
          .selectAll("path")
          .data(slopeData)
          .enter().append("path")
          .attr("d", path)
          .attr("stroke",

            function(d, i) {
              // console.log("foreground: " + d);
              if (dataset2.value[i] >= 1.29 && dataset2.value[i] < 7.35) {
                return "#fed976";
              } else if (dataset2.value[i] >= 7.35 && dataset2.value[i] < 8.62){
                  return "#fc4e2a";
              }
              else if (dataset2.value[i] >= 8.62 && dataset2.value[i] <= 22.52){

                return "#800026";
              }

            })
          .style("stroke-width",
            function(d, i) {
                return 1;
            }
          );

        var g = svg.selectAll(".dimension")
          .data(dimensions)
          .enter().append("g")
          .attr("class",function(d){
            return "dimension";
          })
          .attr("transform", function(d) {

            // console.log(d);
            return "translate(" + x(d)*1.055  + ")";

          }
        )
        .attr("font-family", "Arial")
        .attr("font-weight", 600)
        .style("fill", "red")


        var g = svg.selectAll(".dimension");
        g.append("g")
          .attr("class", function(d){
            return "axis" +d;
          })
          .attr("fill", "coral")
          .each(function(d) {
            d3.select(this).call(d3.axisLeft(y[d]));

          })


          var score = dataset2.testScore;

          var basicScore = score.map(function(item){
            return item;
          });
          // console.log(basicScore);

          var uniqueScore = basicScore.filter(function(item,index){
            return basicScore.indexOf(item) == index;
          });

          // console.log(uniqueScore);


          svg.selectAll(".axisEnhancerID text")
              .style("fill", function(d, i){

                  if (uniqueScore[i] >= 0 && uniqueScore[i] < 10) {
                    return "blue";
                  } else if (uniqueScore[i] >= 10 && uniqueScore[i] < 15) {
                    return "green";
                  } else if (uniqueScore[i] >= 15) {
                    return "red";
                  }
                  else{
                    return "blue";
                  }

              })
              .style("font-size",
                function(d){

                  if(width <= 600){
                    return "14.5px";
                  }
                  else{
                      return "17px";
                  }

                }


              );


              svg.selectAll(".axisTransciptionFactor text")
                    .style("font-weight", "600")
                    .style("font-size", "13px");





      }

      //redraws the graphic dependent on window size
      d3.select(window).on('resize.two', resizeNet);
      //******************************End: the function allows for a redraw of the network dependent on window size**************************************


    }






//////////////////////////////////END NETOWRK/////////////////////////////////////////////////////////////////////

////////BEGINNING- UCSC GENOME BROWSER///////////////////////////////////////////////////////////////////////////////////////////
//new information will appear dependent on
//New elements based on the gene symbol as a flex container to fit within a page
document.getElementById("ucsc_container").style.display = "flex";

//Receive JBROWSE DATA
var jsonText_jbrowse = $.ajax({
    type: 'POST',
    url: "jbrowse.php",
    data: {
      "genesymbol": datum
    },
    async: false
  }).responseText

jbrowse_info = JSON.parse(jsonText_jbrowse);

var ucsc_link = 'http://rstats.immgen.org/JBrowse/index.html?data=EnhancerControl&tracks=ncbiRefSeq%2CEnhancers&menu=0&tracklist=0&loc=' + jbrowse_info.chr + '%3A' + jbrowse_info.summit_min + '..' + jbrowse_info.summit_max;
document.getElementById('frame_UCSC_browser').src = ucsc_link;
// document.getElementById('frame_UCSC_browser').style.display = 'block';



//////////////////END- UCSC GENOME BROWSER/////////////////////////////////////////////////////////////////////////////////////////


    /////////BEGINNING-HEATMAP////////////////////////////////////////////////////////////////////////////////////////////////////////
    //New elements based on the gene symbol as a flex container to fit within a page
    document.getElementById("heatmap_container").style.display = "flex";
    d3.select("#heatmap").selectAll("*").remove();

    //Receive JBROWSE DATA based on
    var jsonText2 = $.ajax({

      type: 'POST',
      url: "heatmap_enhancerControl.php",
      data: {
        "genesymbol": datum
      },
      async: false

    }).responseText
    dataset = JSON.parse(jsonText2);

    console.log(dataset);

  //determine the window and container heights
    var w = window,
        d = document,
        e = d.documentElement,
        g =  d.getElementsByTagName('body')[0];


  //the margins of the heatmap
    var margin = {
        top: 120,
        right: 90,
        bottom: 0,
        left: 90
      },



      //the column length and row length
      col_number = dataset.colLabel.length,
      row_number = dataset.rowLabel.length,

      //height and width of the heatma[]
      height =(w.innerHeight|| e.clientHeight|| g.clientHeight) - margin.top - margin.bottom - 440,
      // width = (w.innerWidth || e.clientWidth || g.clientWidth) - margin.left - margin.right - 250,
      // widthWin = (w.innerWidth || e.clientWidth || g.clientWidth) - margin.left - margin.right - 500,
      width = parseInt(d3.select("#heatmap").style("width")) - margin.left - margin.right - 20,


      //cellsize height and width determine of height and width of the heatmap
      cellSize_h = (height / row_number) / 2.00,
      cellSize_w = (width / col_number) / 2.50;


    //row label and column label size
    var rowLabel_font_size = 17;
    var colLabel_font_size = 9;

    //the list of row label and column labels
    var rowLabel = dataset.rowLabel;
    var colLabel = dataset.colLabel;

    // if (rowLabel.length > 70 && rowLabel.length <= 100) {
    //   rowLabel_font_size = 12;
    // } else if (rowLabel.length > 100) {
    //   rowLabel_font_size = 11.5;
    // }

    //group color array
    var groups_colors = [];
    //push the specific column name and row label
    for (var k = 0; k < col_number; k++) {
      groups_colors.push([colLabel[k], rowLabel[colLabel[k]]]);
    }

    //maximum value within the data
    var max_v = d3.max(dataset.data, function(d) {
      return d.norm_value;
    });

    //minimum value within the data
    var min_v = d3.min(dataset.data, function(d) {
      return d.norm_value;
    });

    //scaling the color based on the minimum and maximum value
    var colorScale = d3.scale.quantile()
      .domain([min_v, 0, max_v])
      .range(colors);

    //d3.select("#heatmap").selectAll("*").remove();
    //draw the svg with d3
    var svg = d3.select("#heatmap").append('svg')
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "heatmap_svg")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //draw the row labels with specific size and color based on gene enhancer score
    var rowLabels = svg.append("g")
      .selectAll(".rowLabelg")
      .data(rowLabel)
      .enter()
      .append("text")
      .text(function(d) {
        return d;
      })
      .attr("fill", function(d, i) {


        if (dataset.geneScore[i] >= 0 && dataset.geneScore[i] < 10) {
          return "blue";
        } else if (dataset.geneScore[i] >= 10 && dataset.geneScore[i] < 15) {
          return "green";
        } else if (dataset.geneScore[i] >= 15) {
          return "red";
        }


      })
      .style("font-size",
        function(d){

          if(width <= 600){
            return "14.5px";
          }
          else{
              return "17px";
          }

        }


      )
      // .style("display", function(d, i){
      //   return i % 2 ? "none" : "initial";
      // })
      .attr("font-family", "Arial")
      .attr("font-weight", 600)
      .attr("x", 0)
      .attr("y", function(d, i) {
        // console.log(i);
        return i * cellSize_h;
      })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + cellSize_h / 1.5 + ")")
      .attr("class", function(d, i) {
        return "rowLabel mono r" + i;
      });
      // .on("mouseover", function(d) {
      //   d3.select(this).classed("text-hover", true)
      //     .style("font-size", 14 + "px");
      // })
      // .on("mouseout", function(d) {
      //   d3.select(this).classed("text-hover", false)
      //     .style("font-size", rowLabel_font_size + "px");
      // });

    rowLabels.append("title").text(function(d) {
      return d;
    });

    //draw the column labels
    var colLabels = svg.append("g")
      .selectAll(".colLabelg")
      .data(colLabel)
      .enter()
      .append("text")
      .text(function(d) {
        if (rowLabel < 1) {
          return null;
        } else {
          return d;
        }
      })
      .style("font-size", colLabel_font_size + "px")
      .attr("font-family", "Arial")
      .attr("font-weight", 600)
      .attr("x", cellSize_h)
      .attr("x", 10)
      .attr("y", function(d, i) {
        return i * cellSize_w;
      })
      .style("text-anchor", "left")
      .attr("transform", "translate(" + cellSize_w / 1.5 + ") rotate (-90)")
      .attr("class", function(d, i) {
        return "colLab mono c" + i;
      })
      .on("mouseover", function(d) {
        d3.select(this).classed("text-hover", true);
      })
      .on("mouseout", function(d) {
        d3.select(this).classed("text-hover", false);
      });

    colLabels.append("title").text(function(d) {
      return d;
    });

    var heatMap = svg.append("g").attr("class", "g3")
      .selectAll(".cellg")
      .data(dataset.data, function(d) {

        return d.row_id + ":" + d.col_id;

      })
      .enter()
      .append("rect")
      .attr("x", function(d) {
        return (d.col_id - 1) * cellSize_w;
      })
      .attr("y", function(d) {
        return (d.row_id - 1) * cellSize_h;
      })
      .attr("class", function(d) {
        return "cell cell-border cr" + (d.row_id - 1) + " cc" + (d.col_id - 1);
      })
      .attr("width", cellSize_w)
      .attr("height", cellSize_h)
      .style("fill", function(d) {
        // console.log(d.norm_value);
        return colorScale(d.norm_value);
      })
      .on("mouseover", function(d) {
        //highlight text
        d3.select(this).classed("cell-hover", true);
        d3.selectAll(".rowLabel").classed("text-highlight", function(r, ri) {
          return ri == (d.row_id - 1);
        });
        d3.selectAll(".colLabel").classed("text-highlight", function(c, ci) {
          return ci == (d.col_id - 1);
        });

        var xPos = d3.event.pageX + 15;
        var yPos = d3.event.pageY + 15;
        if ((window.innderWidth - xPos) < 240) {
          xPos = xPos - 240;
        }
        if ((window.innerHeight - yPos) < 80) {
          yPos = yPos - 80;
        }

        //Update the tooltip position and norm_value
        d3.select("#tooltip")
          .style("left", xPos + "px")
          .style("top", yPos + "px")
          .select("#population")
          .text(d.population);


        d3.select("#tooltip")
          .style("left", xPos + "px")
          .style("top", yPos + "px")
          .select("#en_id")
          .text(d.EnhancerID);

        d3.select("#tooltip")
          .style("left", xPos + "px")
          .style("top", yPos + "px")
          .select("#symbol")
          .text(d.gene_symbol);

        d3.select("#tooltip")
          .style("left", xPos + "px")
          .style("top", yPos + "px")
          .select("#value")
          .text(d.value);

        d3.select("#tooltip")
          .style("left", xPos + "px")
          .style("top", yPos + "px")
          .select("#geneScore")
          .text(d.gene_Score);


        //Show the tooltip
        d3.select("#tooltip").classed("hidden", false);

      })
      //hides the tooltips
      .on("mouseout", function() {
        d3.select(this).classed("cell-hover", false);
        d3.selectAll(".rowLabel").classed("text-highlight", false);
        d3.selectAll(".colLabel").classed("text-highlight", false);
        d3.select("#tooltip").classed("hidden", true);
      });

      //function to draw heatmap based on window size
      function reSize(){


        height =(w.innerHeight|| e.clientHeight|| g.clientHeight) - margin.top - margin.bottom - 440,
        // width = (w.innerWidth || e.clientWidth || g.clientWidth) - margin.left - margin.right - 250,
        // widthWin = (w.innerWidth || e.clientWidth || g.clientWidth) - margin.left - margin.right - 500,
        width = parseInt(d3.select("#heatmap").style("width")) - margin.left - margin.right - 20,




      cellSize_h = (height / row_number) / 2.00,
      cellSize_w = (width / col_number) / 2.50;

      // console.log("width:" + width);


      var rowLabel_font_size = 17;
      var colLabel_font_size = 9;

      var rowLabel = dataset.rowLabel;
      var colLabel = dataset.colLabel;

      var groups_colors = [];
      for (var k = 0; k < col_number; k++) {
      groups_colors.push([colLabel[k], rowLabel[colLabel[k]]]);
      }

      var max_v = d3.max(dataset.data, function(d){
      return d.norm_value;
      });
      var min_v = d3.min(dataset.data, function(d) {
      return d.norm_value;
      });

      var colorScale = d3.scale.quantile()
      .domain([min_v, 0, max_v])
      .range(colors);

      d3.select("#heatmap").selectAll("*").remove();
      var svg = d3.select("#heatmap").append('svg')
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "heatmap_svg")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



      var rowLabels = svg.append("g")
        .selectAll(".rowLabelg")
        .data(rowLabel)
        .enter()
        .append("text")
        .text(function(d) {
          return d;
        })
        .attr("fill", function(d, i) {

          // console.log(dataset.geneScore[i]);
          if (dataset.geneScore[i] >= 0 && dataset.geneScore[i] < 10) {
            return "blue";
          } else if (dataset.geneScore[i] >= 10 && dataset.geneScore[i] < 15) {
            return "green";
          } else if (dataset.geneScore[i] >= 15) {
            return "red";
          }


        })
        .style("font-size", rowLabel_font_size + "px")
        .attr("font-family", "Arial")
        .attr("font-weight", 600)
        .attr("x", 0)
        .attr("y", function(d, i) {
          // console.log(i);
          return i * cellSize_h;
        })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + cellSize_h / 1.5 + ")")
        .attr("class", function(d, i) {
          return "rowLabel mono r" + i;
        });

      rowLabels.append("title").text(function(d) {
        return d;
      });

      var colLabels = svg.append("g")
        .selectAll(".colLabelg")
        .data(colLabel)
        .enter()
        .append("text")
        .text(function(d) {
          if (rowLabel < 1) {
            return null;
          } else {
            return d;
          }
        })
        .style("font-size", colLabel_font_size + "px")
        .attr("font-family", "Arial")
        .attr("font-weight", 600)
        .attr("x", cellSize_h)
        .attr("x", 10)
        .attr("y", function(d, i) {
          return i * cellSize_w;
        })
        .style("text-anchor", "left")
        .attr("transform", "translate(" + cellSize_w / 1.5 + ") rotate (-90)")
        .attr("class", function(d, i) {
          return "colLab mono c" + i;
        })
        .on("mouseover", function(d) {
          d3.select(this).classed("text-hover", true);
        })
        .on("mouseout", function(d) {
          d3.select(this).classed("text-hover", false);
        });

      colLabels.append("title").text(function(d) {
        return d;
      });

      var heatMap = svg.append("g").attr("class", "g3")
        .selectAll(".cellg")
        .data(dataset.data, function(d) {

          return d.row_id + ":" + d.col_id;

        })
        .enter()
        .append("rect")
        .attr("x", function(d) {
          return (d.col_id - 1) * cellSize_w;
        })
        .attr("y", function(d) {
          return (d.row_id - 1) * cellSize_h;
        })
        .attr("class", function(d) {
          return "cell cell-border cr" + (d.row_id - 1) + " cc" + (d.col_id - 1);
        })
        .attr("width", cellSize_w)
        .attr("height", cellSize_h)
        .style("fill", function(d) {
          // console.log(d.norm_value);
          return colorScale(d.norm_value);
        })
        .on("mouseover", function(d) {
          //highlight text
          d3.select(this).classed("cell-hover", true);
          d3.selectAll(".rowLabel").classed("text-highlight", function(r, ri) {
            return ri == (d.row_id - 1);
          });
          d3.selectAll(".colLabel").classed("text-highlight", function(c, ci) {
            return ci == (d.col_id - 1);
          });

          var xPos = d3.event.pageX + 15;
          var yPos = d3.event.pageY + 15;
          if ((window.innderWidth - xPos) < 240) {
            xPos = xPos - 240;
          }
          if ((window.innerHeight - yPos) < 80) {
            yPos = yPos - 80;
          }

          //Update the tooltip position and norm_value
          d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .select("#population")
            .text(d.population);


          d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .select("#en_id")
            .text(d.EnhancerID);

          d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .select("#symbol")
            .text(d.gene_symbol);

          d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .select("#value")
            .text(d.value);

          d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .select("#geneScore")
            .text(d.gene_Score);


          //Show the tooltip
          d3.select("#tooltip").classed("hidden", false);

        })
        .on("mouseout", function() {
          d3.select(this).classed("cell-hover", false);
          d3.selectAll(".rowLabel").classed("text-highlight", false);
          d3.selectAll(".colLabel").classed("text-highlight", false);
          d3.select("#tooltip").classed("hidden", true);
        });
       // svg.attr("width", width).attr("height", height);

      }

      //redraw based on window size
      d3.select(window).on('resize.one', reSize);




    /////////END-HEATMAP/////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////BEGINNING- METAINFO TABLE/////////////////////////////////////////////////////////////////////////////////////////////
    //new gene name based on flex container to fit within a page
    document.getElementById("table_container").style.display = "flex";


    //The DataTable with the first column color based on gene enhancer score
    $('#Enhancer_metainfo_table').DataTable().destroy();
    var table = $('#Enhancer_metainfo_table').DataTable({
      "processing": true,
      "info": false,
      "serverSide": false,
      "searching": false,
      "bPaginate": false,
      "bInfo": false,
      "autoWidth": false,
      "scrollY": "15vh",
      // "scrollCollapse": true,
      // "paging": false,
      responsive: true,
      "ajax": {
        "url": 'metainfo_table_get_data.php',
        "type": 'POST',
        "data": {
          "genesymbol": datum
        }
      },
      columns: [{
          "data": "ID"
        },
        {
          "data": "Chr"
        },
        {
          "data": "PeakPosition"
        },
        {
          "data": "SpeciesConservation"
        },
        {
          "data": "ReliabilityGrade"
        },
        {
          "data": "TSS"
        },
        {
          "data": "GeneScore"
        }
      ],
      "columnDefs": [{
        "max-width": "10%",
        "targets": 0,
        pageLength: 5,
        "createdCell": function(td, cellData, rowData, row, col) {

          $(td).css('color', '#F0F0F0');
          $(td).css("font-weight", "bold");
          $(td).css("font-size", "13px");
          $(td).css("font-family", "Arial");
          if (rowData.GeneScore >= 0 && rowData.GeneScore < 10) {
            $(td).css('background', '#377EB8');
          } else if (rowData.GeneScore >= 10 && rowData.GeneScore < 15) {
            $(td).css('background', '#66A61E');
          } else if (rowData.GeneScore >= 15) {
            $(td).css('background', '#FF0029');
          }

        }
      }],
      "order": [
        //[0, "desc"]
        [2, "asc"]
      ],
      "pagingType": "simple_numbers"
    });

    $('#Enhancer_metainfo_table').css('width', '100px');

    table.on('responsive-resize', function(e, datatable, columns) {
      var count = columns.reduce(function(a, b) {
        return b === false ? a + 1 : a;
      }, 0);

      console.log(count + ' column(s) are hidden');
    });




    ///////////////////////////////BEGINNING - DNA Rchitect////////////////////////////////////////////////////////////////////////////////
    $("#selectCell").change(function() {

    });


    // document.getElementById("dna_rchitect").style.display = "flex";
    //
    // var DNARchitect_link_filename = 'DNARchitect' + Math.floor(Date.now() / 1000);
    // var chrom = hashtable[hashtable_synonyms[datum]][0];
    // var chromstart = hashtable[hashtable_synonyms[datum]][1];
    // var chromend = hashtable[hashtable_synonyms[datum]][2];
    // console.log(datum);
    //////////////////END- DNA Rchitect/////////////////////////////////////////////////////////////////////////////////////////

  }).on('typeahead:change', function() {
  	  //alert("ddd");
  });

//click the Enhancer JBrowse window to open to a new window
  $("#Enhancer_ucsc_browser_new_window").click(function() {
      var geneSymbol = $("#GeneSymbol").val();

      var jsonText_jbrowse2 = $.ajax({
          type: 'POST',
          url: "jbrowse.php",
          data: {
            "genesymbol": geneSymbol
          },
          async: false
        }).responseText

        jbrowse_info_click = JSON.parse(jsonText_jbrowse2);
    window.open('http://rstats.immgen.org/JBrowse/index.html?data=EnhancerControl&tracks=DNA%2CEnhancers%2CncbiRefSeq%2CrefGene%2Cgencode_M22_genes&menu=0&tracklist=0&loc=' + jbrowse_info_click.chr + '%3A' + jbrowse_info_click.summit_min + '..' + jbrowse_info_click.summit_max, '_blank');
    window.focus();
  });


//click to save the network into a CSV
  $("#enhancer_network_csv").click(function() {
    var geneSymbol = $("#GeneSymbol").val();
    console.log(geneSymbol);


    window.open( 'http://rstats.immgen.org/EnhancerControl/download_slopegraph.php?genesymbol=' + geneSymbol );

  });

  //click to save the table into a CSV
  $("#meta_table_csv").click(function() {
    var geneSymbol = $("#GeneSymbol").val();
    console.log(geneSymbol);

    // console.log(datum);
  window.open( 'http://rstats.immgen.org/EnhancerControl/download_metatable.php?genesymbol=' + geneSymbol );
  });

  //click to save the heatmap into a CSV
  $("#heatmap_csv").click(function() {
    var geneSymbol = $("#GeneSymbol").val();
    console.log(geneSymbol);

    window.open( 'http://rstats.immgen.org/EnhancerControl/download_heatmap.php?genesymbol=' + geneSymbol );

  });

  //save the heatmap image as a SVG
  $("#heatmap_save_svg").click(function() {

    // console.log("press");
    // submit_download_form("svg");
    var svgString = new XMLSerializer().serializeToString(document.getElementById("heatmap").getElementsByTagName("svg")[0]),

    blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"}),

    url = window.URL.createObjectURL(blob);



    var a = document.createElement('a');

    a.href = url;

    a.download = 'EnhancerNetwork_Heatmap.svg';

    document.body.appendChild(a);

    a.click();

  });

  //save the network image as a SVG
  $("#network_svg").click(function() {
    // alert("I am an alert box!");
    // console.log("svg")
    // submit_download_form_network("svg");
    var svgString = new XMLSerializer().serializeToString(document.getElementById("network").getElementsByTagName("svg")[0]),

    blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"}),

    url = window.URL.createObjectURL(blob);



    var a = document.createElement('a');

    a.href = url;

    a.download = 'EnhancerNetwork_Network.svg';

    document.body.appendChild(a);

    a.click();
  });

//// open page to question page for the table
  $("#question_table").click(function(){
    // alert("hello");
    // document.getElementById("inst_container_table").style.display = "block";
    var url = "http://www.immgen.org/databrowser/Tutorial/EnhancerTable.html";
    window.open(url, '_blank');

  });

  //// open page to question page for the network
  $("#question_network").click(function(){
    // alert("hello");
    // document.getElementById("inst_container_network").style.display = "block";
    var url = "http://www.immgen.org/databrowser/Tutorial/EnhancerNetwork.html";
    window.open(url, '_blank');
  });

  //// open page to question page for the heatmap
  $("#question_heat").click(function(){

      var url = "http://www.immgen.org/databrowser/Tutorial/EnhancerHeatmap.html";
      window.open(url, '_blank');
  });

  //// open page to question page for the JBROWSE
  $("#question_genome").click(function(){

    var url = "http://www.immgen.org/databrowser/Tutorial/EnhancerLocation.html";
    window.open(url, '_blank');

  });


////////////////////////////////////////////////////BEGIN: NAVIGATION TABS///////////////////////////////////////////////////////////
  $('.nav-tabs a[href="#home"]').click(function(){
    $(this).tab('show');

    document.getElementById("home").style.display = "block";
    document.getElementById("menu1").style.display = "none";

  });

  $('.nav-tabs a[href="#menu1"]').click(function(){
    $(this).tab('show');
    document.getElementById("home").style.display = "none";
    document.getElementById("menu1").style.display = "block";
  });
  ////////////////////////////////////////////////////END: NAVIGATION TABS///////////////////////////////////////////////////////////


    $(".toggle-accordion").on("click", function() {
      var accordionId = $(this).attr("accordion-id"),
        numPanelOpen = $(accordionId + ' .collapse.in').length;

      $(this).toggleClass("active");

      if (numPanelOpen == 0) {
        openAllPanels(accordionId);
      } else {
        closeAllPanels(accordionId);
      }
    })

    openAllPanels = function(aId) {
      // console.log("setAllPanelOpen");
      $(aId + ' .panel-collapse:not(".in")').collapse('show');
    }
    closeAllPanels = function(aId) {
      // console.log("setAllPanelclose");
      $(aId + ' .panel-collapse.in').collapse('hide');
    }

    $("#back2Top").click(function(event) {
      event.preventDefault();
      $("html, body").animate({
        scrollTop: 0
      }, "slow");
      return false;
    });

  });
