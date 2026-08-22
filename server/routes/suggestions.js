import express from "express";
import Product from "../models/Product.js";
import ShoppingItem from "../models/ShoppingItem.js";
import ShoppingHistory from "../models/ShoppingHistory.js";

const router = express.Router();

// Static mapping of healthy/dietary substitutes
const substitutesMap = {
  "whole milk": { name: "Almond Milk (Unsweetened)", reason: "Lighter, plant-based dairy alternative", category: "Dairy & Eggs" },
  "milk": { name: "Almond Milk (Unsweetened)", reason: "Lighter, plant-based dairy alternative", category: "Dairy & Eggs" },
  "butter": { name: "Organic Extra Virgin Olive Oil", reason: "Heart-healthy cooking oil alternative", category: "Pantry & Dry Goods" },
  "salted butter": { name: "Organic Extra Virgin Olive Oil", reason: "Heart-healthy cooking oil alternative", category: "Pantry & Dry Goods" },
  "white bread": { name: "Whole Wheat Bread", reason: "Fiber-rich, nutrient-dense bakery option", category: "Bakery" },
  "bread": { name: "Whole Wheat Bread", reason: "Fiber-rich, nutrient-dense bakery option", category: "Bakery" },
  "sugar": { name: "Pure Maple Syrup", reason: "Natural sweetener swap", category: "Pantry & Dry Goods" },
  "peanut butter": { name: "Roasted Almonds (Salted)", reason: "Whole-nut option if trying to reduce spreads", category: "Snacks & Sweets" },
  "soda": { name: "Sparkling Water (Lime)", reason: "Zero calorie, unsweetened bubbly beverage", category: "Beverages" },
  "coke": { name: "Sparkling Water (Lime)", reason: "Zero calorie, unsweetened bubbly beverage", category: "Beverages" },
  "chips": { name: "Roasted Almonds (Salted)", reason: "Healthier protein-packed crunchy snack", category: "Snacks & Sweets" },
  "tortilla chips": { name: "Roasted Almonds (Salted)", reason: "Healthier protein-packed crunchy snack", category: "Snacks & Sweets" }
};

// GET /api/suggestions/dashboard - Compile recommendations
router.get("/dashboard", async (req, res) => {
  try {
    // 1. Get active shopping items to exclude duplicates
    const activeItems = await ShoppingItem.find({ isCompleted: false });
    const activeNames = activeItems.map(item => item.name.toLowerCase());

    // 2. Fetch history-based recommendations (purchased >= 3 times)
    const historyLogs = await ShoppingHistory.find({ frequencyCount: { $gte: 3 } });
    const historyRecommendations = historyLogs
      .filter(log => !activeNames.includes(log.itemName))
      .map(log => ({
        name: log.itemName.charAt(0).toUpperCase() + log.itemName.slice(1),
        category: log.category,
        reason: "Frequently bought item you might be running low on."
      }))
      .slice(0, 4);

    // 3. Fetch seasonal recommendations based on calendar month
    const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
    let currentSeason = "spring";
    if (month === 11 || month <= 1) currentSeason = "winter";
    else if (month >= 2 && month <= 4) currentSeason = "spring";
    else if (month >= 5 && month <= 7) currentSeason = "summer";
    else currentSeason = "autumn";

    // Query catalog for seasonal items not on active list with optional dietary filter
    const { dietary } = req.query;
    const seasonalQuery = {
      seasons: currentSeason,
      name: { $nin: activeItems.map(i => i.name) }
    };

    if (dietary) {
      const dietaryArray = dietary.split(",").map(t => t.trim().toLowerCase());
      seasonalQuery.dietary = { $all: dietaryArray };
    }

    const seasonalProducts = await Product.find(seasonalQuery).limit(4);

    const seasonalOffers = seasonalProducts.map(prod => ({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      brand: prod.brand,
      size: prod.size,
      reason: `Fresh in season for ${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}!`
    }));

    // 4. Fetch substitute recommendations based on active items
    const substitutes = [];
    activeItems.forEach(item => {
      const normalName = item.name.toLowerCase();
      
      // Look for a key match (e.g. if list contains "whole milk")
      let match = substitutesMap[normalName];
      
      // If no exact match, check partial matching (e.g. if list has "Mrs. Meyer's salted butter" -> "butter")
      if (!match) {
        const matchingKey = Object.keys(substitutesMap).find(key => normalName.includes(key));
        if (matchingKey) match = substitutesMap[matchingKey];
      }

      if (match) {
        // Only suggest if the substitute is not already on the active list
        if (!activeNames.includes(match.name.toLowerCase())) {
          substitutes.push({
            originalItem: item.name,
            name: match.name,
            reason: match.reason,
            category: match.category
          });
        }
      }
    });

    res.json({
      status: "success",
      data: {
        historyRecommendations,
        seasonalOffers,
        substitutes
      }
    });

  } catch (error) {
    console.error("Suggestions API Error:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while compiling smart suggestions."
    });
  }
});

export default router;
