<?php
// Upload video script for Hostinger
// Upload this file to the root of elitepartnersus.com via cPanel File Manager

header('Access-Control-Allow-Origin: https://crm.elitepartnersus.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Upload-Secret');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$secret = 'elite_upload_2026_xK9';
if (!isset($_SERVER['HTTP_X_UPLOAD_SECRET']) || $_SERVER['HTTP_X_UPLOAD_SECRET'] !== $secret) {
  http_response_code(403);
  echo json_encode(['error' => 'Forbidden']);
  exit;
}

if (!isset($_FILES['video'])) {
  http_response_code(400);
  echo json_encode(['error' => 'No file uploaded']);
  exit;
}

$allowed = ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi', 'video/x-msvideo'];
$ftype = $_FILES['video']['type'];

if (!in_array($ftype, $allowed)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid file type. Allowed: MP4, MOV, WEBM, AVI']);
  exit;
}

$maxSize = 100 * 1024 * 1024; // 100MB
if ($_FILES['video']['size'] > $maxSize) {
  http_response_code(400);
  echo json_encode(['error' => 'File too large (max 100MB)']);
  exit;
}

$dir = __DIR__ . '/uploads/videos/';
if (!is_dir($dir)) {
  mkdir($dir, 0755, true);
}

$ext = pathinfo($_FILES['video']['name'], PATHINFO_EXTENSION);
$name = uniqid('vid_', true) . '.' . $ext;
$path = $dir . $name;

if (move_uploaded_file($_FILES['video']['tmp_name'], $path)) {
  $url = 'https://elitepartnersus.com/uploads/videos/' . $name;
  echo json_encode(['url' => $url]);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Upload failed. Please try again.']);
}
?>
