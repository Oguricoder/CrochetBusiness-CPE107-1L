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
function processOrder() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    const orderData = {
        customerName: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        paymentMethod: formData.get('payment-method'),
        deliveryOption: formData.get('delivery-option') || 'standard',
        notes: formData.get('notes') || '',
        items: getCart(),
        subtotal: getCartSubtotal(),
        deliveryFee: getDeliveryFee(),
        total: getCartTotal(),
        orderDate: new Date().toLocaleString()
    };
    
    // In a real application, this would send to a server
    console.log('Order placed:', orderData);
    
    // Show success message
    showOrderConfirmation(orderData);
    
    // Clear cart
    clearCart();
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