'use client';

import { useMemo } from 'react';
import { useSahhaProfiles } from '../contexts/SahhaDataContext';

// Complete Sahha Archetype System based on official documentation
// https://docs.sahha.ai/docs/products/archetypes

export interface SahhaArchetype {
  id: string;
  profileId: string;
  externalId: string;
  name: string;
  value: string;
  dataType: 'ordinal' | 'categorical';
  ordinality?: number;
  periodicity: 'weekly' | 'monthly' | 'quarterly';
  startDateTime: string;
  endDateTime: string;
  createdAtUtc: string;
  description: string;
  requiresWearable: boolean;
}

// Complete archetype definitions from Sahha documentation
export const ARCHETYPE_DEFINITIONS = {
  // Ordinal Archetypes (0-3 ranking)
  activity_level: {
    type: 'ordinal' as const,
    values: ['sedentary', 'lightly_active', 'moderately_active', 'highly_active'],
    description: 'Overall level of physical activity including movement and exercise.',
    requiresWearable: false,
    ordinality: [0, 1, 2, 3]
  },
  exercise_frequency: {
    type: 'ordinal' as const,
    values: ['rare_exerciser', 'occasional_exerciser', 'regular_exerciser', 'frequent_exerciser'],
    description: 'How often the individual exercises.',
    requiresWearable: false,
    ordinality: [0, 1, 2, 3]
  },
  mental_wellness: {
    type: 'ordinal' as const,
    values: ['poor_mental_wellness', 'fair_mental_wellness', 'good_mental_wellness', 'optimal_mental_wellness'],
    description: 'Mental wellness and resiliency based on physical activity, sleep, and stress indicators.',
    requiresWearable: false,
    ordinality: [0, 1, 2, 3]
  },
  overall_wellness: {
    type: 'ordinal' as const,
    values: ['poor_wellness', 'fair_wellness', 'good_wellness', 'optimal_wellness'],
    description: 'Overall wellbeing across all aspects of health.',
    requiresWearable: false,
    ordinality: [0, 1, 2, 3]
  },
  sleep_duration: {
    type: 'ordinal' as const,
    values: ['very_short_sleeper', 'short_sleeper', 'average_sleeper', 'long_sleeper'],
    description: 'Typical sleep duration relative to recommended norms.',
    requiresWearable: false,
    ordinality: [0, 1, 2, 3]
  },
  sleep_efficiency: {
    type: 'ordinal' as const,
    values: ['highly_inefficient_sleeper', 'inefficient_sleeper', 'efficient_sleeper', 'highly_efficient_sleeper'],
    description: 'How effectively the individual maintains uninterrupted sleep.',
    requiresWearable: true,
    ordinality: [0, 1, 2, 3]
  },
  sleep_quality: {
    type: 'ordinal' as const,
    values: ['poor_sleep_quality', 'fair_sleep_quality', 'good_sleep_quality', 'optimal_sleep_quality'],
    description: 'Long-term quality of sleep based on duration, regularity, recovery, and debt.',
    requiresWearable: false,
    ordinality: [0, 1, 2, 3]
  },
  sleep_regularity: {
    type: 'ordinal' as const,
    values: ['highly_irregular_sleeper', 'irregular_sleeper', 'regular_sleeper', 'highly_regular_sleeper'],
    description: 'Consistency in sleep timings.',
    requiresWearable: false,
    ordinality: [0, 1, 2, 3]
  },
  bed_schedule: {
    type: 'ordinal' as const,
    values: ['very_early_sleeper', 'early_sleeper', 'late_sleeper', 'very_late_sleeper'],
    description: 'Typical bedtime.',
    requiresWearable: false,
    ordinality: [0, 1, 2, 3]
  },
  wake_schedule: {
    type: 'ordinal' as const,
    values: ['very_early_riser', 'early_riser', 'late_riser', 'very_late_riser'],
    description: 'Typical wake-up time.',
    requiresWearable: false,
    ordinality: [0, 1, 2, 3]
  },
  
  // Categorical Archetypes (no ranking)
  primary_exercise: {
    type: 'categorical' as const,
    values: ['running', 'weightlifting', 'yoga', 'cycling', 'swimming', 'walking', 'hiking', 'tennis', 'basketball', 'soccer', 'dancing', 'pilates', 'crossfit', 'martial_arts', 'climbing', 'rowing'],
    description: 'Most commonly performed exercise.',
    requiresWearable: false,
    ordinality: null
  },
  primary_exercise_type: {
    type: 'categorical' as const,
    values: ['strength_oriented', 'cardio_oriented', 'mind_body_oriented', 'hybrid_oriented', 'sport_oriented', 'outdoor_oriented'],
    description: 'Categorizes the primary exercise into strength, cardio, sports, etc.',
    requiresWearable: false,
    ordinality: null
  },
  secondary_exercise: {
    type: 'categorical' as const,
    values: ['running', 'weightlifting', 'yoga', 'cycling', 'swimming', 'walking', 'hiking', 'tennis', 'basketball', 'soccer', 'dancing', 'pilates', 'crossfit', 'martial_arts', 'climbing', 'rowing'],
    description: 'Second most commonly performed exercise.',
    requiresWearable: false,
    ordinality: null
  },
  sleep_pattern: {
    type: 'categorical' as const,
    values: ['consistent_early_riser', 'inconsistent_early_riser', 'consistent_late_sleeper', 'inconsistent_late_sleeper', 'early_morning_sleeper', 'chronic_short_sleeper', 'inconsistent_short_sleeper'],
    description: 'Overall sleep behavior based on timing and consistency.',
    requiresWearable: false,
    ordinality: null
  }
};

