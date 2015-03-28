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
	$db->busyTimeout(5000);
	//drop previous tables
	$db->exec("DROP TABLE IF EXISTS images");
	$db->exec("DROP TABLE IF EXISTS boxes");
	//create tables
	$db->exec("CREATE TABLE images(
				id INTEGER PRIMARY KEY,
				image_dir varchar(255))"
				) 
				or die("create images failed");
	
	$db->exec("CREATE TABLE boxes(
				id INTEGER PRIMARY KEY, 
				positive_classification INTEGER, 
				image_id INTEGER, 
				first_point_X REAL, 
				first_point_Y REAL, 
				second_point_X REAL, second_point_Y REAL)"
				)
				or die("create boxes failed");
	
	
	$db->close();
	
	
	// define function is_ajax();
	function is_ajax() {
		return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
					strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
	}
?>
