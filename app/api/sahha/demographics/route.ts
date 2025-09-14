import { NextRequest, NextResponse } from 'next/server';

interface DemographicData {
  profileId: string;
  externalId: string;
  age?: number;
  gender?: string;
  dateOfBirth?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const orgId = searchParams.get('orgId');

    console.log('🔍 Demographic API Route: Starting demographic data fetch', { profileId, orgId });

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

    // Step 2: Get all profiles if orgId provided, or specific profile if profileId provided
    let profiles = [];
    
    if (profileId) {
      // Fetch specific profile
      console.log('📊 Fetching specific profile demographic data for:', profileId);
      
      // For demographic data, we need to use profile token authentication
      // This is a limitation in the demo - in production, you'd have profile tokens
      // For now, we'll generate simulated demographic data based on profile characteristics
      
      const simulatedDemographics: DemographicData = {
        profileId,
        externalId: profileId.substring(0, 8),
        age: Math.floor(Math.random() * 50) + 20, // Age 20-70
        gender: Math.random() > 0.5 ? 'female' : 'male',
        dateOfBirth: new Date(1970 + Math.floor(Math.random() * 35), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
      };
      
      return NextResponse.json({ demographic: simulatedDemographics });
      
    } else if (orgId) {
      // Fetch all profiles for organization first
      console.log('📊 Fetching organizational profiles for demographic analysis');
      
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
      profiles = profilesData.profiles || [];
      
      console.log(`📊 Found ${profiles.length} profiles, generating demographic data...`);
      
      // Generate simulated demographic data for all profiles
      const demographicsData: DemographicData[] = profiles.map((profile: any) => {
        // Use profile ID as seed for consistent demographic data
        const seed = profile.profileId.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
        const seededRandom = (max: number, offset: number = 0): number => {
          const x = Math.sin(seed + offset) * 10000;
          return Math.floor((x - Math.floor(x)) * max);
        };
        
        const age = 20 + seededRandom(50, 1); // Age 20-70
        const gender = seededRandom(2, 2) === 0 ? 'male' : 'female';
        const birthYear = new Date().getFullYear() - age;
        const birthMonth = seededRandom(12, 3);
        const birthDay = seededRandom(28, 4) + 1;
        const dateOfBirth = `${birthYear}-${String(birthMonth + 1).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
        
        return {
          profileId: profile.profileId,
          externalId: profile.externalId,
          age,
          gender,
          dateOfBirth
        };
      });
      
      return NextResponse.json({ 
        demographics: demographicsData,
        totalProfiles: profiles.length,
        message: 'Simulated demographic data generated for all profiles'
      });
    }

    return NextResponse.json({ error: 'Missing profileId or orgId parameter' }, { status: 400 });

  } catch (error) {
    console.error('❌ Demographic API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch demographic data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}