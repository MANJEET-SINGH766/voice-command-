import express from "express";
import { z } from "zod";
import ShoppingItem from "../models/ShoppingItem.js";
import ShoppingHistory from "../models/ShoppingHistory.js";

const router = express.Router();

// Input validators
const ItemAddSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().default(1),
  unit: z.string().nullable().default(null),
  category: z.string().default("Other")
});

const ItemUpdateSchema = z.object({
  quantity: z.number().optional(),
  unit: z.string().nullable().optional(),
  isCompleted: z.boolean().optional()
});

// Helper to get list items
async function getActiveList(res) {
  try {
    const items = await ShoppingItem.find({}).sort({ addedAt: -1 });
    return res.json({ status: "success", data: items });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Failed to retrieve list items" });
  }
}

// 1. GET /api/list - Fetch shopping list
router.get("/", async (req, res) => {
  await getActiveList(res);
});

// 2. POST /api/list/item - Manual add
router.post("/item", async (req, res) => {
  try {
    const validation = ItemAddSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "fail", message: validation.error.errors[0].message });
    }

    const { name, quantity, unit, category } = validation.data;

    // Check if item already exists on list; if so, update quantity
    const existing = await ShoppingItem.findOne({ name: new RegExp(`^${name}$`, "i"), isCompleted: false });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      await ShoppingItem.create({ name, quantity, unit, category });
    }

    await getActiveList(res);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 3. PATCH /api/list/item/:id - Modify quantity or checkbox toggle
router.patch("/item/:id", async (req, res) => {
  try {
    const validation = ItemUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ status: "fail", message: validation.error.errors[0].message });
    }

    const item = await ShoppingItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "fail", message: "Item not found" });
    }

    // Apply updates
    if (validation.data.quantity !== undefined) item.quantity = validation.data.quantity;
    if (validation.data.unit !== undefined) item.unit = validation.data.unit;
    
    // Check toggle behavior
    if (validation.data.isCompleted !== undefined) {
      const wasCompleted = item.isCompleted;
      item.isCompleted = validation.data.isCompleted;

      // If toggled to completed, log it to ShoppingHistory for smart recommendations
      if (!wasCompleted && item.isCompleted) {
        await ShoppingHistory.findOneAndUpdate(
          { itemName: item.name.toLowerCase() },
          { 
            $inc: { frequencyCount: 1 }, 
            $set: { category: item.category, purchaseDate: new Date() } 
          },
          { upsert: true, new: true }
        );
      }
    }

    await item.save();
    await getActiveList(res);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 4. DELETE /api/list/item/:id - Remove item
router.delete("/item/:id", async (req, res) => {
  try {
    const item = await ShoppingItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ status: "fail", message: "Item not found" });
    }
    await getActiveList(res);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// 5. DELETE /api/list/clear - Wipe list
router.delete("/clear", async (req, res) => {
  try {
    await ShoppingItem.deleteMany({});
    await getActiveList(res);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
