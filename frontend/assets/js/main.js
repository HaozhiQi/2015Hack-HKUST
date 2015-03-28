(function(){
	var current_image = null;
	var backgroundCanvas = document.getElementById("canvas0");
	var drawingCanvas = document.getElementById("canvas1");
	var forgingCanvas = document.getElementById("canvas2");
	var users = [];
	var isDrawing = false;
	
	function Point(x,y)
	{
		this.x = x;
		this.y = y;
	}
	//draw canvas function
	function drawCanvas()
	{
		//TODO: redrawImage
		
		//TODO: redrawStrokes
	}
	
	function loadBackground()
	{
		//try to get the newest background from the server
		$.ajax({
			url: , //TODO: fill in the url
		}).done(function(data)
		{
			//decode data
			data = JSON.parse(data);
			//the base64 string of image. image should not include the prefix
			var image =
			//draw the image onto
			var ctx = backgroundCanvas.getContext("2d");
			
			// load image from data url
			var imageObj = new Image();
			imageObj.src = "data:image/png;base64,"+image;
			ctx.drawImage(imageObj,0,0); //I don't use callback because base64 conversion is supposedly done without callback
		})
	}
	
	function loadDrawing(userId)
	{
		$.ajax({
			url: , //TODO: fill in the url
			data: {
				user_id: userId //the id of the user
			}
		}).done(function(data))
		{
			//decode data
			data = JSON.parse(data);
			//the base64 string of the drawingCanvas
			var image = ;
			var ctx = drawingCanvas.getContext("2d");
			ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
			// load image from data url
			var imageObj = new Image();
			imageObj.src = "data:image/png;base64,"+image;
			ctx.drawImage(imageObj,0,0);
		}
	}
	
	function loadUsers()
	{
		$.ajax({
			url: , //TODO: fill in the url
		}).done(function(data))
		{
			//decode json data
			data = JSON.decode(data);
			
			users = ; //TODO: set the user array with the retrieved value
			
			//TODO: populate the user list with users
		}
	}
	
	function startDrawing(point) {
		isDrawing = true;
		var ctx = drawingCanvas.getContext("2d");
		ctx.lineJoin = ctx.lineCap = 'round';
		ctx.moveTo(point.x, point.y);
	}
	
	function drawContinue(point) {
		if (isDrawing) {
			var ctx = drawingCanvas.getContext("2d");
			ctx.lineTo(pint.x, point.y);
			ctx.stroke();
		}
	}
	
	function stopDrawing() {
		isDrawing = false;
		//upload the resulting canvas to the webserver
		var image = drawingCanvas.toDataURL(); //convert to base64 PNG fileCreatedDate
		$.ajax({
			url: , //TODO: fill in the url
			data: {
				image: image;
			}
		}).done(function(data){
			//
		})
	}
	
	function getCanvasCoordinate(point) {
		//transfer the coordinate value measured in the window to that in the canvas
	}
	
	drawingCanvas.onmousedown = function(ev){console.log(ev);};
	
	function saveImage() {
		//forge the image from background and drawing
		var image = new Image();
		image.src = backgroundCanvas.toDataURL();
		forgingCanvas.drawImage(image, 0, 0);
		image.src = drawingCanvas.toDataURL();
		forgingCanvas.drawImage(image, 0, 0);
		
		
	}
})()