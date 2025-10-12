// Main JavaScript - Page Initialization

document.addEventListener('DOMContentLoaded', function() {
    
    // Homepage - Load featured and new products
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
// Set OWNER_EMAIL to the seller's address for mailto fallback
const OWNER_EMAIL = 'owner@example.com';

// If you want to forward custom orders to a Google Form, set the formAction
// to your Google Form 'formResponse' endpoint (example:
// https://docs.google.com/forms/d/e/FORM_ID/formResponse)
// and map your form field names (name/email/phone/description/etc.) to the
// Google Form entry IDs (entry.XXXXXXXX). Example:
// const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/FORM_ID/formResponse';
// const GOOGLE_FORM_FIELDS = { name: 'entry.123456', email: 'entry.234567', description: 'entry.345678' };
const GOOGLE_FORM_ACTION = '';
const GOOGLE_FORM_FIELDS = {};

// Google Apps Script Web App endpoints (deployed by the owner)
// Replace these with your deployed URLs (provided earlier)
const MAIN_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyX20Y08nR2mDFNqsKUlbalcyEjFhriobz-FiC8FfWPcFvzrc2mefotnSDqN4zt5TQf/exec';
const CUSTOM_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby9odO7EKSmICSqQBnPyLqc-KuPj6G1H7A66vdHnmZNL6Yu7udHICZzNm4pHHv954zT/exec';

// Spreadsheet ID (will be sent automatically with requests). You can also set this in your Apps Script properties.
const SPREADSHEET_ID = '1g5l54fIHRQyBp2h0gO_B91j68uw7tVmPMEka2ditjfQ';

// Optional lightweight secret token for minimal protection. If you set a token in your Apps Script
// script properties (e.g. KEY_SECRET), set the same value here so requests include it.
// Leave empty to disable.
const SHARED_SECRET = '';

// Google Form prefill base for payment proof uploads.
// Replace FORM_ID and ENTRY_ID with your form's values (prefill URL pattern):
// e.g. 'https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.ENTRY_ID='
// Prefill base using the form ID you provided and the Order ID entry id
const GOOGLE_FORM_PROOF_PREFILL = 'https://docs.google.com/forms/d/e/1FAIpQLSczpuvin8w07EFcXr9slA2OVOYVARJHNXxuH8WvHIePi9XdgA/viewform?usp=pp_url&entry.375383761=';

// (owner email already configured above as OWNER_EMAIL)

// Load featured products on homepage
function loadFeaturedProducts() {
    const featured = getFeaturedProducts().slice(0, 4); // Show only 4
    displayProducts(featured, 'featured-products');
}

// Load new arrivals on homepage
function loadNewArrivals() {
    // Show a broader selection instead of relying on the `new` flag
    const all = getAllProducts().slice(0, 6); // show up to 6 items
    displayProducts(all, 'new-arrivals');
}

// Load all products with category filter
function loadAllProducts() {
    // Check if there's a category parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    // Display category filter
    displayCategoryFilter();
    
    // Load products based on category
    if (category) {
        filterByCategory(category);
    } else {
        const allProducts = getAllProducts();
        displayProducts(allProducts, 'all-products');
    }
}

// Display category filter buttons
function displayCategoryFilter() {
    const filterContainer = document.getElementById('category-filter');
    if (!filterContainer) return;
    
    const categories = getCategories();
    
    filterContainer.innerHTML = `
        <div class="category-filter-buttons">
            <button class="category-filter-btn active" onclick="filterByCategory('all')">
                All Products
            </button>
            ${categories.map(cat => `
                <button class="category-filter-btn" onclick="filterByCategory('${cat}')">
                    ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
            `).join('')}
        </div>
    `;
}

// Filter products by category
function filterByCategory(category) {
    const products = category === 'all' ? getAllProducts() : getProductsByCategory(category);
    displayProducts(products, 'all-products');
    
    // Update active button
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnText = btn.textContent.trim().toLowerCase();
        if (btnText === category || (category === 'all' && btnText === 'all products')) {
            btn.classList.add('active');
        }
    });
}

// Setup checkout form
function setupCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    
    const paymentMethod = document.getElementById('payment-method');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            showPaymentInstructions(this.value);
        });
        // Show default payment instructions
        showPaymentInstructions(paymentMethod.value);
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        processOrder();
    });
}

