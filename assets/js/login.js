document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const loginError = document.getElementById('login-error');
    const loginStatus = document.getElementById('login-status');
    const loginButton = document.getElementById('login-button');
    const loginSpinner = loginButton.querySelector('.fa-spinner');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const socialButtons = document.querySelectorAll('.social-login');

    // Add focus and blur events to form inputs for animation effects
    const formInputs = document.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        // Add focused class when input receives focus
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        // Remove focused class when input loses focus
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            // Add filled class if the input has a value
            if (input.value.trim() !== '') {
                input.parentElement.classList.add('filled');
            } else {
                input.parentElement.classList.remove('filled');
            }
        });

        // Initialize filled class if the input already has a value
        if (input.value.trim() !== '') {
            input.parentElement.classList.add('filled');
        }
    });

    // Check if user is already logged in
    if (localStorage.getItem('userLoggedIn') === 'true') {
        window.location.href = 'index.html'; // Redirect to home page
    }

    // Check for redirect parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('registered')) {
        showStatus('Registration successful! You can now log in.', 'success');
    } else if (urlParams.has('logout')) {
        showStatus('You have been successfully logged out.', 'success');
    } else if (urlParams.has('session_expired')) {
        showStatus('Your session has expired. Please log in again.', 'danger');
    }

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle eye icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Handle social login buttons (demo only)
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
            showStatus(`${provider} login is not available in demo mode.`, 'danger');
        });
    });

    // Add nice animation to inputs when they get focus
    const handleInputFocus = (input) => {
        const label = input.parentElement.previousElementSibling;
        if (label) {
            label.classList.add('active');
        }
    };

    const handleInputBlur = (input) => {
        const label = input.parentElement.previousElementSibling;
        if (label && input.value === '') {
            label.classList.remove('active');
        }
    };

    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('focus', () => handleInputFocus(input));
        input.addEventListener('blur', () => handleInputBlur(input));

        // Initialize if there's already a value
        if (input.value !== '') {
            handleInputFocus(input);
        }
    });

    // Form validation
    function validateForm() {
        let isValid = true;

        // Reset errors
        usernameError.textContent = '';
        passwordError.textContent = '';
        loginError.textContent = '';

        // Validate username
        if (!usernameInput.value.trim()) {
            usernameError.textContent = 'Please enter your username or email';
            isValid = false;
        }

        // Validate password
        if (!passwordInput.value) {
            passwordError.textContent = 'Please enter your password';
            isValid = false;
        }

        return isValid;
    }

    // Show status message
    function showStatus(message, type = 'danger') {
        loginStatus.textContent = message;
        loginStatus.className = `alert alert-${type}`;
        loginStatus.style.display = 'block';

        // Auto hide after 5 seconds
        setTimeout(() => {
            loginStatus.style.display = 'none';
        }, 5000);
    }

    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            // Show loading state
            loginButton.disabled = true;
            loginButton.querySelector('span').style.opacity = '0.7';
            loginSpinner.style.display = 'inline-block';

            // Get form data
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const rememberMe = document.getElementById('remember-me').checked;

            // Send login request to API
            fetch('../api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    remember_me: rememberMe
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Reset loading state
                    loginButton.disabled = false;
                    loginButton.querySelector('span').style.opacity = '1';
                    loginSpinner.style.display = 'none';

                    if (data.success) {
                        // Login successful
                        localStorage.setItem('userLoggedIn', 'true');
                        localStorage.setItem('userId', data.user_id);
                        localStorage.setItem('username', data.username);

                        if (rememberMe) {
                            // Set longer expiration if "Remember me" is checked
                            const expiration = new Date();
                            expiration.setDate(expiration.getDate() + 30);
                            localStorage.setItem('auth_expiration', expiration.toString());
                        } else {
                            // Set short session expiration (24 hours)
                            const expiration = new Date();
                            expiration.setDate(expiration.getDate() + 1);
                            localStorage.setItem('auth_expiration', expiration.toString());
                        }

                        // Add success animation
                        loginButton.innerHTML = '<i class="fas fa-check"></i> Success!';
                        loginButton.classList.add('success');

                        // Show success message before redirect
                        showStatus('Login successful! Redirecting...', 'success');

                        // Redirect to home page or last page visited
                        setTimeout(() => {
                            const redirectTo = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
                            window.location.href = redirectTo;
                        }, 1500);
                    } else {
                        // Login failed
                        loginError.textContent = data.message || 'Invalid username or password';

                        // Add shake animation to form
                        loginForm.classList.add('shake');
                        setTimeout(() => {
                            loginForm.classList.remove('shake');
                        }, 500);
                    }
                })
                .catch(error => {
                    // Reset loading state
                    loginButton.disabled = false;
                    loginButton.querySelector('span').style.opacity = '1';
                    loginSpinner.style.display = 'none';

                    loginError.textContent = 'An error occurred. Please try again.';
                    console.error('Login error:', error);
                });
        });
    }

    // Add some animation for better UX
    setTimeout(() => {
        document.querySelector('.login-left').classList.add('animate-in');
        document.querySelector('.login-right').classList.add('animate-in');
    }, 200);
});