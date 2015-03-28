<?php
	$doc_path = realpath(dirname(__FILE__));

	// echo "<pre>";
	// var_dump($_FILES);
	// echo "</pre>";
	
	// the name of target image file
	$name = $_FILES["fileToUpload"]["name"];

	if (move_uploaded_file($_FILES['fileToUpload']['tmp_name'], $doc_path . '/' . basename($name))) {
        print "Upload succeed";
    } else {
        print "Upload failed!";
    }
	
	
	$db = new SQLite3('my_database.db') or die('unable to connect to database');
	
	$db->close();
	
	
	// define function is_ajax();
	function is_ajax() {
		return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
					strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
	}
?>
