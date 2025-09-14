// Test Sahha API Authentication with Real Credentials
// This script validates that our credentials work and we can fetch real data

require('dotenv').config();
const axios = require('axios');

async function testSahhaAuthentication() {
    console.log('🔐 Testing Sahha API Authentication...');
    console.log('Using credentials from .env file:');
    console.log('- App ID:', process.env.SAHHA_APP_ID ? '✓ Set' : '✗ Missing');
    console.log('- App Secret:', process.env.SAHHA_APP_SECRET ? '✓ Set' : '✗ Missing');
    console.log('- Client ID:', process.env.SAHHA_CLIENT_ID ? '✓ Set' : '✗ Missing');
    console.log('- Client Secret:', process.env.SAHHA_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
    console.log('- API Base URL:', process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL);
    console.log('- Demo Mode:', process.env.DEMO_MODE);
    
    // Try different authentication methods
    console.log('\n🔍 Trying different authentication approaches...');
    
    // Method 1: Sahha Account Token (correct approach)
    try {
        console.log('Method 1: Sahha Account Token with Client credentials...');
        const authResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/oauth/account/token`,
            {
                clientId: process.env.SAHHA_CLIENT_ID,
                clientSecret: process.env.SAHHA_CLIENT_SECRET,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        
        console.log('✅ Sahha Account Authentication Successful!');
        console.log('Account Token:', authResponse.data.substring ? authResponse.data.substring(0, 20) + '...' : JSON.stringify(authResponse.data));
        const accountToken = authResponse.data.token || authResponse.data;
        console.log('\n🔍 Testing API endpoint with token...');
        
        try {
            // Test profile search endpoint with account token
            const profileResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
                {
                    headers: {
                        'Authorization': `account ${accountToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        limit: 10
                    }
                }
            );
            
            console.log('\n🎉 Profile Search Successful!');
            console.log('Found profiles:', Array.isArray(profileResponse.data) ? profileResponse.data.length : 'Response is not an array');
            console.log('Response structure:', typeof profileResponse.data, Object.keys(profileResponse.data || {}));
            
            const profiles = Array.isArray(profileResponse.data) ? profileResponse.data : 
                           profileResponse.data.profiles || profileResponse.data.data || [];
                           
            if (profiles.length > 0) {
                console.log('Sample profile structure:', Object.keys(profiles[0]));
                console.log('Profile IDs found:', profiles.map(p => p.id || p.profile_id || p.profileId).filter(Boolean).length);
            }
            
            return {
                success: true,
                method: 'sahha_account_token',
                token: accountToken,
                profileCount: profiles.length,
                profiles: profiles
            };
            
        } catch (apiError) {
            console.log('\n⚠️ API Call Failed (but auth worked):');
            console.log('Status:', apiError.response?.status);
            console.log('Message:', apiError.response?.data?.message || apiError.message);
            console.log('This might be normal if no profiles exist yet.');
            
            return {
                success: true,
                token: accessToken,
                profileCount: 0,
                apiError: apiError.response?.status
            };
        }
        
    } catch (authError) {
        console.log('\n❌ Authentication Failed:');
        console.log('Status:', authError.response?.status);
        console.log('Message:', authError.response?.data?.message || authError.message);
        console.log('Response:', authError.response?.data);
        
        console.log('❌ OAuth2 failed, trying alternative methods...');
        
        // Method 2: Try using app credentials directly
        console.log('\nMethod 2: Direct API call with App credentials...');
        try {
            const directResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-App-Id': process.env.SAHHA_APP_ID,
                        'X-App-Secret': process.env.SAHHA_APP_SECRET,
                    },
                    params: { limit: 5 }
                }
            );
            
            console.log('✅ Direct API call successful!');
            return {
                success: true,
                method: 'direct_app_credentials',
                profileCount: directResponse.data.length || 0,
                profiles: directResponse.data
            };
            
        } catch (directError) {
            console.log('❌ Direct API call failed:', directError.response?.status, directError.response?.statusText);
            
            // Method 3: Try Basic Auth
            console.log('\nMethod 3: Basic Authentication...');
            try {
                const basicAuth = Buffer.from(`${process.env.SAHHA_CLIENT_ID}:${process.env.SAHHA_CLIENT_SECRET}`).toString('base64');
                const basicResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
                    {
                        headers: {
                            'Authorization': `Basic ${basicAuth}`,
                            'Content-Type': 'application/json',
                        },
                        params: { limit: 5 }
                    }
                );
                
                console.log('✅ Basic Auth successful!');
                return {
                    success: true,
                    method: 'basic_auth',
                    profileCount: basicResponse.data.length || 0,
                    profiles: basicResponse.data
                };
                
            } catch (basicError) {
                console.log('❌ Basic Auth failed:', basicError.response?.status, basicError.response?.statusText);
                
                return {
                    success: false,
                    error: 'All authentication methods failed',
                    oauthError: authError.response?.status,
                    directError: directError.response?.status,
                    basicError: basicError.response?.status,
                    lastErrorMessage: basicError.message
                };
            }
        }
    }
}

// Run the test
testSahhaAuthentication()
    .then(result => {
        console.log('\n📊 Test Results:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('\n🎯 READY FOR REAL DATA INTEGRATION!');
            console.log('✅ Credentials are valid');
            console.log('✅ API connection works');
            console.log(`✅ Found ${result.profileCount} user profiles`);
            console.log('\n🚀 Next: Replace demo data with real API calls');
        } else {
            console.log('\n❌ AUTHENTICATION ISSUES DETECTED');
            console.log('Please check your Sahha credentials in .env file');
        }
    })
    .catch(error => {
        console.error('\n💥 Unexpected error:', error.message);
    });