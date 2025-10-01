const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Simple health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", port: PORT });
});

app.get("/", (req, res) => {
  res.json({ message: "Server is running!", port: PORT });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Test server running on port ${PORT}`);
});

