const express = require("express");
const path = require("path");
const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config();

const app = express();

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
    (fileName) => `/images/sanctuary-cap-cana/${fileName}`
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
  let data = JSON.parse(rawData);

  // Limit the Result.Items array
  if (limit && data.Result && data.Result.Items) {
    data.Result.Items = data.Result.Items.slice(0, Number(limit));
  }

  res.json(data);
});

app.get("/maps-api", (req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (!key) {
    return res.status(500).send("Google Maps API key is not configured.");
  }

  const mapsUrl =
    `https://maps.googleapis.com/maps/api/js` +
    `?key=${key}` +
    `&callback=initGoogleMap` +
    `&libraries=marker` +
    `&v=beta` +
    `&loading=async`;
  res.redirect(302, mapsUrl);
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running at ${process.env.BASE_URL}`);
});
