console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

d3.select('.custom-tooltip').style('opacity',0);




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
	.translate([width/2, height/2])
	.center(bostonLngLat)
    .scale(200000);

var path = d3.geo.path()
.projection(projection);

//TODO: create a color scale

var colorScale = d3.scale.linear().domain([-9000,200000]).range(['white','black']);


//TODO: create a d3.map() to store the value of median HH income per block group

var income = d3.map();

//TODO: import data, parse, and draw

queue()
	.defer(d3.json, "data/bos_census_blk_group.geojson")
	.defer(d3.json, "data/bos_neighborhoods.geojson")
	.defer(d3.csv, "data/acs2013_median_hh_income.csv", parseData)
	.await(function(err, census, neighborhoods){
		console.log(income);

		draw(census, neighborhoods)
	})


function draw(census,neighborhoods){
	map.selectAll('.region')
	.data(census.features)
	.enter()
	.append('path')
	.attr('class','region')
	.attr('d',path)
	.style('fill', 'blue')
	.style('fill', function(d){
		var getIncome = income.get(d.properties.geoid);
		//console.log(getIncome);
		return colorScale(getIncome);})
	.call(tooltip);

	map.append('path')
		.datum(neighborhoods)
		.attr('class','neighborhoods')
		.attr('d',path);

	map.selectAll('.label')
		.data(neighborhoods.features)
		.enter()
		.append('text')
		.attr('class','label')
		.text(function(d){
			//console.log(d);
			return (d.properties.Name)
		})
		 .attr('x',function(d){
		 	//console.log(d)
            return path.centroid(d)[0]; 
         })       
         .attr('y',function(d){
            return path.centroid(d)[1];
        })
        .style('fill','orange')

}


function tooltip(tip){
	tip.on('mouseenter',function(d){

	var tooltip = d3.select('.custom-tooltip');

        tooltip.transition()
                .style('opacity',1);

		var getIncome = income.get(d.properties.geoid);
		console.log(getIncome);
		tooltip.select('#income').html(getIncome);
	})
	.on('mouseleave', function(d){
            d3.select('.custom-tooltip')
                .transition()
                .style('opacity',0);
        })
    .on('mousemove', function(d){
            var xy = d3.mouse(document.getElementById('map'));
            //this finds the xy of the mouse in relation to this element
            console.log(xy);
            d3.select('.custom-tooltip').style('opacity',1);

            var left = xy[0], top = xy[1];

            d3.select('.custom-tooltip')
                .style('left', left + -40 + 'px')
                .style('top', top + 30 + 'px');

         })
}
	
function parseData(d){
    income.set(d.geoid, +d.B19013001);
}