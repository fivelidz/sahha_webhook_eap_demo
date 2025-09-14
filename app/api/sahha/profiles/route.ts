// Next.js App Router API route to fetch Sahha profiles with complete data
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface SahhaAuthResponse {
  accountToken: string;
  tokenType?: string;
}

interface SahhaProfile {
  profileId: string;
  accountId: string;
  externalId: string;
  sdkId?: string | null;
  sdkVersion?: string | null;
  deviceType?: string | null;
  dataLastReceivedAtUtc: string;
  createdAtUtc: string;
  isSampleProfile: boolean;
}

interface ProfileResponse {
  items: SahhaProfile[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
}

interface ScoreData {
  id: string;
  type: string;
  state: string;
  score: number;
  factors?: Factor[];
  scoreDateTime: string;
  createdAtUtc: string;
  version: number;
}

interface Factor {
  id: string;
  name: string;
  value: number;
  goal: number;
  score: number;
  state: string;
  unit: string;
}

interface Archetype {
  id: string;
  name: string;
  value: string;
  dataType: string;
  periodicity: string;
  startDateTime: string;
  endDateTime: string;
  ordinality?: number;
  version: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeScores = searchParams.get('includeScores') === 'true';
  const profileLimit = parseInt(searchParams.get('limit') || '10'); // Limit profiles to fetch with scores

  try {
    console.log('🔍 Fetching Sahha profiles...');
    
    // Get credentials from headers if provided, otherwise use environment variables
    const headers = request.headers;
    const clientId = headers.get('X-Client-Id') || process.env.SAHHA_CLIENT_ID;
    const clientSecret = headers.get('X-App-Secret') || process.env.SAHHA_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing credentials');
      return NextResponse.json({
        success: false,
        error: 'Missing API credentials'
      }, { status: 401 });
    }
    
    console.log('🔑 Using credentials:', { clientId: clientId?.substring(0, 8) + '...' });
    
