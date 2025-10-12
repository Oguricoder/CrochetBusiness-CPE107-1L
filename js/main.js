document.addEventListener('DOMContentLoaded', function() {
    
    if (document.getElementById('featured-products')) {
        loadFeaturedProducts();
    }
    
    if (document.getElementById('new-arrivals')) {
        loadNewArrivals();
    }
    
    // Products page - Load all products with filters
    if (document.getElementById('all-products')) {
        loadAllProducts();
    }
    
    // Cart page - Display cart
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }
    
    // Checkout page - Setup checkout
    if (document.getElementById('checkout-form')) {
        displayOrderSummary();
        setupCheckoutForm();
    }
    
    // Custom order page
    if (document.getElementById('custom-order-form')) {
        setupCustomOrderForm();
    }
});

// === Configuration ===
const OWNER_EMAIL = 'owner@example.com';
const MAIN_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyiTsG_txC_TC1Esz7vy1nexjWBcFIfXtwOPpslbw7vawAFDlumrSbN_RA6HXHmJItu/exec';
const CUSTOM_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby9odO7EKSmICSqQBnPyLqc-KuPj6G1H7A66vdHnmZNL6Yu7udHICZzNm4pHHv954zT/exec';
const SPREADSHEET_ID = '1g5l54fIHRQyBp2h0gO_B91j68uw7tVmPMEka2ditjfQ';
const SHARED_SECRET = '';
const GOOGLE_FORM_PROOF_PREFILL = 'https://docs.google.com/forms/d/e/1FAIpQLSczpuvin8w07EFcXr9slA2OVOYVARJHNXxuH8WvHIePi9XdgA/viewform?usp=pp_url&entry.375383761=';

// Load featured products on homepage
function loadFeaturedProducts() {
    const featured = getFeaturedProducts().slice(0, 4);
    displayProducts(featured, 'featured-products');
}

// Load new arrivals on homepage
function loadNewArrivals() {
    const all = getAllProducts().slice(0, 6);
    displayProducts(all, 'new-arrivals');
}

// Load all products with category filter
function loadAllProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    displayCategoryFilter();
    if (category) {
        filterByCategory(category);
    } else {
        const allProducts = getAllProducts();
        displayProducts(allProducts, 'all-products');
    }
}

function displayCategoryFilter() {
    const filterContainer = document.getElementById('category-filter');
    if (!filterContainer) return;
    const categories = getCategories();
    filterContainer.innerHTML = `
        <div class="category-filter-buttons">
            <button class="category-filter-btn active" onclick="filterByCategory('all')">All Products</button>
            ${categories.map(cat => `<button class="category-filter-btn" onclick="filterByCategory('${cat}')">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`).join('')}
        </div>
    `;
}

function filterByCategory(category) {
    const products = category === 'all' ? getAllProducts() : getProductsByCategory(category);
    displayProducts(products, 'all-products');
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnText = btn.textContent.trim().toLowerCase();
        if (btnText === category || (category === 'all' && btnText === 'all products')) btn.classList.add('active');
    });
}

function setupCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    const paymentMethod = document.getElementById('payment-method');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            showPaymentInstructions(this.value);
        });
        showPaymentInstructions(paymentMethod.value);
    }
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        processOrder();
    });
}

function showPaymentInstructions(method) {
    const instructionsContainer = document.getElementById('payment-instructions');
    if (!instructionsContainer) return;
    let instructions = '';
    switch(method) {
        case 'gcash':
            instructions = `<div class="payment-instruction-box">
                <h5><i class="fas fa-mobile-alt"></i> GCash Payment</h5>
                <p>Please send payment to:</p>
                <div class="payment-details">
                    <p><strong>GCash Number:</strong> 0917-123-4567</p>
                    <p><strong>Account Name:</strong> STITCH PLEASE!</p>
                </div>
                <p class="text-muted small">After placing your order, please send a screenshot of your payment as proof.</p>
            </div>`;
            break;
        case 'bank':
            instructions = `<div class="payment-instruction-box">
                <h5><i class="fas fa-university"></i> Bank Transfer</h5>
                <p>Please transfer payment to:</p>
                <div class="payment-details">
                    <p><strong>Bank:</strong> BPI</p>
                    <p><strong>Account Number:</strong> 1234-5678-9012</p>
                    <p><strong>Account Name:</strong> STITCH PLEASE!</p>
                </div>
                <p class="text-muted small">Send deposit slip or screenshot as proof of payment.</p>
            </div>`;
            break;
        case 'cod':
            instructions = `<div class="payment-instruction-box">
                <h5><i class="fas fa-money-bill-wave"></i> Cash on Delivery</h5>
                <p>Pay when you receive your order.</p>
                <p class="text-muted small">Our rider will contact you before delivery.</p>
            </div>`;
            break;
    }
    instructionsContainer.innerHTML = instructions;
}

function generateOrderId() {
    const t = new Date();
    const dt = t.toISOString().replace(/[:.]/g, '').replace('T', '-').split('Z')[0];
    const rnd = Math.random().toString(36).slice(2,6).toUpperCase();
    return `ORDER-${dt}-${rnd}`;
}

