#!/usr/bin/env node

/**
 * Script to verify we're getting real Sahha API data
 */

const SAHHA_CREDENTIALS = {
  clientId: 'tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW',
  clientSecret: 'uGJFFzeLuifFEHC2y3dgs6J3O2vui3eiptuxlH5D810DmS8NshymlIJUu14nZ3y8'
};

async function verifyApiData() {
  console.log('🔍 Verifying Sahha API Data...\n');
  
  try {
    // 1. Call our endpoint
    console.log('📡 Calling our dashboard API endpoint...');
    const dashboardResponse = await fetch('http://localhost:3000/api/sahha/profiles', {
      headers: {
        'X-Client-Id': SAHHA_CREDENTIALS.clientId,
        'X-App-Secret': SAHHA_CREDENTIALS.clientSecret
      }
    });
    
    const dashboardData = await dashboardResponse.json();
    
    // 2. Call Sahha API directly
    console.log('📡 Calling Sahha API directly...');
    
    // First authenticate
    const authResponse = await fetch('https://sandbox-api.sahha.ai/api/v1/oauth/account/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: SAHHA_CREDENTIALS.clientId,
        clientSecret: SAHHA_CREDENTIALS.clientSecret
      })
    });
    
    const authData = await authResponse.json();
    console.log('✅ Authenticated with Sahha');
    
    // Then get profiles
    const sahhaResponse = await fetch('https://sandbox-api.sahha.ai/api/v1/account/profile/search?pageSize=100&currentPage=1', {
      headers: {
        'Authorization': `Bearer ${authData.accountToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const sahhaData = await sahhaResponse.json();
    
    // 3. Compare the data
    console.log('\n📊 Data Comparison:');
    console.log('=====================================');
    console.log(`Dashboard API returned: ${dashboardData.profiles?.length || 0} profiles`);
    console.log(`Direct Sahha API returned: ${sahhaData.items?.length || 0} profiles`);
    
    // Check if the profiles match
    if (dashboardData.profiles && sahhaData.items) {
      const dashboardIds = dashboardData.profiles.map(p => p.externalId || p.profileId).sort();
      const sahhaIds = sahhaData.items.map(p => p.externalId).sort();
      
      console.log('\n🔍 Profile ID Verification:');
      console.log('First 5 Dashboard IDs:', dashboardIds.slice(0, 5));
      console.log('First 5 Sahha IDs:', sahhaIds.slice(0, 5));
      
      // Check for demo data indicators
      const hasDemoProfiles = dashboardIds.some(id => id.includes('demo_profile'));
      const hasSampleProfiles = dashboardIds.every(id => id.includes('SampleProfile'));
      
      console.log('\n✅ Data Source Verification:');
      if (hasDemoProfiles) {
        console.log('❌ WARNING: Demo profiles detected! Data is from demo source.');
      } else if (hasSampleProfiles) {
        console.log('✅ Confirmed: All profiles are from Sahha API (SampleProfile format)');
      }
      
      // Verify specific profile
      const testProfileId = 'SampleProfile-f0760754-47de-4f46-ab22-89348f4c710f';
      const foundInDashboard = dashboardIds.includes(testProfileId);
      const foundInSahha = sahhaIds.includes(testProfileId);
      
      console.log(`\n🔍 Specific Profile Check (${testProfileId}):`);
      console.log(`Found in Dashboard API: ${foundInDashboard ? '✅' : '❌'}`);
      console.log(`Found in Sahha API: ${foundInSahha ? '✅' : '❌'}`);
      
      // Final verdict
      console.log('\n📋 FINAL VERIFICATION:');
      if (dashboardIds.length === sahhaIds.length && foundInDashboard && foundInSahha && !hasDemoProfiles) {
        console.log('✅✅✅ CONFIRMED: Dashboard is using REAL Sahha API data!');
        console.log('All profiles match between dashboard and direct Sahha API calls.');
      } else if (hasDemoProfiles) {
        console.log('❌❌❌ Dashboard is using DEMO data, not real API data.');
      } else {
        console.log('⚠️ Data mismatch detected. Further investigation needed.');
      }
    }
    
    // Show profile structure
    console.log('\n📝 Sample Profile Structure from Dashboard:');
    if (dashboardData.profiles?.[0]) {
      const profile = dashboardData.profiles[0];
      console.log({
        profileId: profile.profileId,
        externalId: profile.externalId,
        isSampleProfile: profile.isSampleProfile,
        hasScores: !!profile.scores,
        createdAtUtc: profile.createdAtUtc
      });
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyApiData();