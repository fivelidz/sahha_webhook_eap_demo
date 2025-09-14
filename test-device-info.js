// Test Device Information from Sahha API
require('dotenv').config();
const axios = require('axios');

async function testDeviceInfo() {
  console.log('🔍 Testing Device Information from Sahha API...');
  
  try {
    // Get account token
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
    console.log('✅ Account token obtained');

    // Get all 57 profiles to check device distribution
    const profileResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/account/profile/search`,
      {
        headers: {
          'Authorization': `Bearer ${accountToken}`,
          'Content-Type': 'application/json'
        },
        params: { pageSize: 100 } // Get all profiles
      }
    );

    const profiles = profileResponse.data.items || [];
    console.log(`\n📊 Found ${profiles.length} profiles`);
    
    // Analyze device type distribution
    const deviceTypes = {};
    let nullCount = 0;
    
    profiles.forEach(profile => {
      if (profile.deviceType === null || profile.deviceType === undefined) {
        nullCount++;
      } else {
        deviceTypes[profile.deviceType] = (deviceTypes[profile.deviceType] || 0) + 1;
      }
    });
    
    console.log('\n📱 DEVICE TYPE ANALYSIS:');
    console.log('=========================');
    console.log(`Null/undefined devices: ${nullCount}`);
    console.log('Device types found:', deviceTypes);
    
    // Show some examples of profiles with devices
    const profilesWithDevices = profiles.filter(p => p.deviceType && p.deviceType !== null);
    console.log(`\n🔍 Profiles with actual device info: ${profilesWithDevices.length}`);
    
    if (profilesWithDevices.length > 0) {
      console.log('\nExamples of profiles with devices:');
      profilesWithDevices.slice(0, 5).forEach((profile, index) => {
        console.log(`  ${index + 1}. Device: ${profile.deviceType}, External ID: ${profile.externalId.substring(0, 30)}...`);
      });
    }
    
    // Test device information endpoint for a profile with device data
    if (profilesWithDevices.length > 0) {
      const testProfile = profilesWithDevices[0];
      console.log(`\n🧪 Testing device information endpoint for: ${testProfile.externalId}`);
      
      try {
        const deviceInfoResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/deviceInformation`,
          {
            headers: {
              'Authorization': `Bearer ${accountToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              externalId: testProfile.externalId
            }
          }
        );
        
        console.log('✅ Device Information API Response:');
        console.log(JSON.stringify(deviceInfoResponse.data, null, 2));
        
      } catch (deviceError) {
        console.log(`❌ Device Information API failed: ${deviceError.response?.status} ${deviceError.response?.statusText}`);
        if (deviceError.response?.data) {
          console.log('Error details:', deviceError.response.data);
        }
      }
    }
    
    return { success: true, deviceTypes, nullCount, totalProfiles: profiles.length };

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    return { success: false, error: error.message };
  }
}

testDeviceInfo()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log('✅ DEVICE INFO TEST COMPLETE');
      console.log(`Found ${Object.keys(result.deviceTypes).length} unique device types`);
      console.log(`${result.nullCount}/${result.totalProfiles} profiles have null device info`);
    } else {
      console.log('❌ Device info test failed');
    }
    console.log('='.repeat(60));
  });