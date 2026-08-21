import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET /api/products/search - Query catalog items with filters
router.get("/search", async (req, res) => {
  try {
    const { q, maxPrice, brand, dietary } = req.query;

    const query = {};

    // 1. Text index search on item name
    if (q) {
      query.$text = { $search: q };
    }

    // 2. Filter by maximum price limit
    if (maxPrice) {
      const priceVal = parseFloat(maxPrice);
      if (!isNaN(priceVal)) {
        query.price = { $lte: priceVal };
      }
    }

    // 3. Filter by brand name (case-insensitive partial match)
    if (brand) {
      query.brand = new RegExp(brand, "i");
    }

    // 4. Filter by dietary labels (e.g. organic, vegan)
    if (dietary) {
      const dietaryArray = dietary.split(",").map(t => t.trim());
      query.dietary = { $all: dietaryArray };
    }

    // Execute query
    let results = [];
    if (q) {
      // Sort by text relevance score if text query is present
      results = await Product.find(query, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .limit(10);
    } else {
      results = await Product.find(query).sort({ price: 1 }).limit(10);
    }

    res.json({
      status: "success",
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error("Product Search API Error:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while searching the product catalog."
    });
  }
});

export default router;
