<?php
// Include database connection
require_once 'db_connection.php';
$conn = require_once 'db_connection.php';
// Set headers for JSON response
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from request body
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Check if required fields are present
    if (isset($data['username']) && isset($data['email']) && isset($data['password'])) {
        $username = $conn->real_escape_string($data['username']);
        $email = $conn->real_escape_string($data['email']);
        $phone = isset($data['phone']) ? $conn->real_escape_string($data['phone']) : '';
        $password = $data['password'];

        // Check if username already exists
        $check_username = "SELECT user_id FROM users WHERE username = '$username'";
        $username_result = $conn->query($check_username);

        if ($username_result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Username already exists'
            ]);
            exit;
        }

        // Check if email already exists
        $check_email = "SELECT user_id FROM users WHERE email = '$email'";
        $email_result = $conn->query($check_email);

        if ($email_result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Email already exists'
            ]);
            exit;
        }

        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Insert new user
        $sql = "INSERT INTO users (username, password, email, phone) VALUES ('$username', '$hashed_password', '$email', '$phone')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode([
                'success' => true,
                'message' => 'Registration successful'
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
            'message' => 'Username, email and password are required'
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