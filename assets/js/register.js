// register.js - Complete Registration Form Handling
document.addEventListener('DOMContentLoaded', () => {
    initializeRegistrationForm();
});

function initializeRegistrationForm() {
    const registerForm = document.getElementById('register-form');
    const submitBtn = document.getElementById('register-button');
    const spinner = submitBtn.querySelector('.fa-spinner');
    const validationRules = {
        username: {
            required: true,
            requiredMessage: 'Please enter a username',
            minLength: 3,
            minLengthMessage: 'Username must be at least 3 characters'
        },
        email: {
            required: true,
            requiredMessage: 'Please enter your email',
            email: true,
            emailMessage: 'Invalid email address'
        },
        password: {
            required: true,
            requiredMessage: 'Please enter a password',
            minLength: 6,
            minLengthMessage: 'Password must be at least 6 characters'
        },
        'confirm-password': {
            required: true,
            requiredMessage: 'Please confirm your password',
            match: 'password',
            matchMessage: 'Passwords do not match'
        }
    };

    // Add real-time validation
    Object.keys(validationRules).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field?.addEventListener('input', () => validateField(fieldId, validationRules[fieldId]));
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        toggleLoadingState(true, submitBtn, spinner);

        if (!validateForm(validationRules)) {
            toggleLoadingState(false, submitBtn, spinner);
            return;
        }

        try {
            const formData = {
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                password: document.getElementById('password').value
            };

            const response = await fetch('../api/register.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            const data = await handleResponse(response);
            handleRegistrationResult(data);
        } catch (error) {
            handleRegistrationError(error);
        } finally {
            toggleLoadingState(false, submitBtn, spinner);
        }
    });
}

function validateField(fieldId, rules) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    const value = field.value.trim();
    let isValid = true;

    errorElement.textContent = '';

    if (rules.required && !value) {
        errorElement.textContent = rules.requiredMessage;
        isValid = false;
    }

    if (rules.minLength && value.length < rules.minLength) {
        errorElement.textContent = rules.minLengthMessage;
        isValid = false;
    }

    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorElement.textContent = rules.emailMessage;
        isValid = false;
    }

    if (rules.match) {
        const matchField = document.getElementById(rules.match);
        if (value !== matchField.value.trim()) {
            errorElement.textContent = rules.matchMessage;
            isValid = false;
        }
    }

    return isValid;
}

function validateForm(rules) {
    return Object.keys(rules).every(fieldId => validateField(fieldId, rules[fieldId]));
}

async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Registration failed');
    }
    return response.json();
}

function handleRegistrationResult(data) {
    const errorElement = document.getElementById('register-error');
    if (data.success) {
        showNotification('Registration successful! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'login.html', 2000);
    } else {
        errorElement.textContent = data.message || 'Registration failed. Please try again.';
    }
}

function handleRegistrationError(error) {
    console.error('Registration error:', error);
    document.getElementById('register-error').textContent =
        error.message || 'An unexpected error occurred. Please try again.';
}

function toggleLoadingState(isLoading, button, spinner) {
    button.disabled = isLoading;
    spinner.style.display = isLoading ? 'inline-block' : 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}