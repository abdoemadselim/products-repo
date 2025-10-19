import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";

// Database connection
const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
    max: 20,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Product categories in English
const categories = [
    "Electronics",
    "Furniture",
    "Groceries",
    "Clothing",
    "Books",
    "Sports & Outdoors",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Toys & Games",
    "Automotive",
];

// Product templates for each category
const productTemplates = {
    Electronics: [
        { name: "Wireless Mouse", price: [15.99, 45.99], stockRange: [50, 200] },
        { name: "Bluetooth Keyboard", price: [29.99, 89.99], stockRange: [40, 150] },
        { name: "USB-C Hub", price: [19.99, 59.99], stockRange: [60, 180] },
        { name: "Noise Cancelling Headphones", price: [99.99, 349.99], stockRange: [30, 100] },
        { name: "Wireless Earbuds", price: [49.99, 199.99], stockRange: [80, 250] },
        { name: "Laptop Stand", price: [24.99, 79.99], stockRange: [40, 120] },
        { name: "Webcam HD", price: [39.99, 129.99], stockRange: [50, 150] },
        { name: "External Hard Drive", price: [59.99, 179.99], stockRange: [70, 200] },
        { name: "Power Bank", price: [19.99, 69.99], stockRange: [100, 300] },
        { name: "Smart Watch", price: [149.99, 499.99], stockRange: [20, 80] },
    ],
    Furniture: [
        { name: "Ergonomic Office Chair", price: [149.99, 499.99], stockRange: [10, 50] },
        { name: "Standing Desk", price: [249.99, 699.99], stockRange: [8, 30] },
        { name: "Bookshelf", price: [79.99, 249.99], stockRange: [15, 60] },
        { name: "Coffee Table", price: [99.99, 299.99], stockRange: [12, 45] },
        { name: "Bed Frame", price: [199.99, 599.99], stockRange: [5, 25] },
        { name: "Nightstand", price: [49.99, 149.99], stockRange: [20, 70] },
        { name: "Sofa Set", price: [499.99, 1999.99], stockRange: [3, 15] },
        { name: "Dining Table", price: [299.99, 899.99], stockRange: [6, 20] },
        { name: "TV Stand", price: [89.99, 249.99], stockRange: [15, 50] },
        { name: "Wardrobe", price: [199.99, 699.99], stockRange: [8, 30] },
    ],
    Groceries: [
        { name: "Organic Green Tea", price: [7.99, 19.99], stockRange: [150, 400] },
        { name: "Extra Virgin Olive Oil", price: [12.99, 29.99], stockRange: [80, 250] },
        { name: "Raw Honey", price: [9.99, 24.99], stockRange: [100, 300] },
        { name: "Whole Grain Pasta", price: [2.99, 7.99], stockRange: [200, 500] },
        { name: "Organic Coffee Beans", price: [14.99, 34.99], stockRange: [120, 350] },
        { name: "Almond Butter", price: [8.99, 19.99], stockRange: [90, 280] },
        { name: "Quinoa", price: [6.99, 16.99], stockRange: [110, 320] },
        { name: "Mixed Nuts", price: [11.99, 27.99], stockRange: [130, 370] },
        { name: "Dark Chocolate", price: [4.99, 12.99], stockRange: [180, 450] },
        { name: "Protein Powder", price: [24.99, 59.99], stockRange: [60, 180] },
    ],
    Clothing: [
        { name: "Cotton T-Shirt", price: [12.99, 29.99], stockRange: [100, 300] },
        { name: "Denim Jeans", price: [39.99, 89.99], stockRange: [80, 220] },
        { name: "Waterproof Jacket", price: [69.99, 179.99], stockRange: [50, 150] },
        { name: "Running Shoes", price: [59.99, 149.99], stockRange: [70, 200] },
        { name: "Casual Sneakers", price: [44.99, 99.99], stockRange: [90, 250] },
        { name: "Winter Coat", price: [99.99, 299.99], stockRange: [30, 100] },
        { name: "Hoodie", price: [34.99, 79.99], stockRange: [110, 300] },
        { name: "Dress Shirt", price: [29.99, 69.99], stockRange: [85, 230] },
        { name: "Leather Belt", price: [19.99, 49.99], stockRange: [120, 320] },
        { name: "Summer Dress", price: [39.99, 99.99], stockRange: [60, 180] },
    ],
    Books: [
        { name: "Programming in JavaScript", price: [29.99, 59.99], stockRange: [40, 120] },
        { name: "The Art of Leadership", price: [19.99, 39.99], stockRange: [50, 150] },
        { name: "Cooking Masterclass", price: [24.99, 49.99], stockRange: [45, 135] },
        { name: "Photography Basics", price: [27.99, 54.99], stockRange: [35, 110] },
        { name: "Business Strategy Guide", price: [34.99, 69.99], stockRange: [30, 100] },
        { name: "Science Fiction Novel", price: [14.99, 24.99], stockRange: [80, 240] },
        { name: "Historical Biography", price: [18.99, 34.99], stockRange: [55, 165] },
        { name: "Self-Help Handbook", price: [16.99, 29.99], stockRange: [70, 210] },
        { name: "Travel Guide Asia", price: [22.99, 44.99], stockRange: [40, 120] },
        { name: "Mystery Thriller", price: [12.99, 21.99], stockRange: [90, 270] },
    ],
    "Sports & Outdoors": [
        { name: "Yoga Mat", price: [19.99, 49.99], stockRange: [80, 240] },
        { name: "Camping Tent", price: [89.99, 249.99], stockRange: [20, 70] },
        { name: "Hiking Backpack", price: [49.99, 129.99], stockRange: [40, 120] },
        { name: "Water Bottle", price: [14.99, 34.99], stockRange: [150, 400] },
        { name: "Resistance Bands", price: [12.99, 29.99], stockRange: [100, 280] },
        { name: "Dumbbell Set", price: [39.99, 119.99], stockRange: [30, 90] },
        { name: "Jump Rope", price: [8.99, 19.99], stockRange: [120, 340] },
        { name: "Bicycle Helmet", price: [34.99, 89.99], stockRange: [60, 180] },
        { name: "Sleeping Bag", price: [44.99, 129.99], stockRange: [35, 105] },
        { name: "Fishing Rod", price: [54.99, 159.99], stockRange: [25, 80] },
    ],
    "Home & Kitchen": [
        { name: "Blender", price: [39.99, 119.99], stockRange: [50, 150] },
        { name: "Air Fryer", price: [79.99, 199.99], stockRange: [40, 120] },
        { name: "Coffee Maker", price: [49.99, 149.99], stockRange: [60, 180] },
        { name: "Knife Set", price: [29.99, 89.99], stockRange: [70, 210] },
        { name: "Non-Stick Pan", price: [24.99, 59.99], stockRange: [90, 270] },
        { name: "Cutting Board", price: [14.99, 34.99], stockRange: [110, 330] },
        { name: "Mixing Bowl Set", price: [19.99, 44.99], stockRange: [85, 255] },
        { name: "Food Storage Containers", price: [16.99, 39.99], stockRange: [130, 370] },
        { name: "Vacuum Cleaner", price: [99.99, 299.99], stockRange: [25, 80] },
        { name: "Electric Kettle", price: [29.99, 69.99], stockRange: [75, 225] },
    ],
    "Beauty & Personal Care": [
        { name: "Face Moisturizer", price: [19.99, 49.99], stockRange: [100, 300] },
        { name: "Shampoo and Conditioner Set", price: [24.99, 54.99], stockRange: [120, 340] },
        { name: "Electric Toothbrush", price: [39.99, 119.99], stockRange: [60, 180] },
        { name: "Hair Dryer", price: [34.99, 89.99], stockRange: [50, 150] },
        { name: "Perfume", price: [44.99, 129.99], stockRange: [70, 210] },
        { name: "Makeup Brush Set", price: [22.99, 59.99], stockRange: [80, 240] },
        { name: "Facial Cleanser", price: [14.99, 34.99], stockRange: [140, 380] },
        { name: "Body Lotion", price: [12.99, 29.99], stockRange: [160, 420] },
        { name: "Nail Care Kit", price: [16.99, 39.99], stockRange: [90, 270] },
        { name: "Beard Grooming Kit", price: [29.99, 69.99], stockRange: [55, 165] },
    ],
    "Toys & Games": [
        { name: "Board Game Set", price: [24.99, 59.99], stockRange: [60, 180] },
        { name: "Building Blocks", price: [29.99, 69.99], stockRange: [80, 240] },
        { name: "Remote Control Car", price: [34.99, 89.99], stockRange: [50, 150] },
        { name: "Puzzle 1000 Pieces", price: [14.99, 34.99], stockRange: [70, 210] },
        { name: "Action Figure", price: [19.99, 44.99], stockRange: [100, 280] },
        { name: "Educational Science Kit", price: [39.99, 99.99], stockRange: [40, 120] },
        { name: "Stuffed Animal", price: [12.99, 29.99], stockRange: [120, 340] },
        { name: "Art and Craft Set", price: [22.99, 54.99], stockRange: [65, 195] },
        { name: "Musical Instrument Toy", price: [27.99, 64.99], stockRange: [55, 165] },
        { name: "Playing Cards Deck", price: [4.99, 14.99], stockRange: [200, 500] },
    ],
    Automotive: [
        { name: "Car Phone Mount", price: [14.99, 34.99], stockRange: [100, 280] },
        { name: "Dash Camera", price: [59.99, 149.99], stockRange: [40, 120] },
        { name: "Car Vacuum Cleaner", price: [34.99, 79.99], stockRange: [50, 150] },
        { name: "Tire Pressure Gauge", price: [9.99, 24.99], stockRange: [120, 340] },
        { name: "Car Air Freshener", price: [6.99, 16.99], stockRange: [180, 480] },
        { name: "Jump Starter", price: [69.99, 159.99], stockRange: [30, 90] },
        { name: "Car Seat Cover", price: [39.99, 99.99], stockRange: [60, 180] },
        { name: "Floor Mats Set", price: [24.99, 59.99], stockRange: [80, 240] },
        { name: "Windshield Sunshade", price: [12.99, 29.99], stockRange: [110, 310] },
        { name: "Emergency Roadside Kit", price: [44.99, 99.99], stockRange: [45, 135] },
    ],
};

