
var sj_chartLib = {

	negativeStackChart  : function(id,data,options){

	var settings = $.extend({
						svgWidth : 1400,
						svgHeight : 200,
						isResponsive : true,
						enableTransition : false,
						margin:{
							"top": 40,
							'right': 40, 
							'left': 100,
							'bottom': 100
							},
						chartTitle : "",
						colorPalette : ["#d3d3d3","#fff","ff0000","ff4325"],
						xAxisProperties : {
								dataKeys : '',
								label : "",
								enableAxis : true,
								labelRotation : 0,
								enableGrid : false
						},
						yAxisProperties : {
								dataKeys : [],
								label : "",
								enableAxis : true,
								displayActualValue : false,
								enableGrid : false
						},
						lineChartProperties : {
									enableLineChart : false,
									xAxisProperties : {
												dataKeys : ''
												},
									yAxisProperties : {
												datakeys : [],
												displayActualValue : false
												},
									colorPalette : ["#80076B","#F15722", "#007FC7","#8DC63F","#218535"]
						}
					},options);

	var margin = settings.margin,
		svgWidth = settings.svgWidth,
		svgHeight = settings.svgHeight,
		width = svgWidth - margin.left - margin.right,
		height = svgHeight - margin.top - margin.bottom,
		isResponsive = settings.isResponsive,
		enableTransition = settings.enableTransition,
		chartTitle = settings.chartTitle,
		colorPalette = settings.colorPalette,
		xAxisProperties = $.extend({
										dataKeys : '',
										label : "",
										enableAxis : true,
										labelRotation : 0,
										enableGrid : false
									},settings.xAxisProperties),
		yAxisProperties = $.extend({
										dataKeys : '',
										label : "",
										enableAxis : true,
										displayActualValue : false,
										enableGrid : false
									},settings.yAxisProperties),
		lineChartProperties = settings.lineChartProperties;
	
	//List of variable used in the code	for generating chart
	//All variables have local scope
		var yDomPositive = null,
			yDomNegative = null, 
			xAxisForm = null,
			columnStackObj = null,
			stackSet = null,
			gStackContainer = null,
			stackMax = null,
			stackMin = null, 
			lineMax = null, 
			lineMin = null,
			colorLineDomain = null,
			colorStackDomain = null,
			x = null, 
			y = null, 
			xAxis = null, 
			yAxis = null, 
			elementContainerBox = null, 
			svgContainerBox = null,
			chartTitleContainer = null, 
			gChartContainer = null,
			lineGenerateFunction = null,
			lineSets = null,
			gLineContainer = null;
			
	//Getting selected element in avariable
	 elementContainerBox = d3.select('#'+id);
	
	//Adding svg to the container for chart
	 svgContainerBox = elementContainerBox.append('svg').attr('class','svgContainer').attr('id','svgContainerid');
	
	//Checking if the chart is responsive or not
	if(isResponsive){
		svgContainerBox.attr('viewBox',"0 0 "+svgWidth+" "+svgHeight);
	}else{
		svgContainerBox.attr("width",svgWidth)
						.attr("height",svgHeight);
	}
		//Adding title to the chart
	 chartTitleContainer = svgContainerBox.append('g')
									.attr('class','gChartTitle')
									.attr("transform", "translate("+( (margin.left+width)/2)+"," + margin.top/2 + ")")
									.append('text').text(chartTitle).attr("class",'charttitle');
		
		console.log(data);
		//Adding a g to hold chart with some x & y padding inside svg
	gChartContainer = svgContainerBox.append('g').attr("transform", "translate("+margin.left+"," + margin.top + ")")
										.attr('class','gchartcontainer');
		
	//Declaring x & y axis	
	 x = d3.scale.ordinal()
					.rangeBands([0, width]);
					
	 y = d3.scale.linear()
				.rangeRound([height, 0]);
				
	 xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");
				
	 yAxis = d3.svg.axis()
					.scale(y)
					.orient("left");
	
	//Enabling or disabling grid for x & y axis
	if(yAxisProperties.enableGrid){
		yAxis.innerTickSize(-width);
	}	
	if(xAxisProperties.enableGrid){
				xAxis.innerTickSize(-height);
	}
	
	//Setting colorStackDomain domain for assigning different colorStackDomain to each key
	colorStackDomain = d3.scale.ordinal()
						.range(colorPalette);
						
	//Setting colorStackDomain domain based on number of keys inserted in datakeys for y axis
	colorStackDomain.domain(yAxisProperties.dataKeys);		
	//	console.log(colorStackDomain.range());
	//	console.log(colorStackDomain.domain());
	
	data.forEach(function(d) 
  {
	var y0neg = 0;
	var y0pos = 0;
    d.totalVals = colorStackDomain.domain().map(function(name) 
	{ 
    	if(d[name]>0)
		return {name: name, y0: y0pos, y1: y0pos += +d[name]}; 
		else{
			 var y1 = y0neg;
			 
			 return { name: name, y0: y0neg += +d[name], y1: y1 };
		}
		          
	});
 	d.totalPositive = d3.max(d.totalVals, function (v) { return v.y1;});
	d.totalNegative = d3.min(d.totalVals, function (v) { return v.y0;});
  });
  
  //Setting domain for x axis
  x.domain(data.map(function(d) { return d[	xAxisProperties.dataKeys]; }));
//	console.log(x.domain())

	/******************Start max and min val to set domain for Y axis************************/
	
	if(lineChartProperties.enableLineChart){
			//Setting color domain for assigning different color to each key
		colorLineDomain = d3.scale.ordinal()
							.range(lineChartProperties.colorPalette);
						
		//Setting color domain based on number of keys inserted in datakeys for y axis
		colorLineDomain.domain(lineChartProperties.yAxisProperties.datakeys);		
		//	console.log(colorLineDomain.range());
		//	console.log(colorLineDomain.domain());
		
		
		data.forEach(function(d) 
			  {
				var y0neg = 0;
				var y0pos = 0;
				d.linetotalVals = colorLineDomain.domain().map(function(name) 
				{ 
					if(d[name]>0)
					return {name: name, y0: y0pos, y1: y0pos += +d[name]}; 
					else{
						 var y1 = y0neg;
						 
						 return { name: name, y0: y0neg += +d[name], y1: y1 };
					}
							  
				});
				d.linetotalPositive = d3.max(d.linetotalVals, function (v) { return v.y1;});
				d.linetotalNegative = d3.min(d.linetotalVals, function (v) { return v.y0;});
			  });

			  
		 stackMax = d3.max(data, function(d) { return d.totalPositive; });
		 stackMin = d3.min(data, function(d) { return d.totalNegative; });
		 lineMax = d3.max(data, function(d) { return d.linetotalPositive; });
		 lineMin = d3.min(data, function(d) { return d.linetotalNegative; });
		
		 yDomPositive = (stackMax>lineMax) ? stackMax : lineMax ;
		 yDomNegative = (stackMin<lineMin) ? stackMin : lineMin ;
		
	}else{
		 yDomPositive = d3.max(data, function(d) { return d.totalPositive; });
		 yDomNegative = d3.min(data, function(d) { return d.totalNegative; });
	}
		
		y.domain([Math.floor(yDomNegative), Math.ceil(yDomPositive/10)*10]);
//		console.log(y.domain())
	/******************end max and min val to set domain for Y axis************************/
		
	/****************Start Enabling disabling x axis grid***********************/
		 
		if(xAxisProperties.enableAxis){
			 xAxisForm = gChartContainer.append("g")
								  .attr("class", "x axis")
								  .attr("transform", "translate(0," + y(0) + ")") ;
			if(enableTransition){
				xAxisForm.transition().duration(1000).call(xAxis);
				xAxisForm.selectAll("text").transition().duration(1000).attr("transform", function(d) { return "rotate(" + xAxisProperties.labelRotation + ")"; })
			 					  .attr("y", 0)
								  .attr("x", -(height-y(0)))
								  .attr("dy", ".35em")
								  .attr("dx","-0.85em")
								  .style("text-anchor", "end");		
				if(xAxisProperties.enableGrid){
					xAxisForm.selectAll("line").transition().duration(1000).attr("y1",-(y(0))).attr("y2",height-(y(0)))
				}
			}else{
				xAxisForm.call(xAxis);
				xAxisForm.selectAll("text").attr("transform", function(d) { return "rotate(" + xAxisProperties.labelRotation + ")"; })
			 					  .attr("y", 0)
								  .attr("x", -(height-y(0)))
								  .attr("dy", ".35em")
								  .attr("dx","-0.85em")
								  .style("text-anchor", "end");		
				if(xAxisProperties.enableGrid){
					xAxisForm.selectAll("line").attr("y1",-(y(0))).attr("y2",height-(y(0)))
				}
			}					
								  
		}
	/****************End Enabling disabling x axis grid***********************/
		
	/****************Start Enabling disabling y axis grid***********************/
		if(yAxisProperties.enableAxis){
			if(enableTransition){
				gChartContainer.append("g")
					  .attr("class", "y axis")
					  .attr("transform", "translate("+0+"," + 0 + ")")
					  .transition().duration(1000)
					  .call(yAxis);	
			}else{
				gChartContainer.append("g")
					  .attr("class", "y axis")
					  .attr("transform", "translate("+0+"," + 0 + ")")
					  .call(yAxis);
			}		
		}
	/****************End Enabling disabling y axis grid***********************/
	
	/*************Start Adding column of stacks for each dataset*****************************/	
		
		gStackContainer = gChartContainer.append("g").attr("class","gStackContainer");
		
		columnStackObj = gStackContainer.selectAll(".columnStackObj")
									  .data(data)
									  .enter().append("g")
									  .attr("class", "gColumnStack")
									  .attr("transform", function(d) { return "translate(" + x(d[xAxisProperties.dataKeys]) + ",0)"; });
							  
			stackSet = columnStackObj.selectAll(".rectForstack")
										  .data(function(d) { return d.totalVals; })
										  .enter();
			stackSet.append("rect")
								.attr("class","rectForstack")
								.attr("x",(x.rangeBand()/5)/2)
								.attr("width", (x.rangeBand()-(x.rangeBand()/5)))
								.attr("y", function(d) { return y(d.y1); })
								.attr("height", function(d) { return y(d.y0) - y(d.y1); })
								.style("fill", function(d) { return colorStackDomain(d.name); })										  
		if(yAxisProperties.displayActualValue){
					columnStackObj.append("text")
								.attr("class","stackLableNegative")
								.attr("x",(x.rangeBand()/2))
								.attr("dy","0.7em")
								.attr("y", function(d) {return y(d.totalNegative);})
								.text(function(d,i){return Math.round( d.totalNegative * 10) / 10;})
								.style("text-anchor","middle");
								
					columnStackObj.append("text")
								.attr("class","stackLablePositive")
								.attr("x",(x.rangeBand()/2))
								.attr("y", function(d) {return y(d.totalPositive);})
								.text(function(d,i){return Math.round( d.totalPositive * 10) / 10;})
								.style("text-anchor","middle");
	}							  
	/*************End Adding column of stacks for each dataset*****************************/
	
	/*******************Start Generating line chart****************************************/
		if(lineChartProperties.enableLineChart){
			lineGenerateFunction = d3.svg.line()
										.x(function(d) { return x(d.x); })
										.y(function(d) { return y(d.y); });
			
			lineSets = colorLineDomain.domain().map(function(name) {
				return {
				  name: name,
				  values: data.map(function(d) {
					return {x: d[lineChartProperties.xAxisProperties.dataKeys], y: +d[name]};
				  })
				};
			  });	
			  
			gLineContainer = gChartContainer.append('g').attr("class","gLineContainer");
			
			gLineContainer.selectAll('.lines').data(lineSets).enter().append("svg:path").attr("transform", "translate("+(x.rangeBand()/2)+"," + 0 + ")")
					.attr("d", function(d,i){return lineGenerateFunction(d.values);})
					.style("stroke",function(d,i){ return colorLineDomain(d.name);})
					.style("fill", "none")
					.style("stroke-width", "1.5");

			if(lineChartProperties.yAxisProperties.displayActualValue){

				var gTextContainer = gLineContainer.append('g').attr('class','linetextContainer');

				var textEle = gTextContainer.selectAll('.textElem').data(lineSets)
							.enter().append('g').attr("transform", "translate("+(x.rangeBand()/2)+"," + 0 + ")");

				textEle.selectAll('.textelem').data(function(d,i){return d.values;})
					.enter()
					.append('text')
					.attr('x',function(e,j){return x(e.x);})
					.attr('y',function(e,j){return y(e.y);})
					.style("text-anchor","middle")
					.text(function(e,j) {return Math.round( e.y * 10) / 10});

		        }
		}
	/*******************End Generating line chart****************************************/
	}


}
