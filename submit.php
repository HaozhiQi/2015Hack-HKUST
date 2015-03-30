<?php
	$doc_path = realpath(dirname(__FILE__));
	
	// echo "the directory path is:";
	// echo "<pre>";
	// var_dump($doc_path);
	// echo "</pre>";
	// echo "<pre>";
	// var_dump($_FILES);
	// echo "</pre>";
	

	// the name of target image file
	$name = $_FILES["fileupload"]["name"];
	// echo "<pre>";
	// var_dump($name);
	// echo "</pre>";

	if (move_uploaded_file($_FILES['fileupload']['tmp_name'], $doc_path. '/image/' . basename($name))) {
   	 print "Upload succeed";
	} else {
	   print "Upload failed!";
	}
	
	/* $db = new SQLite3('my_database.db') or die('unable to connect to database');
	$db->busyTimeout(5000);
	$dir_name = $doc_path . '\\' . basename($name);
	$db->exec("insert into images (image_dir) values ('$dir_name')");
	$db->close(); */
	
	// define function is_ajax();
	function is_ajax() {
		return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
					strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
	}
?>