// Show payment instructions based on selected method
function showPaymentInstructions(method) {
    const instructionsContainer = document.getElementById('payment-instructions');
    if (!instructionsContainer) return;
    
    let instructions = '';
    
    switch(method) {
        case 'gcash':
            instructions = `
                <div class="payment-instruction-box">
                    <h5><i class="fas fa-mobile-alt"></i> GCash Payment</h5>
                    <p>Please send payment to:</p>
                    <div class="payment-details">
                        <p><strong>GCash Number:</strong> 0917-123-4567</p>
                        <p><strong>Account Name:</strong> STITCH PLEASE!</p>
                    </div>
                    <p class="text-muted small">After placing your order, please send a screenshot of your payment as proof.</p>
                </div>
            `;
            break;
        case 'bank':
            instructions = `
                <div class="payment-instruction-box">
                    <h5><i class="fas fa-university"></i> Bank Transfer</h5>
                    <p>Please transfer payment to:</p>
                    <div class="payment-details">
                        <p><strong>Bank:</strong> BPI</p>
                        <p><strong>Account Number:</strong> 1234-5678-9012</p>
                        <p><strong>Account Name:</strong> STITCH PLEASE!</p>
                    </div>
                    <p class="text-muted small">Send deposit slip or screenshot as proof of payment.</p>
                </div>
            `;
            break;
        case 'cod':
            instructions = `
                <div class="payment-instruction-box">
                    <h5><i class="fas fa-money-bill-wave"></i> Cash on Delivery</h5>
                    <p>Pay when you receive your order.</p>
                    <p class="text-muted small">Our rider will contact you before delivery.</p>
                </div>
            `;
            break;
    }
    
    instructionsContainer.innerHTML = instructions;
}

// Process order
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

    // Build items array with minimal, stable fields
    const items = getCart().map(i => ({
        productId: i.id,
        name: i.name,
        qty: i.quantity,
        price: i.price,
        options: { color: i.selectedColor, size: i.selectedSize }
    }));

    const orderId = generateOrderId();

    // Keep backward-compatible top-level fields while including a customer object
    const orderData = {
        orderId,
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        customer, // nested object for Apps Script usage
        items,
        subtotal: getCartSubtotal(),
        deliveryFee: getDeliveryFee(),
        total: getCartTotal(),
        paymentMethod: formData.get('payment-method'),
        deliveryOption: formData.get('delivery-option') || 'standard',
        notes: formData.get('notes') || '',
        createdAt: new Date().toISOString()
    };

    // Disable submit button to prevent duplicate orders
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Placing order...';
    }

    // Submit to Google Apps Script endpoint via a temporary HTML form to avoid CORS issues
    try {
        const tmpForm = document.createElement('form');
        tmpForm.method = 'POST';
        tmpForm.action = APPS_SCRIPT_URL;
        // open in new tab so user stays on the site while the request is sent
        tmpForm.target = '_blank';

        // Helper to append hidden inputs
        const appendInput = (name, value) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value == null ? '' : value.toString();
            tmpForm.appendChild(input);
        };

        appendInput('orderId', orderData.orderId);
        appendInput('customerName', orderData.customerName);
        appendInput('email', orderData.email);
        appendInput('phone', orderData.phone);
        appendInput('address', orderData.address);
        appendInput('city', orderData.city);
        appendInput('subtotal', orderData.subtotal);
        appendInput('deliveryFee', orderData.deliveryFee);
        appendInput('total', orderData.total);
        appendInput('paymentMethod', orderData.paymentMethod);
        appendInput('deliveryOption', orderData.deliveryOption);
        appendInput('notes', orderData.notes);
        appendInput('createdAt', orderData.createdAt);
        // Serialize items as JSON string
        appendInput('items', JSON.stringify(orderData.items || []));

        document.body.appendChild(tmpForm);
        tmpForm.submit();
        setTimeout(() => tmpForm.remove(), 1500);
    } catch (err) {
        console.error('Form submit fallback failed:', err);
    } finally {
        // Show confirmation locally regardless of network success
        showOrderConfirmation(orderData);
        clearCart();
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order';
        }
    }
}

