'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';

interface ArchetypeDistributionProps {
  data: any;
  title: string;
  archetypeType: 'activity' | 'sleep' | 'mental' | 'exercise';
}

const DEPARTMENT_COLORS = {
  'Engineering': '#1976d2',
  'Sales': '#388e3c', 
  'Marketing': '#f57c00',
  'HR': '#d32f2f',
  'Operations': '#7b1fa2',
  'Finance': '#0288d1'
};

const ARCHETYPE_LABELS = {
  // Activity archetypes
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  highly_active: 'Highly Active',
  
  // Sleep archetypes
  poor_sleeper: 'Poor Sleeper',
  fair_sleeper: 'Fair Sleeper',
  good_sleeper: 'Good Sleeper',
  excellent_sleeper: 'Excellent Sleeper',
  
  // Mental wellness archetypes
  stressed: 'Stressed',
  balanced: 'Balanced',
  thriving: 'Thriving',
  optimal: 'Optimal',
  
  // Exercise frequency archetypes
  none: 'No Exercise',
  occasional: 'Occasional',
  regular: 'Regular',
  frequent: 'Frequent'
};

export default function ArchetypeDistributionChart({ data, title, archetypeType }: ArchetypeDistributionProps) {
  if (!data || !data.profiles || data.profiles.length === 0) {
    return null;
  }

  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  
  // Define archetype categories based on type
  let archetypeCategories: string[] = [];
  switch (archetypeType) {
    case 'activity':
      archetypeCategories = ['sedentary', 'lightly_active', 'moderately_active', 'highly_active'];
      break;
    case 'sleep':
      archetypeCategories = ['poor_sleeper', 'fair_sleeper', 'good_sleeper', 'excellent_sleeper'];
      break;
    case 'mental':
      archetypeCategories = ['stressed', 'balanced', 'thriving', 'optimal'];
      break;
    case 'exercise':
      archetypeCategories = ['none', 'occasional', 'regular', 'frequent'];
      break;
  }

  // Process data to create horizontal stacked bars
  // Y-axis: archetype types
  // X-axis: population count
  // Stacked segments: departments
  const chartData = archetypeCategories.map(archetype => {
    const archetypeData: any = {
      archetype: ARCHETYPE_LABELS[archetype as keyof typeof ARCHETYPE_LABELS] || archetype
    };
    
    departments.forEach(dept => {
      const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
      
      // Count profiles in this archetype for this department
      let count = 0;
      deptProfiles.forEach((profile: any) => {
        // Check archetype value
        let profileArchetype = null;
        
        switch (archetypeType) {
          case 'activity':
            profileArchetype = profile.archetypes?.activity_level?.value;
            break;
          case 'sleep':
            profileArchetype = profile.archetypes?.sleep_pattern?.value;
            break;
          case 'mental':
            profileArchetype = profile.archetypes?.mental_wellness?.value;
            break;
          case 'exercise':
            profileArchetype = profile.archetypes?.exercise_frequency?.value;
            break;
        }
        
        // If no archetype, derive from score
        if (!profileArchetype) {
          const score = profile.scores?.[archetypeType === 'mental' ? 'mental_wellbeing' : archetypeType]?.value || 0;
          const index = Math.floor(score * archetypeCategories.length);
          profileArchetype = archetypeCategories[Math.min(index, archetypeCategories.length - 1)];
        }
        
        if (profileArchetype === archetype) {
          count++;
        }
      });
      
      archetypeData[dept] = count;
    });
    
    return archetypeData;
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Horizontal stacked bars: Y-axis shows archetype types, X-axis shows population, departments are stacked segments
        </Typography>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            layout="horizontal"
            margin={{ top: 20, right: 30, bottom: 40, left: 120 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: 'Population', position: 'insideBottom', offset: -5 }} />
            <YAxis type="category" dataKey="archetype" width={100} />
            <Tooltip />
            <Legend />
            
            {departments.map(dept => (
              <Bar 
                key={dept}
                dataKey={dept} 
                stackId="a" 
                fill={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}
                name={dept}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        
        <Box mt={2}>
          <Typography variant="caption" color="textSecondary">
            Each bar shows the total population for that archetype type, with colored segments representing different departments.
            This visualization helps identify which departments have concentrations of specific behavioral archetypes.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}