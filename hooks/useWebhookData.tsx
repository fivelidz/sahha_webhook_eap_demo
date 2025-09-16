'use client';

import { useState, useEffect, useCallback } from 'react';

interface WebhookProfile {
  profileId: string;
  externalId: string;
  accountId?: string;
  scores: {
    [key: string]: {
      value: number;
      state: string;
      updatedAt: string;
      scoreDateTime?: string;
    };
  };
  factors: {
    [key: string]: any[];
  };
  archetypes: {
    [key: string]: any;
  };
  biomarkers?: {
    [key: string]: any;
  };
  dataLogs?: {
    [key: string]: any[];
  };
  device?: {
    type: string;
    source: string;
    lastSeen: string | null;
  };
  demographics?: {
    age: number | null;
    gender: string | null;
    location: string | null;
  };
  lastUpdated: string;
  department?: string;
  name?: string;
}

interface WebhookData {
  profiles: WebhookProfile[];
  count: number;
  lastUpdated: string;
  stats?: {
    totalProfiles: number;
    withScores: number;
    averageWellbeing: number;
    scoreCoverage: {
      [key: string]: number;
    };
  };
}

export function useWebhookData(refreshInterval: number = 30000, demoMode: boolean = true) {
  const [data, setData] = useState<WebhookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Always use demo mode for now
      const url = demoMode ? '/api/sahha/webhook?mode=demo' : '/api/sahha/webhook';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Use profiles as-is from webhook, only add name generation
        const enhancedProfiles = (result.profiles || []).map((profile: WebhookProfile, index: number) => {
          // Normalize scores to 0-100 if they're in decimal format
          const normalizedScores = { ...profile.scores };
          Object.keys(normalizedScores).forEach(key => {
            if (normalizedScores[key] && normalizedScores[key].value <= 1) {
              normalizedScores[key].value = normalizedScores[key].value * 100;
            }
          });
          
          return {
            ...profile,
            scores: normalizedScores,
            department: profile.department || 'unassigned', // Keep original department
            name: generateName(profile.externalId, index)
          };
        });
        
        setData({
          profiles: enhancedProfiles,
          count: result.count || enhancedProfiles.length,
          lastUpdated: result.lastUpdated || new Date().toISOString(),
          stats: result.stats
        });
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (err: any) {
      console.error('Error fetching webhook data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval, demoMode]);

  return { data, loading, error, refetch: fetchData };
}

// Helper functions

function generateName(externalId: string, index: number): string {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  
  // Generate consistent name based on externalId
  const hash1 = externalId.charCodeAt(0) + externalId.charCodeAt(1);
  const hash2 = externalId.charCodeAt(2) + externalId.charCodeAt(3);
  
  return `${firstNames[hash1 % firstNames.length]} ${lastNames[hash2 % lastNames.length]}`;
}

// Export utility functions for calculating aggregated stats
export function calculateDepartmentStats(profiles: WebhookProfile[]) {
  // Get unique departments from actual data
  const departmentSet = new Set<string>();
  profiles.forEach(p => {
    departmentSet.add(p.department || 'unassigned');
  });
  const departments = Array.from(departmentSet).sort();
  
  return departments.map(dept => {
    const deptProfiles = profiles.filter(p => (p.department || 'unassigned') === dept);
    const avgWellbeing = deptProfiles.reduce((sum, p) => {
      // Handle both decimal (0-1) and percentage (0-100) formats
      let score = p.scores?.wellbeing?.value || p.scores?.mentalWellbeing?.value || 50;
      if (score <= 1) score = score * 100; // Convert decimal to percentage
      return sum + score;
    }, 0) / (deptProfiles.length || 1);
    
    const riskProfiles = deptProfiles.filter(p => {
      // Normalize all scores to 0-100
      const wellbeing = (p.scores?.wellbeing?.value || 50) <= 1 ? 
        (p.scores?.wellbeing?.value || 0.5) * 100 : (p.scores?.wellbeing?.value || 50);
      const mental = (p.scores?.mentalWellbeing?.value || 50) <= 1 ? 
        (p.scores?.mentalWellbeing?.value || 0.5) * 100 : (p.scores?.mentalWellbeing?.value || 50);
      const sleep = (p.scores?.sleep?.value || 50) <= 1 ? 
        (p.scores?.sleep?.value || 0.5) * 100 : (p.scores?.sleep?.value || 50);
      
      const minScore = Math.min(wellbeing, mental, sleep);
      return minScore < 40;
    });
    
    return {
      department: dept,
      totalEmployees: deptProfiles.length,
      avgWellbeing: Math.round(avgWellbeing),
      riskCount: riskProfiles.length,
      riskPercentage: Math.round((riskProfiles.length / (deptProfiles.length || 1)) * 100)
    };
  });
}

export function calculateScoreDistribution(profiles: WebhookProfile[]) {
  const distribution = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    critical: 0
  };
  
  profiles.forEach(profile => {
    // Normalize scores to 0-100 range
    let wellbeing = profile.scores?.wellbeing?.value || 50;
    let mental = profile.scores?.mentalWellbeing?.value || 50;
    
    if (wellbeing <= 1) wellbeing = wellbeing * 100;
    if (mental <= 1) mental = mental * 100;
    
    const score = Math.min(wellbeing, mental);
    
    if (score >= 80) distribution.excellent++;
    else if (score >= 65) distribution.good++;
    else if (score >= 50) distribution.fair++;
    else if (score >= 30) distribution.poor++;
    else distribution.critical++;
  });
  
  return distribution;
}

export function extractArchetypes(profiles: WebhookProfile[]) {
  const archetypeData: { [key: string]: number } = {};
  
  profiles.forEach(profile => {
    if (profile.archetypes) {
      Object.entries(profile.archetypes).forEach(([name, data]: [string, any]) => {
        const key = `${name}_${data.value || 'unknown'}`;
        archetypeData[key] = (archetypeData[key] || 0) + 1;
      });
    }
  });
  
  return archetypeData;
}