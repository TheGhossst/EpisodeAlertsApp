/**
 * This script installs the necessary dependencies and runs the PWA asset generation.
 * To use this script, run: node scripts/setup-pwa.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert the current module URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SCRIPTS_DIR = __dirname;
const SVG_TO_PNG_SCRIPT = path.join(SCRIPTS_DIR, 'svg-to-png.js');
const GENERATE_PWA_ASSETS_SCRIPT = path.join(SCRIPTS_DIR, 'generate-pwa-assets.js');

// Function to run a command and log the output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Main function
async function setupPWA() {
  console.log('Setting up PWA assets...');
  
  // Install sharp if not already installed
  console.log('Installing dependencies...');
  if (!runCommand('npm install --save-dev sharp')) {
    console.error('Failed to install dependencies. Aborting.');
    return;
  }
  
  // Create directories if they don't exist
  const dirs = [
    path.join(__dirname, '../public'),
    path.join(__dirname, '../public/icons'),
    path.join(__dirname, '../public/splash'),
    path.join(__dirname, '../src/assets')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Convert SVG to PNG
  console.log('Converting SVG to PNG...');
  if (!runCommand(`node ${SVG_TO_PNG_SCRIPT}`)) {
    console.error('Failed to convert SVG to PNG. Aborting.');
    return;
  }
  
  // Generate PWA assets
  console.log('Generating PWA assets...');
  if (!runCommand(`node ${GENERATE_PWA_ASSETS_SCRIPT}`)) {
    console.error('Failed to generate PWA assets. Aborting.');
    return;
  }
  
  console.log('PWA setup completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Build your application: npm run build');
  console.log('2. Deploy to a HTTPS-enabled server');
  console.log('3. Test the PWA installation on your mobile device');
}

// Run the setup
setupPWA();