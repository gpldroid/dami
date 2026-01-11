<?php
// api_proxy.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$url = "http://ottpro.iptvpro2.com:8789/player_api.php?" . $_SERVER['QUERY_STRING'];

// استخدام cURL لجلب البيانات من سيرفر IPTV
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
