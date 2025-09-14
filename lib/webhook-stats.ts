// Webhook Statistics Aggregation Service
// Comprehensive stats for all Sahha webhook data

import { loadWebhookData } from './webhook-storage';

export interface WebhookStats {
  summary: {
    totalProfiles: number;
    lastUpdated: string;
    dataCompleteness: number; // Percentage
    activeProfiles: number; // Updated in last 24h
  };
  
  scores: {
    coverage: {
      sleep: number;
      activity: number;
      mentalWellbeing: number;
      readiness: number;
      wellbeing: number;
    };
    averages: {
      sleep: number | null;
      activity: number | null;
      mentalWellbeing: number | null;
      readiness: number | null;
      wellbeing: number | null;
    };
    distribution: {
      [scoreType: string]: {
        excellent: number; // >= 0.8
        high: number;      // >= 0.6
        medium: number;    // >= 0.4
        low: number;       // >= 0.2
        minimal: number;   // < 0.2
      };
    };
  };
  
  biomarkers: {
    totalTypes: number;
    coverage: {
      [biomarkerType: string]: number; // Number of profiles with this biomarker
    };
    categories: {
      sleep: number;
      activity: number;
      vitals: number;
      other: number;
    };
  };
  
  dataLogs: {
    totalEntries: number;
    types: {
      [logType: string]: number;
    };
    sources: {
      [source: string]: number;
    };
  };
  
  factors: {
    coverage: {
      [scoreType: string]: number; // Profiles with factors for this score
    };
    topFactors: {
      [scoreType: string]: string[]; // Top 3 factor names
    };
  };
  
  archetypes: {
    totalTypes: number;
    distribution: {
      [archetypeName: string]: number;
    };
  };
  
  profiles: {
    withCompleteData: number; // All 5 scores
    withPartialData: number;  // 2-4 scores
    withMinimalData: number;  // 1 score
    withNoScores: number;     // 0 scores
    topProfiles: Array<{
      externalId: string;
      scoreCount: number;
      biomarkerCount: number;
      lastUpdated: string;
    }>;
  };
}

