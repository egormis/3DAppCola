<?php
header('Content-Type: application/json');

$modelPath = $_GET['modelPath'];

$models = [
  'Cola' => '../3D models/Cola.glb',
  'Fanta' => '../3D models/Fanta.glb',
  'DoctorPepper' => '../3D models/Doctor Pepper.glb'
];

$response = [];

if (isset($models[$modelPath])) {
    $response = ['modelUrl' => $models[$modelPath]];
} else {
    $response = ['error' => 'Model not found'];
}


file_put_contents('debug.log', print_r($response, true));

echo json_encode($response);
?>
