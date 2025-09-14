// Progressive Score Loading API - Load scores for profiles in batches with progress updates
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface ScoreResponse {
  profileId: string;
  externalId: string;
  scores: {
    wellbeing?: number;
    activity?: number;
    sleep?: number;
    mentalWellbeing?: number;
    readiness?: number;
  };
  biomarkers?: {
    [scoreType: string]: any[];
  };
  status: 'loading' | 'completed' | 'error';
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { profiles, includeSubScores = false } = await request.json();
    
    if (!profiles || !Array.isArray(profiles)) {
      return NextResponse.json({
        success: false,
        error: 'Profiles array is required'
      }, { status: 400 });
    }

    console.log(`🔍 Progressive loading scores for ${profiles.length} profiles...`);

    // Step 1: Get account token
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
    
    // Step 2: Process profiles in batches (5 at a time to avoid rate limits)
    const batchSize = 5;
    const results: ScoreResponse[] = [];
    
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);
      console.log(`📊 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(profiles.length/batchSize)}`);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (profile: any) => {
          return await fetchProfileScoresWithBiomarkers(accountToken, profile, includeSubScores);
        })
      );

      // Add batch results
      batchResults.forEach((result, index) => {
        const profile = batch[index];
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            profileId: profile.id,
            externalId: profile.externalId,
            scores: {},
            status: 'error',
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      // Small delay between batches to respect rate limits
      if (i + batchSize < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const successCount = results.filter(r => r.status === 'completed').length;
    console.log(`✅ Progressive loading completed: ${successCount}/${profiles.length} profiles with scores`);

    return NextResponse.json({
      success: true,
      results: results,
      totalProfiles: profiles.length,
      successfulProfiles: successCount,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Progressive score loading error:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load scores progressively',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper function to fetch scores and biomarkers for a single profile
async function fetchProfileScoresWithBiomarkers(
  accountToken: string, 
  profile: any, 
  includeSubScores: boolean
): Promise<ScoreResponse> {
  const scoreTypes = ['wellbeing', 'activity', 'sleep', 'mental wellbeing', 'readiness'];
  const scores: any = {};
  const biomarkers: any = {};
  
  try {
    // Fetch all score types for this profile
    const scorePromises = scoreTypes.map(async (scoreType) => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SAHHA_API_BASE_URL}/api/v1/profile/score/${profile.externalId}`,
          {
            headers: {
              'Authorization': `Bearer ${accountToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              types: scoreType
            }
          }
        );

        const scoreData = response.data;
        if (scoreData && scoreData.length > 0) {
          const latestScore = scoreData[scoreData.length - 1];
          const normalizedScoreType = scoreType === 'mental wellbeing' ? 'mentalWellbeing' : scoreType;
          scores[normalizedScoreType] = Math.round(latestScore.score * 100);
          
          // If including sub-scores, fetch biomarkers
          if (includeSubScores) {
            biomarkers[normalizedScoreType] = scoreData; // Store full score data for sub-scores
          }
          
          return { scoreType, success: true, value: scores[normalizedScoreType] };
        }
        return { scoreType, success: false, reason: 'No score data' };
      } catch (error: any) {
        return { scoreType, success: false, reason: error.message };
      }
    });

    await Promise.all(scorePromises);

    return {
      profileId: profile.id,
      externalId: profile.externalId,
      scores: scores,
      biomarkers: includeSubScores ? biomarkers : undefined,
      status: 'completed'
    };

  } catch (error: any) {
    return {
      profileId: profile.id,
      externalId: profile.externalId,
      scores: {},
      status: 'error',
      error: error.message
    };
  }
}