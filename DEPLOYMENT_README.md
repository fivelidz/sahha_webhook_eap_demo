# Sahha EAP Dashboard - Deployment Package

## 🚀 Quick Start

This is a production-ready deployment package for the Sahha Employee Assistance Program (EAP) Dashboard.

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A web server (Apache, Nginx, or Node.js hosting)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Copy `.env.example` to `.env` and add your Sahha credentials:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
SAHHA_APP_ID=your_app_id
SAHHA_APP_SECRET=your_app_secret
SAHHA_CLIENT_ID=your_client_id
SAHHA_CLIENT_SECRET=your_client_secret
```

3. **Build for production:**
```bash
npm run build
```

4. **Start the server:**
```bash
npm start
```

The dashboard will be available at `http://localhost:3000`

## 📦 What's Included

- **Full EAP Dashboard** - Complete wellness monitoring interface
- **Demo Mode** - Works without API credentials for testing
- **API Integration** - Ready to connect to real Sahha data
- **MCP Documentation** - Guide for Claude Desktop integration
- **All Components:**
  - Executive Overview
  - Profile Management
  - Wellness Analytics
  - Activity Tracking
  - Sleep Analysis
  - Mental Health Monitoring
  - Behavioral Intelligence
  - API Key Manager

## 🔧 Configuration

### API Mode vs Demo Mode

The dashboard defaults to Demo mode. To switch to API mode:

1. Go to Profile Management page
2. Click the toggle switch from "Demo" to "API"
3. Enter your Sahha credentials (or use the defaults for sandbox)
4. The dashboard will now fetch real data from Sahha

### Default Sandbox Credentials

For testing with Sahha's sandbox environment:
- App ID: `NqrB0AYlviHruQVbF0Cp5Jch2utzQNwe`
- Client ID: `tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW`

## 🌐 Deployment Options

### Option 1: Static Export (Recommended for fivelidz.com)

```bash
npm run build
npm run export
```

This creates a `out/` directory with static files that can be uploaded to any web server.

### Option 2: Node.js Server

```bash
npm run build
npm start
```

### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

### Option 4: Vercel/Netlify

Simply connect your repository and deploy. The build commands are already configured.

## 📱 Features

- **Real-time Wellness Monitoring** - Track employee wellbeing metrics
- **Department Analytics** - Compare wellness across teams
- **Risk Detection** - Identify burnout and stress indicators
- **Behavioral Archetypes** - Understand employee wellness patterns
- **Privacy-First** - All data handling follows best practices
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🔒 Security

- All API credentials are stored securely
- Data is fetched over HTTPS only
- No personal data is stored locally
- Session-based authentication
- GDPR compliant data handling

## 📊 API Endpoints

The dashboard includes the following API routes:

- `/api/sahha/profiles` - Fetch employee profiles
- `/api/sahha/organization-metrics` - Get org-wide metrics
- `/api/sahha/demographics` - Demographic information
- `/api/sahha/device-information` - Device data
- `/api/sahha/scores/progressive` - Wellness scores

## 🛠️ Troubleshooting

### Dashboard shows no data
- Check API credentials in `.env`
- Verify network connectivity
- Try switching to Demo mode first

### Build errors
- Ensure Node.js 18+ is installed
- Delete `node_modules` and reinstall
- Clear Next.js cache: `rm -rf .next`

### API connection issues
- Verify credentials are correct
- Check if using sandbox vs production API
- Review console logs for specific errors

## 📝 License

This dashboard is provided as part of the Sahha EAP solution. All rights reserved.

## 🤝 Support

For support, please contact:
- Technical issues: Check the console logs
- API issues: Verify credentials and network
- General questions: Refer to the Dashboard Guide in the app

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Compatible with:** Sahha API v1