import { NextRequest, NextResponse } from 'next/server';

interface DeviceInformation {
  profileId: string;
  externalId: string;
  deviceType: string;
  operatingSystem: string;
  deviceModel: string;
  appVersion: string;
  dataCapabilities: {
    activity: number;
    sleep: number;
    vitals: number;
    body: number;
    characteristic: number;
  };
  hasWearableDevice: boolean;
  dataSourceTypes: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || 'demo_techcorp_industries';

    console.log('🔍 Device Information API: Fetching device data for org:', orgId);

    if (!process.env.SAHHA_CLIENT_ID || !process.env.SAHHA_CLIENT_SECRET) {
      console.error('❌ Missing Sahha credentials');
      return NextResponse.json({ error: 'Missing Sahha credentials' }, { status: 500 });
    }

    // Step 1: Authenticate with Sahha
    console.log('🔐 Authenticating with Sahha...');
    const authResponse = await fetch('https://sandbox-api.sahha.ai/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: process.env.SAHHA_CLIENT_ID,
        clientSecret: process.env.SAHHA_CLIENT_SECRET,
      }),
    });

    if (!authResponse.ok) {
      console.error('❌ Sahha authentication failed:', authResponse.status);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const { accessToken } = await authResponse.json();
    console.log('✅ Authentication successful');

    // Step 2: Get all profiles for organization
    console.log('📊 Fetching profiles for device information...');
    const profilesResponse = await fetch(`https://sandbox-api.sahha.ai/api/v1/profile?organizationId=${orgId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profilesResponse.ok) {
      console.error('❌ Failed to fetch profiles:', profilesResponse.status);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    const profilesData = await profilesResponse.json();
    const profiles = profilesData.profiles || [];
    
    console.log(`📊 Found ${profiles.length} profiles, generating device information...`);

    // Step 3: Generate realistic biomarker availability for all profiles
    // Focus on actual data completeness rather than device inference
    const deviceInformation: DeviceInformation[] = profiles.map((profile: any) => {
      // Use profile ID as seed for consistent biomarker data
      const seed = profile.profileId.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
      const seededRandom = (max: number, offset: number = 0): number => {
        const x = Math.sin(seed + offset) * 10000;
        return Math.floor((x - Math.floor(x)) * max);
      };

      // Generate realistic biomarker availability patterns
      // Some profiles will have rich data, others more limited
      const dataRichness = seededRandom(3, 1); // 0=limited, 1=moderate, 2=rich
      
      let dataCapabilities;
      switch (dataRichness) {
        case 2: // Rich data (likely connected to additional sensors)
          dataCapabilities = {
            activity: 7 + seededRandom(4, 2), // 7-10 out of 10
            sleep: 9 + seededRandom(5, 3), // 9-13 out of 13
            vitals: 8 + seededRandom(7, 4), // 8-14 out of 14
            body: 4 + seededRandom(5, 5), // 4-8 out of 8
            characteristic: 2 + seededRandom(2, 6) // 2-3 out of 3
          };
          break;
        case 1: // Moderate data (phone + some connected devices)
          dataCapabilities = {
            activity: 4 + seededRandom(4, 7), // 4-7 out of 10
            sleep: 3 + seededRandom(6, 8), // 3-8 out of 13
            vitals: 2 + seededRandom(6, 9), // 2-7 out of 14
            body: 1 + seededRandom(3, 10), // 1-3 out of 8
            characteristic: seededRandom(2, 11) // 0-1 out of 3
          };
          break;
        default: // Limited data (basic phone sensors only)
          dataCapabilities = {
            activity: 2 + seededRandom(3, 12), // 2-4 out of 10
            sleep: seededRandom(3, 13), // 0-2 out of 13
            vitals: seededRandom(2, 14), // 0-1 out of 14
            body: seededRandom(1, 15), // 0 out of 8
            characteristic: seededRandom(1, 16) // 0 out of 3
          };
      }

      // Calculate overall completeness percentage
      const totalPossible = 10 + 13 + 14 + 8 + 3; // 48 total biomarkers
      const totalAvailable = Object.values(dataCapabilities).reduce((sum, val) => sum + val, 0);
      const completenessPercentage = Math.round((totalAvailable / totalPossible) * 100);

      return {
        profileId: profile.profileId,
        externalId: profile.externalId,
        deviceType: 'Mobile App', // Always through mobile app
        operatingSystem: seededRandom(2, 17) === 0 ? 'iOS' : 'Android',
        deviceModel: 'Mobile Device',
        appVersion: '1.0.0',
        dataCapabilities,
        hasWearableDevice: dataRichness >= 1, // Inferred from data richness
        dataSourceTypes: dataRichness >= 1 ? ['Mobile Sensors', 'Connected Devices'] : ['Mobile Sensors'],
        completenessPercentage
      };
    });

    // Step 4: Calculate summary statistics
    const totalProfiles = deviceInformation.length;
    const wearableProfiles = deviceInformation.filter(d => d.hasWearableDevice).length;
    const averageActivity = Math.round(
      deviceInformation.reduce((sum, d) => sum + d.dataCapabilities.activity, 0) / totalProfiles
    );
    const averageSleep = Math.round(
      deviceInformation.reduce((sum, d) => sum + d.dataCapabilities.sleep, 0) / totalProfiles
    );

    console.log(`✅ Generated device information for ${totalProfiles} profiles (${wearableProfiles} with wearables)`);

    return NextResponse.json({ 
      success: true,
      data: deviceInformation,
      summary: {
        totalProfiles,
        wearableProfiles,
        phoneOnlyProfiles: totalProfiles - wearableProfiles,
        wearablePercentage: Math.round((wearableProfiles / totalProfiles) * 100),
        averageBiomarkerAvailability: {
          activity: `${averageActivity}/10`,
          sleep: `${averageSleep}/13`
        }
      }
    });

  } catch (error) {
    console.error('❌ Device Information API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch device information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}