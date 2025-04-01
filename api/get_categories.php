<?php
// Include database connection
$conn = require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Query to get all categories
$sql = "SELECT * FROM categories ORDER BY name";
$result = $conn->query($sql);

if ($result) {
    $categories = [];

    // Fetch all categories
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);
} else {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving categories: ' . $conn->error
    ]);
}

// Close the database connection
$conn->close();
?>