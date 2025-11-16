const CART_STORAGE_KEY = 'crochet_cart_v1';
let cartItems = [];

// Initialize cart on page load
function initCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                cartItems = parsed;
            }
        }
    } catch (e) {
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
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
        console.error('Failed to save cart to storage:', e);
    }
    updateCartCount();
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }
}

// Add item to cart with stock validation
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    console.log('Adding to cart:', product.name);
    console.log('Available stock:', product.stock);
    
    const existingItem = cartItems.find(item => item.id === productId);
    const currentCartQty = existingItem ? existingItem.quantity : 0;
    
    console.log('Already in cart:', currentCartQty);
    console.log('Total after adding:', currentCartQty + 1);
    
    if (currentCartQty + 1 > product.stock) {
        if (product.stock === 0) {
            showNotification(`${product.name} is out of stock!`, 'error');
        } else if (currentCartQty >= product.stock) {
            showNotification(`You already have the maximum available (${product.stock}) in your cart`, 'warning');
        } else {
            const remaining = product.stock - currentCartQty;
            showNotification(`Only ${remaining} more available for ${product.name}`, 'warning');
        }
        return;
    }
    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('Updated quantity to:', existingItem.quantity);
    } else {
        cartItems.push({
            ...product,
            quantity: 1,
            selectedColor: product.colors[0],
            selectedSize: product.sizes[0]
        });
        console.log('Added new item to cart');
    }
    
    saveCart();
    showNotification(`${product.name} added to cart!`, 'success');
}

// Remove item from cart - THIS WAS MISSING!
function removeFromCart(productId) {
    console.log('🗑️ Removing product ID:', productId);
    
    const product = cartItems.find(item => item.id === productId);
    
    if (!product) {
        console.error('Product not found in cart:', productId);
        return;
    }
    
    const productName = product.name;
    
    // Remove item from cart
    cartItems = cartItems.filter(item => item.id !== productId);
    
    console.log('Cart after removal:', cartItems);
    console.log('Remaining items:', cartItems.length);
    
    // Save and update display
    saveCart();
    
    // Show notification
    showNotification(`${productName} removed from cart`, 'info');
}

// Update item quantity with stock validation
function updateQuantity(productId, newQuantity) {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;
    
    const requestedQty = parseInt(newQuantity);
    const product = getProductById(productId);
    
    if (!product) return;
    
    if (requestedQty > product.stock) {
        showNotification(`Only ${product.stock} available for ${product.name}`, 'warning');
        item.quantity = product.stock;
    } else {
        item.quantity = Math.max(1, requestedQty);
    }
    
    saveCart();
    displayCartItems();
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
    return subtotal >= 1000 ? 0 : 50;
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

    // Check for stock issues
    let hasStockIssues = false;
    const stockWarnings = [];

    items.forEach(item => {
        const product = getProductById(item.id);
        if (product) {
            if (product.stock === 0) {
                stockWarnings.push(`${item.name} is out of stock`);
                hasStockIssues = true;
            } else if (item.quantity > product.stock) {
                stockWarnings.push(`${item.name}: Only ${product.stock} available (you have ${item.quantity} in cart)`);
                hasStockIssues = true;
                item.quantity = product.stock;
                saveCart();
            }
        }
    });

    // Display stock warnings
    let stockWarningHTML = '';
    if (stockWarnings.length > 0) {
        stockWarningHTML = `
            <div class="alert alert-warning mb-4">
                <h5><i class="fas fa-exclamation-triangle"></i> Stock Issues</h5>
                <ul class="mb-0">
                    ${stockWarnings.map(w => `<li>${w}</li>`).join('')}
                </ul>
                <p class="mb-0 mt-2"><small>Quantities have been adjusted to available stock.</small></p>
            </div>
        `;
    }

    // Display cart items
    cartContainer.innerHTML = stockWarningHTML + `
        <div class="cart-items-list">
            ${items.map(item => {
                const product = getProductById(item.id);
                const currentStock = product ? product.stock : 0;
                const isOutOfStock = currentStock === 0;
                const exceedsStock = item.quantity > currentStock;
                const isLowStock = currentStock > 0 && currentStock <= 5;
                
                return `
                <div class="cart-item ${isOutOfStock ? 'out-of-stock-item' : ''}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                        ${isOutOfStock ? '<div class="stock-overlay">OUT OF STOCK</div>' : ''}
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="text-muted">${item.category}</p>
                        ${isOutOfStock ? '<span class="badge bg-danger">Out of Stock</span>' : ''}
                        ${isLowStock && !isOutOfStock ? `<span class="badge bg-warning text-dark">Only ${currentStock} available</span>` : ''}
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
                        <span class="price">P${item.price}</span>
                    </div>
                    <div class="cart-item-quantity">
                        <input type="number" 
                               value="${item.quantity}" 
                               min="1" 
                               max="${currentStock > 0 ? currentStock : 1}" 
                               onchange="updateQuantity(${item.id}, this.value)"
                               oninput="if(parseInt(this.value) > ${currentStock}) this.value = ${currentStock};"
                               ${isOutOfStock ? 'disabled' : ''}
                               class="form-control ${exceedsStock ? 'is-invalid' : ''}">
                        <small class="text-muted">Max: ${currentStock}</small>
                    </div>
                    <div class="cart-item-total">
                        <strong>P${item.price * item.quantity}</strong>
                    </div>
                    <div class="cart-item-remove">
                        <button onclick="removeFromCart(${item.id}); return false;" 
                                class="btn btn-link text-danger"
                                type="button"
                                title="Remove from cart">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `}).join('')}
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
                    <strong>P${subtotal}</strong>
                </div>
                <div class="summary-row">
                    <span>Delivery Fee:</span>
                    <strong>${deliveryFee === 0 ? 'FREE' : 'P' + deliveryFee}</strong>
                </div>
                ${deliveryFee === 0 ? '<p class="free-shipping-msg"><i class="fas fa-truck"></i> You got free shipping!</p>' : ''}
                ${subtotal < 1000 && subtotal > 0 ? `<p class="shipping-info">Add P${1000 - subtotal} more for free shipping!</p>` : ''}
                <hr>
                <div class="summary-total">
                    <span>Total:</span>
                    <strong class="total-amount">P${total}</strong>
                </div>
                ${hasStockIssues ? `
                    <button class="btn btn-secondary btn-lg w-100 mt-3" disabled>
                        <i class="fas fa-exclamation-triangle"></i> Stock Issues Detected
                    </button>
                    <small class="text-muted d-block text-center mt-2">Remove out-of-stock items to continue</small>
                ` : `
                    <a href="checkout.html" class="btn btn-primary btn-lg w-100 mt-3">
                        <i class="fas fa-lock"></i> Proceed to Checkout
                    </a>
                `}
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
                            <p class="text-muted small">Qty: ${item.quantity} × P${item.price}</p>
                        </div>
                        <div class="order-item-price">
                            <strong>P${item.price * item.quantity}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
            <hr>
            <div class="summary-row">
                <span>Subtotal:</span>
                <strong>P${subtotal}</strong>
            </div>
            <div class="summary-row">
                <span>Delivery Fee:</span>
                <strong>${deliveryFee === 0 ? 'FREE' : 'P' + deliveryFee}</strong>
            </div>
            <hr>
            <div class="summary-total">
                <span>Total Amount:</span>
                <strong class="total-amount">P${total}</strong>
            </div>
        </div>
    `;
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification-toast');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    
    let icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'error' || type === 'danger') icon = 'exclamation-circle';
    if (type === 'info') icon = 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
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