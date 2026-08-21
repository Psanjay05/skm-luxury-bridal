import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBSITE_URL = "https://skm-luxury-bridal.vercel.app";
const OUTPUT_DIR = path.resolve(__dirname, "../public/images");

async function generateQRCodes() {
  console.log(`Generating QR Codes for: ${WEBSITE_URL}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. High Resolution PNG (1024x1024, High Error Correction)
  const pngPath = path.join(OUTPUT_DIR, "skm-qr-code.png");
  const pngAliasPath = path.join(OUTPUT_DIR, "qr-code.png");

  await QRCode.toFile(pngPath, WEBSITE_URL, {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#1c1917", // Rich luxury charcoal
      light: "#ffffff",
    },
  });

  fs.copyFileSync(pngPath, pngAliasPath);
  console.log(`✅ Saved High-Res PNG: ${pngPath}`);

  // 2. Scalable Vector Graphic (SVG)
  const svgPath = path.join(OUTPUT_DIR, "skm-qr-code.svg");
  const svgAliasPath = path.join(OUTPUT_DIR, "qr-code.svg");

  const svgString = await QRCode.toString(WEBSITE_URL, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#1c1917",
      light: "#ffffff",
    },
  });

  fs.writeFileSync(svgPath, svgString, "utf8");
  fs.copyFileSync(svgPath, svgAliasPath);
  console.log(`✅ Saved Crisp SVG: ${svgPath}`);

  console.log("\n🎉 QR Codes generated successfully!");
}

generateQRCodes().catch(console.error);
