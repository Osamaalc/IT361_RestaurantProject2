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
    if (isset($data['username']) && isset($data['password'])) {
        $usernameOrEmail = $conn->real_escape_string($data['username']);
        $password = $data['password'];
        $rememberMe = isset($data['remember_me']) ? (bool)$data['remember_me'] : false;

        // Query to find user by username or email
        $sql = "SELECT user_id, username, email, password FROM users 
                WHERE username = '$usernameOrEmail' OR email = '$usernameOrEmail'";
        $result = $conn->query($sql);

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            // Verify password
            if (password_verify($password, $user['password'])) {
                // Set session variables (in a real app)
                /*
                session_start();
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['logged_in'] = true;

                if ($rememberMe) {
                    // Set a longer session expiration for "Remember me"
                    ini_set('session.cookie_lifetime', 60 * 60 * 24 * 30); // 30 days
                }
                */

                // Update last login timestamp
                $userId = $user['user_id'];
                $updateLoginSql = "UPDATE users SET last_login = NOW() WHERE user_id = '$userId'";
                $conn->query($updateLoginSql);

                // Password is correct
                echo json_encode([
                    'success' => true,
                    'user_id' => $user['user_id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'remember_me' => $rememberMe
                ]);
                exit;
            }
        }

        // Invalid credentials - Sleep for a short time to prevent brute force attacks
        sleep(1);

        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
    } else {
        // Missing required fields
        echo json_encode([
            'success' => false,
            'message' => 'Username and password are required'
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