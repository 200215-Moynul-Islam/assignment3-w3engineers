const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Serve frontend files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Serve images folder
app.use("/images", express.static(path.join(__dirname, "images")));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Return image URLs
app.get("/images", (req, res) => {
  const imagesDir = path.join(__dirname, "images/sanctuary-cap-cana");
  const fileNames = fs.readdirSync(imagesDir);
  const imageUrls = fileNames.map(
    (fileName) => `/images/santuary-cap-cana/${fileName}`
  );

  res.json(imageUrls);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
