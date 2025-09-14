# Setting Up ngrok - Quick Guide

## Step 1: Create Free Account (2 minutes)
1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with your email
3. Verify your email

## Step 2: Get Your Auth Token
1. After login, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy the token (it looks like: `2pxBP5Nt9gOlSxYKNkfaH7VzXHf_...`)

## Step 3: Configure ngrok
Run this command with YOUR token:
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

## Step 4: Start ngrok
```bash
ngrok http 3000
```

This will give you a permanent session that stays up for 8 hours on the free plan.

---

**Note**: The free plan includes:
- 1 online ngrok agent
- 40 connections per minute
- Random URL (changes each restart)
- 8 hour session limit

For testing, this is perfect!