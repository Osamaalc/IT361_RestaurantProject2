<?php
// Database connection parameters
$servername = "localhost";
$username = "root";  // Change as needed
$password = "";      // Change as needed
$database = "university_restaurant";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to ensure proper handling of special characters
$conn->set_charset("utf8mb4");

// Return the connection for use in other files
return $conn;
?>