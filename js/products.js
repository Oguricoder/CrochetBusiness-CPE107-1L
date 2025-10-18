// Enhanced Product Database
const products = [
    {
        id: 1,
        name: "Baby Deer Plush Toy",
        price: 350,
        image: "deerplush.jpg",
        description: "Soft deer plush with pink accents, ideal for baby gifts or nursery decor.",
        category: "toys",
        featured: true,
        new: true,
        colors: ["Beige", "White", "Pink"],
        sizes: ["S", "M"]
    },
    {
        id: 2,
        name: "Bear Face Mittens",
        price: 450,
        image: "bearwarmers.jpg",
        description: "Cozy mittens with bear face design. Warm and whimsical for winter wear.",
        category: "accessories",
        featured: true,
        new: false,
        colors: ["Brown", "Natural"],
        sizes: ["One Size"]
    },
    {
        id: 3,
        name: "Wrapped Crochet Rose Bouquet",
        price: 600,
        image: "Boquet.png",
        description: "Elegant bouquet of purple and white crocheted roses, wrapped and ribbon-tied.",
        category: "home",
        featured: true,
        new: true,
        colors: ["Purple", "White", "Green"],
        sizes: ["80x80cm"]
    },
    {
        id: 4,
        name: "Earth-Tone Granny Cardigan",
        price: 400,
        image: "cardigan.jpg",
        description: "Handmade cardigan with warm-toned granny squares and striped sleeves.",
        category: "clothing",
        featured: false,
        new: true,
        colors: ["Brown", "Mustard", "Cream"],
        sizes: ["S", "M", "L"]
    },
    {
        id: 5,
        name: "Chevron Crochet Floor Mat",
        price: 300,
        image: "floormat.jpg",
        description: "Mint and cream ripple-pattern mat for cozy, decorative flooring.",
        category: "home",
        featured: false,
        new: false,
        colors: ["Mint", "Cream"],
        sizes: ["100x100cm"]
    },
    {
        id: 6,
        name: "Simplistic White Granny Cardigan",
        price: 200,
        image: "Granny.jpg",
        description: "Dirty white cardigan that is cozy, simplistic, and great for chilly weather.",
        category: "crafts",
        featured: false,
        new: true,
        colors: ["White", "Green", "Blue"],
        sizes: ["15x15cm"]
    },
    {
        id: 7,
        name: "Velvet Scrunchie Bouquet",
        price: 180,
        image: "hairclip.jpg",
        description: "Pastel scrunchies styled like flowers, with butterfly clip accents.",
        category: "accessories",
        featured: true,
        new: true,
        colors: ["Pink", "Lavender", "Beige"],
        sizes: ["Standard"]
    },
    {
        id: 8,
        name: "Ice Cream Cone Plushies",
        price: 320,
        image: "icecreamplush.jpg",
        description: "Whimsical cone-shaped plush toys with smiling faces and cherry toppers.",
        category: "toys",
        featured: false,
        new: true,
        colors: ["Brown", "Pink", "White"],
        sizes: ["S", "M"]
    },
    {
        id: 9,
        name: "Colorburst Kitchen Mats",
        price: 280,
        image: "kitechenmats.jpg",
        description: "Vibrant striped crochet mats for kitchen or tabletop use.",
        category: "home",
        featured: false,
        new: false,
        colors: ["Multicolor"],
        sizes: ["40x60cm"]
    },
    {
        id: 10,
        name: "Checkered Mini Phone Pouch",
        price: 220,
        image: "phonebag.jpg",
        description: "Yellow-and-white pouch with green strap, sized for phones or small items.",
        category: "bags",
        featured: false,
        new: true,
        colors: ["Yellow", "White", "Green"],
        sizes: ["One Size"]
    },
    {
        id: 11,
        name: "Pastel Flower Scrunchies",
        price: 120,
        image: "scrunchie.jpg",
        description: "Soft pastel scrunchies with floral centers, arranged like a bouquet.",
        category: "accessories",
        featured: false,
        new: true,
        colors: ["Pink", "Lavender", "Blue"],
        sizes: ["Standard"]
    },
    {
        id: 12,
        name: "Mushroom Knit Socks",
        price: 280,
        image: "Socks.jpg",
        description: "Fun socks with red mushroom motifs—great for cozy, nature-inspired style.",
        category: "clothing",
        featured: false,
        new: false,
        colors: ["Brown", "Red", "White"],
        sizes: ["S", "M", "L"]
    },
    {
        id: 13,
        name: "Cloud Stitch Beanie",
        price: 280,
        image: "beanie.jpg",
        description: "FStay warm and stylish with the Cloud Stitch Beanie—a soft, hand-crocheted hat featuring a snug fit and subtle texture.",
        category: "hats",
        featured: false,
        new: false,
        colors: ["Brown", "Red", "White"],
        sizes: ["S", "M", "L"]
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
                    <!-- Removed NEW badge as requested -->
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
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