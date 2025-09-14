// Webhook Data Service - No API Calls
// Author: Alexei Brown
// Date: 12 September 2025

import { formatScore, formatTimeValue, formatArchetype } from './webhook-integration';

// Generate realistic demo webhook data
export function generateDemoWebhookData(count: number = 57): any[] {
  const archetypeValues = {
    sleep_duration: ['short_sleeper', 'normal_sleeper', 'long_sleeper'],
    sleep_quality: ['poor_sleeper', 'average_sleeper', 'good_sleeper'],
    activity_level: ['sedentary', 'moderately_active', 'highly_active'],
    circadian_rhythm: ['early_bird', 'night_owl', 'irregular_schedule'],
    wellness_trend: ['improving', 'stable', 'declining'],
    stress_pattern: ['low_stress', 'moderate_stress', 'high_stress']
  };

  const profiles = [];
  
  for (let i = 0; i < count; i++) {
    const profileId = `demo-${String(i + 1).padStart(4, '0')}`;
    const externalId = `EMP-${String(i + 1).padStart(3, '0')}`;
    
    // Generate realistic scores
    const scores = {
      wellbeing: Math.random() * 0.4 + 0.5, // 50-90%
      activity: Math.random() * 0.5 + 0.3, // 30-80%
      sleep: Math.random() * 0.4 + 0.5, // 50-90%
      mentalWellbeing: Math.random() * 0.3 + 0.6, // 60-90%
      readiness: Math.random() * 0.4 + 0.5 // 50-90%
    };
    
    // Generate factors for each score
    const factors = {
      activity: [
        { name: 'steps', value: 2000 + Math.random() * 10000, unit: 'count', score: scores.activity, state: getState(scores.activity), goal: 10000 },
        { name: 'active_hours', value: Math.random() * 8 + 2, unit: 'hour', score: scores.activity, state: getState(scores.activity), goal: 8 },
        { name: 'active_calories', value: 100 + Math.random() * 500, unit: 'kcal', score: scores.activity * 0.8, state: getState(scores.activity * 0.8), goal: 500 },
        { name: 'extended_inactivity', value: 200 + Math.random() * 600, unit: 'minute', score: 1 - scores.activity * 0.5, state: getState(1 - scores.activity * 0.5), goal: 300 }
      ],
      sleep: [
        { name: 'sleep_duration', value: 5 + Math.random() * 4, unit: 'hour', score: scores.sleep, state: getState(scores.sleep), goal: 8 },
        { name: 'sleep_efficiency', value: 0.7 + Math.random() * 0.3, unit: 'index', score: scores.sleep, state: getState(scores.sleep), goal: 0.9 },
        { name: 'sleep_debt', value: Math.random() * 180, unit: 'minute', score: 1 - scores.sleep * 0.3, state: getState(1 - scores.sleep * 0.3), goal: 0 },
        { name: 'sleep_regularity', value: 0.6 + Math.random() * 0.4, unit: 'index', score: scores.sleep * 0.9, state: getState(scores.sleep * 0.9), goal: 1 }
      ],
      mentalWellbeing: [
        { name: 'circadian_alignment', value: Math.random() * 180, unit: 'minute', score: scores.mentalWellbeing, state: getState(scores.mentalWellbeing), goal: 30 },
        { name: 'stress_level', value: Math.random(), unit: 'index', score: 1 - scores.mentalWellbeing * 0.5, state: getState(1 - scores.mentalWellbeing * 0.5), goal: 0.3 },
        { name: 'mood_stability', value: 0.5 + Math.random() * 0.5, unit: 'index', score: scores.mentalWellbeing, state: getState(scores.mentalWellbeing), goal: 0.8 }
      ],
      readiness: [
        { name: 'recovery_index', value: 50 + Math.random() * 50, unit: 'score', score: scores.readiness, state: getState(scores.readiness), goal: 80 },
        { name: 'energy_level', value: 0.4 + Math.random() * 0.6, unit: 'index', score: scores.readiness, state: getState(scores.readiness), goal: 0.8 },
        { name: 'activity_balance', value: 0.5 + Math.random() * 0.5, unit: 'index', score: scores.readiness * 0.9, state: getState(scores.readiness * 0.9), goal: 0.85 }
      ],
      wellbeing: [
        { name: 'overall_wellness', value: 40 + Math.random() * 60, unit: 'score', score: scores.wellbeing, state: getState(scores.wellbeing), goal: 80 },
        { name: 'life_satisfaction', value: 50 + Math.random() * 50, unit: 'score', score: scores.wellbeing * 0.95, state: getState(scores.wellbeing * 0.95), goal: 85 }
      ]
    };
    
    // Generate archetypes
    const archetypes: any = {};
    Object.entries(archetypeValues).forEach(([name, values]) => {
      if (Math.random() > 0.3) { // 70% chance of having each archetype
        archetypes[name] = {
          value: values[Math.floor(Math.random() * values.length)],
          periodicity: 'monthly',
          updatedAt: new Date().toISOString()
        };
      }
    });
    
    profiles.push({
      profileId,
      externalId,
      accountId: `account-${i + 1}`,
      scores: Object.entries(scores).reduce((acc, [key, value]) => {
        acc[key] = {
          value,
          state: getState(value),
          updatedAt: new Date().toISOString()
        };
        return acc;
      }, {} as any),
      factors,
      archetypes,
      biomarkers: generateBiomarkers(scores),
      lastUpdated: new Date().toISOString(),
      deviceType: i % 2 === 0 ? 'iOS' : 'Android',
      demographics: {
        age: 25 + Math.floor(Math.random() * 30),
        gender: Math.random() > 0.5 ? 'Male' : 'Female'
      }
    });
  }
  
  return profiles;
}

