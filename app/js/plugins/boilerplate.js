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
