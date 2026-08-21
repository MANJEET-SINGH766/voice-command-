import mongoose from "mongoose";

const ShoppingItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    default: 1 
  },
  unit: { 
    type: String, 
    default: null 
  },
  category: { 
    type: String, 
    required: true, 
    default: "Other" 
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const ShoppingItem = mongoose.model("ShoppingItem", ShoppingItemSchema);

export default ShoppingItem;
