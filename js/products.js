// Enhanced Product Database
const products = [
    {
        id: 1,
        name: "Crochet Bucket Hat",
        price: 350,
        image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600",
        description: "Stylish handmade bucket hat perfect for summer. Available in multiple colors and sizes.",
        category: "hats",
        featured: true,
        new: true,
        colors: ["Beige", "White", "Pink", "Blue"],
        sizes: ["S", "M", "L"]
    },
    {
        id: 2,
        name: "Classic Tote Bag",
        price: 450,
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600",
        description: "Durable crochet tote bag perfect for shopping, beach trips, or daily use.",
        category: "bags",
        featured: true,
        new: false,
        colors: ["Natural", "Black", "Navy"],
        sizes: ["One Size"]
    },
    {
        id: 3,
        name: "Baby Blanket",
        price: 600,
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600",
        description: "Soft and cozy baby blanket, perfect gift for newborns. Gentle on sensitive skin.",
        category: "home",
        featured: true,
        new: true,
        colors: ["Pink", "Blue", "Yellow", "White"],
        sizes: ["80x80cm"]
    },
    {
        id: 4,
        name: "Summer Crop Top",
        price: 400,
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600",
        description: "Trendy crochet crop top perfect for summer outfits. Breathable and stylish.",
        category: "clothing",
        featured: false,
        new: true,
        colors: ["White", "Black", "Lavender"],
        sizes: ["XS", "S", "M", "L"]
    },
    {
        id: 5,
        name: "Coaster Set (4pcs)",
        price: 150,
        image: "https://images.unsplash.com/photo-1578070181910-f1e514afdd08?w=600",
        description: "Set of 4 colorful handmade coasters. Protects your furniture in style.",
        category: "home",
        featured: false,
        new: false,
        colors: ["Mixed", "Pastel", "Rainbow"],
        sizes: ["10cm diameter"]
    },
    {
        id: 6,
        name: "Flower Headband",
        price: 180,
        image: "https://images.unsplash.com/photo-1535632788429-517bb4f54911?w=600",
        description: "Cute crochet headband with delicate flower detail. Perfect accessory for any outfit.",
        category: "accessories",
        featured: true,
        new: false,
        colors: ["White", "Pink", "Yellow"],
        sizes: ["Adjustable"]
    },
    {
        id: 7,
        name: "Cozy Cardigan",
        price: 800,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
        description: "Warm and comfortable crochet cardigan. Perfect layer for cool weather.",
        category: "clothing",
        featured: false,
        new: true,
        colors: ["Cream", "Grey", "Brown"],
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 8,
        name: "Macrame Plant Hanger",
        price: 250,
        image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600",
        description: "Stylish macrame-style plant hanger for your indoor plants. Adds boho charm.",
        category: "home",
        featured: false,
        new: false,
        colors: ["Natural", "White"],
        sizes: ["75cm length"]
    },
    {
        id: 9,
        name: "Mini Crossbody Bag",
        price: 380,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
        description: "Compact and stylish crossbody bag. Perfect for carrying essentials.",
        category: "bags",
        featured: false,
        new: true,
        colors: ["Tan", "Black", "Pink"],
        sizes: ["One Size"]
    },
    {
        id: 10,
        name: "Beanie Hat",
        price: 280,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600",
        description: "Classic crochet beanie to keep you warm and stylish during cold weather.",
        category: "hats",
        featured: false,
        new: false,
        colors: ["Black", "Grey", "Navy", "Burgundy"],
        sizes: ["One Size"]
    },
    {
        id: 11,
        name: "Scrunchie Set (3pcs)",
        price: 120,
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
        description: "Set of 3 cute crochet scrunchies. Gentle on hair, stylish accessory.",
        category: "accessories",
        featured: false,
        new: true,
        colors: ["Pastel Mix", "Neutral Mix", "Bright Mix"],
        sizes: ["Standard"]
    },
    {
        id: 12,
        name: "Beach Cover-Up",
        price: 550,
        image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600",
        description: "Lightweight crochet cover-up perfect for the beach or pool.",
        category: "clothing",
        featured: true,
        new: true,
        colors: ["White", "Turquoise", "Coral"],
        sizes: ["S/M", "L/XL"]
    }
];

// Get all products
function getAllProducts() {
    return products;
}

// Get featured products
function getFeaturedProducts() {
    return products.filter(product => product.featured);
}

// Get new arrivals
function getNewArrivals() {
    return products.filter(product => product.new);
}

// Get product by ID
function getProductById(id) {
    return products.find(product => product.id === parseInt(id));
}

// Get products by category
function getProductsByCategory(category) {
    if (!category || category === 'all') return products;
    return products.filter(product => product.category === category);
}

// Get all categories
function getCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
}

// Display products as cards
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

    container.innerHTML = productsToDisplay.map(product => `
        <div class="col-lg-3 col-md-4 col-sm-6 col-12 mb-4">
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    ${product.new ? '<span class="product-badge">NEW</span>' : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-footer">
                        <span class="product-price">₱${product.price}</span>
                        <button class="btn-add-cart" onclick="addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Display product with more details (for product detail page)
function displayProductDetail(productId) {
    const product = getProductById(productId);
    if (!product) {
        document.body.innerHTML = '<div class="container mt-5"><h2>Product not found</h2></div>';
        return;
    }
    
    // This will be used in product-detail.html
    return product;
}