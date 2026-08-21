import mongoose from "mongoose";

const ShoppingHistorySchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  purchaseDate: { 
    type: Date, 
    default: Date.now 
  },
  frequencyCount: { 
    type: Number, 
    default: 1 
  }
});

// Index itemName for quick recommendations lookup
ShoppingHistorySchema.index({ itemName: 1 });

const ShoppingHistory = mongoose.model("ShoppingHistory", ShoppingHistorySchema);

export default ShoppingHistory;
