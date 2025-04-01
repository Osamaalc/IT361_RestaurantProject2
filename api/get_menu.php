<?php
// Include database connection
$conn = require_once 'db_connection.php';

// Set headers for JSON response
header('Content-Type: application/json');

// Get category filter if provided
$category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;

// Get search query if provided
$search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';

// Base query
$sql = "SELECT m.*, c.name as category_name 
        FROM menu_items m
        JOIN categories c ON m.category_id = c.category_id
        WHERE m.is_available = 1";

// Add category filter if provided
if ($category_id > 0) {
    $sql .= " AND m.category_id = $category_id";
}

// Add search filter if provided
if ($search !== '') {
    $sql .= " AND (m.name LIKE '%$search%' OR m.description LIKE '%$search%')";
}

// Order by category and name
$sql .= " ORDER BY c.name, m.name";

$result = $conn->query($sql);

if ($result) {
    $menu_items = [];

    // Fetch all menu items
    while ($row = $result->fetch_assoc()) {
        $menu_items[] = $row;
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'menu_items' => $menu_items
    ]);
} else {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving menu items: ' . $conn->error
    ]);
}

// Close the database connection
$conn->close();
?>