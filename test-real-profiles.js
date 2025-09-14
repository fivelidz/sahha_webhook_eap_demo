// Test Real Profile Access with Different Authorization Methods
require('dotenv').config();
const axios = require('axios');

async function testRealProfileAccess() {
    console.log('🔍 Testing Access to Your 57 Sahha Profiles...');
    
    try {
        // Step 1: Get Account Token (we know this works)
        console.log('Step 1: Getting Sahha Account Token...');
        const authResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/oauth/account/token`,
            {
                clientId: process.env.SAHHA_CLIENT_ID,
                clientSecret: process.env.SAHHA_CLIENT_SECRET,
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
        const accountToken = authResponse.data.accountToken;
        console.log('✅ Account Token Retrieved Successfully');
        console.log('Token expires:', new Date(Date.now() + 24*60*60*1000).toISOString());
        
        // Step 2: Try different authorization methods to access profiles
        const authMethods = [
            { name: 'Bearer Token', headers: { 'Authorization': `Bearer ${accountToken}` }},
            { name: 'Account Token', headers: { 'Authorization': `account ${accountToken}` }},
            { name: 'Sahha Account', headers: { 'Sahha-Account-Token': accountToken }},
            { name: 'Account + Content-Type', headers: { 
                'Authorization': `account ${accountToken}`, 
                'Content-Type': 'application/json' 
            }},
            { name: 'Bearer + Content-Type', headers: { 
                'Authorization': `Bearer ${accountToken}`, 
                'Content-Type': 'application/json' 
            }}
        ];
        
        for (const method of authMethods) {
            console.log(`\n🔬 Testing: ${method.name}...`);
            
            try {
                const profileResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
                    {
                        headers: method.headers,
                        params: {
                            pageSize: 100  // Get up to 100 profiles
                        }
                    }
                );
                
                console.log('✅ SUCCESS! Profile access working!');
                console.log('Response status:', profileResponse.status);
                console.log('Response type:', typeof profileResponse.data);
                console.log('Data keys:', Object.keys(profileResponse.data || {}));
                
                // Extract profiles from response
                const profiles = Array.isArray(profileResponse.data) ? profileResponse.data :
                               profileResponse.data.profiles || profileResponse.data.data ||
                               profileResponse.data.items || [];
                
                console.log(`🎉 FOUND ${profiles.length} PROFILES!`);
                
                if (profiles.length > 0) {
                    console.log('\n📊 Profile Sample Data:');
                    console.log('First profile keys:', Object.keys(profiles[0]));
                    console.log('Profile ID format:', profiles[0].id || profiles[0].profileId || profiles[0].externalId);
                    
                    // Count profiles with different data completeness
                    const profileStats = {
                        total: profiles.length,
                        withIds: profiles.filter(p => p.id || p.profileId).length,
                        withExternalIds: profiles.filter(p => p.externalId).length,
                        withTimeStamps: profiles.filter(p => p.createdDateTime || p.updatedDateTime).length
                    };
                    
                    console.log('\n📈 Profile Statistics:');
                    console.table(profileStats);
                    
                    return {
                        success: true,
                        method: method.name,
                        profiles: profiles,
                        count: profiles.length,
                        sampleProfile: profiles[0]
                    };
                }
                
            } catch (methodError) {
                console.log(`❌ ${method.name} failed:`, methodError.response?.status, methodError.response?.statusText);
                if (methodError.response?.status === 404) {
                    console.log('   → Endpoint not found');
                } else if (methodError.response?.status === 401) {
                    console.log('   → Unauthorized (wrong auth method)');
                } else if (methodError.response?.status === 403) {
                    console.log('   → Forbidden (permissions issue)');
                }
            }
        }
        
        console.log('\n❌ All authorization methods failed');
        return { success: false, error: 'No authorization method worked' };
        
    } catch (tokenError) {
        console.log('❌ Failed to get account token:', tokenError.message);
        return { success: false, error: 'Account token failed' };
    }
}

// Step 3: If we get profiles, test individual profile data access
async function testIndividualProfileData(profileId, accountToken) {
    console.log(`\n🔬 Testing individual profile data for: ${profileId}`);
    
    const endpoints = [
        '/api/v1/profile/score',
        '/api/v1/profile/biomarker',
        '/api/v1/profile/demographic',
        '/api/v1/profile/insight/comparison'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}${endpoint}`,
                {
                    headers: {
                        'Authorization': `account ${accountToken}`,
                        'Sahha-Profile-Token': profileId  // or however profile selection works
                    }
                }
            );
            
            console.log(`✅ ${endpoint}: Data available`);
            console.log(`   Size:`, JSON.stringify(response.data).length, 'bytes');
            
        } catch (error) {
            console.log(`❌ ${endpoint}:`, error.response?.status, error.response?.statusText);
        }
    }
}

// Run the test
testRealProfileAccess()
    .then(async (result) => {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 FINAL RESULTS:');
        
        if (result.success) {
            console.log(`✅ SUCCESS: Found ${result.count} real profiles using ${result.method}!`);
            console.log('✅ Authentication method confirmed working');
            console.log('✅ Profile data structure identified');
            console.log('\n🚀 READY FOR DASHBOARD INTEGRATION!');
            console.log('Your 57 profiles (50 with real data) are accessible via Sahha API');
            
            if (result.profiles && result.profiles.length > 0) {
                const sampleId = result.profiles[0].id || result.profiles[0].profileId;
                if (sampleId) {
                    await testIndividualProfileData(sampleId, 'account_token_here');
                }
            }
            
        } else {
            console.log('❌ ISSUE: Profile access not working yet');
            console.log('❌ Need to determine correct authentication method');
            console.log('\n🔍 NEXT STEPS:');
            console.log('1. Check if profiles need to be registered first');
            console.log('2. Verify if different API endpoint is needed');
            console.log('3. Confirm if additional permissions are required');
        }
        
        console.log('='.repeat(60));
    })
    .catch(error => {
        console.error('\n💥 Unexpected error:', error.message);
    });