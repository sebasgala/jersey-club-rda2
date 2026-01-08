const fs = require("fs");
const path = require("path");

// Define the directory containing images
const IMAGES_DIR = path.join(__dirname, "../public/assets/images");
const OUTPUT_FILE = path.join(__dirname, "../src/data/footballProducts.js");

// Expanded keywords to identify football-related images
const FOOTBALL_KEYWORDS = [
  "fútbol", "football", "soccer", "milan", "barcelona", "real madrid", "arsenal",
  "bayern", "manchester", "inter", "juventus", "argentina", "alemania", "aucas",
  "ecuador", "retro", "local", "visitante", "home", "away"
];

// Helper function to normalize filenames
function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\.(png|jpg|jpeg|webp)$/i, "");
}

// Helper function to check if a filename matches football keywords
function isFootballJersey(filename) {
  const normalized = normalize(filename);
  return FOOTBALL_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

// Generate product data from image files
function generateFootballProducts() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR);
  const footballProducts = files
    .filter((file) => file.endsWith(".png") || file.endsWith(".jpg"))
    .map((file) => {
      const title = normalize(file)
        .replace(/\b\w/g, (char) => char.toUpperCase());

      // Assign prices based on seasonality
      const isCurrentSeason = title.includes("2025") || title.includes("2026");
      const price = isCurrentSeason ? 60 : 45;
      const isOnSale = price === 45;

      return {
        title,
        image: `/assets/images/${file}`,
        price: `$${price}.00`,
        isOnSale
      };
    })
    .filter(product => isFootballJersey(product.title)); // Filter only football-related products

  const outputContent = `// Auto-generated file. Do not edit manually.
const footballProducts = ${JSON.stringify(footballProducts, null, 2)};

export default footballProducts;
`;

  fs.writeFileSync(OUTPUT_FILE, outputContent, "utf-8");
  console.log(`Football products data generated: ${OUTPUT_FILE}`);
}

generateFootballProducts();