import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Product from "./models/Product.js";
import ShoppingItem from "./models/ShoppingItem.js";
import ShoppingHistory from "./models/ShoppingHistory.js";

// Load environment variables
dotenv.config();

const mockProducts = [
  // Produce
  { name: "Organic Honeycrisp Apples", category: "Produce", price: 4.99, brand: "Earthbound Farm", size: "3 lb bag", dietary: ["organic", "vegan", "gluten-free"], seasons: ["autumn", "winter"] },
  { name: "Bananas", category: "Produce", price: 1.89, brand: "Dole", size: "1 bunch", dietary: ["vegan", "gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Fresh Strawberries", category: "Produce", price: 3.49, brand: "Driscoll's", size: "16 oz", dietary: ["organic", "vegan", "gluten-free"], seasons: ["spring", "summer"] },
  { name: "Baby Spinach", category: "Produce", price: 2.99, brand: "Olivia's Organics", size: "5 oz", dietary: ["organic", "vegan", "gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Avocados", category: "Produce", price: 1.25, brand: "Calavo", size: "1 count", dietary: ["vegan", "gluten-free"], seasons: ["spring", "summer"] },
  { name: "Sweet Potatoes", category: "Produce", price: 0.99, brand: "Local Farm", size: "1 lb", dietary: ["vegan", "gluten-free"], seasons: ["autumn", "winter"] },
  { name: "Fresh Watermelon", category: "Produce", price: 5.99, brand: "Sunsweet", size: "1 whole", dietary: ["vegan", "gluten-free"], seasons: ["summer"] },

  // Dairy & Eggs
  { name: "Whole Milk", category: "Dairy & Eggs", price: 3.89, brand: "Organic Valley", size: "1 gallon", dietary: ["organic", "gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Almond Milk (Unsweetened)", category: "Dairy & Eggs", price: 3.29, brand: "Silk", size: "64 oz", dietary: ["vegan", "gluten-free", "dairy-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Greek Yogurt (Plain)", category: "Dairy & Eggs", price: 5.49, brand: "Chobani", size: "32 oz", dietary: ["gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Oat Milk (Barista Edition)", category: "Dairy & Eggs", price: 4.49, brand: "Oatly", size: "64 oz", dietary: ["vegan", "gluten-free", "dairy-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Large Brown Eggs", category: "Dairy & Eggs", price: 4.29, brand: "Vital Farms", size: "1 dozen", dietary: ["organic", "gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Salted Butter", category: "Dairy & Eggs", price: 3.99, brand: "Land O'Lakes", size: "16 oz", dietary: ["gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Cheddar Cheese Block", category: "Dairy & Eggs", price: 4.79, brand: "Tillamook", size: "8 oz", dietary: ["gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },

  // Bakery
  { name: "Whole Wheat Bread", category: "Bakery", price: 3.49, brand: "Dave's Killer Bread", size: "20 oz", dietary: ["organic"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Gluten-Free White Bread", category: "Bakery", price: 5.99, brand: "Udi's", size: "12 oz", dietary: ["gluten-free", "dairy-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Butter Croissants", category: "Bakery", price: 4.99, brand: "Local Bakery", size: "4 pack", dietary: [], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Blueberry Muffins", category: "Bakery", price: 3.99, brand: "Kirkland", size: "4 pack", dietary: [], seasons: ["spring", "summer"] },

  // Meat & Seafood
  { name: "Organic Chicken Breast", category: "Meat & Seafood", price: 8.99, brand: "Bell & Evans", size: "1.25 lb", dietary: ["organic", "gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Wild Caught Salmon Fillets", category: "Meat & Seafood", price: 14.99, brand: "Marine Harvest", size: "1 lb", dietary: ["gluten-free"], seasons: ["spring", "summer", "autumn"] },
  { name: "Lean Ground Beef 90/10", category: "Meat & Seafood", price: 6.99, brand: "Laura's Lean", size: "1 lb", dietary: ["gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },

  // Pantry & Dry Goods
  { name: "Organic Brown Rice", category: "Pantry & Dry Goods", price: 2.49, brand: "Lundberg", size: "2 lb", dietary: ["organic", "vegan", "gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Peanut Butter (Creamy)", category: "Pantry & Dry Goods", price: 3.79, brand: "Jif", size: "16 oz", dietary: ["gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Organic Extra Virgin Olive Oil", category: "Pantry & Dry Goods", price: 11.99, brand: "Bertolli", size: "16.9 oz", dietary: ["organic", "vegan", "gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Gluten-Free Penne Pasta", category: "Pantry & Dry Goods", price: 2.29, brand: "Barilla", size: "12 oz", dietary: ["gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Pure Maple Syrup", category: "Pantry & Dry Goods", price: 7.99, brand: "Coombs Family Farms", size: "8 oz", dietary: ["organic", "vegan", "gluten-free"], seasons: ["autumn", "winter"] },

  // Beverages
  { name: "Sparkling Water (Lime)", category: "Beverages", price: 4.49, brand: "LaCroix", size: "12 pack", dietary: ["vegan", "gluten-free"], seasons: ["spring", "summer"] },
  { name: "100% Orange Juice", category: "Beverages", price: 4.99, brand: "Tropicana", size: "52 oz", dietary: ["vegan", "gluten-free"], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Organic Ground Coffee (Medium Roast)", category: "Beverages", price: 9.99, brand: "Peet's", size: "12 oz", dietary: ["organic", "vegan", "gluten-free"], seasons: ["autumn", "winter"] },

  // Snacks & Sweets
  { name: "Tortilla Chips", category: "Snacks & Sweets", price: 2.99, brand: "Tostitos", size: "13 oz", dietary: ["gluten-free", "vegan"], seasons: ["spring", "summer"] },
  { name: "Organic Dark Chocolate Bar 70%", category: "Snacks & Sweets", price: 3.49, brand: "Green & Black's", size: "3.17 oz", dietary: ["organic", "gluten-free"], seasons: ["autumn", "winter"] },
  { name: "Roasted Almonds (Salted)", category: "Snacks & Sweets", price: 6.49, brand: "Blue Diamond", size: "6 oz", dietary: ["gluten-free", "vegan"], seasons: ["spring", "summer", "autumn", "winter"] },

  // Household & Cleaning
  { name: "Paper Towels", category: "Household & Cleaning", price: 8.99, brand: "Bounty", size: "6 double rolls", dietary: [], seasons: ["spring", "summer", "autumn", "winter"] },
  { name: "Eco-Friendly Dish Soap", category: "Household & Cleaning", price: 3.49, brand: "Mrs. Meyer's", size: "16 oz", dietary: ["vegan"], seasons: ["spring", "summer", "autumn", "winter"] }
];

const seedDatabase = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Clear out any existing entries
    console.log("Clearing existing collections...");
    await Product.deleteMany({});
    await ShoppingItem.deleteMany({});
    await ShoppingHistory.deleteMany({});
    console.log("Database collections cleared.");

    // 3. Insert fresh mock products
    console.log(`Inserting ${mockProducts.length} seed products...`);
    const createdProducts = await Product.insertMany(mockProducts);
    console.log(`Successfully populated Product catalog with ${createdProducts.length} items!`);

    // 4. Close database connection and exit
    mongoose.connection.close();
    console.log("Database connection closed cleanly.");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding script failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
