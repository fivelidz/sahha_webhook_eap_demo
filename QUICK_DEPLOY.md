# ⚡ Quick Deploy Guide for website-deployment-manager

## 🎯 One-Line Summary
Deploy the Sahha EAP Dashboard (Next.js app) from `/home/fivelidz/sahha_work/sahha-marketing-intelligence/projects/EAP/deployment-package/sahha-eap-dashboard-fivelidz.tar.gz` to fivelidz.com/projects/

## 📦 What You're Deploying
- **Name**: Sahha EAP Dashboard
- **Type**: Next.js 14 application (needs Node.js runtime)
- **Size**: 24MB compressed
- **Location**: Ready at `deployment-package/sahha-eap-dashboard-fivelidz.tar.gz`

## 🚀 Fastest Deployment Path

```bash
# 1. Upload archive to server
scp -P [PORT] deployment-package/sahha-eap-dashboard-fivelidz.tar.gz [USER]@fivelidz.com:~/public_html/projects/

# 2. SSH to server and extract
ssh [USER]@fivelidz.com
cd ~/public_html/projects/
tar -xzf sahha-eap-dashboard-fivelidz.tar.gz
cd fivelidz-deploy

# 3. Install and run
npm install --production
nohup npm start > app.log 2>&1 &

# 4. Add to projects.html
```

## ⚠️ Critical Requirements
1. **Node.js 18+** must be installed on server
2. **Port 3000** (or configure custom port)
3. **Process manager** (PM2 preferred, or use nohup)

## 🔗 Final URLs
- Dashboard: `https://fivelidz.com/projects/sahha-eap-dashboard/`
- Test API: `https://fivelidz.com/projects/sahha-eap-dashboard/api/test-connection`

## ✅ Verification
1. Dashboard loads with demo data
2. Can toggle between Demo/API mode
3. Shows "57 profiles" when in API mode
4. MCP documentation page accessible

## 🆘 If Static Hosting Only
If SiteGround doesn't support Node.js apps, we can create a static export instead. Let me know and I'll generate static HTML files.

---
**Ready to deploy!** The package is fully tested and working.