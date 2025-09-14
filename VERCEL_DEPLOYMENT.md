# 🚀 Vercel Deployment Guide - Sahha EAP Dashboard

## Quick Deploy (2 Methods)

### Method 1: One-Click Deploy via GitHub (Recommended)

1. **Create GitHub Repository**
   ```bash
   cd /home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/EAP/deployment-package
   git init
   git add .
   git commit -m "Sahha EAP Dashboard - Production Ready"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sahha-eap-dashboard.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel auto-detects Next.js
   - Click "Deploy"
   - ✅ Done in 2-3 minutes!

### Method 2: Direct CLI Deploy (No GitHub Required)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from deployment-package folder**
   ```bash
   cd /home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/EAP/deployment-package
   vercel
   ```

3. **Follow prompts:**
   ```
   ? Set up and deploy "deployment-package"? [Y/n] Y
   ? Which scope do you want to deploy to? (Use arrow keys) [Select your account]
   ? Link to existing project? [y/N] N
   ? What's your project's name? sahha-eap-dashboard
   ? In which directory is your code located? ./
   ? Want to override the settings? [y/N] N
   ```

4. **Deployment starts automatically!**

## 🔐 Environment Variables (Already Configured!)

The `vercel.json` file already includes your Sahha sandbox credentials:
- ✅ SAHHA_APP_ID
- ✅ SAHHA_APP_SECRET  
- ✅ SAHHA_CLIENT_ID
- ✅ SAHHA_CLIENT_SECRET

No additional configuration needed!

## 🌐 Your URLs After Deployment

- **Production**: `https://sahha-eap-dashboard.vercel.app`
- **Preview**: `https://sahha-eap-dashboard-[hash].vercel.app`
- **API Status**: `https://sahha-eap-dashboard.vercel.app/api/test-connection`

## 📝 Add to fivelidz.com

Once deployed, add this to your projects page:

```html
<div class="project-card">
  <h3>Sahha EAP Dashboard</h3>
  <p>Enterprise wellness monitoring dashboard with real-time Sahha API integration.</p>
  <div class="project-links">
    <a href="https://sahha-eap-dashboard.vercel.app" target="_blank" class="btn btn-primary">
      View Live Dashboard
    </a>
    <a href="https://github.com/YOUR_USERNAME/sahha-eap-dashboard" target="_blank" class="btn btn-secondary">
      View Source
    </a>
  </div>
  <div class="project-tech">
    <span class="tech-badge">Next.js</span>
    <span class="tech-badge">React</span>
    <span class="tech-badge">TypeScript</span>
    <span class="tech-badge">Sahha API</span>
    <span class="tech-badge">Vercel</span>
  </div>
  <div class="project-features">
    <ul>
      <li>✅ Real Sahha API Integration (57 profiles)</li>
      <li>✅ Demo/API Mode Toggle</li>
      <li>✅ MCP Documentation for Claude Desktop</li>
      <li>✅ Responsive Design</li>
    </ul>
  </div>
</div>
```

## ✅ Features That Will Work on Vercel

- ✅ **Full API Integration** - All backend routes work
- ✅ **Real Sahha Data** - 57 sandbox profiles  
- ✅ **Demo/API Toggle** - Both modes functional
- ✅ **MCP Documentation** - Complete guide included
- ✅ **Auto-SSL** - HTTPS automatically configured
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Auto-scaling** - Handles traffic automatically

## 🎯 Deployment Checklist

- [ ] Run `vercel` command from deployment-package folder
- [ ] Wait 2-3 minutes for build
- [ ] Visit your new URL
- [ ] Test Demo mode works
- [ ] Toggle to API mode in Profile Management
- [ ] Verify "57 profiles" shows in API mode
- [ ] Add link to fivelidz.com

## 🆓 Vercel Free Tier Limits (More than enough!)

- **100GB Bandwidth** per month
- **Unlimited deployments**
- **Automatic HTTPS**
- **Serverless Functions** included
- **Custom domains** supported

## 🔧 Custom Domain (Optional)

To use `eap.fivelidz.com` or similar:
1. In Vercel dashboard → Settings → Domains
2. Add `eap.fivelidz.com`
3. Add CNAME record in your DNS:
   ```
   eap.fivelidz.com → cname.vercel-dns.com
   ```

## 📊 Monitor Your Dashboard

After deployment, you can:
- View analytics in Vercel dashboard
- See real-time logs
- Monitor API usage
- Track visitor metrics

---

**Ready to deploy!** Just run `vercel` from the deployment-package folder and you'll have a live URL in minutes!