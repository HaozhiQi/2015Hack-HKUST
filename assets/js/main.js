$(document).ready(function(){
	drawingCanvas.addEventListener("mousedown", function(ev){startDrawing(new Point(ev.layerX,ev.layerY))});
	drawingCanvas.addEventListener("mousemove", function(ev){drawContinue(new Point(ev.layerX,ev.layerY))});
	drawingCanvas.addEventListener("mouseup", function(ev){stopDrawing(new Point(ev.layerX,ev.layerY))});
		
	$("#button-clear").click(clearCanvas);
	
	document.getElementById('button-save').addEventListener('click', function() {
		downloadCanvas(this, forgeImage(),'canvas.png');
	}, false);
	
	loadBackground();
	loadUsers();
});

var timerInterval = 3000;
var current_image = null;
var backgroundCanvas = document.getElementById("canvas0");
var drawingCanvas = document.getElementById("canvas1");
var forgingCanvas = document.getElementById("canvas2");
var users = [];
var isDrawing = false;
var savedDrawing = null;
var currentViewUser = 0;
//timers
var userListTimer = null; //timer to refresh user list
var backgroundTimer = null; //timer to refresh background
var uploadDrawingTimer = null; //timer to auto upload drawing even when no input
var loadDrawingTimer = null; //timer to auto load drawing

function Point(x,y)
{
	this.x = x;
	this.y = y;
}

function loadBackground()
{
	clearTimeout(backgroundTimer);
	if (currentViewUser != 0){
		backgroundTimer = setTimeout(loadBackground, timerInterval); //keep this function running even if it doesn't do anything
	}
	//try to get the newest background from the server
	$.ajax({
		url: "get.php", //TODO: fill in the url
	}).done(function(data)
	{
		backgroundTimer = setTimeout(loadBackground, timerInterval);
		
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
		
		
		
		//trigger the upload of drawing if never before
		if(!uploadDrawingTimer)
		{
			uploadDrawingTimer = setTimeout(uploadDrawing, 0);
		}
	})
}

function loadUsers()
{
	$.ajax({
		url: "get_user_list.php", //TODO: fill in the url
	}).done(function(data)
	{
		userListTimer = setTimeout(loadUsers, timerInterval);
		
		//decode json data
		data = JSON.parse(data);
		
		users = data.user_list; //TODO: set the user array with the retrieved value
		users.splice(0, 0, {user_id: 0});
		
		renderUserList();
	})
}

function renderUserList()
{
	//set isActive values
	var index;
	var flag = false;
	for (index = 0; index < users.length; ++index)
	{
		if (users[index].user_id == currentViewUser)
		{
			users[index].isActive = true;
			flag = true;
		}
		else
		{
			users[index].isActive = false;
		}
	}
	
	//if no term is matched, fall back to the user's page
	if (!flag) {
		users[0].isActive = true;
		currentViewUser = 0;
	}
	//populate the user list with users
	var userTabTmpl = $.templates("#user-tab-template");
	var renderedHTML = userTabTmpl.render(users);
	$("#user-list").html(renderedHTML);
}

//load the drawing of the specific user in currentViewUser
function loadUserDrawing()
{
	//need this because this function can be invoked manually
	clearTimeout(loadDrawingTimer);
	var userId = currentViewUser;
	//if the user refers to oneself
	if (userId == 0) {
		//loadBackground();
		loadSavedDrawing();
		return; //don't start timer again because I don't need to keep it running. The click event is good enough for me to keep track of the change of view
	}
	$.ajax({
		url: "get_user_canvas.php", //TODO: fill in the url
		data: {
			user_id: userId //the id of the user
		},
		type: "POST",
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
		imageObj.src = image;
		ctx.drawImage(imageObj,0,0);
		loadDrawingTimer = setTimeout(loadUserDrawing, timerInterval);
	})
}

function startDrawing(point) {
	if(!currentViewUser){
		isDrawing = true;
		var ctx = drawingCanvas.getContext("2d");
		ctx.lineJoin = ctx.lineCap = 'round';
		ctx.moveTo(point.x, point.y);
	}
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
	saveDrawing();
	uploadDrawing();
}

function clearCanvas() {
	if (currentViewUser == 0) {
		drawingCanvas.width = drawingCanvas.width;
	}
}

//call after each stroke
function saveDrawing() {
	savedDrawing = drawingCanvas.toDataURL();
}

//call after switching back from someone else's thread
function loadSavedDrawing() {
	if (savedDrawing) {
		clearCanvas();
		var ctx = drawingCanvas.getContext("2d");
		var imageObj = new Image();
		imageObj.src = savedDrawing;
		ctx.drawImage(imageObj,0,0);
	}
}

function uploadDrawing() {
	//reset the timer as this method can be called manually
	clearTimeout(uploadDrawingTimer);
	
	//don't upload if viewing someone else
	if (currentViewUser != 0) {
		uploadDrawingTimer = setTimeout(uploadDrawing, timerInterval);
		return;		
	}
	//upload the resulting canvas to the webserver
	var image = forgeImage(); //convert to base64 PNG fileCreatedDate
	$.ajax({
		url: "upload_user_canvas.php",
		data: {
			image_str: image,
		},
		type: "POST",
	}).done(function(data){
		//
	uploadDrawingTimer = setTimeout(uploadDrawing, timerInterval);

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

function onUserTabClick(userId)
{
	currentViewUser = userId;
	renderUserList();
	loadUserDrawing();
}