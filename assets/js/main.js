// Load header and footer components
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    fetch('../includes/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            setupHeaderFunctionality();
            checkLoginStatus();
        });

    // Load footer
    fetch('../includes/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });
});

// Setup header functionality including mobile menu
function setupHeaderFunctionality() {
    // Add the overlay element to the body if it doesn't exist
    if (!document.querySelector('.overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }

    // Header scroll effect
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const overlay = document.querySelector('.overlay');

    function openMobileMenu() {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openMobileMenu);
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }

    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }

    // Header cart button
    const headerCartBtn = document.getElementById('header-cart-btn');

    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', function() {
            if (typeof openCartPreview === 'function') {
                openCartPreview();
            } else {
                window.location.href = 'order.html';
            }
        });
    }

    // Add active class to current page link
    const currentPage = window.location.pathname.split('/').pop();

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage ||
            (currentPage === '' && href === 'index.html') ||
            (currentPage === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage ||
            (currentPage === '' && href === 'index.html') ||
            (currentPage === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Setup mobile logout link
    const mobileLogoutLink = document.getElementById('mobile-logout-link');
    if (mobileLogoutLink) {
        mobileLogoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Check if user is logged in and update UI accordingly
function checkLoginStatus() {
    const loginStatus = localStorage.getItem('userLoggedIn');
    const authLinks = document.querySelectorAll('.auth-links');
    const loggedInLinks = document.querySelectorAll('.logged-in-links');
    const logoutLink = document.getElementById('logout-link');

    if (loginStatus === 'true') {
        // User is logged in
        authLinks.forEach(link => link.style.display = 'none');
        loggedInLinks.forEach(link => link.style.display = 'block');

        // Setup logout functionality
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    } else {
        // User is not logged in
        authLinks.forEach(link => link.style.display = 'block');
        loggedInLinks.forEach(link => link.style.display = 'none');
    }
}

// Logout function
function logout() {
    // Clear user data from localStorage
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    // Redirect to home page
    window.location.href = 'index.html';
}

// Function to update the cart count in the header
function updateHeaderCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const itemCount = cart && typeof cart.getItemCount === 'function' ? cart.getItemCount() : 0;

    cartCountElements.forEach(element => {
        element.textContent = itemCount;

        if (itemCount > 0) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    });
}

// Show a notification message
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    // Set notification type and message
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.display = 'block';

    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Add form validation
function validateForm(formId, rules) {
    const form = document.getElementById(formId);

    if (!form) return;

    form.addEventListener('submit', function(e) {
        let isValid = true;

        // Check each field against rules
        for (const fieldName in rules) {
            const field = form.elements[fieldName];
            const rule = rules[fieldName];
            const errorElement = document.getElementById(`${fieldName}-error`);

            let errorMessage = '';

            // Required check
            if (rule.required && !field.value.trim()) {
                errorMessage = rule.requiredMessage || 'This field is required';
                isValid = false;
            }

            // Email format check
            if (rule.email && field.value.trim() && !isValidEmail(field.value.trim())) {
                errorMessage = rule.emailMessage || 'Please enter a valid email address';
                isValid = false;
            }

            // Minimum length check
            if (rule.minLength && field.value.trim().length < rule.minLength) {
                errorMessage = rule.minLengthMessage || `Must be at least ${rule.minLength} characters`;
                isValid = false;
            }

            // Password match check
            if (rule.match && field.value !== form.elements[rule.match].value) {
                errorMessage = rule.matchMessage || 'Passwords do not match';
                isValid = false;
            }

            // Display error message if any
            if (errorElement) {
                errorElement.textContent = errorMessage;
            }
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Shopping cart functionality
const cart = {
    items: [],

    init() {
        // Load cart from localStorage
        this.loadCart();

        // Update cart UI
        this.updateCartUI();

        // Setup cart buttons
        this.setupCartButtons();
    },

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    },

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },

    addItem(itemId, name, price, quantity = 1) {
        // Check if item already exists in cart
        const existingItem = this.items.find(item => item.id === itemId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: itemId,
                name: name,
                price: price,
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartUI();
        showNotification('Item added to cart');
    },

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartUI();
        showNotification('Item removed from cart');
    },

    updateQuantity(itemId, quantity) {
        const item = this.items.find(item => item.id === itemId);

        if (item) {
            item.quantity = quantity;

            if (item.quantity <= 0) {
                this.removeItem(itemId);
            } else {
                this.saveCart();
                this.updateCartUI();
            }
        }
    },

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
        showNotification('Cart cleared');
    },

    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },

    getItemCount() {
        return this.items.reduce((count, item) => {
            return count + item.quantity;
        }, 0);
    },

    updateCartUI() {
        // Update cart icon with item count
        updateHeaderCartCount();

        // If on cart page, update cart items list
        this.updateCartPage();
    },

    updateCartPage() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutButton = document.getElementById('checkout-button');

        if (cartItems && cartTotal) {
            // Clear current cart items
            cartItems.innerHTML = '';

            if (this.items.length === 0) {
                // Show empty cart message
                if (emptyCartMessage) {
                    emptyCartMessage.style.display = 'block';
                }

                if (checkoutButton) {
                    checkoutButton.disabled = true;
                }
            } else {
                // Hide empty cart message
                if (emptyCartMessage) {
                    emptyCartMessage.style.display = 'none';
                }

                if (checkoutButton) {
                    checkoutButton.disabled = false;
                }

                // Add each item to cart
                this.items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'cart-item';
                    itemElement.innerHTML = `
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <div class="cart-item-subtotal">$${(item.price * item.quantity).toFixed(2)}</div>
                        <button class="remove-btn" data-id="${item.id}">Remove</button>
                    `;

                    cartItems.appendChild(itemElement);
                });

                // Setup quantity and remove buttons
                this.setupCartItemButtons();
            }

            // Update total
            cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
        }
    },

    setupCartButtons() {
        document.addEventListener('click', e => {
            if (e.target.classList.contains('add-to-cart')) {
                const itemId = e.target.dataset.id;
                const itemName = e.target.dataset.name || 'Menu Item';
                const itemPrice = parseFloat(e.target.dataset.price) || 0;

                this.addItem(itemId, itemName, itemPrice);
            }
        });

        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }
    },

    setupCartItemButtons() {
        // Quantity adjustment buttons
        const minusButtons = document.querySelectorAll('.quantity-btn.minus');
        const plusButtons = document.querySelectorAll('.quantity-btn.plus');
        const removeButtons = document.querySelectorAll('.remove-btn');

        minusButtons.forEach(btn => {
            btn.addEventListener('click', e => {
                const itemId = e.target.dataset.id;
                const item = this.items.find(item => item.id === itemId);

                if (item) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            });
        });

        plusButtons.forEach(btn => {
            btn.addEventListener('click', e => {
                const itemId = e.target.dataset.id;
                const item = this.items.find(item => item.id === itemId);

                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            });
        });

        removeButtons.forEach(btn => {
            btn.addEventListener('click', e => {
                const itemId = e.target.dataset.id;
                this.removeItem(itemId);
            });
        });
    }
};