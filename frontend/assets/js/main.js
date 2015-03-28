(function(){
	var current_image = null
	//draw canvas function
	function drawCanvas()
	{
		//TODO: redrawImage
		
		//TODO: redrawStrokes
	}
	
	$('canvas').addLayer({
		name: 'mylayer',
	});
	console.log($('canvas').getLayer('mylayer'));
	$('canvas').getLayer('mylayer').drawLine(
		{
			fillStyle: "#000",
			x1: 0, y1: 0,
			x2: 100, y2: 100,
		})
	$('canvas').drawLayers();
})()