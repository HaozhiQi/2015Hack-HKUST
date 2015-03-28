<?php
	$db_name = 'my_database.db';

	// get last image number
	$db = new SQLite3($db_name) or die('unable to connect database');
	$query = "select max(id) from images";
	$result = $db->query($query)->fetchArray();

	// get directory of image file. 
	$query = "select image_dir from images where id = '$result[0]'";
	$res = $db->query($query)->fetchArray();
	$image_dir = $res[0];
	
	$my_image = imagecreatefrompng($image_dir);

	ob_start();
	imagepng($my_image);
	$imageData = ob_get_contents();
	ob_clean();

	$result2 = array(
			'id' => $result[0],
			'imageprocessed' => base64_encode($imageData)
		);

	$json = json_encode($result2);
	echo $json;
	$db->close();

?>