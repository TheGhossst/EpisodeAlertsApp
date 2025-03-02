/**
 * This script generates various sized PWA assets from the PNG icon.
 * It requires the sharp library to be installed: npm install --save-dev sharp
 * To use this script, run: node scripts/generate-pwa-assets.js
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_ICON = path.join(__dirname, '../src/assets/icon.png');
const ICONS_OUTPUT_DIR = path.join(__dirname, '../public/icons');
const SPLASH_OUTPUT_DIR = path.join(__dirname, '../public/splash');

// Icon sizes for different platforms
const ICON_SIZES = [
  16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512
];

// Splash screen sizes for iOS devices
const SPLASH_SCREENS = [
  { width: 320, height: 568 }, // iPhone 5/SE
  { width: 375, height: 667 }, // iPhone 6/7/8
  { width: 414, height: 896 }, // iPhone XR/XS Max
  { width: 390, height: 844 }, // iPhone 12/13
  { width: 428, height: 926 }, // iPhone 12/13 Pro Max
  { width: 768, height: 1024 }, // iPad
  { width: 834, height: 1194 }, // iPad Pro 11"
  { width: 1024, height: 1366 } // iPad Pro 12.9"
];

// Ensure output directories exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

// Generate icons of different sizes
async function generateIcons() {
  ensureDirectoryExists(ICONS_OUTPUT_DIR);
  
  console.log('Generating icons...');
  
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    try {
      await sharp(SOURCE_ICON)
        .resize(size, size)
        .toFile(outputPath);
      
      console.log(`Generated icon: ${outputPath}`);
    } catch (error) {
      console.error(`Error generating icon ${size}x${size}:`, error);
    }
  }
}

// Generate splash screens for different device sizes
async function generateSplashScreens() {
  ensureDirectoryExists(SPLASH_OUTPUT_DIR);
  
  console.log('Generating splash screens...');
  
  // Create a background for the splash screen
  const backgroundColor = '#7C3AED'; // Purple background matching the icon
  
  for (const screen of SPLASH_SCREENS) {
    const { width, height } = screen;
    const outputPath = path.join(SPLASH_OUTPUT_DIR, `splash-${width}x${height}.png`);
    
    try {
      // Create a blank canvas with the background color
      const canvas = sharp({
        create: {
          width,
          height,
          channels: 4,
          background: backgroundColor
        }
      });
      
      // Calculate icon size (50% of the smallest dimension)
      const iconSize = Math.min(width, height) * 0.5;
      
      // Resize the icon
      const resizedIcon = await sharp(SOURCE_ICON)
        .resize(Math.round(iconSize), Math.round(iconSize))
        .toBuffer();
      
      // Composite the icon onto the center of the canvas
      await canvas
        .composite([
          {
            input: resizedIcon,
            gravity: 'center'
          }
        ])
        .toFile(outputPath);
      
      console.log(`Generated splash screen: ${outputPath}`);
    } catch (error) {
      console.error(`Error generating splash screen ${width}x${height}:`, error);
    }
  }
}

// Main function
async function generatePWAAssets() {
  try {
    // Check if source icon exists
    if (!fs.existsSync(SOURCE_ICON)) {
      console.error(`Source icon not found: ${SOURCE_ICON}`);
      console.error('Please run the svg-to-png.js script first.');
      return;
    }
    
    await generateIcons();
    await generateSplashScreens();
    
    console.log('PWA assets generation completed successfully!');
  } catch (error) {
    console.error('Error generating PWA assets:', error);
  }
}

// Run the generator
generatePWAAssets();
