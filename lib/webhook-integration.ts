// Webhook Data Integration Service
// Author: Alexei Brown
// Date: 12 September 2025

interface WebhookProfile {
  profileId: string;
  externalId: string;
  accountId?: string;
  
  // Score data from webhooks
  scores: {
    wellbeing?: { value: number; state: string; updatedAt: string };
    activity?: { value: number; state: string; updatedAt: string };
    sleep?: { value: number; state: string; updatedAt: string };
    mentalWellbeing?: { value: number; state: string; updatedAt: string };
    readiness?: { value: number; state: string; updatedAt: string };
  };
  
  // Factors (sub-scores) for each score type
  factors: {
    activity?: Array<{
      name: string;
      value: number;
      goal?: number;
      score: number;
      state: string;
      unit: string;
    }>;
    sleep?: Array<{
      name: string;
      value: number;
      goal?: number;
      score: number;
      state: string;
      unit: string;
    }>;
    mentalWellbeing?: Array<{
      name: string;
      value: number;
      goal?: number;
      score: number;
      state: string;
      unit: string;
    }>;
    readiness?: Array<{
      name: string;
      value: number;
      goal?: number;
      score: number;
      state: string;
      unit: string;
    }>;
    wellbeing?: Array<{
      name: string;
      value: number;
      goal?: number;
      score: number;
      state: string;
      unit: string;
    }>;
  };
  
  // Behavioral archetypes
  archetypes: {
    [archetypeName: string]: {
      value: string;
      periodicity?: string;
      updatedAt?: string;
    };
  };
  
  // Individual biomarkers
  biomarkers?: {
    [biomarkerKey: string]: {
      category: string;
      type: string;
      value: string | number;
      unit: string;
      updatedAt: string;
    };
  };
  
  lastUpdated: string;
}

// Format score to 3 significant figures
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'N/A';
  
  // If score is 0-1 scale, convert to percentage
  const percentage = score <= 1 ? score * 100 : score;
  
  // Format to 3 significant figures
  if (percentage === 0) return '0';
  if (percentage === 100) return '100';
  
  // Use toPrecision for 3 significant figures
  const formatted = percentage.toPrecision(3);
  
  // Remove trailing zeros after decimal
  return parseFloat(formatted).toString();
}

// Format time values properly
export function formatTimeValue(value: number, unit: string): string {
  // Handle hours
  if (unit === 'hour' || unit === 'hours') {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }
  
  // Handle minutes
  if (unit === 'minute' || unit === 'minutes' || unit === 'mins') {
    if (value >= 60) {
      const hours = Math.floor(value / 60);
      const minutes = Math.round(value % 60);
      
      if (minutes === 0) return `${hours}h`;
      return `${hours}h ${minutes}m`;
    }
    return `${Math.round(value)}m`;
  }
  
  // Handle other units
  if (unit === 'count' || unit === 'steps') {
    return value.toLocaleString();
  }
  
  if (unit === 'kcal') {
    return `${Math.round(value)} kcal`;
  }
  
  if (unit === 'index' || unit === '%') {
    return formatScore(value);
  }
  
  // Default formatting
  return `${value} ${unit}`;
}

// Get archetype display name
export function formatArchetype(archetypeName: string, value?: string): string {
  // If we have a value, use it
  if (value) {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Otherwise format the archetype name
  return archetypeName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Get all archetypes for a profile
export function getProfileArchetypes(profile: WebhookProfile): string[] {
  const archetypes: string[] = [];
  
  if (profile.archetypes) {
    Object.entries(profile.archetypes).forEach(([name, data]) => {
      if (data.value) {
        archetypes.push(formatArchetype(name, data.value));
      }
    });
  }
  
  return archetypes;
}

// Get factors for a score type
export function getScoreFactors(profile: WebhookProfile, scoreType: string): any[] {
  const factors = profile.factors?.[scoreType as keyof typeof profile.factors];
  
  if (!factors || factors.length === 0) {
    return [];
  }
  
  return factors.map(factor => ({
    name: factor.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: formatTimeValue(factor.value, factor.unit),
    score: formatScore(factor.score),
    state: factor.state,
    goal: factor.goal ? formatTimeValue(factor.goal, factor.unit) : null
  }));
}

// Merge webhook data with API data
export function mergeProfileData(apiProfile: any, webhookData?: WebhookProfile): any {
  if (!webhookData) return apiProfile;
  
  const merged = { ...apiProfile };
  
  // Update scores from webhook
  if (webhookData.scores) {
    merged.wellbeingScore = webhookData.scores.wellbeing?.value ?? apiProfile.wellbeingScore;
    merged.activityScore = webhookData.scores.activity?.value ?? apiProfile.activityScore;
    merged.sleepScore = webhookData.scores.sleep?.value ?? apiProfile.sleepScore;
    merged.mentalWellbeingScore = webhookData.scores.mentalWellbeing?.value ?? apiProfile.mentalWellbeingScore;
    merged.readinessScore = webhookData.scores.readiness?.value ?? apiProfile.readinessScore;
  }
  
  // Update archetypes from webhook
  merged.archetypes = getProfileArchetypes(webhookData);
  
  // Update sub-scores (factors) from webhook
  merged.subScores = {
    activity: getScoreFactors(webhookData, 'activity'),
    sleep: getScoreFactors(webhookData, 'sleep'),
    mentalWellbeing: getScoreFactors(webhookData, 'mentalWellbeing'),
    readiness: getScoreFactors(webhookData, 'readiness'),
    wellbeing: getScoreFactors(webhookData, 'wellbeing')
  };
  
  // Add webhook last updated time
  merged.lastWebhookUpdate = webhookData.lastUpdated;
  
  return merged;
}

// Fetch webhook data for a profile
export async function fetchWebhookData(externalId: string): Promise<WebhookProfile | null> {
  try {
    const response = await fetch(`/api/sahha/webhook?externalId=${externalId}`);
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data as WebhookProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching webhook data:', error);
    return null;
  }
}

// Fetch all webhook data
export async function fetchAllWebhookData(): Promise<Record<string, WebhookProfile>> {
  try {
    const response = await fetch('/api/sahha/webhook');
    
    if (!response.ok) {
      return {};
    }
    
    const result = await response.json();
    
    if (result.success && result.profiles) {
      const webhookMap: Record<string, WebhookProfile> = {};
      
      result.profiles.forEach((profile: WebhookProfile) => {
        webhookMap[profile.externalId] = profile;
      });
      
      return webhookMap;
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching all webhook data:', error);
    return {};
  }
}

// Check if webhook data is available
export async function hasWebhookData(): Promise<boolean> {
  try {
    const response = await fetch('/api/sahha/webhook');
    const result = await response.json();
    return result.success && result.count > 0;
  } catch {
    return false;
  }
}

// Get score state color
export function getScoreStateColor(state?: string): string {
  switch (state) {
    case 'excellent': return '#4caf50';
    case 'high': return '#8bc34a';
    case 'medium': return '#ff9800';
    case 'low': return '#ff5722';
    case 'minimal': return '#f44336';
    default: return '#9e9e9e';
  }
}

// Get score state background
export function getScoreStateBackground(state?: string): string {
  switch (state) {
    case 'excellent': return 'rgba(76, 175, 80, 0.1)';
    case 'high': return 'rgba(139, 195, 74, 0.1)';
    case 'medium': return 'rgba(255, 152, 0, 0.1)';
    case 'low': return 'rgba(255, 87, 34, 0.1)';
    case 'minimal': return 'rgba(244, 67, 54, 0.1)';
    default: return 'rgba(158, 158, 158, 0.1)';
  }
}