function getState(score: number): string {
  if (score >= 0.8) return 'excellent';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'medium';
  if (score >= 0.2) return 'low';
  return 'minimal';
}

function generateBiomarkers(scores: any): any {
  return {
    'activity_steps': {
      category: 'activity',
      type: 'steps',
      value: 2000 + Math.random() * 10000,
      unit: 'count',
      updatedAt: new Date().toISOString()
    },
    'sleep_duration': {
      category: 'sleep',
      type: 'duration',
      value: 5 + Math.random() * 4,
      unit: 'hour',
      updatedAt: new Date().toISOString()
    },
    'heart_rate': {
      category: 'heart',
      type: 'resting_heart_rate',
      value: 60 + Math.random() * 20,
      unit: 'bpm',
      updatedAt: new Date().toISOString()
    }
  };
}

// Load webhook data or generate demo data
export async function loadWebhookProfiles(mode: 'webhook' | 'demo'): Promise<any[]> {
  if (mode === 'demo') {
    return generateDemoWebhookData();
  }
  
  try {
    const response = await fetch('/api/sahha/webhook');
    const result = await response.json();
    
    if (result.success && result.profiles && result.profiles.length > 0) {
      return result.profiles;
    }
    
    // If no webhook data, return demo data
    console.log('No webhook data available, using demo data');
    return generateDemoWebhookData();
  } catch (error) {
    console.error('Error loading webhook data:', error);
    return generateDemoWebhookData();
  }
}

// Format profile for display
export function formatWebhookProfile(webhookData: any, index: number): any {
  const profile = {
    // Keep original Sahha IDs
    profileId: webhookData.profileId || `profile-${index + 1}`,
    externalId: webhookData.externalId || `ext-${index + 1}`,
    
    // Editable ID for display (user can change this)
    editableProfileId: `EMP-${String(index + 1).padStart(3, '0')}`,
    
    // Original IDs from webhook
    originalProfileId: webhookData.profileId,
    originalExternalId: webhookData.externalId,
    
    deviceType: webhookData.deviceType || 'Unknown',
    demographics: webhookData.demographics || {},
    
    // Scores
    wellbeingScore: webhookData.scores?.wellbeing?.value || null,
    activityScore: webhookData.scores?.activity?.value || null,
    sleepScore: webhookData.scores?.sleep?.value || null,
    mentalWellbeingScore: webhookData.scores?.mentalWellbeing?.value || webhookData.scores?.mental_wellbeing?.value || null,
    readinessScore: webhookData.scores?.readiness?.value || null,
    
    // Score availability
    scoreAvailability: {
      wellbeing: !!webhookData.scores?.wellbeing,
      activity: !!webhookData.scores?.activity,
      sleep: !!webhookData.scores?.sleep,
      mentalWellbeing: !!(webhookData.scores?.mentalWellbeing || webhookData.scores?.mental_wellbeing),
      readiness: !!webhookData.scores?.readiness
    },
    
    // Factors (sub-scores)
    subScores: {
      activity: formatFactors(webhookData.factors?.activity || []),
      sleep: formatFactors(webhookData.factors?.sleep || []),
      mentalWellbeing: formatFactors(webhookData.factors?.mentalWellbeing || webhookData.factors?.mental_wellbeing || []),
      readiness: formatFactors(webhookData.factors?.readiness || []),
      wellbeing: formatFactors(webhookData.factors?.wellbeing || [])
    },
    
    // Archetypes
    archetypes: formatArchetypes(webhookData.archetypes || {}),
    
    // Metadata
    lastDataSync: webhookData.lastUpdated || new Date().toISOString(),
    hasWebhookData: true,
    webhookData: webhookData
  };
  
  return profile;
}

function formatFactors(factors: any[]): any[] {
  if (!factors || factors.length === 0) return [];
  
  return factors.map(factor => ({
    name: factor.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: formatTimeValue(factor.value, factor.unit),
    unit: factor.unit,
    score: formatScore(factor.score),
    state: factor.state, // Keep state but don't display it
    rawValue: factor.value, // Keep raw value for sorting
    goal: factor.goal ? formatTimeValue(factor.goal, factor.unit) : null
  }));
}

function formatArchetypes(archetypes: any): string[] {
  const formatted: string[] = [];
  
  if (archetypes) {
    Object.entries(archetypes).forEach(([name, data]: [string, any]) => {
      if (data.value) {
        formatted.push(formatArchetype(name, data.value));
      }
    });
  }
  
  return formatted;
}