export interface ProfileArchetypes {
  profileId: string;
  externalId: string;
  editableId: string;
  archetypes: SahhaArchetype[];
  archetypeCompleteness: number; // Percentage of archetypes with data
  hasWearableData: boolean;
  archetypesByCategory: {
    activity: SahhaArchetype[];
    sleep: SahhaArchetype[];
    exercise: SahhaArchetype[];
    wellness: SahhaArchetype[];
  };
}

// Generate realistic archetype data based on health scores and profile seed
const generateProfileArchetypes = (profileId: string, externalId: string, healthScores: any): SahhaArchetype[] => {
  const seed = profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  const seededRandom = (max: number, offset: number = 0): number => {
    const x = Math.sin(seed + offset) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  };

  const selectFromArray = (array: string[], offset: number = 0): string => {
    const index = seededRandom(array.length, offset);
    return array[index];
  };

  const archetypes: SahhaArchetype[] = [];
  const currentDate = new Date();
  const startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  
  Object.entries(ARCHETYPE_DEFINITIONS).forEach(([archetypeName, definition], index) => {
    // Determine if this profile has this archetype (simulate missing data)
    const hasArchetype = seededRandom(100, index * 7) > 15; // 85% chance of having each archetype
    
    if (hasArchetype) {
      let value: string;
      let ordinality: number | undefined;
      
      if (definition.type === 'ordinal') {
        // For ordinal archetypes, use health scores to influence selection
        const relevantScore = getRelevantHealthScore(archetypeName, healthScores);
        ordinality = mapScoreToOrdinality(relevantScore, seededRandom(4, index * 11));
        value = definition.values[ordinality];
      } else {
        // For categorical archetypes, use seeded random selection
        value = selectFromArray(definition.values, index * 13);
      }

      archetypes.push({
        id: `${profileId}-${archetypeName}-${index}`,
        profileId,
        externalId,
        name: archetypeName,
        value,
        dataType: definition.type,
        ordinality,
        periodicity: 'monthly',
        startDateTime: startDate.toISOString(),
        endDateTime: currentDate.toISOString(),
        createdAtUtc: currentDate.toISOString(),
        description: definition.description,
        requiresWearable: definition.requiresWearable
      });
    }
  });

  return archetypes;
};

// Map health scores to archetype ordinality
const getRelevantHealthScore = (archetypeName: string, healthScores: any): number => {
  switch (archetypeName) {
    case 'activity_level':
    case 'exercise_frequency':
      return healthScores.activity || 50;
    case 'sleep_duration':
    case 'sleep_efficiency':
    case 'sleep_quality':
    case 'sleep_regularity':
    case 'bed_schedule':
    case 'wake_schedule':
      return healthScores.sleep || 50;
    case 'mental_wellness':
      return healthScores.mentalWellbeing || 50;
    case 'overall_wellness':
      return healthScores.wellbeing || 50;
    default:
      return 50;
  }
};

const mapScoreToOrdinality = (score: number, randomOffset: number): number => {
  // Map health scores (0-100) to ordinality (0-3) with some randomness
  const baseOrdinality = Math.floor(score / 25);
  const adjustedOrdinality = Math.min(3, Math.max(0, baseOrdinality + (randomOffset % 3) - 1));
  return adjustedOrdinality;
};

// Categorize archetypes for better organization
const categorizeArchetypes = (archetypes: SahhaArchetype[]) => {
  return {
    activity: archetypes.filter(a => 
      ['activity_level', 'exercise_frequency', 'primary_exercise', 'primary_exercise_type', 'secondary_exercise'].includes(a.name)
    ),
    sleep: archetypes.filter(a => 
      ['sleep_duration', 'sleep_efficiency', 'sleep_quality', 'sleep_regularity', 'bed_schedule', 'wake_schedule', 'sleep_pattern'].includes(a.name)
    ),
    exercise: archetypes.filter(a => 
      ['primary_exercise', 'primary_exercise_type', 'secondary_exercise'].includes(a.name)
    ),
    wellness: archetypes.filter(a => 
      ['mental_wellness', 'overall_wellness'].includes(a.name)
    )
  };
};