function processOrder() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);

    const customer = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city')
    };

    // Format items for better readability in spreadsheet
    const formatItems = (items) => {
        return items.map(item => 
            `${item.name} (${item.options.color}, ${item.options.size}) x${item.qty} - ₱${item.price}`
        ).join('; ');
    };

    const items = getCart().map(i => ({ 
        productId: i.id, 
        name: i.name, 
        qty: i.quantity, 
        price: i.price, 
        options: { color: i.selectedColor, size: i.selectedSize } 
    }));

    const orderId = generateOrderId();
    const now = new Date();
    const orderDate = now.toLocaleString();
    const createdAt = now.toISOString();

    const orderData = {
        orderId,
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        items: formatItems(items),
        subtotal: getCartSubtotal(),
        deliveryFee: getDeliveryFee(),
        total: getCartTotal(),
        paymentMethod: formData.get('payment-method'),
        notes: formData.get('notes') || '',
        createdAt,
        orderDate
    };

    // First show confirmation page
    showOrderConfirmation(orderData, items);
    clearCart();

    // Then submit form in background
    try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.name = 'order_submit_frame';
        document.body.appendChild(iframe);

        const tmpForm = document.createElement('form');
        tmpForm.method = 'POST';
        tmpForm.action = MAIN_WEB_APP_URL;
        tmpForm.target = 'order_submit_frame';

        const appendInput = (name, value) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value == null ? '' : String(value);
            tmpForm.appendChild(input);
        };

        // Add all form fields
        Object.entries(orderData).forEach(([key, value]) => {
            appendInput(key, value);
        });
        appendInput('spreadsheetId', SPREADSHEET_ID);
        appendInput('sheetName', 'ORDERS (MAIN)');

        document.body.appendChild(tmpForm);
        tmpForm.submit();

        // Cleanup after submission
        setTimeout(() => {
            document.body.removeChild(tmpForm);
            document.body.removeChild(iframe);
        }, 2000);

    } catch (err) {
        console.error('Order submission error:', err);
    }
}

function showOrderConfirmation(orderData, items) {
    const checkoutContainer = document.querySelector('.checkout-container');
    if (!checkoutContainer) return;
    
    const paymentMethodLabel = (orderData.paymentMethod || '').toUpperCase();
    const itemsList = items.map(item => 
        `<div class="d-flex justify-content-between align-items-center border-bottom py-2">
            <span>${item.name} (${item.options.color}, ${item.options.size}) x${item.qty}</span>
            <span>₱${(item.price * item.qty).toFixed(2)}</span>
        </div>`
    ).join('');

    checkoutContainer.innerHTML = `
        <div class="order-confirmation bg-light p-4 rounded">
            <div class="text-center mb-4">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle text-success fa-3x"></i>
                </div>
                <h2 class="mt-3">Order Placed Successfully!</h2>
                <p class="lead">Thank you for your order, ${orderData.customerName}!</p>
            </div>
            
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">Order Summary</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                            <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
                            <p><strong>Payment Method:</strong> ${paymentMethodLabel}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Delivery Address:</strong><br>${orderData.address}, ${orderData.city}</p>
                            <p><strong>Contact:</strong> ${orderData.phone}</p>
                            <p><strong>Email:</strong> ${orderData.email}</p>
                        </div>
                    </div>
                    
                    <div class="items-list mt-3">
                        <h6 class="border-bottom pb-2">Items Ordered</h6>
                        ${itemsList}
                        <div class="d-flex justify-content-between mt-3">
                            <strong>Subtotal:</strong>
                            <span>₱${orderData.subtotal}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <strong>Delivery Fee:</strong>
                            <span>₱${orderData.deliveryFee}</span>
                        </div>
                        <div class="d-flex justify-content-between mt-2 pt-2 border-top">
                            <strong>Total:</strong>
                            <strong>₱${orderData.total}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header bg-info text-white">
                    <h5 class="card-title mb-0">What's Next?</h5>
                </div>
                <div class="card-body">
                    <ul class="list-unstyled">
                        <li class="mb-2"><i class="fas fa-envelope me-2"></i> Confirmation email will be sent to <strong>${orderData.email}</strong></li>
                        <li class="mb-2"><i class="fas fa-phone me-2"></i> We will contact you at <strong>${orderData.phone}</strong> to confirm your order</li>
                        ${orderData.paymentMethod !== 'cod' ? '<li class="mb-2"><i class="fas fa-upload me-2"></i> Please upload your payment proof below</li>' : ''}
                        <li class="mb-2"><i class="fas fa-truck me-2"></i> Estimated delivery: 3-5 business days</li>
                    </ul>
                </div>
            </div>

            ${orderData.paymentMethod !== 'cod' ? `
                <div class="card mb-4">
                    <div class="card-header bg-warning">
                        <h5 class="card-title mb-0">Upload Payment Proof</h5>
                    </div>
                    <div class="card-body text-center">
                        <p class="mb-3">Please upload a screenshot of your payment</p>
                        <a href="${GOOGLE_FORM_PROOF_PREFILL}${encodeURIComponent(orderData.orderId)}" 
                           target="_blank" 
                           class="btn btn-warning btn-lg">
                            <i class="fas fa-upload me-2"></i> Upload Payment Proof
                        </a>
                        <p class="small text-muted mt-2">Include Order ID: <strong>${orderData.orderId}</strong></p>
                    </div>
                </div>
            ` : ''}

            <div class="text-center mt-4">
                <a href="products.html" class="btn btn-primary btn-lg me-3">
                    <i class="fas fa-shopping-bag me-2"></i> Continue Shopping
                </a>
                <a href="index.html" class="btn btn-outline-secondary btn-lg">
                    <i class="fas fa-home me-2"></i> Back to Home
                </a>
            </div>
        </div>
    `;
    
    window.scrollTo(0, 0);
}
