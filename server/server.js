import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import voiceRouter from "./routes/voice.js";
import listRouter from "./routes/list.js";
import productRouter from "./routes/products.js";
import suggestionsRouter from "./routes/suggestions.js";

// Load configuration variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS middleware so our React client can talk to the backend
app.use(cors());

// Enable JSON parser middleware to read request payloads
app.use(express.json());

// Register API Routes
app.use("/api/voice", voiceRouter);
app.use("/api/list", listRouter);
app.use("/api/products", productRouter);
app.use("/api/suggestions", suggestionsRouter);

// Base health-check route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Voice Command Shopping Assistant API is running!"
  });
});

// Start listening for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
