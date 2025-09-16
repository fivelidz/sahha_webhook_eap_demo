# Sahha EAP Dashboard Demo

A comprehensive Employee Assistance Program (EAP) dashboard showcasing Sahha's behavioral intelligence and wellness tracking capabilities with demo data.

## 🚀 Live Demo

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://sahha-webhook-eap-demo.vercel.app/dashboard)
[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge)](https://sahha-webhook-eap-demo.vercel.app/dashboard)

**🌐 [View Live Demo →](https://sahha-webhook-eap-demo.vercel.app/dashboard)**

### Quick Links:
- 📊 [Executive Dashboard](https://sahha-webhook-eap-demo.vercel.app/dashboard) - Main analytics dashboard
- 📚 [Dashboard Guide](https://sahha-webhook-eap-demo.vercel.app/dashboard-guide) - User guide for EAP managers
- 🔧 [Technical Documentation](https://sahha-webhook-eap-demo.vercel.app/mcp-guide) - Webhook integration guide

### Mobile Friendly
📱 **Fully responsive** - Works perfectly on phones, tablets, and desktops

## Features

- 🔄 **Real-time Webhook Integration** - Receive live data from Sahha
- 🎯 **Adaptive Configuration** - Easy setup for any organization
- 📊 **Comprehensive Dashboard** - View mental wellbeing, activity, sleep, and readiness scores
- 🔒 **Secure** - Webhook signature verification
- 📱 **Responsive** - Works on all devices
- 🎨 **Modern UI** - Built with Next.js and Material-UI

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Set Up Webhook
Visit http://localhost:3000/setup and follow the wizard to:
- Set up a tunnel (ngrok/localtunnel)
- Configure your Sahha webhook
- Test the connection

## Project Structure

```
├── app/
│   ├── api/
│   │   └── sahha/
│   │       ├── webhook/    # Webhook receiver endpoint
│   │       ├── config/     # Configuration API
│   │       └── test/       # Test endpoints
│   ├── dashboard/          # Main dashboard page
│   └── setup/             # Setup wizard page
├── components/
│   └── ProfileManagerWebhook.tsx  # Main dashboard component
├── lib/
│   ├── webhook-storage.ts        # Data persistence
│   └── webhook-integration.ts    # Data formatting utilities
```

## Webhook Setup Guide

### Option 1: Using ngrok (Recommended)

1. Install ngrok:
```bash
npm install -g ngrok
```

2. Start ngrok:
```bash
ngrok http 3000
```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Option 2: Using localtunnel

1. Run localtunnel:
```bash
npx localtunnel --port 3000
```

2. Copy the URL (e.g., `https://xyz.loca.lt`)

### Configure Sahha Webhook

1. Go to your Sahha Dashboard
2. Navigate to Settings → Webhooks
3. Add new webhook with:
   - URL: `https://your-tunnel.ngrok.io/api/sahha/webhook`
   - Events: Score Created, Biomarker Created
   - Secret: (Generated in setup wizard)

## API Endpoints

### Webhook Receiver
- **POST** `/api/sahha/webhook` - Receives Sahha webhook events
- **GET** `/api/sahha/webhook` - Retrieves stored profile data

### Configuration
- **GET** `/api/sahha/config` - Check current configuration
- **POST** `/api/sahha/config` - Save webhook configuration

## Environment Variables

Create a `.env.local` file:

```env
# Webhook secret from Sahha
SAHHA_WEBHOOK_SECRET=your-webhook-secret-here

# Optional: Default tunnel URL
DEFAULT_TUNNEL_URL=https://your-app.ngrok.io
```

## Data Storage

The application stores webhook data locally in the `/data` directory:
- `sahha-webhook-data.json` - Profile data
- `webhook-config.json` - Configuration
- `webhook-activity.log` - Activity log

For production, consider using a database like PostgreSQL or MongoDB.

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- AWS
- Google Cloud
- Azure
- Heroku
- DigitalOcean

## Security

- ✅ Webhook signature verification
- ✅ HTTPS only for webhooks
- ✅ Environment variable for secrets
- ✅ Input validation
- ✅ File locking for concurrent writes

## Troubleshooting

### Webhook not receiving data
1. Check tunnel is running
2. Verify webhook URL in Sahha dashboard
3. Check webhook secret matches
4. Look at `/data/webhook-activity.log`

### Data not displaying
1. Check `/data/sahha-webhook-data.json` exists
2. Verify data format matches expected structure
3. Check browser console for errors

## Demo Data

This demo includes:
- **57 employee profiles** with complete wellness scores
- **5 departments**: Tech (20), Sales (11), Operations (11), Admin (9), Unassigned (6)
- **15+ behavioral archetypes** including sleep patterns, activity levels, and stress responses
- **Real-time updates** every 30 seconds
- **Department analytics** with heat maps and trend analysis

## Contributing

Pull requests are welcome! Please open an issue first to discuss changes.

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Contact Sahha support for API questions: support@sahha.ai
- Check Sahha documentation at https://docs.sahha.ai

---

**Built with ❤️ using [Sahha](https://sahha.ai) behavioral intelligence platform**