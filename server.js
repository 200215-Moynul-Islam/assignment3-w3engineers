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

app.get("/get-property", (req, res) => {
  const {
    "most-popular": mostPopular,
    "highest-price": highestPrice,
    "lowest-price": lowestPrice,
    limit,
  } = req.query;
  let filePath;
  if (mostPopular === "true") {
    filePath = path.join(__dirname, "data", "most_popular.json");
  } else if (highestPrice === "true") {
    filePath = path.join(__dirname, "data", "highest_price.json");
  } else if (lowestPrice === "true") {
    filePath = path.join(__dirname, "data", "lowest_price.json");
  } else {
    return res
      .status(400)
      .json({ error: "Please provide a valid query parameter" });
  }
  const rawData = fs.readFileSync(filePath, "utf-8");
  let properties = JSON.parse(rawData);

  // Limit the Result.Items array
  if (limit && properties.Result && properties.Result.Items) {
    properties.Result.Items = properties.Result.Items.slice(0, Number(limit));
  }

  res.json(properties);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
