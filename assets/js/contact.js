document.addEventListener('DOMContentLoaded', function() {
    // Setup form validation
    validateForm('contact-form', {
        name: {
            required: true,
            requiredMessage: 'Please enter your name'
        },
        email: {
            required: true,
            requiredMessage: 'Please enter your email',
            email: true,
            emailMessage: 'Please enter a valid email address'
        },
        subject: {
            required: true,
            requiredMessage: 'Please enter a subject'
        },
        message: {
            required: true,
            requiredMessage: 'Please enter your message'
        }
    });

    // Handle form submission
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            const formError = document.getElementById('form-error');
            const formSuccess = document.getElementById('form-success');

            // Clear previous messages
            formError.textContent = '';
            formSuccess.style.display = 'none';

            // Send contact form data to API
            fetch('../api/send_contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Form submission successful
                        formSuccess.style.display = 'block';
                        contactForm.reset();

                        // Scroll to success message
                        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        // Form submission failed
                        formError.textContent = data.message || 'Failed to send message. Please try again.';
                    }
                })
                .catch(error => {
                    formError.textContent = 'An error occurred. Please try again.';
                    console.error('Contact form error:', error);
                });
        });
    }
});