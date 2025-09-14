# Sahha Webhook Setup Guide

## Current Status
- **Active Tunnel**: `https://stupid-shoes-tell.loca.lt`
- **Webhook Endpoint**: `https://stupid-shoes-tell.loca.lt/api/sahha/webhook`
- **Running in**: tmux session "tunnel"

## Option 1: Quick Start (LocalTunnel - Free, No Account)
```bash
# Run the tunnel manager script
./start-webhook-tunnel.sh

# This will:
# 1. Start a localtunnel on port 3000
# 2. Display the webhook URL
# 3. Auto-restart if it crashes
# 4. Monitor tunnel health
```

## Option 2: ngrok Setup (More Stable, Free Account Required)

### Step 1: Create Free ngrok Account
1. Go to https://dashboard.ngrok.com/signup
2. Sign up for a free account
3. Go to https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken

### Step 2: Configure ngrok
```bash
# Add your authtoken
ngrok config add-authtoken YOUR_TOKEN_HERE

# Test ngrok
./start-webhook-tunnel.sh ngrok
```

### Step 3: (Optional) Set up as System Service
```bash
# Copy service file to systemd directory
sudo cp sahha-webhook-tunnel.service /etc/systemd/system/

# Enable and start the service
sudo systemctl enable sahha-webhook-tunnel
sudo systemctl start sahha-webhook-tunnel

# Check status
sudo systemctl status sahha-webhook-tunnel

# View logs
journalctl -u sahha-webhook-tunnel -f
```

## Option 3: Permanent Solution (Cloudflare Tunnel - Free)

### Benefits:
- Permanent URL that never changes
- No need to keep terminal open
- Works through firewalls
- Free for personal use

### Setup:
1. Install cloudflared:
```bash
# For Arch/CachyOS
yay -S cloudflared

# Or download directly
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
```

2. Create tunnel:
```bash
# Login to Cloudflare (opens browser)
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create sahha-webhook

# Create config file
cat > ~/.cloudflared/config.yml << EOF
url: http://localhost:3000
tunnel: sahha-webhook
credentials-file: /home/fivelidz/.cloudflared/TUNNEL_ID.json
EOF

# Run tunnel
cloudflared tunnel run sahha-webhook
```

3. Get your permanent URL from Cloudflare dashboard

## Testing the Webhook

### With Signature Verification (Production)
```bash
curl -X POST YOUR_TUNNEL_URL/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Sahha-Signature: <valid-signature>" \
  -d '{"type":"wellbeing","score":0.75,"externalId":"test-001"}'
```

### Without Signature (Development Only)
```bash
curl -X POST YOUR_TUNNEL_URL/api/sahha/webhook \
  -H "Content-Type: application/json" \
  -H "X-Bypass-Signature: test" \
  -d '{"type":"wellbeing","score":0.75,"externalId":"test-001"}'
```

## Current Webhook Secret
```
CN6pV9ZGITXwj+/xAnrAQqZP4CQ+zp3tliNs8NO8EVc=
```

## Troubleshooting

### Check if tunnel is running
```bash
# For tmux session
tmux list-sessions
tmux attach -t tunnel

# For script
ps aux | grep tunnel
cat tunnel.pid
```

### View logs
```bash
tail -f tunnel.log
tail -f tunnel-service.log
```

### Restart tunnel
```bash
# Kill existing
pkill -f localtunnel
pkill -f ngrok

# Start new
./start-webhook-tunnel.sh
```

## Recommended: Use ngrok or Cloudflare Tunnel

LocalTunnel works but has limitations:
- URLs change frequently
- Can be unstable
- Requires password page on first visit

ngrok (free tier) provides:
- More stable connections
- Web interface for debugging (localhost:4040)
- 40 connections/minute limit
- Random URL each restart

Cloudflare Tunnel provides:
- Permanent URL
- Most stable option
- Free for personal use
- Best for production