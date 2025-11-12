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
const OWNER_EMAIL = 'jamiahsoophiaguinto@gmail.com';
const MAIN_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwfF43f0ph6seF8anxOEtpHLDIl3xMkq234xDvsHtRc3S5oT1XhRXGYP7gtKAEtCtgA/exec';
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
                <p class="mb-2">You will see the QR code and payment details after placing your order.</p>
                <p class="text-muted small">Please have your GCash app ready to scan and pay.</p>
            </div>`;
            break;
        case 'bank':
            instructions = `<div class="payment-instruction-box">
                <h5><i class="fas fa-university"></i> Bank Transfer</h5>
                <p class="mb-2">You will see the bank account details after placing your order.</p>
                <p class="text-muted small">Please have your banking app ready to transfer payment.</p>
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

    // Get cart items and format them properly
    const cartItems = getCart();
    
    // Format items as readable string with quantity, color, size
    // Example: "Baby Deer Plush (Pink, Medium) x2 - ₱700; Bear Mittens (Brown, One Size) x1 - ₱450"
    const itemsFormatted = cartItems.map(item => {
        const subtotal = item.price * item.quantity;
        return `${item.name} (${item.selectedColor}, ${item.selectedSize}) x${item.quantity} - ₱${subtotal}`;
    }).join('; ');

    // Also keep detailed breakdown for display
    const itemsDetailed = cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        color: item.selectedColor || 'N/A',
        size: item.selectedSize || 'N/A',
        subtotal: item.price * item.quantity
    }));

    // Generate order details
    const orderId = generateOrderId();
    const now = new Date();
    const orderDate = now.toLocaleString('en-PH', { 
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    const createdAt = now.toISOString();

    const subtotal = getCartSubtotal();
    const deliveryFee = getDeliveryFee();
    const total = getCartTotal();
    const paymentMethod = formData.get('payment-method');
    const deliveryOption = formData.get('delivery-option');
    const notes = formData.get('notes') || '';

    // Order data for Google Sheets
    const orderData = {
        orderId: orderId,
        orderDate: orderDate,
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        items: itemsFormatted, // ← This is the key field with qty, color, size
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'COD' : 'Pending Payment',
        orderStatus: 'New Order',
        paymentRef: '',
        proofUrl: '',
        deliveryCompany: '',
        deliveryOption: deliveryOption,
        notes: notes,
        createdAt: createdAt,
        updatedAt: createdAt
    };

    console.log('📦 Order Data Being Sent:');
    console.log('Order ID:', orderId);
    console.log('Items:', itemsFormatted);
    console.log('Full order data:', orderData);

    // Show confirmation page first
    showOrderConfirmation(orderData, itemsDetailed);
    clearCart();

    // Submit to Google Sheets in background
    submitOrderToGoogleSheets(orderData);
}

function submitOrderToGoogleSheets(orderData) {
    try {
        console.log('📤 Submitting order to Google Sheets...');
        console.log('Email being sent:', orderData.email);
        
        // Create hidden iframe for form submission
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.name = 'order_submit_frame';
        document.body.appendChild(iframe);

        // Create temporary form
        const tmpForm = document.createElement('form');
        tmpForm.method = 'POST';
        tmpForm.action = MAIN_WEB_APP_URL;
        tmpForm.target = 'order_submit_frame';

        // Add all order data as hidden inputs
        Object.entries(orderData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value == null ? '' : String(value);
            tmpForm.appendChild(input);
        });

        // Add spreadsheet configuration
        const configInputs = {
            spreadsheetId: SPREADSHEET_ID,
            sheetName: 'ORDERS (MAIN)'
        };

        Object.entries(configInputs).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            tmpForm.appendChild(input);
        });

        // Submit form
        document.body.appendChild(tmpForm);
        console.log('✅ Form created with email:', orderData.email);
        tmpForm.submit();
        console.log('✅ Order submitted to Google Sheets');

        // Cleanup
        setTimeout(() => {
            if (document.body.contains(tmpForm)) document.body.removeChild(tmpForm);
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 2000);

    } catch (err) {
        console.error('❌ Failed to submit order:', err);
    }
}


