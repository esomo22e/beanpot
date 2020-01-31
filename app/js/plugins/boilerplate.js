document.getElementById("men").addEventListener("click", function menButton(){
    console.log("click men button");
    document.getElementById("beanpot_chart_men").style.display="block";
    document.getElementById("slider_men").style.display="block";

    document.getElementById("beanpot_chart_women").style.display="none";
    document.getElementById("slider_women").style.display="none";



var tooltip = d3.select("#beanpot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position","absolute")



d3.queue()
   .defer(d3.json, "/interactive/2020/02/beanpot/data/beanpot.json")
   .defer(d3.json, "/interactive/2020/02/beanpot/data/gameresults.json")
   .await(function(error, data, gameresults) {
      if (error) throw error;

      var mouseover = function(d) {
          tooltip
            .style("opacity", 1)
        }
     var mousemove = function(d) {
        for (var g=0; g<gameresults.length; g++)
         if (gameresults[g].year == Math.round(x.invert(d3.event.x - margin.left))) {
            tooltip
              .html(
                 "<h3>" + Math.round(x.invert(d3.event.x - margin.left)) + " Men's Beanpot</h3>" +
                 "<h4>Final</h4>" +
                 gameresults[g].final_winner_team + " " + gameresults[g].final_winner_score + ", " + gameresults[g].final_loser_team + " " + gameresults[g].final_loser_score +
                 "<h4>Third-Place Game</h4>" +
                 gameresults[g].thirdplace_winner_team + " " + gameresults[g].thirdplace_winner_score + ", " + gameresults[g].thirdplace_loser_team + " " + gameresults[g].thirdplace_loser_score
              )
              .style("left", (d3.event.x + 10) + "px")
              .style("top", (d3.event.y + 10) + "px")
         }

     }
     var mouseleave = function(d) {
       tooltip
         .style("opacity", 0)
     }


           var tooltipgrid = svg.append("rect")
            .attr("class","tooltip-grid")
            .attr("width", width)
            .attr("height", height)
            .attr("opacity", 0)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)


});
document.getElementById("women").addEventListener("click", function menButton(){
    console.log("click women button");


    document.getElementById("beanpot_chart_women").style.display="block";
    document.getElementById("slider_women").style.display="block";

     document.getElementById("beanpot_chart_men").style.display="none";
     document.getElementById("slider_men").style.display="none";

});
d3.json("/interactive/2018/10/bubble/data/beanpot.json", function(error, data) {
    if (error) throw error;
    beanpotMen(data, "#beanpot_chart_men", "#slider_men");

});

d3.json("/interactive/2018/10/bubble/data/beanpots_women.json", function(error, data2){
    if(error) throw error;
    // console.log(data);
    beanpotWomen(data2, "#beanpot_chart_women", "#slider_women");
});
