<?php
// Include database connection
$conn = require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Check if user_id is provided
if (isset($_GET['user_id'])) {
    $user_id = $conn->real_escape_string($_GET['user_id']);

    // Query to get user's orders
    $sql = "SELECT * FROM orders WHERE user_id = '$user_id' ORDER BY order_date DESC";
    $result = $conn->query($sql);

    if ($result) {
        $orders = [];

        // Fetch all orders
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }

        // Return success response
        echo json_encode([
            'success' => true,
            'orders' => $orders
        ]);
    } else {
        // Return error response
        echo json_encode([
            'success' => false,
            'message' => 'Error retrieving orders: ' . $conn->error
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