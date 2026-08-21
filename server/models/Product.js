import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    index: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  brand: { 
    type: String, 
    default: null, 
    index: true 
  },
  size: { 
    type: String, 
    required: true 
  },
  dietary: { 
    type: [String], 
    default: [] 
  },
  seasons: { 
    type: [String], 
    default: [] 
  }
});

// Create a text index on name to allow text-search queries
ProductSchema.index({ name: "text" });

const Product = mongoose.model("Product", ProductSchema);

export default Product;
