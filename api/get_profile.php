<?php
// Include database connection
$conn = require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if user_id is provided
if (isset($_GET['user_id'])) {
    $user_id = $conn->real_escape_string($_GET['user_id']);

    // Query to get user profile
    $sql = "SELECT user_id, username, email, phone, registration_date FROM users WHERE user_id = '$user_id'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows === 1) {
        $profile = $result->fetch_assoc();

        // Return success response
        echo json_encode([
            'success' => true,
            'profile' => $profile
        ]);
    } else {
        // Return error response
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }
} else {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'User ID is required'
    ]);
}

// Close the database connection
$conn->close();
?>