// Show order confirmation
function showOrderConfirmation(orderData) {
    const checkoutContainer = document.querySelector('.checkout-container');
    if (!checkoutContainer) return;
    
    checkoutContainer.innerHTML = `
        <div class="order-confirmation">
            <div class="confirmation-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Order Placed Successfully!</h2>
            <p class="lead">Thank you for your order, ${orderData.customerName}!</p>
            
            <div class="confirmation-details">
                <h5>Order Summary</h5>
                <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
                <p><strong>Total Amount:</strong> ₱${orderData.total}</p>
                <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
                <p><strong>Delivery Address:</strong> ${orderData.address}, ${orderData.city}</p>
            </div>
            
            <div class="next-steps">
                <h5>What's Next?</h5>
                <ul>
                    <li>You will receive a confirmation message at <strong>${orderData.email}</strong></li>
                    <li>We will contact you at <strong>${orderData.phone}</strong> to confirm your order</li>
                    ${orderData.paymentMethod !== 'cod' ? '<li>Please send proof of payment</li>' : ''}
                    <li>Estimated delivery: 3-5 business days</li>
                </ul>
            </div>
            
            <div class="payment-proof mt-3">
                <h5>Upload Payment Proof</h5>
                <p>Please upload a screenshot of your payment and include the payment reference number so we can verify your order quickly.</p>
                <p>
                    <a id="upload-proof-link" href="${GOOGLE_FORM_PROOF_PREFILL}${encodeURIComponent(orderData.orderId)}" target="_blank" class="btn btn-primary btn-lg">Upload Payment Proof</a>
                </p>
                <p class="small text-muted">Note: Google may require you to sign in to upload files. If you prefer, you can also send the screenshot via WhatsApp or email and include your Order ID: <strong>${orderData.orderId}</strong>.</p>
            </div>

            <div class="confirmation-actions">
                <a href="products.html" class="btn btn-primary btn-lg">Continue Shopping</a>
                <a href="index.html" class="btn btn-outline-secondary btn-lg">Back to Home</a>
            </div>
        </div>
    `;
    
    window.scrollTo(0, 0);
}

// Setup custom order form
function setupCustomOrderForm() {
    const form = document.getElementById('custom-order-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const customOrderData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            productType: formData.get('product-type'),
            description: formData.get('description'),
            preferredColors: formData.get('colors'),
            budget: formData.get('budget'),
            deadline: formData.get('deadline'),
            submittedDate: new Date().toLocaleString()
        };
        
        console.log('Custom order submitted:', customOrderData);
        
        // If a GOOGLE_FORM_ACTION is configured, post to the Google Form
        if (GOOGLE_FORM_ACTION && Object.keys(GOOGLE_FORM_FIELDS).length > 0) {
            try {
                // Create a temporary form and submit (avoids CORS problems with fetch)
                const tmpForm = document.createElement('form');
                tmpForm.method = 'POST';
                tmpForm.action = GOOGLE_FORM_ACTION;
                // open in new tab so user stays on site
                tmpForm.target = '_blank';

                // Map fields from our form to Google Form entry IDs
                Object.keys(GOOGLE_FORM_FIELDS).forEach(key => {
                    const entryName = GOOGLE_FORM_FIELDS[key]; // e.g. 'entry.123456'
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = entryName;
                    input.value = (customOrderData[key] || '').toString();
                    tmpForm.appendChild(input);
                });

                // Append and submit
                document.body.appendChild(tmpForm);
                tmpForm.submit();
                // remove it afterwards
                setTimeout(() => tmpForm.remove(), 1000);
            } catch (err) {
                console.warn('Google Form submission failed:', err);
            }
        } else {
            // Attempt mailto fallback so owner receives an email draft with the details
            try {
                const subject = encodeURIComponent(`Custom Order Request from ${customOrderData.name}`);
                const body = encodeURIComponent(
                    `Name: ${customOrderData.name}\nEmail: ${customOrderData.email}\nPhone: ${customOrderData.phone}\nProduct Type: ${customOrderData.productType}\nBudget: ${customOrderData.budget}\nDeadline: ${customOrderData.deadline}\n\nDescription:\n${customOrderData.description}`
                );
                // Open user's default mail client with prefilled message to owner
                window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
            } catch (err) {
                console.warn('Could not open mail client:', err);
            }
        }

        // Show success message regardless so the user sees feedback
        showCustomOrderConfirmation(customOrderData);
    });
}

// Show custom order confirmation
function showCustomOrderConfirmation(orderData) {
    const formContainer = document.querySelector('.custom-order-container');
    if (!formContainer) return;
    
    formContainer.innerHTML = `
        <div class="order-confirmation">
            <div class="confirmation-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Custom Order Request Received!</h2>
            <p class="lead">Thank you, ${orderData.name}!</p>
            
            <div class="confirmation-details">
                <p>We've received your custom order request for: <strong>${orderData.productType}</strong></p>
                <p>We will review your request and contact you at <strong>${orderData.email}</strong> or <strong>${orderData.phone}</strong> within 24 hours with a quote and timeline.</p>
            </div>
            
            <div class="confirmation-actions mt-4">
                <a href="products.html" class="btn btn-primary btn-lg">Browse Products</a>
                <a href="index.html" class="btn btn-outline-secondary btn-lg">Back to Home</a>
            </div>
        </div>
    `;
}