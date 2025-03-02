import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SVG_ICON = path.join(__dirname, '../src/assets/icon.svg');
const OUTPUT_FILE = path.join(__dirname, '../src/assets/icon.png');

// Convert SVG to PNG
async function convertSvgToPng() {
  console.log('Converting SVG to PNG...');

  try {
    if (!fs.existsSync(SVG_ICON)) {
      throw new Error(`SVG file not found: ${SVG_ICON}`);
    }

    // Convert SVG to PNG explicitly
    await sharp(SVG_ICON) // <- Load the file directly instead of using `fs.readFileSync`
      .resize(1024, 1024)
      .png()
      .toFile(OUTPUT_FILE);

    console.log(`SVG converted to PNG: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

// Run the converter
convertSvgToPng();