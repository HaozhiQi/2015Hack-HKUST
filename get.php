<?php
	$image_dir = "image/white_board.png";
	$my_image = file_get_contents($image_dir);

	
	$result = array(
			'image_str' => base64_encode($my_image)
		);

	$json = json_encode($result);
	echo $json;

?>