export async function generateWebhookStats(): Promise<WebhookStats> {
  const data = await loadWebhookData();
  const profiles = Object.values(data);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Initialize stats
  const stats: WebhookStats = {
    summary: {
      totalProfiles: profiles.length,
      lastUpdated: now.toISOString(),
      dataCompleteness: 0,
      activeProfiles: 0
    },
    scores: {
      coverage: {
        sleep: 0,
        activity: 0,
        mentalWellbeing: 0,
        readiness: 0,
        wellbeing: 0
      },
      averages: {
        sleep: null,
        activity: null,
        mentalWellbeing: null,
        readiness: null,
        wellbeing: null
      },
      distribution: {}
    },
    biomarkers: {
      totalTypes: 0,
      coverage: {},
      categories: {
        sleep: 0,
        activity: 0,
        vitals: 0,
        other: 0
      }
    },
    dataLogs: {
      totalEntries: 0,
      types: {},
      sources: {}
    },
    factors: {
      coverage: {},
      topFactors: {}
    },
    archetypes: {
      totalTypes: 0,
      distribution: {}
    },
    profiles: {
      withCompleteData: 0,
      withPartialData: 0,
      withMinimalData: 0,
      withNoScores: 0,
      topProfiles: []
    }
  };
  
  if (profiles.length === 0) return stats;
  
  // Score type names
  const scoreTypes = ['sleep', 'activity', 'mentalWellbeing', 'mental_wellbeing', 'readiness', 'wellbeing'];
  const scoreTypesNormalized = ['sleep', 'activity', 'mentalWellbeing', 'readiness', 'wellbeing'];
  
  // Initialize score distributions
  scoreTypesNormalized.forEach(type => {
    stats.scores.distribution[type] = {
      excellent: 0,
      high: 0,
      medium: 0,
      low: 0,
      minimal: 0
    };
  });
  
  // Aggregate score values for averages
  const scoreValues: { [key: string]: number[] } = {
    sleep: [],
    activity: [],
    mentalWellbeing: [],
    readiness: [],
    wellbeing: []
  };
  
  // Process each profile
  profiles.forEach((profile: any) => {
    // Count active profiles (updated in last 24h)
    if (profile.lastUpdated && new Date(profile.lastUpdated) > yesterday) {
      stats.summary.activeProfiles++;
    }
    
    // Count scores
    let profileScoreCount = 0;
    if (profile.scores) {
      Object.entries(profile.scores).forEach(([type, scoreData]: [string, any]) => {
        // Normalize mental_wellbeing to mentalWellbeing
        const normalizedType = type === 'mental_wellbeing' ? 'mentalWellbeing' : type;
        
        if (scoreData && scoreData.value !== undefined && scoreData.value !== null) {
          profileScoreCount++;
          
          // Update coverage
          if (normalizedType in stats.scores.coverage) {
            stats.scores.coverage[normalizedType as keyof typeof stats.scores.coverage]++;
          }
          
          // Collect values for average
          if (!scoreValues[normalizedType]) scoreValues[normalizedType] = [];
          scoreValues[normalizedType].push(scoreData.value);
          
          // Update distribution
          const value = scoreData.value;
          const dist = stats.scores.distribution[normalizedType];
          if (dist) {
            if (value >= 0.8) dist.excellent++;
            else if (value >= 0.6) dist.high++;
            else if (value >= 0.4) dist.medium++;
            else if (value >= 0.2) dist.low++;
            else dist.minimal++;
          }
        }
      });
    }
    
    // Categorize profile by score completeness
    if (profileScoreCount === 5) stats.profiles.withCompleteData++;
    else if (profileScoreCount >= 2) stats.profiles.withPartialData++;
    else if (profileScoreCount === 1) stats.profiles.withMinimalData++;
    else stats.profiles.withNoScores++;
    
    // Count biomarkers
    let biomarkerCount = 0;
    if (profile.biomarkers) {
      Object.entries(profile.biomarkers).forEach(([key, biomarker]: [string, any]) => {
        biomarkerCount++;
        stats.biomarkers.coverage[key] = (stats.biomarkers.coverage[key] || 0) + 1;
        
        // Categorize by type
        if (biomarker.category === 'sleep') stats.biomarkers.categories.sleep++;
        else if (biomarker.category === 'activity') stats.biomarkers.categories.activity++;
        else if (biomarker.category === 'vitals' || biomarker.category === 'heart') stats.biomarkers.categories.vitals++;
        else stats.biomarkers.categories.other++;
      });
    }
    
    // Count data logs
    if (profile.dataLogs) {
      Object.entries(profile.dataLogs).forEach(([logType, logs]: [string, any]) => {
        stats.dataLogs.types[logType] = (stats.dataLogs.types[logType] || 0) + 1;
        
        if (Array.isArray(logs)) {
          logs.forEach((logEntry: any) => {
            if (logEntry.logs && Array.isArray(logEntry.logs)) {
              stats.dataLogs.totalEntries += logEntry.logs.length;
              
              logEntry.logs.forEach((log: any) => {
                if (log.source) {
                  stats.dataLogs.sources[log.source] = (stats.dataLogs.sources[log.source] || 0) + 1;
                }
              });
            }
          });
        }
      });
    }
    
    // Count factors
    if (profile.factors) {
      Object.entries(profile.factors).forEach(([scoreType, factors]: [string, any]) => {
        if (factors && factors.length > 0) {
          const normalizedType = scoreType === 'mental_wellbeing' ? 'mentalWellbeing' : scoreType;
          stats.factors.coverage[normalizedType] = (stats.factors.coverage[normalizedType] || 0) + 1;
          
          // Track top factor names
          if (!stats.factors.topFactors[normalizedType]) {
            stats.factors.topFactors[normalizedType] = [];
          }
          factors.forEach((factor: any) => {
            if (factor.name && !stats.factors.topFactors[normalizedType].includes(factor.name)) {
              stats.factors.topFactors[normalizedType].push(factor.name);
            }
          });
        }
      });
    }
    
    // Count archetypes
    if (profile.archetypes) {
      Object.entries(profile.archetypes).forEach(([name, data]: [string, any]) => {
        if (data && data.value) {
          stats.archetypes.distribution[name] = (stats.archetypes.distribution[name] || 0) + 1;
        }
      });
    }
    
    // Track top profiles
    if (profileScoreCount > 0 || biomarkerCount > 0) {
      stats.profiles.topProfiles.push({
        externalId: profile.externalId || 'unknown',
        scoreCount: profileScoreCount,
        biomarkerCount: biomarkerCount,
        lastUpdated: profile.lastUpdated || ''
      });
    }
  });
  
  // Calculate averages
  Object.entries(scoreValues).forEach(([type, values]) => {
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      stats.scores.averages[type as keyof typeof stats.scores.averages] = 
        Math.round((sum / values.length) * 100) / 100;
    }
  });
  
  // Calculate data completeness (% of possible data points filled)
  const maxDataPoints = profiles.length * 5; // 5 score types per profile
  const actualDataPoints = Object.values(stats.scores.coverage).reduce((a, b) => a + b, 0);
  stats.summary.dataCompleteness = Math.round((actualDataPoints / maxDataPoints) * 100);
  
  // Sort and limit top profiles
  stats.profiles.topProfiles.sort((a, b) => {
    const aTotal = a.scoreCount + (a.biomarkerCount / 10); // Weight scores more
    const bTotal = b.scoreCount + (b.biomarkerCount / 10);
    return bTotal - aTotal;
  });
  stats.profiles.topProfiles = stats.profiles.topProfiles.slice(0, 10);
  
  // Limit top factors to 3 per score type
  Object.keys(stats.factors.topFactors).forEach(type => {
    stats.factors.topFactors[type] = stats.factors.topFactors[type].slice(0, 3);
  });
  
  // Count unique biomarker types
  stats.biomarkers.totalTypes = Object.keys(stats.biomarkers.coverage).length;
  
  // Count unique archetype types
  stats.archetypes.totalTypes = Object.keys(stats.archetypes.distribution).length;
  
  return stats;
}

// Save stats to file for analysis
export async function saveWebhookStats(stats: WebhookStats): Promise<void> {
  const fs = (await import('fs')).promises;
  const path = (await import('path')).default;
  const statsFile = path.join(process.cwd(), 'data', 'webhook-stats.json');
  
  await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
}

// Generate and save stats
export async function updateWebhookStats(): Promise<WebhookStats> {
  const stats = await generateWebhookStats();
  await saveWebhookStats(stats);
  return stats;
}