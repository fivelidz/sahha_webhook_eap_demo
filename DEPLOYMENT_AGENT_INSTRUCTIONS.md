# 🚀 Deployment Agent Instructions - Sahha EAP Dashboard

## Overview
This document contains complete instructions for the website-deployment-manager agent to deploy the Sahha EAP Dashboard to fivelidz.com.

## Package Location
**Ready-to-deploy archive**: `/home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/EAP/deployment-package/sahha-eap-dashboard-fivelidz.tar.gz`

## Deployment Target
- **Website**: fivelidz.com
- **Section**: Projects section
- **Project Name**: Sahha EAP Dashboard
- **Project Type**: Full-stack Next.js web application

## Pre-Deployment Checklist
- [x] Production build completed successfully
- [x] All TypeScript errors resolved
- [x] API integration tested and working
- [x] Demo mode functional
- [x] MCP documentation included
- [x] Archive created (24MB)

## Deployment Steps

### 1. SSH Connection to SiteGround
```bash
ssh -p 18765 u1234567@fivelidz.com
# Or use the specific SiteGround server details
```

### 2. Navigate to Projects Directory
```bash
cd ~/public_html/projects/
# Create directory for the EAP dashboard
mkdir -p sahha-eap-dashboard
cd sahha-eap-dashboard
```

### 3. Upload the Archive
Upload the tarball from local machine:
```bash
# From local machine:
scp -P 18765 /home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/EAP/deployment-package/sahha-eap-dashboard-fivelidz.tar.gz u1234567@fivelidz.com:~/public_html/projects/sahha-eap-dashboard/
```

### 4. Extract and Setup
```bash
# On server:
tar -xzf sahha-eap-dashboard-fivelidz.tar.gz
cd fivelidz-deploy

# Install Node.js dependencies
npm install --production

# Copy environment template
cp .env.example .env
```

### 5. Configure Environment
Edit `.env` file with production credentials:
```env
# Sahha API Credentials (Sandbox)
SAHHA_APP_ID=NqrB0AYlviHruQVbF0Cp5Jch2utzQNwe
SAHHA_APP_SECRET=VsU94PUlVPj7LM9dFAZ4sHPRAYFqgtfmG0WuANKLErtQlbFk8LZNLHIJA1AEnbtC
SAHHA_CLIENT_ID=tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW
SAHHA_CLIENT_SECRET=uGJFFzeLuifFEHC2y3dgs6J3O2vui3eiptuxlH5D810DmS8NshymlIJUu14nZ3y8

# Optional: Set custom port if needed
PORT=3000
```

### 6. Set Up Process Management
Since this is a Node.js app, we need it to run persistently:

```bash
# Using PM2 (if available on SiteGround)
pm2 start npm --name "sahha-eap" -- start
pm2 save
pm2 startup

# Or using a simple background process
nohup npm start > dashboard.log 2>&1 &
```

### 7. Configure Reverse Proxy (if needed)
If running on a non-standard port, set up Apache/Nginx proxy:

For Apache `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/projects/sahha-eap-dashboard
RewriteRule ^projects/sahha-eap-dashboard/(.*)$ http://localhost:3000/$1 [P,L]
```

### 8. Update Projects Page
Add entry to `projects.html`:
```html
<div class="project-card">
  <h3>Sahha EAP Dashboard</h3>
  <p>Enterprise wellness monitoring dashboard integrating Sahha's health intelligence API. Features real-time wellness tracking, behavioral analytics, and MCP integration for Claude Desktop.</p>
  <div class="project-links">
    <a href="/projects/sahha-eap-dashboard/" class="btn btn-primary">View Dashboard</a>
    <a href="/projects/sahha-eap-dashboard/docs" class="btn btn-secondary">Documentation</a>
  </div>
  <div class="project-tech">
    <span class="tech-badge">Next.js</span>
    <span class="tech-badge">React</span>
    <span class="tech-badge">TypeScript</span>
    <span class="tech-badge">Sahha API</span>
    <span class="tech-badge">MUI</span>
  </div>
</div>
```

## Important URLs After Deployment
- **Dashboard**: `https://fivelidz.com/projects/sahha-eap-dashboard/`
- **API Status**: `https://fivelidz.com/projects/sahha-eap-dashboard/api/test-connection`
- **MCP Guide**: `https://fivelidz.com/projects/sahha-eap-dashboard/#mcp-integration`

## Features to Highlight
1. **Demo Mode** - Works without credentials for showcase
2. **API Integration** - Live connection to Sahha sandbox (57 profiles)
3. **MCP Documentation** - Full guide for Claude Desktop integration
4. **Responsive Design** - Works on all devices
5. **Real-time Analytics** - Wellness monitoring dashboard

## Troubleshooting

### If the app doesn't start:
```bash
# Check Node.js version (needs 18+)
node --version

# Check for port conflicts
netstat -tulpn | grep 3000

# Review logs
tail -f dashboard.log
```

### If API calls fail:
- Verify `.env` file has correct credentials
- Check network connectivity to sandbox-api.sahha.ai
- Review browser console for CORS issues

### Database Not Required
This dashboard uses Sahha's API directly and doesn't need a local database.

## Security Notes
- The provided credentials are SANDBOX only (safe for demo)
- No personal data is stored locally
- All API calls use HTTPS
- Session data is temporary

## Post-Deployment Verification
1. Visit the dashboard URL
2. Verify demo data loads
3. Test API/Demo toggle in Profile Management
4. Check that all pages render correctly
5. Verify MCP documentation page displays

## Rollback Plan
If issues occur:
```bash
# Stop the current process
pm2 stop sahha-eap
# or
pkill -f "npm start"

# Restore previous version if needed
cd ~/public_html/projects/
mv sahha-eap-dashboard sahha-eap-dashboard.backup
# Restore from backup
```

## Contact for Issues
- **Dashboard created by**: Claude (this session)
- **Location of source**: `/home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/EAP/`
- **Archive location**: `/home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/EAP/deployment-package/sahha-eap-dashboard-fivelidz.tar.gz`

## Summary for Agent
This is a standalone Next.js application that needs:
1. Node.js environment
2. Port 3000 (or custom)
3. Process management (PM2 or nohup)
4. Possible reverse proxy configuration
5. Addition to projects.html page

The dashboard is fully functional and tested. It includes both demo mode and real API integration with Sahha's wellness platform.

---
**Created**: January 10, 2025
**Package Size**: 24MB
**Technology**: Next.js 14.2.32, React 18, TypeScript, Material-UI