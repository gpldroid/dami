<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// بيانات السيرفر (محمية داخل PHP لا يراها المستخدم)
$base_url = "http://ottpro.iptvpro2.com:8789/player_api.php";
$username = "Oujakr12";
$password = "87593226";

// بناء الرابط بناءً على الطلبات القادمة من الـ JS
$query = http_build_query([
    'username' => $username,
    'password' => $password,
    'action'   => $_GET['action'] ?? '',
    'category_id' => $_GET['category_id'] ?? '',
    'series_id'   => $_GET['series_id'] ?? '',
    'vod_id'      => $_GET['vod_id'] ?? ''
]);

$final_url = $base_url . "?" . $query;

// جلب البيانات
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $final_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
