document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.getElementById('menu-items');
    const menuCategories = document.querySelector('.menu-categories');
    const searchInput = document.getElementById('menu-search-input');
    const searchBtn = document.getElementById('menu-search-btn');
    const noResults = document.getElementById('no-results');
    const loading = document.getElementById('loading');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const cartPreview = document.querySelector('.cart-preview');
    const closeCartPreview = document.getElementById('close-cart-preview');
    const cartPreviewItems = document.getElementById('cart-preview-items');
    const cartPreviewTotal = document.getElementById('cart-preview-total');

    let allMenuItems = [];
    let activeCategory = 'all';
    let searchQuery = '';

    // Initialize the shopping cart
    cart.init();

    // Load menu categories and items
    loadMenuData();

    // Search functionality
    searchBtn.addEventListener('click', function() {
        searchQuery = searchInput.value.trim().toLowerCase();
        filterMenuItems();
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value.trim().toLowerCase();
            filterMenuItems();
        }
    });

    // Cart preview functionality
    viewCartBtn.addEventListener('click', function() {
        updateCartPreview();
        cartPreview.classList.add('active');
    });

    closeCartPreview.addEventListener('click', function() {
        cartPreview.classList.remove('active');
    });

    // Close cart preview when clicking outside
    document.addEventListener('click', function(e) {
        if (cartPreview.classList.contains('active') &&
            !cartPreview.contains(e.target) &&
            e.target !== viewCartBtn &&
            !viewCartBtn.contains(e.target)) {
            cartPreview.classList.remove('active');
        }
    });

    // Functions
    function loadMenuData() {
        showLoading(true);

        // Fetch categories
        fetch('../api/get_categories.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderCategories(data.categories);
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
            });

        // Fetch menu items
        fetch('../api/get_menu.php')
            .then(response => response.json())
            .then(data => {
                showLoading(false);

                if (data.success) {
                    allMenuItems = data.menu_items;
                    renderMenuItems(allMenuItems);
                } else {
                    showNoResults(true);
                }
            })
            .catch(error => {
                showLoading(false);
                console.error('Error loading menu:', error);
            });
    }

    function renderCategories(categories) {
        // Add the "All" category which is already in the HTML

        // Add other categories
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-filter';
            button.setAttribute('data-category', category.category_id);
            button.textContent = category.name;

            button.addEventListener('click', function() {
                activeCategory = category.category_id;

                // Update active class
                document.querySelectorAll('.category-filter').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');

                // Filter menu items
                filterMenuItems();
            });

            menuCategories.appendChild(button);
        });

        // Set "All" as active by default
        document.querySelector('.category-filter[data-category="all"]').addEventListener('click', function() {
            activeCategory = 'all';

            // Update active class
            document.querySelectorAll('.category-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Filter menu items
            filterMenuItems();
        });
    }

    function renderMenuItems(items) {
        menuItems.innerHTML = '';

        if (items.length === 0) {
            showNoResults(true);
            return;
        }

        showNoResults(false);

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-image">
                    <img src="../assets/images/${item.image_path || 'default-food.jpg'}" alt="${item.name}">
                </div>
                <div class="menu-item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="menu-item-footer">
                        <div class="price">$${parseFloat(item.price).toFixed(2)}</div>
                        <button class="add-to-cart" data-id="${item.item_id}" data-name="${item.name}" data-price="${item.price}">Add to Cart</button>
                    </div>
                </div>
            `;

            menuItems.appendChild(menuItem);
        });

        // Setup add to cart buttons
        setupAddToCartButtons();
    }

    function filterMenuItems() {
        let filteredItems = allMenuItems;

        // Filter by category
        if (activeCategory !== 'all') {
            filteredItems = filteredItems.filter(item => item.category_id === activeCategory);
        }

        // Filter by search query
        if (searchQuery) {
            filteredItems = filteredItems.filter(item =>
                item.name.toLowerCase().includes(searchQuery) ||
                item.description.toLowerCase().includes(searchQuery)
            );
        }

        renderMenuItems(filteredItems);
    }

    function setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                const itemName = this.dataset.name;
                const itemPrice = parseFloat(this.dataset.price);

                cart.addItem(itemId, itemName, itemPrice);

                // Show cart preview
                updateCartPreview();
                cartPreview.classList.add('active');
            });
        });
    }

    function updateCartPreview() {
        cartPreviewItems.innerHTML = '';

        if (cart.items.length === 0) {
            cartPreviewItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            cartPreviewTotal.textContent = '$0.00';
        } else {
            cart.items.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-preview-item';
                cartItem.innerHTML = `
                    <div class="cart-preview-item-info">
                        <div class="cart-preview-item-name">${item.name}</div>
                        <div class="cart-preview-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                    </div>
                    <div class="cart-preview-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                `;

                cartPreviewItems.appendChild(cartItem);
            });

            cartPreviewTotal.textContent = `$${cart.getTotal().toFixed(2)}`;

            // Setup quantity buttons
            setupQuantityButtons();
        }
    }

    function setupQuantityButtons() {
        const minusButtons = document.querySelectorAll('.cart-preview-item .quantity-btn.minus');
        const plusButtons = document.querySelectorAll('.cart-preview-item .quantity-btn.plus');

        minusButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                const item = cart.items.find(item => item.id === itemId);

                if (item) {
                    cart.updateQuantity(itemId, item.quantity - 1);
                    updateCartPreview();
                }
            });
        });

        plusButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                const item = cart.items.find(item => item.id === itemId);

                if (item) {
                    cart.updateQuantity(itemId, item.quantity + 1);
                    updateCartPreview();
                }
            });
        });
    }

    function showLoading(show) {
        if (show) {
            loading.style.display = 'flex';
        } else {
            loading.style.display = 'none';
        }
    }
    function showNoResults(show) {
        if (show) {
            noResults.style.display = 'block';
            menuItems.style.display = 'none';
        } else {
            noResults.style.display = 'none';
            menuItems.style.display = 'grid';
        }
    }
});