export function useSahhaArchetypes() {
  const { profiles, assignments, editableIds } = useSahhaProfiles();

  const profileArchetypes = useMemo((): ProfileArchetypes[] => {
    if (!profiles || profiles.length === 0) return [];

    return profiles.map(profile => {
      const healthScores = {
        wellbeing: profile.wellbeingScore,
        activity: profile.activityScore,
        sleep: profile.sleepScore,
        mentalWellbeing: profile.mentalHealthScore,
        readiness: profile.readinessScore
      };

      const archetypes = generateProfileArchetypes(
        profile.profileId, 
        profile.externalId, 
        healthScores
      );

      const archetypesByCategory = categorizeArchetypes(archetypes);
      
      // Generate realistic completeness based on data collection patterns
      const seed = profile.profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const seededRandom = (min: number, max: number, offset: number = 0): number => {
        const x = Math.sin(seed + offset) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
      };
      
      // More realistic completeness - based on data collection patterns
      const hasWearableData = seededRandom(1, 10, 1) > 3; // 70% have wearable
      const baseCompleteness = hasWearableData ? seededRandom(75, 95, 2) : seededRandom(45, 75, 3);
      const archetypeCompleteness = Math.min(baseCompleteness, 95); // Cap at 95% - never perfect
      
      // Calculate missing archetypes for data quality insights
      const missingArchetypes = Object.keys(ARCHETYPE_DEFINITIONS).filter(name => 
        !archetypes.some(a => a.name === name)
      );
      
      // Simulate some profiles missing certain archetypes
      const actualMissingCount = seededRandom(0, 3, 4); // 0-3 missing archetypes per profile
      const actualMissingArchetypes = missingArchetypes.slice(0, actualMissingCount);

      return {
        profileId: profile.profileId,
        externalId: profile.externalId,
        editableId: editableIds[profile.profileId] || profile.editableProfileId || profile.externalId,
        archetypes,
        archetypeCompleteness,
        hasWearableData,
        archetypesByCategory,
        missingArchetypes: actualMissingArchetypes,
        dataQuality: archetypeCompleteness > 80 ? 'high' : archetypeCompleteness > 60 ? 'medium' : 'low'
      };
    });
  }, [profiles, editableIds]);

  // Organizational archetype distributions
  const organizationalArchetypeDistribution = useMemo(() => {
    const distribution: Record<string, Record<string, number>> = {};
    
    // Initialize distribution counters
    Object.entries(ARCHETYPE_DEFINITIONS).forEach(([archetypeName, definition]) => {
      distribution[archetypeName] = {};
      definition.values.forEach(value => {
        distribution[archetypeName][value] = 0;
      });
    });

    // Count occurrences
    profileArchetypes.forEach(profile => {
      profile.archetypes.forEach(archetype => {
        if (distribution[archetype.name]) {
          distribution[archetype.name][archetype.value] = 
            (distribution[archetype.name][archetype.value] || 0) + 1;
        }
      });
    });

    return distribution;
  }, [profileArchetypes]);

  // Department-based archetype analysis
  const departmentArchetypeAnalysis = useMemo(() => {
    const analysis: Record<string, any> = {};
    
    profileArchetypes.forEach(profile => {
      const department = assignments[profile.profileId] || 'unassigned';
      
      if (!analysis[department]) {
        analysis[department] = {
          department,
          profileCount: 0,
          archetypeDistribution: {},
          averageCompleteness: 0,
          wearableDataCount: 0
        };
      }
      
      analysis[department].profileCount++;
      analysis[department].averageCompleteness += profile.archetypeCompleteness;
      if (profile.hasWearableData) {
        analysis[department].wearableDataCount++;
      }
      
      // Add archetype distributions per department
      profile.archetypes.forEach(archetype => {
        if (!analysis[department].archetypeDistribution[archetype.name]) {
          analysis[department].archetypeDistribution[archetype.name] = {};
        }
        const current = analysis[department].archetypeDistribution[archetype.name][archetype.value] || 0;
        analysis[department].archetypeDistribution[archetype.name][archetype.value] = current + 1;
      });
    });

    // Calculate averages
    Object.keys(analysis).forEach(dept => {
      if (analysis[dept].profileCount > 0) {
        analysis[dept].averageCompleteness = 
          Math.round(analysis[dept].averageCompleteness / analysis[dept].profileCount);
      }
    });

    return analysis;
  }, [profileArchetypes, assignments]);

  return {
    profileArchetypes,
    organizationalArchetypeDistribution,
    departmentArchetypeAnalysis,
    archetypeDefinitions: ARCHETYPE_DEFINITIONS
  };
}