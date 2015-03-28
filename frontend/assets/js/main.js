(function(){
	var current_image = null
	//ink manager object
	var inkManager = (function(){
		var isStroking = false
		var inkStack = []; //store the history of the picture
		var strokeStack = []; //store the strokes in the same picture
		var stroke = []; //the current drawing stroke
		var lastInk = 0;
		var lastStroke = 0;
		//basic point class
		function Point(x, y)
		{
			this.x = x;
			this.y = y;
		}
		//begin a stroke.
		this.beginStroke = function(eventX, eventY)
		{
			isStroking = true;
			//make an InkPoint
			var point = new Point(eventX, eventY);
			//add it to the stroke array
			strokeStack.push(point);
		}
		this.addInkPoint = function(eventX, eventY)
		{
			if (isStroking)
			{
				//make an InkPoint
				var point = new Point(eventX, eventY);
				//add it to the stroke array
				strokeStack.push(point);
			}
		}
		this.endStroke = function(eventX, eventY)
		{
			isStroking = false;
			//TODO: stack the stroke
			strokeStack.push(stroke);
			stroke = [];
		}
		
		//draw all the stroke in the strokeStack
		this.draw = function(ctx)
		{
			var index;
			//lastStroke is the lastStroke to show
			for(index = 0; index < lastStroke; ++index)
			{
				drawStroke(index, ctx);
			}
		}
		
		function drawStroke(strokeIndex, ctx)
		{
			//draw the given stroke
			var stroke = strokeStack[strokeIndex];
			ctx.moveTo(stroke[0].x, stroke[0].y);
			var index;
			for (index = 1; index < stroke.length; ++index)
			{
				ctx.lineTo(stroke[index].x, stroke[0].y);
			}
			ctx.stroke();
		}	
	})();
	//load picture function
	function load_image(onloadCallback, onerrorCallback = null)
	{
		$.ajax({
			url: "load_image.php"
		}).done(function(data)
		{
			//if the image info is successfully load
			if(data)
			{
				//if the image info contains data
				var image_info = JSON.parse(data);
				
				//TODO: modify the code here. load the image the image
				image_info.image_object = new Image();
				image_info.image_object.src = image_info.path;
				image_info.image_object.onload = onloadCallback;
				image_info.image_object.onerror = onerrorCallback | function () {
					$('#canvas-wrapper').empty().html('That image is not available.');
				};
			}
			else
			{
				$('#canvas-wrapper').empty().html('There are currently no images');
				current_image = null;
			}
		})
	}
	
	//the callback called after the image is loaded to browser
	function onloadCallback(current_image) {
		//set the image as the background image of the canvas wrapper
		$('#canvas-wrapper').css('background', 'url(' + current_image.path +') no-repeat center center fixed').css('background-size', 'contain');
	};
	
	//draw canvas function
	function drawCanvas()
	{
		//TODO: redrawImage
		
		//TODO: redrawStrokes
	}
	
	$('canvas').addLayer({
		name: 'mylayer',
	});
	$('canvas').getLayer('mylayer').drawLine(
		{
			fillStyle: "#000",
			x1: 0, y1: 0,
			x2: 100, y2: 100,
		})
	$('canvas').drawLayers();
})()