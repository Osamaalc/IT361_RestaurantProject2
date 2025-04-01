<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from request body
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Check if required fields are present
    if (isset($data['name']) && isset($data['email']) && isset($data['subject']) && isset($data['message'])) {
        $name = $data['name'];
        $email = $data['email'];
        $subject = $data['subject'];
        $message = $data['message'];

        // In a real application, you would send an email here
        // For this example, we'll just simulate a successful submission

        // Example of what email sending code might look like:
        /*
        $to = 'info@unicafe.edu';
        $headers = "From: $email\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

        $email_body = "
            <h2>Contact Form Submission</h2>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Subject:</strong> $subject</p>
            <p><strong>Message:</strong></p>
            <p>$message</p>
        ";

        $mail_sent = mail($to, "Contact Form: $subject", $email_body, $headers);

        if ($mail_sent) {
            echo json_encode([
                'success' => true,
                'message' => 'Your message has been sent successfully!'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to send email. Please try again.'
            ]);
        }
        */

        // Since we're just simulating the email sending for this project
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Your message has been sent successfully!'
        ]);
    } else {
        // Missing required fields
        echo json_encode([
            'success' => false,
            'message' => 'All fields are required'
        ]);
    }
} else {
    // Invalid request method
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}
?>