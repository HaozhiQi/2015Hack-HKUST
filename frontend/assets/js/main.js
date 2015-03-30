(function(){
	var current_image = null
	//ink manager object
	var inkManager = (function(){
		var isStroking = false
		var inkStack = []; //store a whole picture
		var strokeStack = []; //store the strokes in the same picture
		var stroke = [];
		var inkStackIdx = 0;
		//basic point class
		function Point(x, y)
		{
			this.x = x;
			this.y = y;
		}
		//begin a stroke.
		function beginStroke(eventX, eventY)
		{
			
		}
		function addInkPoint(eventX, eventY)
		{
			if (isStroking)
			{
				//make an InkPoint
				//add it to the stroke array
			}
		}
		function endStroke(eventX, eventY)
		{
			isStroking = false;
			//TODO: stack the stroke
			strokeStack.push(stroke);
			stroke = [];
		}
		//draw all the points in the Ink
		function drawInk(ctx)
		{
			var index;
			for(index = 0; index < inkStack.length; ++index)
			{
				inkStack[index].drawInk
			}
		}
		
		function draw(ctx)
		{
			drawInk(ctx);
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
})()