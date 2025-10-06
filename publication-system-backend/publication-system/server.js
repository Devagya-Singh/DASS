require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // your frontend dev URL
  credentials: true,
}));

// Serve static files from the "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    // Start the server only when NOT in test mode
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
const publicationRoutes = require("./routes/publications");
const userRoutes = require("./routes/user");
const conferenceRoutes = require("./routes/conference");

app.use("/publications", publicationRoutes);
app.use("/users", userRoutes);
app.use("/conference", conferenceRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the Publication Management System API");
});

// Export the app instance for testing
module.exports = app;
