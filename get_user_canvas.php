<?php
	$db_name = 'my_database.db';
	$db = new SQLite3($db_name) or die('unable to connect database');
	$user_id = $_POST['user_id'];

	$query = "Select image_str from images where user_id = '$user_id'";
	$result = $db->query($query)->fetchArray();

	

	$result2 = array(
			'user_id' => $user_id,
			'image_str' => $result[0]
		);

	$json = json_encode($result2);
	echo $json;
	$db->close();

?>