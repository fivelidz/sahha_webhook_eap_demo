import { NextRequest, NextResponse } from 'next/server';
import { loadWebhookData } from '../../../lib/webhook-storage';
import { formatWebhookProfile } from '../../../lib/webhook-data-service';

export async function GET(request: NextRequest) {
  try {
    // Load raw webhook data
    const rawData = await loadWebhookData();
    const profiles = Object.values(rawData);
    
    // Find profiles with multiple scores
    const multiScoreProfiles = profiles.filter((p: any) => 
      p.scores && Object.keys(p.scores).length > 1
    );
    
    // Format them like the dashboard does
    const formattedProfiles = multiScoreProfiles.map((p: any, idx) => 
      formatWebhookProfile(p, idx)
    );
    
    // Analyze score availability
    const scoreStats = {
      totalProfiles: profiles.length,
      profilesWithMultipleScores: multiScoreProfiles.length,
      scoreTypeCounts: {} as any,
      formattedSamples: formattedProfiles.slice(0, 3),
      missingScoreProfiles: [] as any[]
    };
    
    // Count score types
    profiles.forEach((p: any) => {
      if (p.scores) {
        Object.keys(p.scores).forEach(type => {
          scoreStats.scoreTypeCounts[type] = (scoreStats.scoreTypeCounts[type] || 0) + 1;
        });
      }
    });
    
    // Find profiles where formatting might be losing scores
    formattedProfiles.forEach((formatted: any, idx) => {
      const raw = multiScoreProfiles[idx] as any;
      const rawScoreCount = raw.scores ? Object.keys(raw.scores).length : 0;
      const formattedScoreCount = [
        formatted.wellbeingScore,
        formatted.activityScore,
        formatted.sleepScore,
        formatted.mentalWellbeingScore,
        formatted.readinessScore
      ].filter(s => s !== null).length;
      
      if (rawScoreCount !== formattedScoreCount) {
        scoreStats.missingScoreProfiles.push({
          externalId: raw.externalId,
          rawScores: Object.keys(raw.scores || {}),
          formattedScores: {
            wellbeing: formatted.wellbeingScore,
            activity: formatted.activityScore,
            sleep: formatted.sleepScore,
            mentalWellbeing: formatted.mentalWellbeingScore,
            readiness: formatted.readinessScore
          }
        });
      }
    });
    
    return NextResponse.json({
      success: true,
      stats: scoreStats,
      sampleProfile: formattedProfiles[0],
      testProfiles: profiles.filter((p: any) => 
        p.externalId && p.externalId.includes('TestProfile')
      ).map((p: any) => ({
        externalId: p.externalId,
        scores: p.scores ? Object.keys(p.scores) : [],
        scoreValues: p.scores
      }))
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}