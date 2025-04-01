document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userId = localStorage.getItem('userId');

    if (!userLoggedIn) {
        // Show login required message
        document.getElementById('login-required').style.display = 'block';
        document.getElementById('account-content').style.display = 'none';

        // Store current URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        return;
    }

    // Show account content
    document.getElementById('login-required').style.display = 'none';
    document.getElementById('account-content').style.display = 'block';

    // Setup tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;

            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Load orders data
    loadOrders();

    // Load profile data
    loadProfile();

    // Setup profile actions
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const cancelEdit = document.getElementById('cancel-edit');
    const cancelPasswordChange = document.getElementById('cancel-password-change');

    // Edit profile form
    const editProfileForm = document.getElementById('edit-profile-form');
    const editEmailInput = document.getElementById('edit-email');
    const editPhoneInput = document.getElementById('edit-phone');

    // Change password form
    const changePasswordForm = document.getElementById('change-password-form');

    // Order details modal
    const orderDetailsModal = document.getElementById('order-details-modal');
    const closeOrderDetails = document.getElementById('close-order-details');

    // Toggle edit profile form
    editProfileBtn.addEventListener('click', function() {
        document.getElementById('profile-details').style.display = 'none';
        editProfileForm.style.display = 'block';
        changePasswordForm.style.display = 'none';
    });

    // Toggle change password form
    changePasswordBtn.addEventListener('click', function() {
        document.getElementById('profile-details').style.display = 'none';
        editProfileForm.style.display = 'none';
        changePasswordForm.style.display = 'block';
    });

    // Cancel edit profile
    cancelEdit.addEventListener('click', function() {
        editProfileForm.style.display = 'none';
        document.getElementById('profile-details').style.display = 'block';
    });

    // Cancel change password
    cancelPasswordChange.addEventListener('click', function() {
        changePasswordForm.style.display = 'none';
        document.getElementById('profile-details').style.display = 'block';
    });

    // Close order details modal
    closeOrderDetails.addEventListener('click', function() {
        orderDetailsModal.classList.remove('active');
    });

    // Close modal when clicking outside
    orderDetailsModal.addEventListener('click', function(e) {
        if (e.target === orderDetailsModal) {
            orderDetailsModal.classList.remove('active');
        }
    });

    // Handle edit profile form submission
    editProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = editEmailInput.value;
        const phone = editPhoneInput.value;
        const errorEl = document.getElementById('edit-profile-error');

        // Clear previous error
        errorEl.textContent = '';

        // Validate email
        if (!isValidEmail(email)) {
            errorEl.textContent = 'Please enter a valid email address';
            return;
        }

        // Send update request to API
        fetch('../api/update_profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                email: email,
                phone: phone
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update successful
                    showNotification('Profile updated successfully');

                    // Hide form and show details
                    editProfileForm.style.display = 'none';

                    // Reload profile data
                    loadProfile();
                } else {
                    // Update failed
                    errorEl.textContent = data.message || 'Failed to update profile';
                }
            })
            .catch(error => {
                errorEl.textContent = 'An error occurred. Please try again.';
                console.error('Profile update error:', error);
            });
    });

    // Handle change password form submission
    changePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        const errorEl = document.getElementById('change-password-error');

        // Clear previous error
        errorEl.textContent = '';

        // Validate passwords
        if (!currentPassword) {
            errorEl.textContent = 'Please enter your current password';
            return;
        }

        if (!newPassword) {
            errorEl.textContent = 'Please enter a new password';
            return;
        }

        if (newPassword.length < 6) {
            errorEl.textContent = 'New password must be at least 6 characters';
            return;
        }

        if (newPassword !== confirmNewPassword) {
            errorEl.textContent = 'New passwords do not match';
            return;
        }

        // Send change password request to API
        fetch('../api/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                current_password: currentPassword,
                new_password: newPassword
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Password change successful
                    showNotification('Password changed successfully');

                    // Reset form and hide it
                    changePasswordForm.reset();
                    changePasswordForm.style.display = 'none';
                    document.getElementById('profile-details').style.display = 'block';
                } else {
                    // Password change failed
                    errorEl.textContent = data.message || 'Failed to change password';
                }
            })
            .catch(error => {
                errorEl.textContent = 'An error occurred. Please try again.';
                console.error('Password change error:', error);
            });
    });

    // Functions
    function loadOrders() {
        const ordersList = document.getElementById('orders-list');
        const noOrders = document.getElementById('no-orders');
        const loading = document.getElementById('orders-loading');

        // Show loading
        loading.style.display = 'flex';
        noOrders.style.display = 'none';
        ordersList.innerHTML = '';

        // Fetch orders from API
        fetch(`../api/get_orders.php?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                // Hide loading
                loading.style.display = 'none';

                if (data.success && data.orders.length > 0) {
                    // Render orders
                    data.orders.forEach(order => {
                        const orderCard = createOrderCard(order);
                        ordersList.appendChild(orderCard);
                    });
                } else {
                    // Show no orders message
                    noOrders.style.display = 'block';
                }
            })
            .catch(error => {
                // Hide loading and show error
                loading.style.display = 'none';
                console.error('Error loading orders:', error);
            });
    }

    function createOrderCard(order) {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';

        // Parse order date
        const orderDate = new Date(order.order_date);
        const formattedDate = `${orderDate.toLocaleDateString()} at ${orderDate.toLocaleTimeString()}`;

        // Parse total price
        const totalPrice = parseFloat(order.total_price).toFixed(2);

        // Parse items
        const items = JSON.parse(order.items);
        const itemCount = items.reduce((count, item) => count + item.quantity, 0);

        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-id">Order #${order.order_id}</div>
                <div class="order-status status-${order.status.toLowerCase()}">${capitalizeFirstLetter(order.status)}</div>
            </div>
            <div class="order-info">
                <div class="info-group">
                    <label>Date Placed</label>
                    <span>${formattedDate}</span>
                </div>
                <div class="info-group">
                    <label>Items</label>
                    <span>${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
                </div>
                <div class="info-group">
                    <label>Total</label>
                    <span>$${totalPrice}</span>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn view-details-btn" data-order-id="${order.order_id}">View Details</button>
            </div>
        `;

        // Add event listener to view details button
        const viewDetailsBtn = orderCard.querySelector('.view-details-btn');
        viewDetailsBtn.addEventListener('click', function() {
            showOrderDetails(order);
        });

        return orderCard;
    }

    function showOrderDetails(order) {
        // Set order details in modal
        document.getElementById('detail-order-id').textContent = order.order_id;

        // Parse order date
        const orderDate = new Date(order.order_date);
        document.getElementById('detail-order-date').textContent = `${orderDate.toLocaleDateString()} at ${orderDate.toLocaleTimeString()}`;

        document.getElementById('detail-pickup-time').textContent = order.pickup_time || 'Not specified';
        document.getElementById('detail-status').textContent = capitalizeFirstLetter(order.status);
        document.getElementById('detail-total').textContent = `$${parseFloat(order.total_price).toFixed(2)}`;

        // Show or hide notes
        const notesContainer = document.getElementById('detail-notes-container');
        const notesEl = document.getElementById('detail-notes');

        if (order.notes && order.notes.trim() !== '') {
            notesEl.textContent = order.notes;
            notesContainer.style.display = 'block';
        } else {
            notesContainer.style.display = 'none';
        }

        // Parse items
        const items = JSON.parse(order.items);
        const itemsContainer = document.getElementById('detail-items');
        itemsContainer.innerHTML = '';

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'order-item';
            itemEl.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">x${item.quantity}</div>
                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            `;

            itemsContainer.appendChild(itemEl);
        });

        // Show modal
        document.getElementById('order-details-modal').classList.add('active');
    }

    function loadProfile() {
        const profileDetails = document.getElementById('profile-details');
        const loading = document.getElementById('profile-loading');

        // Show loading
        loading.style.display = 'flex';
        profileDetails.style.display = 'none';

        // Fetch profile data from API
        fetch(`../api/get_profile.php?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                // Hide loading
                loading.style.display = 'none';

                if (data.success) {
                    // Update profile details
                    document.getElementById('profile-username').textContent = data.profile.username;
                    document.getElementById('profile-email').textContent = data.profile.email;
                    document.getElementById('profile-phone').textContent = data.profile.phone || 'Not provided';

                    // Parse registration date
                    const regDate = new Date(data.profile.registration_date);
                    document.getElementById('profile-date').textContent = regDate.toLocaleDateString();

                    // Update edit form values
                    document.getElementById('edit-email').value = data.profile.email;
                    document.getElementById('edit-phone').value = data.profile.phone || '';

                    // Show profile details
                    profileDetails.style.display = 'block';
                } else {
                    // Show error
                    showNotification('Failed to load profile', 'error');
                }
            })
            .catch(error => {
                // Hide loading and show error
                loading.style.display = 'none';
                console.error('Error loading profile:', error);
            });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});