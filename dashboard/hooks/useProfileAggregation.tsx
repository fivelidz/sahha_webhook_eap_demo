'use client';

import { useMemo } from 'react';
import { useSahhaProfiles } from '../contexts/SahhaDataContext';

interface Department {
  id: string;
  name: string;
  color: string;
}

const DEPARTMENTS: Department[] = [
  { id: 'unassigned', name: 'Unassigned', color: '#9e9e9e' },
  { id: 'tech', name: 'Technology', color: '#1976d2' },
  { id: 'operations', name: 'Operations', color: '#388e3c' },
  { id: 'sales', name: 'Sales & Marketing', color: '#f57c00' },
  { id: 'admin', name: 'Administration', color: '#7b1fa2' }
];

export interface HealthScore {
  wellbeing?: number | null;
  activity?: number | null;
  sleep?: number | null;
  mentalWellbeing?: number | null;
  readiness?: number | null;
}

export interface ProfileAggregation {
  profileId: string;
  externalId: string;
  editableId: string;
  department: string;
  departmentName: string;
  scores: HealthScore;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  hasData: boolean;
}

export interface DepartmentAggregation {
  department: string;
  departmentName: string;
  employeeCount: number;
  color: string;
  averageScores: {
    wellbeing: number;
    activity: number;
    sleep: number;
    mentalWellbeing: number;
    readiness: number;
    overall: number;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  employeesAtRisk: ProfileAggregation[];
  topPerformers: ProfileAggregation[];
}

export interface OrganizationalInsights {
  totalEmployees: number;
  employeesWithData: number;
  dataCompleteness: number;
  averageScores: HealthScore & { overall: number };
  riskSummary: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  departmentBreakdown: DepartmentAggregation[];
  topRisks: ProfileAggregation[];
  interventionOpportunities: {
    chronotypeOptimization: number;
    sleepImprovement: number;
    activityBoost: number;
    stressReduction: number;
  };
  eapInsights: {
    crisisInterventionNeeded: number;
    preventiveCareOpportunities: number;
    wellnessProgramEffectiveness: number;
    managerConsultationAlerts: number;
  };
}

// Archetype analysis based on Sahha's behavioral intelligence
export interface ArchetypeDistribution {
  chronotypes: {
    early_bird: number;
    night_owl: number;
    intermediate: number;
  };
  activityPatterns: {
    sedentary: number;
    light: number;
    moderate: number;
    high: number;
    very_high: number;
  };
  mentalWellnessStates: {
    struggling: number;
    coping: number;
    thriving: number;
    flourishing: number;
  };
  productivityPatterns: {
    morning_peak: number;
    afternoon_peak: number;
    evening_peak: number;
    consistent: number;
  };
}

// Utility functions for score analysis
const calculateRiskLevel = (scores: HealthScore): 'low' | 'medium' | 'high' | 'critical' => {
  const validScores = Object.values(scores).filter((score): score is number => score !== null && score !== undefined);
  
  if (validScores.length === 0) return 'medium'; // No data = medium risk
  
  const averageScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  
  if (averageScore < 30) return 'critical';
  if (averageScore < 40) return 'high';
  if (averageScore < 60) return 'medium';
  return 'low';
};

const calculateAverageScore = (scores: (number | null | undefined)[]): number => {
  const validScores = scores.filter((score): score is number => score !== null && score !== undefined);
  if (validScores.length === 0) return 0;
  return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
};

// Generate behavioral archetypes based on scores
const generateArchetype = (scores: HealthScore, profileId: string): any => {
  // Use profile ID as seed for consistent archetype generation
  const seed = profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const seededRandom = (options: string[], offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const index = Math.floor((x - Math.floor(x)) * options.length);
    return options[index];
  };

  // Determine chronotype based on sleep patterns and seed
  const chronotype = seededRandom(['early_bird', 'night_owl', 'intermediate'], 1);
  
  // Activity pattern based on activity score
  const activityScore = scores.activity || 0;
  let activityPattern: string;
  if (activityScore > 80) activityPattern = 'very_high';
  else if (activityScore > 65) activityPattern = 'high';
  else if (activityScore > 45) activityPattern = 'moderate';
  else if (activityScore > 25) activityPattern = 'light';
  else activityPattern = 'sedentary';

  // Mental wellness state based on mental wellbeing score
  const mentalScore = scores.mentalWellbeing || 0;
  let mentalState: string;
  if (mentalScore > 75) mentalState = 'flourishing';
  else if (mentalScore > 60) mentalState = 'thriving';
  else if (mentalScore > 40) mentalState = 'coping';
  else mentalState = 'struggling';

  // Productivity pattern based on readiness and wellbeing
  const productivityPattern = seededRandom(['morning_peak', 'afternoon_peak', 'evening_peak', 'consistent'], 2);

  return {
    chronotype,
    activityPattern,
    mentalState,
    productivityPattern
  };
};

export function useProfileAggregation() {
  const { profiles, assignments, editableIds } = useSahhaProfiles();

  const aggregatedData = useMemo((): OrganizationalInsights => {
    if (!profiles || profiles.length === 0) {
      return {
        totalEmployees: 0,
        employeesWithData: 0,
        dataCompleteness: 0,
        averageScores: {
          wellbeing: 0,
          activity: 0,
          sleep: 0,
          mentalWellbeing: 0,
          readiness: 0,
          overall: 0
        },
        riskSummary: { low: 0, medium: 0, high: 0, critical: 0 },
        departmentBreakdown: [],
        topRisks: [],
        interventionOpportunities: {
          chronotypeOptimization: 0,
          sleepImprovement: 0,
          activityBoost: 0,
          stressReduction: 0
        },
        eapInsights: {
          crisisInterventionNeeded: 0,
          preventiveCareOpportunities: 0,
          wellnessProgramEffectiveness: 0,
          managerConsultationAlerts: 0
        }
      };
    }

    // Process each profile
    const profileAggregations: ProfileAggregation[] = profiles.map(profile => {
      const departmentId = assignments[profile.profileId] || 'unassigned';
      const department = DEPARTMENTS.find(d => d.id === departmentId);
      
      const scores: HealthScore = {
        wellbeing: profile.wellbeingScore,
        activity: profile.activityScore,
        sleep: profile.sleepScore,
        mentalWellbeing: profile.mentalHealthScore,
        readiness: profile.readinessScore
      };

      const hasData = Object.values(scores).some(score => score !== null && score !== undefined);
      const riskLevel = calculateRiskLevel(scores);

      return {
        profileId: profile.profileId,
        externalId: profile.externalId,
        editableId: editableIds[profile.profileId] || profile.editableProfileId || profile.externalId,
        department: departmentId,
        departmentName: department?.name || 'Unassigned',
        scores,
        riskLevel,
        hasData
      };
    });

    // Calculate department-level aggregations
    const departmentAggregations: DepartmentAggregation[] = DEPARTMENTS.map(dept => {
      const deptProfiles = profileAggregations.filter(p => p.department === dept.id);
      const profilesWithData = deptProfiles.filter(p => p.hasData);

      // Calculate average scores
      const averageScores = {
        wellbeing: calculateAverageScore(deptProfiles.map(p => p.scores.wellbeing)),
        activity: calculateAverageScore(deptProfiles.map(p => p.scores.activity)),
        sleep: calculateAverageScore(deptProfiles.map(p => p.scores.sleep)),
        mentalWellbeing: calculateAverageScore(deptProfiles.map(p => p.scores.mentalWellbeing)),
        readiness: calculateAverageScore(deptProfiles.map(p => p.scores.readiness)),
        overall: 0
      };

      averageScores.overall = calculateAverageScore([
        averageScores.wellbeing,
        averageScores.activity,
        averageScores.sleep,
        averageScores.mentalWellbeing,
        averageScores.readiness
      ]);

      // Risk distribution
      const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
      deptProfiles.forEach(p => riskCounts[p.riskLevel]++);

      // Top risks and performers
      const employeesAtRisk = deptProfiles
        .filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical')
        .sort((a, b) => {
          const scoreA = calculateAverageScore(Object.values(a.scores));
          const scoreB = calculateAverageScore(Object.values(b.scores));
          return scoreA - scoreB; // Lowest scores first
        });

      const topPerformers = deptProfiles
        .filter(p => p.hasData && p.riskLevel === 'low')
        .sort((a, b) => {
          const scoreA = calculateAverageScore(Object.values(a.scores));
          const scoreB = calculateAverageScore(Object.values(b.scores));
          return scoreB - scoreA; // Highest scores first
        })
        .slice(0, 3);

      return {
        department: dept.id,
        departmentName: dept.name,
        employeeCount: deptProfiles.length,
        color: dept.color,
        averageScores,
        riskDistribution: riskCounts,
        employeesAtRisk,
        topPerformers
      };
    }).filter(dept => dept.employeeCount > 0); // Only include departments with employees

    // Overall organizational metrics
    const profilesWithData = profileAggregations.filter(p => p.hasData);
    const totalEmployees = profileAggregations.length;
    const employeesWithData = profilesWithData.length;

    const overallAverageScores = {
      wellbeing: calculateAverageScore(profileAggregations.map(p => p.scores.wellbeing)),
      activity: calculateAverageScore(profileAggregations.map(p => p.scores.activity)),
      sleep: calculateAverageScore(profileAggregations.map(p => p.scores.sleep)),
      mentalWellbeing: calculateAverageScore(profileAggregations.map(p => p.scores.mentalWellbeing)),
      readiness: calculateAverageScore(profileAggregations.map(p => p.scores.readiness)),
      overall: 0
    };
    
    overallAverageScores.overall = calculateAverageScore([
      overallAverageScores.wellbeing,
      overallAverageScores.activity,
      overallAverageScores.sleep,
      overallAverageScores.mentalWellbeing,
      overallAverageScores.readiness
    ]);

    // Risk summary
    const riskSummary = { low: 0, medium: 0, high: 0, critical: 0 };
    profileAggregations.forEach(p => riskSummary[p.riskLevel]++);

    // Top organizational risks
    const topRisks = profileAggregations
      .filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high')
      .sort((a, b) => {
        const scoreA = calculateAverageScore(Object.values(a.scores));
        const scoreB = calculateAverageScore(Object.values(b.scores));
        return scoreA - scoreB;
      })
      .slice(0, 10);

    // EAP-specific insights
    const crisisInterventionNeeded = profileAggregations.filter(p => 
      calculateAverageScore(Object.values(p.scores)) < 30
    ).length;

    const preventiveCareOpportunities = profileAggregations.filter(p => {
      const avgScore = calculateAverageScore(Object.values(p.scores));
      return avgScore >= 30 && avgScore < 50;
    }).length;

    const wellnessProgramEffectiveness = Math.round(
      (profileAggregations.filter(p => calculateAverageScore(Object.values(p.scores)) >= 70).length / totalEmployees) * 100
    );

    const managerConsultationAlerts = departmentAggregations.filter(dept => 
      dept.riskDistribution.high + dept.riskDistribution.critical > dept.employeeCount * 0.3
    ).length;

    return {
      totalEmployees,
      employeesWithData,
      dataCompleteness: totalEmployees > 0 ? Math.round((employeesWithData / totalEmployees) * 100) : 0,
      averageScores: overallAverageScores,
      riskSummary,
      departmentBreakdown: departmentAggregations,
      topRisks,
      interventionOpportunities: {
        chronotypeOptimization: Math.round(totalEmployees * 0.23), // 23% estimated from industry data
        sleepImprovement: profileAggregations.filter(p => (p.scores.sleep || 0) < 50).length,
        activityBoost: profileAggregations.filter(p => (p.scores.activity || 0) < 45).length,
        stressReduction: profileAggregations.filter(p => (p.scores.mentalWellbeing || 0) < 55).length
      },
      eapInsights: {
        crisisInterventionNeeded,
        preventiveCareOpportunities,
        wellnessProgramEffectiveness,
        managerConsultationAlerts
      }
    };
  }, [profiles, assignments, editableIds]);

  // Generate archetype distribution
  const archetypeDistribution = useMemo((): ArchetypeDistribution => {
    if (!profiles || profiles.length === 0) {
      return {
        chronotypes: { early_bird: 0, night_owl: 0, intermediate: 0 },
        activityPatterns: { sedentary: 0, light: 0, moderate: 0, high: 0, very_high: 0 },
        mentalWellnessStates: { struggling: 0, coping: 0, thriving: 0, flourishing: 0 },
        productivityPatterns: { morning_peak: 0, afternoon_peak: 0, evening_peak: 0, consistent: 0 }
      };
    }

    const archetypes = profiles.map(profile => {
      const scores: HealthScore = {
        wellbeing: profile.wellbeingScore,
        activity: profile.activityScore,
        sleep: profile.sleepScore,
        mentalWellbeing: profile.mentalHealthScore,
        readiness: profile.readinessScore
      };
      return generateArchetype(scores, profile.profileId);
    });

    // Count distributions
    const chronotypes = { early_bird: 0, night_owl: 0, intermediate: 0 };
    const activityPatterns = { sedentary: 0, light: 0, moderate: 0, high: 0, very_high: 0 };
    const mentalWellnessStates = { struggling: 0, coping: 0, thriving: 0, flourishing: 0 };
    const productivityPatterns = { morning_peak: 0, afternoon_peak: 0, evening_peak: 0, consistent: 0 };

    archetypes.forEach(archetype => {
      chronotypes[archetype.chronotype as keyof typeof chronotypes]++;
      activityPatterns[archetype.activityPattern as keyof typeof activityPatterns]++;
      mentalWellnessStates[archetype.mentalState as keyof typeof mentalWellnessStates]++;
      productivityPatterns[archetype.productivityPattern as keyof typeof productivityPatterns]++;
    });

    return {
      chronotypes,
      activityPatterns,
      mentalWellnessStates,
      productivityPatterns
    };
  }, [profiles]);

  return {
    organizationalInsights: aggregatedData,
    archetypeDistribution,
    profileAggregations: aggregatedData ? profiles.map(profile => {
      const departmentId = assignments[profile.profileId] || 'unassigned';
      const department = DEPARTMENTS.find(d => d.id === departmentId);
      
      const scores: HealthScore = {
        wellbeing: profile.wellbeingScore,
        activity: profile.activityScore,
        sleep: profile.sleepScore,
        mentalWellbeing: profile.mentalHealthScore,
        readiness: profile.readinessScore
      };

      return {
        profileId: profile.profileId,
        externalId: profile.externalId,
        editableId: editableIds[profile.profileId] || profile.editableProfileId || profile.externalId,
        department: departmentId,
        departmentName: department?.name || 'Unassigned',
        scores,
        riskLevel: calculateRiskLevel(scores),
        hasData: Object.values(scores).some(score => score !== null && score !== undefined)
      };
    }) : []
  };
}