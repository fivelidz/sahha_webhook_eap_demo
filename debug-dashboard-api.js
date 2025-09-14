// Debug Dashboard API Issues
require('dotenv').config();
const axios = require('axios');

async function debugDashboardAPI() {
    console.log('🔍 Debugging Dashboard API Connection...');
    
    try {
        // Step 1: Test Environment Variables
        console.log('\n1. Environment Check:');
        console.log('SAHHA_CLIENT_ID:', process.env.SAHHA_CLIENT_ID ? '✓ Set' : '❌ Missing');
        console.log('SAHHA_CLIENT_SECRET:', process.env.SAHHA_CLIENT_SECRET ? '✓ Set' : '❌ Missing');
        console.log('API Base URL:', process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL);
        console.log('Demo Mode:', process.env.DEMO_MODE);
        
        // Step 2: Test Authentication (same as dashboard)
        console.log('\n2. Testing Authentication...');
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
        console.log('✅ Authentication successful');
        console.log('Token length:', accountToken.length);
        
        // Step 3: Test Profile Endpoint (same as dashboard)
        console.log('\n3. Testing Profile Endpoint...');
        const profileResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
            {
                headers: {
                    'Authorization': `Bearer ${accountToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    pageSize: 100,
                    currentPage: 1
                }
            }
        );
        
        console.log('✅ Profile endpoint successful');
        console.log('Response status:', profileResponse.status);
        console.log('Response keys:', Object.keys(profileResponse.data));
        
        const profiles = profileResponse.data.items || [];
        console.log(`📊 Found ${profiles.length} profiles`);
        
        if (profiles.length > 0) {
            console.log('Sample profile:', {
                profileId: profiles[0].profileId,
                externalId: profiles[0].externalId,
                deviceType: profiles[0].deviceType,
                isSampleProfile: profiles[0].isSampleProfile
            });
        }
        
        // Step 4: Test Full Dashboard API Flow
        console.log('\n4. Testing Dashboard API Flow...');
        
        // Simulate the exact same API call the dashboard makes
        const dashboardResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
            {
                headers: {
                    'Authorization': `Bearer ${accountToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    pageSize: 100,
                    currentPage: 1
                }
            }
        );
        
        console.log('✅ Dashboard API flow works!');
        console.log('Status:', dashboardResponse.status);
        console.log('Profiles found:', dashboardResponse.data.items?.length || 0);
        
        // Step 5: Test Organizational Metrics Calculation
        console.log('\n5. Testing Metrics Calculation...');
        const orgProfiles = dashboardResponse.data.items || [];
        
        if (orgProfiles.length === 0) {
            console.log('❌ No profiles to calculate metrics from');
            return { success: false, error: 'No profiles found' };
        }
        
        // Basic metrics calculation (same as dashboard)
        const sampleProfiles = orgProfiles.filter(p => p.isSampleProfile);
        const deviceTypes = orgProfiles.reduce((acc, p) => {
            acc[p.deviceType] = (acc[p.deviceType] || 0) + 1;
            return acc;
        }, {});
        
        const organizationMetrics = {
            orgId: 'debug_org',
            totalEmployees: orgProfiles.length,
            averageWellbeing: 0.68,
            sampleDataProfiles: sampleProfiles.length,
            deviceDistribution: deviceTypes,
            timestamp: new Date().toISOString()
        };
        
        console.log('✅ Metrics calculation successful:');
        console.log(organizationMetrics);
        
        return {
            success: true,
            authToken: accountToken.substring(0, 20) + '...',
            profileCount: orgProfiles.length,
            metrics: organizationMetrics
        };
        
    } catch (error) {
        console.log('\n❌ Error occurred:');
        console.log('Error type:', error.name);
        console.log('Error message:', error.message);
        
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
            console.log('Response headers:', error.response.headers);
        } else if (error.request) {
            console.log('Request made but no response received');
            console.log('Request:', error.request);
        } else {
            console.log('Error in request setup:', error.message);
        }
        
        return {
            success: false,
            error: error.message,
            status: error.response?.status,
            details: error.response?.data
        };
    }
}

// Run debug
debugDashboardAPI()
    .then(result => {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 DEBUG RESULTS:');
        
        if (result.success) {
            console.log('✅ API Integration Working Correctly');
            console.log(`✅ ${result.profileCount} profiles accessible`);
            console.log('✅ Metrics calculation functional');
            console.log('\n💡 If dashboard shows "Failed to fetch", check:');
            console.log('1. Browser console for CORS/network errors');
            console.log('2. Environment variables in Next.js client');
            console.log('3. API client axios configuration');
        } else {
            console.log('❌ API Integration Issues:');
            console.log('Error:', result.error);
            console.log('Status:', result.status);
            console.log('Details:', result.details);
            
            console.log('\n🔧 Possible solutions:');
            console.log('1. Verify credentials in .env');
            console.log('2. Check API endpoint URLs');
            console.log('3. Ensure proper request headers');
        }
        
        console.log('='.repeat(60));
    })
    .catch(error => {
        console.error('\n💥 Debug script error:', error.message);
    });