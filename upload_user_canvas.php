<?php
	/* This file is for user to upload their own notes in the canvas
	*  So if the users' session is in the database, just update the information of 
	*     images of that user.
	* 		if not exist, create a new record to store it.
	*/

	session_start();
	$ses_id = session_id();

	// var_dump($ses_id);
	// echo "</br>";

	// Get the base64 image string
	$image_str = $_POST['image_str'];
	
	// play with database
	$db_name = 'my_database.db';
	$db = new SQLite3($db_name) or die('unable to connect database');
	$db->busyTimeout(5000);

	// test whether this user exists
	$query = "select user_id from sessions where session_id = '$ses_id'";
	$result = $db->query($query)->fetchArray();
	
	if (!$result) {
		$query1 = "select max(user_id) from images";
		$tmp = $db->query($query1)->fetchArray();
		$cur_user;
		if(!is_array($tmp)) {
			$cur_user = 1;
		} else {
			$cur_user = $tmp[0]+1;
		}

		$db->exec("insert into sessions (session_id, user_id) values ('$ses_id','$cur_user')");
		$db->exec("insert into images (user_id, image_str, submit_time) values ('$cur_user','$image_str',time('now'))");
	} else {

		$tmp = $db->query($query)->fetchArray();
		$user_id = $tmp[0];
		$db->exec("delete from images where user_id = '$user_id'");
		$db->exec("insert into images (user_id, image_str, submit_time) values ('$user_id','$image_str',time('now'))");
	}

	// session_abort();
	$db->close();
?>