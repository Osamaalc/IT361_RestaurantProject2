document.addEventListener('DOMContentLoaded', function() {
    // Setup form validation
    validateForm('register-form', {
        username: {
            required: true,
            requiredMessage: 'Please choose a username',
            minLength: 3,
            minLengthMessage: 'Username must be at least 3 characters'
        },
        email: {
            required: true,
            requiredMessage: 'Please enter your email',
            email: true,
            emailMessage: 'Please enter a valid email address'
        },
        password: {
            required: true,
            requiredMessage: 'Please choose a password',
            minLength: 6,
            minLengthMessage: 'Password must be at least 6 characters'
        },
        'confirm-password': {
            required: true,
            requiredMessage: 'Please confirm your password',
            match: 'password',
            matchMessage: 'Passwords do not match'
        }
    });

    // Handle form submission
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const registerError = document.getElementById('register-error');

            // Clear previous error
            registerError.textContent = '';

            // Validate passwords match
            if (password !== confirmPassword) {
                registerError.textContent = 'Passwords do not match';
                return;
            }

            // Send registration request to API
            fetch('../api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    phone: phone,
                    password: password
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Registration successful
                        showNotification('Registration successful! You can now login.', 'success');

                        // Redirect to login page after a short delay
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    } else {
                        // Registration failed
                        registerError.textContent = data.message || 'Registration failed. Please try again.';
                    }
                })
                .catch(error => {
                    registerError.textContent = 'An error occurred. Please try again.';
                    console.error('Registration error:', error);
                });
        });
    }
});