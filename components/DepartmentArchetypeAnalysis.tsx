'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid
} from '@mui/material';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';

const DEPARTMENT_COLORS = {
  'Engineering': '#1976d2',
  'Sales': '#388e3c', 
  'Marketing': '#f57c00',
  'HR': '#d32f2f',
  'Operations': '#7b1fa2',
  'Finance': '#0288d1'
};

export default function DepartmentArchetypeAnalysis() {
  const { data } = useWebhookData(30000);
  
  if (!data || !data.profiles) {
    return null;
  }
  
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  
  // Process data for horizontal stacked bars
  // Y-axis: archetype types, X-axis: population, stacked segments: departments
  
  // Activity archetypes
  const activityArchetypes = ['Highly Active', 'Moderately Active', 'Lightly Active', 'Sedentary'];
  const activityData = activityArchetypes.map(archetype => {
    const row: any = { archetype };
    departments.forEach(dept => {
      const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
      let count = 0;
      
      deptProfiles.forEach((p: any) => {
        const score = p.scores?.activity?.value || 0;
        const profileArchetype = 
          score >= 0.75 ? 'Highly Active' :
          score >= 0.5 ? 'Moderately Active' :
          score >= 0.25 ? 'Lightly Active' : 'Sedentary';
        
        if (profileArchetype === archetype) count++;
      });
      
      row[dept] = count;
    });
    return row;
  });
  
  // Sleep archetypes
  const sleepArchetypes = ['Excellent Sleeper', 'Good Sleeper', 'Fair Sleeper', 'Poor Sleeper'];
  const sleepData = sleepArchetypes.map(archetype => {
    const row: any = { archetype };
    departments.forEach(dept => {
      const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
      let count = 0;
      
      deptProfiles.forEach((p: any) => {
        const score = p.scores?.sleep?.value || 0;
        const profileArchetype = 
          score >= 0.85 ? 'Excellent Sleeper' :
          score >= 0.65 ? 'Good Sleeper' :
          score >= 0.45 ? 'Fair Sleeper' : 'Poor Sleeper';
        
        if (profileArchetype === archetype) count++;
      });
      
      row[dept] = count;
    });
    return row;
  });
  
  // Mental wellness archetypes
  const mentalArchetypes = ['Optimal', 'Thriving', 'Balanced', 'Stressed'];
  const mentalData = mentalArchetypes.map(archetype => {
    const row: any = { archetype };
    departments.forEach(dept => {
      const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
      let count = 0;
      
      deptProfiles.forEach((p: any) => {
        const score = p.scores?.mental_wellbeing?.value || 0;
        const profileArchetype = 
          score >= 0.85 ? 'Optimal' :
          score >= 0.65 ? 'Thriving' :
          score >= 0.45 ? 'Balanced' : 'Stressed';
        
        if (profileArchetype === archetype) count++;
      });
      
      row[dept] = count;
    });
    return row;
  });
  
  // Exercise frequency archetypes
  const exerciseArchetypes = ['Frequent', 'Regular', 'Occasional', 'None'];
  const exerciseData = exerciseArchetypes.map(archetype => {
    const row: any = { archetype };
    departments.forEach(dept => {
      const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
      let count = 0;
      
      deptProfiles.forEach((p: any) => {
        const score = p.scores?.activity?.value || 0;
        const profileArchetype = 
          score >= 0.75 ? 'Frequent' :
          score >= 0.5 ? 'Regular' :
          score >= 0.25 ? 'Occasional' : 'None';
        
        if (profileArchetype === archetype) count++;
      });
      
      row[dept] = count;
    });
    return row;
  });
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Department Archetype Analysis
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Horizontal stacked bars showing population distribution across departments for each archetype category
      </Typography>
      
      <Grid container spacing={3}>
        {/* Activity Archetypes */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Level Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={activityData} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Population', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="archetype" width={90} />
                  <Tooltip />
                  <Legend />
                  
                  {departments.map(dept => (
                    <Bar 
                      key={dept}
                      dataKey={dept} 
                      stackId="a" 
                      fill={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Sleep Archetypes */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sleep Pattern Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={sleepData} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Population', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="archetype" width={90} />
                  <Tooltip />
                  <Legend />
                  
                  {departments.map(dept => (
                    <Bar 
                      key={dept}
                      dataKey={dept} 
                      stackId="a" 
                      fill={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Mental Wellness Archetypes */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mental Wellness Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={mentalData} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Population', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="archetype" width={90} />
                  <Tooltip />
                  <Legend />
                  
                  {departments.map(dept => (
                    <Bar 
                      key={dept}
                      dataKey={dept} 
                      stackId="a" 
                      fill={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Exercise Frequency Archetypes */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exercise Frequency Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={exerciseData} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Population', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="archetype" width={90} />
                  <Tooltip />
                  <Legend />
                  
                  {departments.map(dept => (
                    <Bar 
                      key={dept}
                      dataKey={dept} 
                      stackId="a" 
                      fill={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}