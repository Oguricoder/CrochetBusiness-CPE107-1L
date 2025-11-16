// ============================================
// UPDATED products.js - FIX FEATURED & NEW
// Replace your existing products.js with this
// ============================================

let products = [];

const MAIN_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwiAmEGXqM9xirwAJ70tVW5demI4-4yuBPbTDbsBUkrw8zN10yyLOYyP3AQrA06-j-9/exec';

// ============================================
// LOAD PRODUCTS FROM SHEETS
// ============================================

async function loadProductsFromSheets() {
    try {
        console.log('📦 Loading products from Google Sheets...');
        
        const response = await fetch(MAIN_WEB_APP_URL + '?action=getProducts&t=' + Date.now(), {
            method: 'GET',
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (data.success && data.products && data.products.length > 0) {
            console.log('✅ Loaded ' + data.products.length + ' products from Sheets');
            products = data.products;
            
            // ✅ DEBUG: Log featured and new products
            const featured = products.filter(p => p.featured === true);
            const newArrivals = products.filter(p => p.new === true);
            
            console.log('⭐ Featured products:', featured.length, featured.map(p => p.name));
            console.log('🆕 New arrivals:', newArrivals.length, newArrivals.map(p => p.name));
            
            console.log('✅ Products ready:', products);
        } else {
            console.warn('⚠️ No products returned from Sheets');
            products = [];
        }
    } catch (err) {
        console.error('❌ Failed to load from Sheets:', err.message);
        products = [];
    }
}

// ============================================
// PRODUCT GETTERS - FIXED LOGIC
// ============================================

function getAllProducts() {
    return products;
}

// ✅ FIX: Only return products where featured === true (boolean true, not string)
function getFeaturedProducts() {
    const featured = products.filter(p => p.featured === true);
    console.log('📌 getFeaturedProducts called, returning:', featured.length, 'products');
    return featured;
}

// ✅ FIX: Only return products where new === true (boolean true, not string)
function getNewArrivals() {
    const newProducts = products.filter(p => p.new === true);
    console.log('📌 getNewArrivals called, returning:', newProducts.length, 'products');
    return newProducts;
}

function getProductById(id) {
    return products.find(p => p.id === parseInt(id));
}

function getProductsByCategory(category) {
    if (!category || category === 'all') return products;
    return products.filter(p => p.category === category);
}

function getCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
}

// ============================================
// DISPLAY PRODUCTS
// ============================================

function displayProducts(productsToDisplay, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (productsToDisplay.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open" style="font-size: 4rem; color: #ddd;"></i>
                <h4 class="mt-3">No products found</h4>
            </div>
        `;
        return;
    }

    container.innerHTML = productsToDisplay.map(product => {
        const isOutOfStock = !product.actualStock || product.actualStock === 0;
        const isLowStock = !isOutOfStock && product.actualStock > 0 && product.actualStock <= 5;
        
        return `
        <div class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}">
                <a href="product-detail.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        ${isLowStock ? `<span class="stock-badge low">Only ${product.actualStock} left!</span>` : ''}
                        ${isOutOfStock ? '<span class="stock-badge out">Out of Stock</span>' : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-footer">
                            <span class="product-price">₱${product.price}</span>
                        </div>
                    </div>
                </a>
                <div style="padding: 0 20px 20px 20px;">
                    <div class="d-flex gap-2">
                        <a href="product-detail.html?id=${product.id}" class="btn btn-outline-primary flex-fill" style="border-radius: 25px; font-weight: 600; text-transform: uppercase; font-size: 0.85rem;">
                            <i class="fas fa-eye"></i> Details
                        </a>
                        ${!isOutOfStock ? `
                            <button class="btn-add-cart flex-fill" onclick="addToCart(${product.id}); event.stopPropagation();">
                                <i class="fas fa-cart-plus"></i> Add
                            </button>
                        ` : `
                            <button class="btn btn-secondary flex-fill" disabled style="border-radius: 25px;">
                                <i class="fas fa-times"></i> Unavailable
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function displayProductDetail(productId) {
    const product = getProductById(productId);
    if (!product) {
        document.body.innerHTML = '<div class="container mt-5"><h2>Product not found</h2></div>';
        return;
    }
    
    return product;
}