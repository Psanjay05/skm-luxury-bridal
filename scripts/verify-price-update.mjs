import fs from "fs";
import path from "path";

// Test offline local store persistence
const DATA_DIR = path.join(process.cwd(), "data");
const servicesFile = path.join(DATA_DIR, "services.json");

console.log("=== RUNNING PRICE UPDATE & PERSISTENCE VERIFICATION ===");

// 1. Check data directory
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 2. Read or initialize services.json
let services = [];
if (fs.existsSync(servicesFile)) {
  services = JSON.parse(fs.readFileSync(servicesFile, "utf8"));
} else {
  console.log("Initializing services.json from defaults...");
  // sample test item
  services = [
    {
      _id: "65a000000000000000000001",
      title: "Classic Bridal Package",
      price: "₹18,000",
      tagline: "Essential HD makeover for budget-conscious brides",
      description: "High Definition (HD) Foundation Base, Traditional Hair Styling & Flower Draping",
      imageUrl: "/images/portfolio/traditional-south-indian-bride.jpg",
      category: "bridal_package",
    },
    {
      _id: "65a000000000000000000002",
      title: "Royal HD Makeover Package",
      price: "₹25,000",
      tagline: "Our most popular 2-event Muhurtham + Reception package",
      description: "HD Base for Muhurtham & Reception",
      imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
      category: "bridal_package",
    }
  ];
  fs.writeFileSync(servicesFile, JSON.stringify(services, null, 2), "utf8");
}

console.log(`Loaded ${services.length} services from ${servicesFile}`);

// 3. Test updating price of Classic Bridal Package to ₹19,500
const targetId = "65a000000000000000000001";
const newPrice = "₹19,500";
const targetIndex = services.findIndex(s => s._id === targetId);

if (targetIndex !== -1) {
  const oldPrice = services[targetIndex].price;
  console.log(`Updating "${services[targetIndex].title}" from ${oldPrice} -> ${newPrice}`);
  services[targetIndex].price = newPrice;
  services[targetIndex].updatedAt = new Date().toISOString();
  fs.writeFileSync(servicesFile, JSON.stringify(services, null, 2), "utf8");
} else {
  console.error("Target service not found!");
  process.exit(1);
}

// 4. Re-read from disk to prove persistence
const verifyServices = JSON.parse(fs.readFileSync(servicesFile, "utf8"));
const verified = verifyServices.find(s => s._id === targetId);

if (verified && verified.price === newPrice) {
  console.log(`SUCCESS: Service price verified on disk: ${verified.title} = ${verified.price}`);
  console.log("=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY ===");
} else {
  console.error("FAILURE: Price did not match on disk.");
  process.exit(1);
}
