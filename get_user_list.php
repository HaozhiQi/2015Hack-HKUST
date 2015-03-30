<?php
	// This file provides a list of users.
	$db_name = 'my_database.db';
	$ses_id = session_id();
	$db = new SQLite3($db_name) or die("unable to connect database");

	$q = "select user_id from sessions where session_id != '$ses_id'";
	$r = $db->query($q)->fetchArray();
	$u = $r['user_id'];

	$query = "select user_id, image_str from images where user_id != '$u'";
	$result = $db->query($query);

	$row = array();
  $i = 0; 
  while($res = $result->fetchArray(SQLITE3_ASSOC)){ 
    if(!isset($res['user_id'])) continue; 
    	$row[$i]['user_id'] = $res['user_id']; 
     	$row[$i]['image_str'] = $res['image_str']; 
	    $i++; 
  } 
 	$result2 = array("user_list" => $row);

	$json = json_encode($result2);
	echo $json;
	$db->close();
?>