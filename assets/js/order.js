document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const loginRequiredMessage = document.getElementById('login-required-message');
    const orderForm = document.getElementById('order-form');
    const pickupTimeSelect = document.getElementById('pickup-time');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const orderConfirmation = document.getElementById('order-confirmation');
    const closeModal = document.getElementById('close-modal');
    const orderIdSpan = document.getElementById('order-id');
    const confirmationPickupTime = document.getElementById('confirmation-pickup-time');
    const confirmationTotal = document.getElementById('confirmation-total');

    // Initialize the shopping cart
    cart.init();

    // Check login status
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

    if (userLoggedIn) {
        loginRequiredMessage.style.display = 'none';
        orderForm.style.display = 'block';
    } else {
        loginRequiredMessage.style.display = 'block';
        orderForm.style.display = 'none';

        // Store current URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
    }

    // Update cart display
    updateCartDisplay();

    // Generate pickup time options
    generatePickupTimes();

    // Form validation
    validateForm('order-form', {
        'pickup-time': {
            required: true,
            requiredMessage: 'Please select a pickup time'
        }
    });

    // Handle form submission
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (cart.items.length === 0) {
            showNotification('Your cart is empty. Please add items to place an order.', 'error');
            return;
        }

        const pickupTime = pickupTimeSelect.value;
        const notes = document.getElementById('notes').value;
        const userId = localStorage.getItem('userId');
        const orderError = document.getElementById('order-error');

        // Clear previous error
        orderError.textContent = '';

        // Disable place order button to prevent multiple submissions
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Processing...';

        // Send order to API
        fetch('../api/process_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                items: cart.items,
                total_price: cart.getTotal(),
                pickup_time: pickupTime,
                notes: notes
            })
        })
            .then(response => response.json())
            .then(data => {
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';

                if (data.success) {
                    // Order successful
                    orderIdSpan.textContent = data.order_id;
                    confirmationPickupTime.textContent = pickupTime;
                    confirmationTotal.textContent = `$${cart.getTotal().toFixed(2)}`;

                    // Show confirmation modal
                    orderConfirmation.classList.add('active');

                    // Clear cart
                    cart.clearCart();
                    updateCartDisplay();
                } else {
                    // Order failed
                    orderError.textContent = data.message || 'Failed to place order. Please try again.';
                }
            })
            .catch(error => {
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
                orderError.textContent = 'An error occurred. Please try again.';
                console.error('Order error:', error);
            });
    });

    // Close modal
    closeModal.addEventListener('click', function() {
        orderConfirmation.classList.remove('active');
    });

    // Close modal when clicking outside
    orderConfirmation.addEventListener('click', function(e) {
        if (e.target === orderConfirmation) {
            orderConfirmation.classList.remove('active');
        }
    });

    // Functions
    function updateCartDisplay() {
        if (cart.items.length === 0) {
            cartEmptyMessage.style.display = 'block';
            cartItemsContainer.style.display = 'none';
        } else {
            cartEmptyMessage.style.display = 'none';
            cartItemsContainer.style.display = 'block';

            // Clear cart items
            cartItems.innerHTML = '';

            // Add each item to cart
            cart.items.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-subtotal">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                `;

                cartItems.appendChild(cartItem);
            });

            // Update total
            cartTotal.textContent = `$${cart.getTotal().toFixed(2)}`;

            // Setup quantity and remove buttons
            setupCartButtons();
        }
    }

    function setupCartButtons() {
        // Quantity adjustment buttons
        const minusButtons = document.querySelectorAll('.quantity-btn.minus');
        const plusButtons = document.querySelectorAll('.quantity-btn.plus');
        const removeButtons = document.querySelectorAll('.remove-btn');
        const clearCartBtn = document.getElementById('clear-cart-btn');

        minusButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.dataset.id;
                const item = cart.items.find(item => item.id === itemId);

                if (item) {
                    cart.updateQuantity(itemId, item.quantity - 1);
                    updateCartDisplay();
                }
            });
        });

        plusButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.dataset.id;
                const item = cart.items.find(item => item.id === itemId);

                if (item) {
                    cart.updateQuantity(itemId, item.quantity + 1);
                    updateCartDisplay();
                }
            });
        });

        removeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.dataset.id;
                cart.removeItem(itemId);
                updateCartDisplay();
            });
        });

        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', function() {
                cart.clearCart();
                updateCartDisplay();
            });
        }
    }

    function generatePickupTimes() {
        const now = new Date();
        const opening = new Date(now);
        const closing = new Date(now);

        // Set opening time (7:30 AM on weekdays, 8:00 AM on Saturday, closed on Sunday)
        opening.setHours(now.getDay() === 6 ? 8 : 7); // 8AM on Saturday, 7AM other days
        opening.setMinutes(now.getDay() === 6 ? 0 : 30); // 8:00 on Saturday, 7:30 other days
        opening.setSeconds(0);
        opening.setMilliseconds(0);

        // Set closing time (8:00 PM on weekdays, 7:00 PM on Saturday, closed on Sunday)
        closing.setHours(now.getDay() === 6 ? 19 : 20); // 7PM on Saturday, 8PM other days
        closing.setMinutes(0);
        closing.setSeconds(0);
        closing.setMilliseconds(0);

        // If Sunday or outside operating hours, show message
        if (now.getDay() === 0 || now >= closing || now < opening) {
            pickupTimeSelect.innerHTML = '<option value="">Restaurant is currently closed</option>';
            pickupTimeSelect.disabled = true;
            placeOrderBtn.disabled = true;
            return;
        }

        // Add 30 minutes to current time for first available pickup
        const firstPickup = new Date(now.getTime() + 30 * 60000);

        // Round to nearest 15-minute interval
        firstPickup.setMinutes(Math.ceil(firstPickup.getMinutes() / 15) * 15);
        firstPickup.setSeconds(0);
        firstPickup.setMilliseconds(0);

        // Generate time slots in 15-minute intervals until closing
        let current = new Date(firstPickup);

        // Add default option
        pickupTimeSelect.innerHTML = '<option value="">Select a pickup time</option>';

        while (current <= closing) {
            const timeStr = formatTime(current);
            const value = `${timeStr}, ${formatDate(current)}`;

            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;

            pickupTimeSelect.appendChild(option);

            // Add 15 minutes for next slot
            current = new Date(current.getTime() + 15 * 60000);
        }
    }

    function formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12

        const minutesStr = minutes < 10 ? '0' + minutes : minutes;

        return `${hours}:${minutesStr} ${ampm}`;
    }

    function formatDate(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    }
});