(function(){
	
	var current_image = null;
	var backgroundCanvas = document.getElementById("canvas0");
	var drawingCanvas = document.getElementById("canvas1");
	var forgingCanvas = document.getElementById("canvas2");
	var users = [];
	var isDrawing = false;
	
	drawingCanvas.addEventListener("mousedown", function(ev){console.log(ev);});
	
	function Point(x,y)
	{
		this.x = x;
		this.y = y;
	}
	
	function loadBackground()
	{
		//try to get the newest background from the server
		$.ajax({
			url: "get.php", //TODO: fill in the url
		}).done(function(data)
		{
			//decode data
			data = JSON.parse(data);
			//the base64 string of image. image should not include the prefix
			var image = data.image_str;
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
			url: "get_user_canvas.php", //TODO: fill in the url
			data: {
				user_id: userId //the id of the user
			}
		}).done(function(data)
		{
			//decode data
			data = JSON.parse(data);
			//the base64 string of the drawingCanvas
			var image = data.image_str;
			var ctx = drawingCanvas.getContext("2d");
			ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
			// load image from data url
			var imageObj = new Image();
			imageObj.src = "data:image/png;base64,"+image;
			ctx.drawImage(imageObj,0,0);
		})
	}
	
	function loadUsers()
	{
		$.ajax({
			url: "get_user_list.php", //TODO: fill in the url
		}).done(function(data)
		{
			//decode json data
			data = JSON.decode(data);
			
			users = data.user_list; //TODO: set the user array with the retrieved value
			
			//TODO: populate the user list with users
		})
	}
	
	drawingCanvas.addEventListener("mousedown", function(ev){startDrawing(new Point(ev.layerX,ev.layerY))});
	drawingCanvas.addEventListener("touchstart", function(ev){startDrawing(new Point(ev.layerX,ev.layerY))});
	drawingCanvas.addEventListener("mousemove", function(ev){drawContinue(new Point(ev.layerX,ev.layerY))});
	drawingCanvas.addEventListener("touchstart", function(ev){drawContinue(new Point(ev.layerX,ev.layerY))});
	drawingCanvas.addEventListener("mouseup", function(ev){stopDrawing(new Point(ev.layerX,ev.layerY))});
	drawingCanvas.addEventListener("touchstop", function(ev){stopDrawing(new Point(ev.layerX,ev.layerY))});
	
	function startDrawing(point) {
		isDrawing = true;
		var ctx = drawingCanvas.getContext("2d");
		ctx.lineJoin = ctx.lineCap = 'round';
		ctx.moveTo(point.x, point.y);
	}
	
	function drawContinue(point) {
		if (isDrawing) {
			var ctx = drawingCanvas.getContext("2d");
			ctx.lineTo(point.x, point.y);
			ctx.stroke();
		}
	}
	
	function stopDrawing() {
		isDrawing = false;
		uploadUserCanvas();
	}
	
	function uploadUserCanvas() {
		//upload the resulting canvas to the webserver
		var image = forgeImage(); //convert to base64 PNG fileCreatedDate
		$.ajax({
			url: "upload_user_canvas.php",
			data: {
				image_str: image,
			},
			type: "POST";
		}).done(function(data){
			//
		})
	}
	
		
	function forgeImage() {
		//forge the image from background and drawing
		var image = new Image();
		var ctx = forgingCanvas.getContext("2d");
		image.src = backgroundCanvas.toDataURL();
		ctx.drawImage(image, 0, 0);
		image.src = drawingCanvas.toDataURL();
		ctx.drawImage(image, 0, 0);
		return forgingCanvas.toDataURL();
	}
	
	function downloadCanvas(link, imageURL, filename) {
		link.href = imageURL;
		link.download = filename;
	}

	document.getElementById('button-save').addEventListener('click', function() {
		downloadCanvas(this, forgeImage(),'canvas.png');
	}, false);
})()