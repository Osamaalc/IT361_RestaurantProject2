<?php
// Include database connection
$conn = require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from request body
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Check if required fields are present
    if (isset($data['user_id']) && isset($data['email'])) {
        $user_id = $conn->real_escape_string($data['user_id']);
        $email = $conn->real_escape_string($data['email']);
        $phone = isset($data['phone']) ? $conn->real_escape_string($data['phone']) : '';

        // Check if email is already used by another user
        $check_email = "SELECT user_id FROM users WHERE email = '$email' AND user_id != '$user_id'";
        $email_result = $conn->query($check_email);

        if ($email_result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Email already in use by another account'
            ]);
            exit;
        }

        // Update user profile
        $sql = "UPDATE users SET email = '$email', phone = '$phone' WHERE user_id = '$user_id'";

        if ($conn->query($sql) === TRUE) {
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error: ' . $conn->error
            ]);
        }
    } else {
        // Missing required fields
        echo json_encode([
            'success' => false,
            'message' => 'User ID and email are required'
        ]);
    }
} else {
    // Invalid request method
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

// Close the database connection
$conn->close();
?>