// Generate random number within range
function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

// Generate random integer within range
function randomIntInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate product description
function generateDescription(productName: string, category: string): string {
    const descriptionTemplates = [
        `High-quality ${productName.toLowerCase()} perfect for everyday use. Features premium materials and excellent durability.`,
        `Professional-grade ${productName.toLowerCase()} designed with modern technology and user comfort in mind.`,
        `Premium ${productName.toLowerCase()} offering exceptional performance and reliability at an affordable price.`,
        `Innovative ${productName.toLowerCase()} crafted with attention to detail and superior craftsmanship.`,
        `Top-rated ${productName.toLowerCase()} combining style, functionality, and outstanding value for money.`,
        `Versatile ${productName.toLowerCase()} suitable for both personal and professional use with excellent features.`,
        `Durable and reliable ${productName.toLowerCase()} built to last with high-quality components and materials.`,
        `Stylish ${productName.toLowerCase()} featuring contemporary design and practical functionality for daily needs.`,
        `Advanced ${productName.toLowerCase()} equipped with the latest features to enhance your experience and productivity.`,
        `Carefully selected ${productName.toLowerCase()} offering great value and performance in the ${category.toLowerCase()} category.`,
    ];

    return descriptionTemplates[Math.floor(Math.random() * descriptionTemplates.length)];
}

