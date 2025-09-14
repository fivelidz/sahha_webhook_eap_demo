# Setting Up Secure Environment Variables in Vercel

## Quick Setup

1. **Go to your Vercel Dashboard**
   - Visit: https://vercel.com/fivelidz/eap-demo-sahha/settings/environment-variables

2. **Add the following Environment Variables:**

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `SAHHA_APP_ID` | `NqrB0AYlviHruQVbF0Cp5Jch2utzQNwe` | Production, Preview, Development |
   | `SAHHA_APP_SECRET` | `VsU94PUlVPj7LM9dFAZ4sHPRAYFqgtfmG0WuANKLErtQlbFk8LZNLHIJA1AEnbtC` | Production, Preview, Development |
   | `SAHHA_CLIENT_ID` | `tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW` | Production, Preview, Development |
   | `SAHHA_CLIENT_SECRET` | `uGJFFzeLuifFEHC2y3dgs6J3O2vui3eiptuxlH5D810DmS8NshymlIJUu14nZ3y8` | Production, Preview, Development |

3. **Click "Save" for each variable**

4. **Redeploy your application**
   - Go to the Deployments tab
   - Click the three dots on the latest deployment
   - Select "Redeploy"

## Security Benefits

- API keys are no longer visible in your GitHub repository
- Keys are encrypted in Vercel's infrastructure
- Different keys can be used for different environments
- Keys can be rotated without code changes

## Verifying the Setup

1. After redeployment, visit your app
2. Go to Profile Management
3. Toggle to "API" mode
4. If you see "57 profiles" loaded, the API is working correctly

## Troubleshooting

- **API not working?** Check the browser console for errors
- **403 Forbidden?** Verify the credentials are correct
- **Still showing demo data?** Clear browser cache and localStorage

## For Local Development

Create a `.env.local` file (never commit this!):

```bash
SAHHA_APP_ID=NqrB0AYlviHruQVbF0Cp5Jch2utzQNwe
SAHHA_APP_SECRET=VsU94PUlVPj7LM9dFAZ4sHPRAYFqgtfmG0WuANKLErtQlbFk8LZNLHIJA1AEnbtC
SAHHA_CLIENT_ID=tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW
SAHHA_CLIENT_SECRET=uGJFFzeLuifFEHC2y3dgs6J3O2vui3eiptuxlH5D810DmS8NshymlIJUu14nZ3y8
```

## Important Notes

- These are sandbox credentials for testing
- For production use, replace with your production Sahha credentials
- Never commit `.env.local` or any file with real credentials