import express from "express";
import { z } from "zod";
import { parseCommand } from "../utils/nlpParser.js";
import ShoppingItem from "../models/ShoppingItem.js";
import Product from "../models/Product.js";

const router = express.Router();

// Input payload validator
const RequestSchema = z.object({
  text: z.string().min(1, "Command text is required"),
  language: z.string().default("en-US")
});

router.post("/command", async (req, res) => {
  try {
    // 1. Validate request payload using Zod
    const validation = RequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: "fail",
        error: "INVALID_INPUT",
        message: validation.error.errors[0].message
      });
    }

    const { text, language } = validation.data;

    // 2. Parse text into structured intent
    const parsedCommand = await parseCommand(text, language);

    // 3. Check if intent is unknown
    if (parsedCommand.intent === "UNKNOWN") {
      return res.status(422).json({
        status: "fail",
        error: "COMMAND_NOT_UNDERSTOOD",
        message: "We couldn't process that command. Try saying 'Add [item]' or 'Find [item] under [price]'."
      });
    }

    // 4. Execute Business Logic directly in Database
    const { intent, item, quantity, unit, category, maxPrice, brand } = parsedCommand;
    let searchResults = [];

    if (intent === "ADD_ITEM" && item) {
      // Case-insensitive check to see if item is already on active list
      const existing = await ShoppingItem.findOne({ name: new RegExp(`^${item}$`, "i"), isCompleted: false });
      if (existing) {
        existing.quantity += quantity;
        await existing.save();
      } else {
        await ShoppingItem.create({ name: item, quantity, unit, category });
      }
    } else if (intent === "REMOVE_ITEM" && item) {
      await ShoppingItem.deleteOne({ name: new RegExp(`^${item}$`, "i"), isCompleted: false });
    } else if (intent === "CLEAR_LIST") {
      await ShoppingItem.deleteMany({});
    } else if (intent === "UPDATE_QTY" && item) {
      await ShoppingItem.updateOne({ name: new RegExp(`^${item}$`, "i"), isCompleted: false }, { $set: { quantity } });
    } else if (intent === "SEARCH_PRODUCT" && item) {
      // Build dynamic catalog search query
      const searchQuery = { $text: { $search: item } };
      if (maxPrice) searchQuery.price = { $lte: maxPrice };
      if (brand) searchQuery.brand = new RegExp(brand, "i");

      searchResults = await Product.find(searchQuery).sort({ price: 1 }).limit(10);
    }

    // Fetch the updated list to send back
    const updatedList = await ShoppingItem.find({}).sort({ addedAt: -1 });

    // 5. Return structured command, updated list, and search results
    res.json({
      status: "success",
      data: parsedCommand,
      list: updatedList,
      searchResults
    });

  } catch (error) {
    console.error("Voice Command API Error:", error);
    res.status(500).json({
      status: "error",
      error: "SERVER_ERROR",
      message: "An internal server error occurred while processing the voice command."
    });
  }
});

export default router;