// Product interface
interface ProductSeed {
    name: string;
    category: string;
    price: number;
    stock: number;
    sales: number;
    description: string;
}

// Generate 200 products
function generateProducts(): ProductSeed[] {
    const products: ProductSeed[] = [];
    let productCount = 0;

    while (productCount < 200) {
        for (const category of categories) {
            if (productCount >= 200) break;

            const templates = productTemplates[category as keyof typeof productTemplates];
            const template = templates[Math.floor(Math.random() * templates.length)];

            // Add variation to product name
            const variations = ["", " Pro", " Plus", " Premium", " Deluxe", " Classic", " Essential", " Ultra"];
            const colors = ["", " Black", " White", " Blue", " Red", " Gray", " Silver"];
            const sizes = ["", " Small", " Medium", " Large", " XL"];

            let variation = "";
            const rand = Math.random();
            if (rand < 0.3) {
                variation = variations[Math.floor(Math.random() * variations.length)];
            } else if (rand < 0.6) {
                variation = colors[Math.floor(Math.random() * colors.length)];
            } else if (rand < 0.8) {
                variation = sizes[Math.floor(Math.random() * sizes.length)];
            }

            const stock = randomIntInRange(template.stockRange[0], template.stockRange[1]);
            // Generate sales based on stock - products sell between 0% and 80% of their stock
            const salesPercentage = Math.random() * 0.8;
            const sales = Math.floor(stock * salesPercentage);

            const product = {
                name: template.name + variation,
                category: category,
                price: parseFloat(randomInRange(template.price[0], template.price[1]).toFixed(2)),
                stock: stock,
                sales: sales,
                description: generateDescription(template.name + variation, category),
            };

            products.push(product);
            productCount++;
        }
    }

    return products.slice(0, 200); // Ensure exactly 200 products
}

async function seedDatabase() {
    const client = await pool.connect();

    try {
        console.log("🌱 Starting seed process...");

        // Start transaction
        await client.query("BEGIN");

        // 1. Create categories if they don't exist
        console.log("📦 Creating categories...");
        const categoryIds: { [key: string]: number } = {};

        for (const category of categories) {
            const result = await client.query(
                `INSERT INTO category (name) 
         VALUES ($1) 
         RETURNING id`,
                [category]
            );
            categoryIds[category] = result.rows[0].id;
            console.log(`  ✓ Category: ${category} (ID: ${categoryIds[category]})`);
        }

        // 2. Generate and insert products
        console.log("\n🛍️  Generating 200 products...");
        const products = generateProducts();

        console.log("💾 Inserting products into database...");
        let insertedCount = 0;

        for (const product of products) {
            const categoryId = categoryIds[product.category];

            await client.query(
                `INSERT INTO product (name, category_id, description, price, stock, sales)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [product.name, categoryId, product.description, product.price, product.stock, product.sales]
            );

            insertedCount++;
            if (insertedCount % 20 === 0) {
                console.log(`  ✓ Inserted ${insertedCount} products...`);
            }
        }

        // Commit transaction
        await client.query("COMMIT");

        console.log(`\n✅ Successfully seeded ${insertedCount} products!`);
        console.log(`📊 Categories created: ${categories.length}`);
        console.log("\n🎉 Seed process completed successfully!");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error seeding database:", error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the seed
seedDatabase().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

