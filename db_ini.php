<?php
	
	$db = new SQLite3('my_database.db') or die('unable to connect to database');
	$db->busyTimeout(5000);

	//drop previous tables
	$db->exec("DROP TABLE IF EXISTS images");
	$db->exec("DROP TABLE IF EXISTS sessions");
	//create tables

	// id is the order of images being inserted
	// image_dir is the directory of image
	$db->exec("CREATE TABLE images(
				user_id INTEGER,
				image_str TEXT,
				submit_time DATETIME)"
				)
				or die("create images table failed");
	
	// $db->exec("CREATE TABLE boxes(
	// 			id INTEGER PRIMARY KEY, 
	// 			positive_classification INTEGER, 
	// 			image_id INTEGER, 
	// 			first_point_X REAL, 
	// 			first_point_Y REAL, 
	// 			second_point_X REAL, second_point_Y REAL)"
	// 			)
	// 			or die("create boxes failed");

	// a table record last_image of users
	
	$db->exec("CREATE TABLE sessions(
					session_id TEXT PRIMARY KEY,
					user_id INTEGER)"
					)
					or die("create sessions table failed");

  

	$db->close();
?>
