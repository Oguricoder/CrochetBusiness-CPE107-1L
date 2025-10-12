// Shopping Cart Management (persisted to localStorage)
const CART_STORAGE_KEY = 'crochet_cart_v1';
let cartItems = [];

// Initialize cart on page load
function initCart() {
    // Try to load cart from localStorage
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                cartItems = parsed;
            }
        }
    } catch (e) {
        // If parsing fails, fall back to empty cart
        console.error('Failed to load cart from storage:', e);
        cartItems = [];
    }

    updateCartCount();
}

// Get cart items
function getCart() {
    return cartItems;
}

// Save cart and update UI
function saveCart() {
    // Persist cart to localStorage so it survives page reloads/navigation
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
        console.error('Failed to save cart to storage:', e);
    }

    updateCartCount();

    // If we're on the cart page, refresh the displayed items
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }
}

// Add item to cart
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;

    // Check if product already exists in cart
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            ...product,
            quantity: 1,
            selectedColor: product.colors[0],
            selectedSize: product.sizes[0]
        });
    }
    
    saveCart();
    showNotification(`${product.name} added to cart!`, 'success');
}

// Remove item from cart
function removeFromCart(productId) {
    const product = cartItems.find(item => item.id === productId);
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCart();
    displayCartItems();
    if (product) {
        showNotification(`${product.name} removed from cart`, 'info');
    }
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, parseInt(newQuantity));
        saveCart();
        displayCartItems();
    }
}

// Update item color
function updateColor(productId, newColor) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.selectedColor = newColor;
        saveCart();
    }
}

// Update item size
function updateSize(productId, newSize) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.selectedSize = newSize;
        saveCart();
    }
}

// Get cart count
function getCartCount() {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
}

// Get cart subtotal
function getCartSubtotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get delivery fee
function getDeliveryFee() {
    const subtotal = getCartSubtotal();
    return subtotal >= 1000 ? 0 : 50; // Free shipping over ₱1000
}

// Get cart total
function getCartTotal() {
    return getCartSubtotal() + getDeliveryFee();
}

// Update cart count badge
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count, .cart-count');
    const count = getCartCount();
    cartCountElements.forEach(element => {
        element.textContent = count;
        if (count > 0) {
            element.style.display = 'inline-block';
        } else {
            element.style.display = 'none';
        }
    });
}

// Display cart items on cart.html
function displayCartItems() {
    const cartContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('cart-summary');
    
    if (!cartContainer) return;

    const items = getCart();
    
    if (items.length === 0) {
        // If we can locate the surrounding row, replace it with a single full-width
        // column containing the empty-cart message so it appears centered on the page.
        const rowEl = cartContainer.closest('.row');
        const emptyHtml = `
            <div class="col-12">
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Start shopping to add items to your cart!</p>
                    <a href="products.html" class="btn btn-primary btn-lg">Browse Products</a>
                </div>
            </div>
        `;

        if (rowEl) {
            rowEl.innerHTML = emptyHtml;
        } else {
            // Fallback: replace only the cart container (keeps layout intact)
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Start shopping to add items to your cart!</p>
                    <a href="products.html" class="btn btn-primary btn-lg">Browse Products</a>
                </div>
            `;
        }

        if (summaryContainer) {
            summaryContainer.innerHTML = '';
        }
        return;
    }

    // Display cart items
    cartContainer.innerHTML = `
        <div class="cart-items-list">
            ${items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="text-muted">${item.category}</p>
                        <div class="cart-item-options">
                            <div class="option-group">
                                <label>Color:</label>
                                <select onchange="updateColor(${item.id}, this.value)" class="form-select form-select-sm">
                                    ${item.colors.map(color => `
                                        <option value="${color}" ${color === item.selectedColor ? 'selected' : ''}>${color}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="option-group">
                                <label>Size:</label>
                                <select onchange="updateSize(${item.id}, this.value)" class="form-select form-select-sm">
                                    ${item.sizes.map(size => `
                                        <option value="${size}" ${size === item.selectedSize ? 'selected' : ''}>${size}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        <span class="price">₱${item.price}</span>
                    </div>
                    <div class="cart-item-quantity">
                        <input type="number" value="${item.quantity}" min="1" max="99" 
                               onchange="updateQuantity(${item.id}, this.value)"
                               class="form-control">
                    </div>
                    <div class="cart-item-total">
                        <strong>₱${item.price * item.quantity}</strong>
                    </div>
                    <div class="cart-item-remove">
                        <button onclick="removeFromCart(${item.id})" class="btn btn-link text-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Display cart summary
    if (summaryContainer) {
        const subtotal = getCartSubtotal();
        const deliveryFee = getDeliveryFee();
        const total = getCartTotal();

        summaryContainer.innerHTML = `
            <div class="cart-summary-box">
                <h4>Order Summary</h4>
                <div class="summary-row">
                    <span>Subtotal (${getCartCount()} items):</span>
                    <strong>₱${subtotal}</strong>
                </div>
                <div class="summary-row">
                    <span>Delivery Fee:</span>
                    <strong>${deliveryFee === 0 ? 'FREE' : '₱' + deliveryFee}</strong>
                </div>
                ${deliveryFee === 0 ? '<p class="free-shipping-msg"><i class="fas fa-truck"></i> You got free shipping!</p>' : ''}
                ${subtotal < 1000 && subtotal > 0 ? `<p class="shipping-info">Add ₱${1000 - subtotal} more for free shipping!</p>` : ''}
                <hr>
                <div class="summary-total">
                    <span>Total:</span>
                    <strong class="total-amount">₱${total}</strong>
                </div>
                <a href="checkout.html" class="btn btn-primary btn-lg w-100 mt-3">
                    <i class="fas fa-lock"></i> Proceed to Checkout
                </a>
                <a href="products.html" class="btn btn-outline-secondary w-100 mt-2">
                    <i class="fas fa-arrow-left"></i> Continue Shopping
                </a>
            </div>
        `;
    }
}

// Display order summary in checkout
function displayOrderSummary() {
    const summaryContainer = document.getElementById('order-summary');
    if (!summaryContainer) return;

    const items = getCart();
    const subtotal = getCartSubtotal();
    const deliveryFee = getDeliveryFee();
    const total = getCartTotal();

    summaryContainer.innerHTML = `
        <div class="order-summary-box">
            <h4 class="mb-4">Order Summary</h4>
            <div class="order-items">
                ${items.map(item => `
                    <div class="order-item">
                        <div class="order-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="order-item-info">
                            <h6>${item.name}</h6>
                            <p class="text-muted small mb-1">Color: ${item.selectedColor} | Size: ${item.selectedSize}</p>
                            <p class="text-muted small">Qty: ${item.quantity} × ₱${item.price}</p>
                        </div>
                        <div class="order-item-price">
                            <strong>₱${item.price * item.quantity}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
            <hr>
            <div class="summary-row">
                <span>Subtotal:</span>
                <strong>₱${subtotal}</strong>
            </div>
            <div class="summary-row">
                <span>Delivery Fee:</span>
                <strong>${deliveryFee === 0 ? 'FREE' : '₱' + deliveryFee}</strong>
            </div>
            <hr>
            <div class="summary-total">
                <span>Total Amount:</span>
                <strong class="total-amount">₱${total}</strong>
            </div>
        </div>
    `;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Clear cart
function clearCart() {
    cartItems = [];
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
        console.error('Failed to remove cart from storage:', e);
    }
    saveCart();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initCart();
});
