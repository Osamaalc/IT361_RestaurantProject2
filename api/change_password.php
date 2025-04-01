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
    if (isset($data['user_id']) && isset($data['current_password']) && isset($data['new_password'])) {
        $user_id = $conn->real_escape_string($data['user_id']);
        $current_password = $data['current_password'];
        $new_password = $data['new_password'];

        // Get current password from database
        $sql = "SELECT password FROM users WHERE user_id = '$user_id'";
        $result = $conn->query($sql);

        if ($result && $result->num_rows === 1) {
            $user = $result->fetch_assoc();

            // Verify current password
            if (password_verify($current_password, $user['password'])) {
                // Hash new password
                $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

                // Update password
                $update_sql = "UPDATE users SET password = '$hashed_password' WHERE user_id = '$user_id'";

                if ($conn->query($update_sql) === TRUE) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Password changed successfully'
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error: ' . $conn->error
                    ]);
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
        }
    } else {
        // Missing required fields
        echo json_encode([
            'success' => false,
            'message' => 'User ID, current password, and new password are required'
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