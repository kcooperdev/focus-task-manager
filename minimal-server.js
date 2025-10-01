const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Log startup
console.log("Starting server on port:", PORT);
console.log("Environment:", process.env.NODE_ENV);

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("Health check requested");
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Root endpoint
app.get("/", (req, res) => {
  console.log("Root endpoint requested");
  res.json({
    message: "Server is running!",
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://0.0.0.0:${PORT}/health`);
});

// Handle errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});