function showOrderConfirmation(orderData, itemsDetailed) {
    const checkoutContainer = document.querySelector('.checkout-container');
    if (!checkoutContainer) return;
    
    const paymentMethodLabel = (orderData.paymentMethod || '').toUpperCase().replace('-', ' ');
    
    // Format items for display
    const itemsList = itemsDetailed.map(item => 
        `<div class="d-flex justify-content-between align-items-start border-bottom py-3">
            <div class="flex-grow-1">
                <h6 class="mb-1">${item.name}</h6>
                <small class="text-muted d-block">
                    <i class="fas fa-palette me-1"></i> Color: <strong>${item.color}</strong> &nbsp;
                    <i class="fas fa-ruler me-1"></i> Size: <strong>${item.size}</strong> &nbsp;
                    <i class="fas fa-boxes me-1"></i> Qty: <strong>${item.quantity}</strong>
                </small>
                <small class="text-muted">₱${item.price} × ${item.quantity}</small>
            </div>
            <div class="text-end">
                <strong class="text-primary">₱${item.subtotal.toFixed(2)}</strong>
            </div>
        </div>`
    ).join('');

    // Payment instructions based on method
    let paymentInstructionsHTML = '';
    
    if (orderData.paymentMethod === 'gcash') {
        paymentInstructionsHTML = `
            <div class="card mb-4 shadow-sm">
                <div class="card-header text-white" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);">
                    <h5 class="card-title mb-0"><i class="fas fa-mobile-alt me-2"></i>GCash Payment Instructions</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="mb-3">📱 Scan QR Code:</h6>
                            <div class="text-center p-3 bg-light rounded">
                                <img src="images/gcash-qr.png" alt="GCash QR" 
                                     style="max-width: 250px; width: 100%; border: 2px solid #dee2e6; border-radius: 8px;" 
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <div style="display: none;" class="alert alert-warning mt-2 mb-0">
                                    <small><i class="fas fa-exclamation-triangle"></i> QR not available. Use manual details.</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6 class="mb-3">💳 Manual Payment:</h6>
                            <div class="p-3 bg-light rounded mb-3">
                                <p class="mb-2"><strong>GCash Number:</strong></p>
                                <p class="fs-4 text-primary mb-2"><strong>0918-748-5693</strong></p>
                                <p class="mb-0"><strong>Name:</strong> Jamiah Sophia Guinto</p>
                            </div>
                            <div class="alert alert-info mb-0">
                                <strong><i class="fas fa-money-bill-wave me-1"></i> Amount to Pay:</strong>
                                <span class="fs-5 text-primary ms-2"><strong>₱${orderData.total}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (orderData.paymentMethod === 'cod') {
        paymentInstructionsHTML = `
            <div class="card mb-4 shadow-sm">
                <div class="card-header text-white" style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);">
                    <h5 class="card-title mb-0"><i class="fas fa-money-bill-wave me-2"></i>Cash on Delivery</h5>
                </div>
                <div class="card-body">
                    <div class="alert alert-warning mb-0">
                        <h6 class="alert-heading"><i class="fas fa-truck me-2"></i>Payment Details</h6>
                        <p class="mb-2">✅ You'll pay when you receive your order</p>
                        <p class="mb-2">📞 Our rider will contact you at <strong>${orderData.phone}</strong></p>
                        <p class="mb-0">💵 Please prepare: <strong class="fs-5">₱${orderData.total}</strong></p>
                    </div>
                </div>
            </div>
        `;
    }

    checkoutContainer.innerHTML = `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="order-confirmation bg-white p-4 p-md-5 rounded shadow-sm">
                        
                        <!-- Success Header -->
                        <div class="text-center mb-4">
                            <div class="mb-3">
                                <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                            </div>
                            <h2 class="fw-bold">Order Placed Successfully!</h2>
                            <p class="lead text-muted">Thank you, ${orderData.customerName}!</p>
                            <div class="alert alert-info d-inline-block">
                                <strong>Order ID:</strong> <code class="fs-6">${orderData.orderId}</code>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div class="card mb-4 shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <h5 class="card-title mb-0"><i class="fas fa-receipt me-2"></i>Order Summary</h5>
                            </div>
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-sm-6 mb-3 mb-sm-0">
                                        <p class="mb-2"><i class="fas fa-calendar me-2 text-muted"></i><strong>Date:</strong> ${orderData.orderDate}</p>
                                        <p class="mb-2"><i class="fas fa-credit-card me-2 text-muted"></i><strong>Payment:</strong> ${paymentMethodLabel}</p>
                                    </div>
                                    <div class="col-sm-6">
                                        <p class="mb-2"><i class="fas fa-map-marker-alt me-2 text-muted"></i><strong>Delivery:</strong></p>
                                        <p class="mb-1 ms-4 small">${orderData.address}, ${orderData.city}</p>
                                        <p class="mb-0 ms-4 small"><i class="fas fa-phone me-1"></i> ${orderData.phone}</p>
                                    </div>
                                </div>
                                
                                <h6 class="border-top pt-3 mb-3"><i class="fas fa-shopping-bag me-2"></i>Items Ordered</h6>
                                ${itemsList}
                                
                                <div class="mt-3 pt-3 border-top">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <span>₱${orderData.subtotal}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Delivery Fee:</span>
                                        <span>${orderData.deliveryFee > 0 ? '₱' + orderData.deliveryFee : 'FREE'}</span>
                                    </div>
                                    <div class="d-flex justify-content-between fs-4 fw-bold text-primary pt-2 border-top">
                                        <span>Total:</span>
                                        <span>₱${orderData.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        ${paymentInstructionsHTML}

                        ${orderData.paymentMethod !== 'cod' ? `
                            <div class="card mb-4 shadow-sm">
                                <div class="card-header text-white" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);">
                                    <h5 class="card-title mb-0"><i class="fas fa-camera me-2"></i>Upload Payment Proof</h5>
                                </div>
                                <div class="card-body text-center">
                                    <p class="mb-3">After paying, please upload a screenshot of your payment confirmation.</p>
                                    <a href="${GOOGLE_FORM_PROOF_PREFILL}${encodeURIComponent(orderData.orderId)}" 
                                       target="_blank" 
                                       class="btn btn-danger btn-lg">
                                        <i class="fas fa-upload me-2"></i> Upload Payment Screenshot
                                    </a>
                                    <p class="small text-muted mt-3 mb-0">
                                        💡 Include your Order ID: <strong>${orderData.orderId}</strong>
                                    </p>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Next Steps -->
                        <div class="card mb-4 shadow-sm">
                            <div class="card-header bg-success text-white">
                                <h5 class="card-title mb-0"><i class="fas fa-list-check me-2"></i>What Happens Next?</h5>
                            </div>
                            <div class="card-body">
                                <ul class="list-unstyled mb-0">
                                    <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i> Confirmation email sent to <strong>${orderData.email}</strong></li>
                                    <li class="mb-2"><i class="fas fa-phone text-success me-2"></i> We'll call <strong>${orderData.phone}</strong> to confirm</li>
                                    ${orderData.paymentMethod !== 'cod' ? '<li class="mb-2"><i class="fas fa-clock text-warning me-2"></i> Payment verification within 24 hours</li>' : ''}
                                    <li class="mb-0"><i class="fas fa-truck text-info me-2"></i> Delivery in <strong>${orderData.deliveryOption === 'express' ? '1-2' : '3-5'} days</strong></li>
                                </ul>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                            <a href="products.html" class="btn btn-primary btn-lg">
                                <i class="fas fa-shopping-bag me-2"></i> Continue Shopping
                            </a>
                            <a href="index.html" class="btn btn-outline-secondary btn-lg">
                                <i class="fas fa-home me-2"></i> Back to Home
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    `;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}