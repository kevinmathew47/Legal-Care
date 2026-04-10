const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); 

const chatRoutes = require("./routes/chat.js");
const chat2Routes = require("./routes/chat2.js");
const mlRoutes = require("./routes/ml");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes);
app.use("/api", chat2Routes);
app.use("/api/ml", mlRoutes);

// Compatibility with Vercel routePrefix
app.use("/_/backend/api", chatRoutes);
app.use("/_/backend/api", chat2Routes);
app.use("/_/backend/api/ml", mlRoutes);

// Root health check for Vercel
app.get("/", (req, res) => {
  res.status(200).send("Legal Care Backend is running...");
});

// Environment variable check
if (!process.env.MONGODB_URI) {
  console.error("WARNING: MONGODB_URI is not defined in environment variables.");
}

const PORT = process.env.PORT || 5000;

// Connect to MongoDB (Non-blocking for server start)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err.message));

// Start listening immediately to satisfy Vercel health checks
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

module.exports = app;
