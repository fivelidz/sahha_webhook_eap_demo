#!/usr/bin/env node

/**
 * Export static files for deployment to fivelidz.com
 * This creates a standalone version that can be hosted on any static server
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing static export for fivelidz.com deployment...\n');

// Check if build exists
if (!fs.existsSync('.next')) {
  console.error('❌ Build directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Create export directory
const exportDir = path.join(__dirname, 'fivelidz-deploy');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

console.log('📦 Packaging deployment files...');

// Copy essential files
const filesToCopy = [
  { src: '.next', dest: 'fivelidz-deploy/.next' },
  { src: 'public', dest: 'fivelidz-deploy/public' },
  { src: 'package.json', dest: 'fivelidz-deploy/package.json' },
  { src: 'package-lock.json', dest: 'fivelidz-deploy/package-lock.json' },
  { src: 'next.config.js', dest: 'fivelidz-deploy/next.config.js' },
  { src: '.env.example', dest: 'fivelidz-deploy/.env.example' },
  { src: 'DEPLOYMENT_README.md', dest: 'fivelidz-deploy/README.md' }
];

// Copy files
filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, src);
  const destPath = path.join(__dirname, dest);
  
  if (fs.existsSync(srcPath)) {
    // Create destination directory
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy recursively if directory
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
    console.log(`✅ Copied ${src}`);
  } else {
    console.log(`⚠️  Skipped ${src} (not found)`);
  }
});

// Create deployment script
const deployScript = `#!/bin/bash
# Deployment script for fivelidz.com

echo "🚀 Deploying Sahha EAP Dashboard to fivelidz.com..."

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env

# Start the application
npm start

echo "✅ Deployment complete! Dashboard is running on port 3000"
`;

fs.writeFileSync(path.join(exportDir, 'deploy.sh'), deployScript);
fs.chmodSync(path.join(exportDir, 'deploy.sh'), '755');

// Create simple start script
const startScript = `{
  "name": "sahha-eap-dashboard",
  "version": "1.0.0",
  "scripts": {
    "start": "next start",
    "start:custom-port": "next start -p $PORT"
  }
}`;

// Update package.json for production
const packageJson = JSON.parse(fs.readFileSync(path.join(exportDir, 'package.json'), 'utf8'));
packageJson.scripts = {
  "start": "next start",
  "start:custom-port": "next start -p $PORT"
};
fs.writeFileSync(
  path.join(exportDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

console.log('\n✨ Static export complete!');
console.log('\n📂 Deployment package created at: fivelidz-deploy/');
console.log('\n📋 Next steps:');
console.log('1. Upload the fivelidz-deploy folder to your server');
console.log('2. Run: npm install --production');
console.log('3. Run: npm start');
console.log('\n🌐 The dashboard will be available at your configured domain');

// Helper function to copy directories recursively
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}