    // Step 1: Authenticate with Sahha API
    const authResponse = await axios.post<SahhaAuthResponse>(
      `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/oauth/account/token`,
      {
        clientId: clientId,
        clientSecret: clientSecret,
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const accountToken = authResponse.data.accountToken;
    console.log('✅ Authentication successful');

    // Step 2: Fetch all profiles  
    const profileResponse = await axios.get<ProfileResponse>(
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

    const profiles = profileResponse.data.items || [];
    console.log(`📊 Found ${profiles.length} profiles from Sahha API`);

    if (!includeScores) {
      // Return just the basic profile data
      return NextResponse.json({
        success: true,
        profiles: profiles.map(p => ({
          ...p,
          scores: {
            wellbeing: null,
            activity: null,
            sleep: null,
            mentalWellbeing: null,
            readiness: null
          },
          archetypes: []
        })),
        count: profiles.length,
        timestamp: new Date().toISOString()
      });
    }

    // Step 3: Fetch complete data for each profile (limited for performance)
    console.log(`🔍 Fetching complete data for first ${profileLimit} profiles...`);
    
    const profilesWithData = await Promise.all(
      profiles.slice(0, profileLimit).map(async (profile) => {
        try {
          // Fetch all scores in ONE call and archetypes in parallel (2 calls instead of 6!)
          const [allScoresData, archetypesData] = await Promise.all([
            fetchAllScores(accountToken, profile.externalId),
            fetchArchetypes(accountToken, profile.externalId)
          ]);
          
          // Extract individual score types from the grouped response
          const wellbeingData = allScoresData?.wellbeing || null;
          const activityData = allScoresData?.activity || null;
          const sleepData = allScoresData?.sleep || null;
          const mentalWellbeingData = allScoresData?.mentalwellbeing || null;
          const readinessData = allScoresData?.readiness || null;

          // Get the latest score for each type (first in array is most recent)
          const latestWellbeing = wellbeingData && wellbeingData.length > 0 ? wellbeingData[0] : null;
          const latestActivity = activityData && activityData.length > 0 ? activityData[0] : null;
          const latestSleep = sleepData && sleepData.length > 0 ? sleepData[0] : null;
          const latestMentalWellbeing = mentalWellbeingData && mentalWellbeingData.length > 0 ? mentalWellbeingData[0] : null;
          const latestReadiness = readinessData && readinessData.length > 0 ? readinessData[0] : null;

          // Combine all factors
          const allFactors = [
            ...(latestWellbeing?.factors || []),
            ...(latestActivity?.factors || []),
            ...(latestSleep?.factors || []),
            ...(latestMentalWellbeing?.factors || []),
            ...(latestReadiness?.factors || [])
          ];

          // Extract archetype names
          const archetypeNames = archetypesData?.map((a: Archetype) => a.name) || [];

          console.log(`✅ Profile ${profile.externalId}: W=${latestWellbeing ? Math.round(latestWellbeing.score * 100) : 'N/A'}, A=${latestActivity ? Math.round(latestActivity.score * 100) : 'N/A'}, S=${latestSleep ? Math.round(latestSleep.score * 100) : 'N/A'}, MW=${latestMentalWellbeing ? Math.round(latestMentalWellbeing.score * 100) : 'N/A'}, R=${latestReadiness ? Math.round(latestReadiness.score * 100) : 'N/A'}, Archetypes=${archetypeNames.length}`);

          return {
            ...profile,
            scores: {
              wellbeing: latestWellbeing?.score || null,
              activity: latestActivity?.score || null,
              sleep: latestSleep?.score || null,
              mentalWellbeing: latestMentalWellbeing?.score || null,
              readiness: latestReadiness?.score || null
            },
            wellbeingScore: latestWellbeing?.score || null,
            activityScore: latestActivity?.score || null,
            sleepScore: latestSleep?.score || null,
            mentalWellbeingScore: latestMentalWellbeing?.score || null,
            readinessScore: latestReadiness?.score || null,
            factors: allFactors,
            archetypes: archetypeNames,
            archetypesData: archetypesData || [],
            scoreAvailability: {
              wellbeing: !!latestWellbeing,
              activity: !!latestActivity,
              sleep: !!latestSleep,
              mentalWellbeing: !!latestMentalWellbeing,
              readiness: !!latestReadiness
            },
            lastScoreDate: latestWellbeing?.scoreDateTime || null,
            hasRealScores: !!(latestWellbeing || latestActivity || latestSleep || latestMentalWellbeing || latestReadiness)
          };
        } catch (error) {
          console.log(`⚠️ Error fetching data for ${profile.externalId}:`, error instanceof Error ? error.message : error);
          return {
            ...profile,
            scores: {
              wellbeing: null,
              activity: null,
              sleep: null,
              mentalWellbeing: null,
              readiness: null
            },
            wellbeingScore: null,
            activityScore: null,
            sleepScore: null,
            mentalWellbeingScore: null,
            readinessScore: null,
            factors: [],
            archetypes: [],
            archetypesData: [],
            scoreAvailability: {
              wellbeing: false,
              activity: false,
              sleep: false,
              mentalWellbeing: false,
              readiness: false
            },
            hasRealScores: false
          };
        }
      })
    );

    // Add remaining profiles without scores (for performance)
    const remainingProfiles = profiles.slice(profileLimit).map(profile => ({
      ...profile,
      scores: {
        wellbeing: null,
        activity: null,
        sleep: null,
        mentalWellbeing: null,
        readiness: null
      },
      wellbeingScore: null,
      activityScore: null,
      sleepScore: null,
      mentalWellbeingScore: null,
      readinessScore: null,
      factors: [],
      archetypes: [],
      archetypesData: [],
      scoreAvailability: {
        wellbeing: false,
        activity: false,
        sleep: false,
        mentalWellbeing: false,
        readiness: false
      },
      hasRealScores: false
    }));

    const allProfiles = [...profilesWithData, ...remainingProfiles];
    const profilesWithRealScores = profilesWithData.filter(p => p.hasRealScores);

    console.log(`✅ Fetched complete data for ${profilesWithRealScores.length} profiles`);

    return NextResponse.json({
      success: true,
      profiles: allProfiles,
      count: allProfiles.length,
      profilesWithScores: profilesWithRealScores.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Profile fetching error:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profiles',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper function to fetch ALL scores in ONE API call
async function fetchAllScores(accountToken: string, externalId: string): Promise<{ [key: string]: ScoreData[] } | null> {
  try {
    // Build URL with multiple score types
    const baseUrl = `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score/${externalId}`;
    const params = new URLSearchParams();
    
    // Add all score types
    ['wellbeing', 'activity', 'sleep', 'mental_wellbeing', 'readiness'].forEach(type => {
      params.append('types', type);
    });
    
    // Add date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    params.append('startDateTime', startDate.toISOString().split('T')[0]);
    params.append('endDateTime', endDate.toISOString().split('T')[0]);
    
    const response = await axios.get(
      `${baseUrl}?${params.toString()}`,
      {
        headers: {
          // Use 'account' prefix as shown in working curl command
          'Authorization': `account ${accountToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Group scores by type
    const scores = response.data || [];
    const groupedScores: { [key: string]: ScoreData[] } = {};
    
    scores.forEach((score: ScoreData) => {
      const type = score.type.replace('_', ''); // normalize mental_wellbeing to mentalwellbeing
      if (!groupedScores[type]) groupedScores[type] = [];
      groupedScores[type].push(score);
    });
    
    console.log(`✅ Fetched all scores for ${externalId} in one call:`, Object.keys(groupedScores));
    return groupedScores;
    
  } catch (error: any) {
    // Log detailed error information for debugging
    if (error.response?.status === 500) {
      console.log(`❌ 500 Error fetching all scores for ${externalId}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        message: 'Server error - check token format'
      });
    } else if (error.response?.status === 404) {
      console.log(`📭 No score data for ${externalId} (404 - expected)`);
    } else if (error.response?.status === 401) {
      console.log(`🔐 Authentication error for ${externalId}`);
    } else {
      console.log(`⚠️ Score fetch error for ${externalId}:`, error.response?.status, error.message);
    }
    return null;
  }
}

// Legacy function for backward compatibility
async function fetchScore(accountToken: string, externalId: string, scoreType: string): Promise<ScoreData[] | null> {
  const allScores = await fetchAllScores(accountToken, externalId);
  if (!allScores) return null;
  
  const normalizedType = scoreType.replace('_', '');
  return allScores[normalizedType] || null;
}

// Helper function to fetch archetypes
async function fetchArchetypes(accountToken: string, externalId: string): Promise<Archetype[] | null> {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/archetype/${externalId}`,
      {
        headers: {
          // Use 'account' prefix for consistency
          'Authorization': `account ${accountToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data || [];
  } catch (error: any) {
    // Archetypes might not exist for all profiles - this is expected
    if (error.response?.status !== 404) {
      console.log(`⚠️ Archetype fetch error for ${externalId}:`, error.response?.status);
    }
    return null;
  }
}