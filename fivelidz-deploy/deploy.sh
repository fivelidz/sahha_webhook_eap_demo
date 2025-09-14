#!/bin/bash
# Deployment script for fivelidz.com

echo "🚀 Deploying Sahha EAP Dashboard to fivelidz.com..."

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env

# Start the application
npm start

echo "✅ Deployment complete! Dashboard is running on port 3000"
