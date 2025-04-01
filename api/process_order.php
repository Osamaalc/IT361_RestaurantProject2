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
    if (isset($data['user_id']) && isset($data['items']) && isset($data['total_price'])) {
        $user_id = $conn->real_escape_string($data['user_id']);
        $items = json_encode($data['items']); // Store items as JSON string
        $total_price = floatval($data['total_price']);
        $pickup_time = isset($data['pickup_time']) ? $conn->real_escape_string($data['pickup_time']) : '';
        $notes = isset($data['notes']) ? $conn->real_escape_string($data['notes']) : '';

        // Check if user exists
        $check_user = "SELECT user_id FROM users WHERE user_id = '$user_id'";
        $user_result = $conn->query($check_user);

        if ($user_result->num_rows === 0) {
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
            exit;
        }

        // Insert order
        $sql = "INSERT INTO orders (user_id, items, total_price, pickup_time, notes) 
                VALUES ('$user_id', '$items', $total_price, '$pickup_time', '$notes')";

        if ($conn->query($sql) === TRUE) {
            $order_id = $conn->insert_id;

            echo json_encode([
                'success' => true,
                'message' => 'Order placed successfully',
                'order_id' => $order_id
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
            'message' => 'Missing required fields'
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