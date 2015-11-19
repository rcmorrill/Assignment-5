console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html
var projection = d3.geo.mercator()
    .center(bostonLngLat)
    .translate([(width/2)-75,height/2])
    .scale(200000);

var path = d3.geo.path().projection(projection);



//TODO: create a color scale
var scaleColor = d3.scale.linear ().domain([0,100000]).range(["#DCD9C6","#2374DB"]);

//TODO: create a d3.map() to store the value of median HH income per block group
var incomePerNeig = d3.map();
console.log(incomePerNeig);

//TODO: import data, parse, and draw
queue()
    .defer(d3.json, "data/bos_census_blk_group.geojson")
    .defer(d3.json, "data/bos_neighborhoods.geojson")
    .defer(d3.csv, "data/acs2013_median_hh_income.csv", parseData)
    .await(function(err,neighborhood,neighborhoods){
        console.log(neighborhood);
        console.log(neighborhoods);

        draw (neighborhood,neighborhoods);


    });

function draw (neighborhood,neighborhoods) {

    map.append("g")
        .attr("class", "block-groups")
        .selectAll(".block-group")
        .data(neighborhood.features)
        .enter()
        .append("path")
        .attr("class", "block-group")
        .attr("d", path)
        .style("fill", function (d){
            //console.log(d);

            //var block = (incomePerNeig.get(d.properties.geoid)).nameBlock;

            var income = (incomePerNeig.get(d.properties.geoid)).income;

            return scaleColor(income)

        })
        .call(attachTooltip);

    map2 = map.append("g")
        .attr("class","neighborhoods")
        .selectAll("neighborhood")
        .data(neighborhoods.features)
        .enter()
        .append("g")
        .attr("class", "neighborhood");

        map2.append("path")
        .attr("class", "boundaries")
        .attr("d", path)
        .style("stroke", "#ffffff")
        .style("stroke-width", "1.5px")
        .style("fill","none");

    map2.append("text")
        .text(function(d){
            //console.log(d);
            var nameNeigh = (d.properties.Name);
            //console.log(nameNeigh);
            return nameNeigh
        })
        .attr("x", function (d){
            return path.centroid(d)[0];
        })
        .attr("y", function (d){
            return path.centroid(d)[1];
        });


}


function parseData(d){
    //console.log("ds",d)
    incomePerNeig.set (d.geoid, {
        nameBlock: d.name,
        income: +d.B19013001
    });

}

function attachTooltip(selection){
    selection
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity',1);

            var income = (incomePerNeig.get(d.properties.geoid)).income;
            tooltip.select('#income').html(income);
        })
        .on('mousemove',function(){
            var xy = d3.mouse(canvas.node());
            var tooltip = d3.select('.custom-tooltip');

            tooltip
                .style('left',xy[0]+50+'px')
                .style('top',(xy[1]+50)+'px');

        })
        .on('mouseleave',function(){
            var tooltip = d3.select('.custom-tooltip')
                .transition()
                .style('opacity',0);
        })
}