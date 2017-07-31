<?php
	$json = json_decode(file_get_contents('package.json'));
	header( 'Location: ' . $json->projectSettings->rcfLocalFolder . '/viewer/index.php' );
?>