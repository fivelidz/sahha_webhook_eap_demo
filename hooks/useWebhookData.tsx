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

export function useWebhookData(refreshInterval: number = 30000) {
  const [data, setData] = useState<WebhookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/sahha/webhook');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Enhance profiles with department assignments
        const enhancedProfiles = (result.profiles || []).map((profile: WebhookProfile, index: number) => ({
          ...profile,
          department: assignDepartment(profile, index),
          name: generateName(profile.externalId, index)
        }));
        
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
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}

// Helper functions
function assignDepartment(profile: WebhookProfile, index: number): string {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  
  // Use profile characteristics to assign department
  if (profile.externalId.includes('USr')) return 'Engineering';
  if (profile.externalId.includes('Sample')) {
    const hash = profile.externalId.split('-')[1]?.charCodeAt(0) || 0;
    return departments[hash % departments.length];
  }
  
  return departments[index % departments.length];
}

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
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  
  return departments.map(dept => {
    const deptProfiles = profiles.filter(p => p.department === dept);
    const avgWellbeing = deptProfiles.reduce((sum, p) => {
      const score = p.scores?.wellbeing?.value || p.scores?.mental_wellbeing?.value || 0.5;
      return sum + score;
    }, 0) / (deptProfiles.length || 1);
    
    const riskProfiles = deptProfiles.filter(p => {
      const minScore = Math.min(
        p.scores?.wellbeing?.value || 1,
        p.scores?.mental_wellbeing?.value || 1,
        p.scores?.sleep?.value || 1
      );
      return minScore < 0.4;
    });
    
    return {
      department: dept,
      totalEmployees: deptProfiles.length,
      avgWellbeing: Math.round(avgWellbeing * 100),
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
    const score = Math.min(
      profile.scores?.wellbeing?.value || 1,
      profile.scores?.mental_wellbeing?.value || 1
    );
    
    if (score >= 0.8) distribution.excellent++;
    else if (score >= 0.65) distribution.good++;
    else if (score >= 0.5) distribution.fair++;
    else if (score >= 0.3) distribution.poor++;
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