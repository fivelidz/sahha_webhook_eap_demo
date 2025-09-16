'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';

interface ComprehensiveArchetypesProps {
  refreshInterval?: number;
}

const DEPARTMENT_COLORS = {
  'Engineering': '#1976d2',
  'Sales': '#388e3c', 
  'Marketing': '#f57c00',
  'HR': '#d32f2f',
  'Operations': '#7b1fa2',
  'Finance': '#0288d1'
};

const ARCHETYPE_COLORS = {
  // Activity levels
  sedentary: '#FF7043',
  lightly_active: '#FFB300',
  moderately_active: '#2196F3',
  highly_active: '#4CAF50',
  
  // Sleep patterns
  poor_sleeper: '#FF7043',
  fair_sleeper: '#FFB300',
  good_sleeper: '#2196F3',
  excellent_sleeper: '#4CAF50',
  
  // Mental wellness
  stressed: '#FF7043',
  balanced: '#FFB300',
  thriving: '#2196F3',
  optimal: '#4CAF50',
  
  // Exercise frequency
  none: '#FF7043',
  occasional: '#FFB300',
  regular: '#2196F3',
  frequent: '#4CAF50'
};

export default function ComprehensiveArchetypes({ refreshInterval = 30000 }: ComprehensiveArchetypesProps) {
  const { data, loading, error } = useWebhookData(refreshInterval);
  
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading comprehensive archetype analysis...</Typography>
      </Box>
    );
  }
  
  if (error || !data || !data.profiles) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Unable to load archetype data</Typography>
      </Box>
    );
  }
  
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  
  // Process data for comprehensive department breakdown
  const processDepartmentArchetypes = (archetypeType: string) => {
    return departments.map(dept => {
      const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
      
      const archetypeData: any = {
        department: dept,
        total: deptProfiles.length
      };
      
      // Count each archetype
      if (archetypeType === 'activity') {
        const counts = { sedentary: 0, lightly_active: 0, moderately_active: 0, highly_active: 0 };
        deptProfiles.forEach((p: any) => {
          const archetype = p.archetypes?.activity_level?.value;
          if (archetype && counts.hasOwnProperty(archetype)) {
            counts[archetype as keyof typeof counts]++;
          } else {
            const score = p.scores?.activity?.value || 0;
            if (score >= 0.75) counts.highly_active++;
            else if (score >= 0.5) counts.moderately_active++;
            else if (score >= 0.25) counts.lightly_active++;
            else counts.sedentary++;
          }
        });
        Object.assign(archetypeData, counts);
      } else if (archetypeType === 'sleep') {
        const counts = { poor_sleeper: 0, fair_sleeper: 0, good_sleeper: 0, excellent_sleeper: 0 };
        deptProfiles.forEach((p: any) => {
          const archetype = p.archetypes?.sleep_pattern?.value;
          if (archetype && counts.hasOwnProperty(archetype)) {
            counts[archetype as keyof typeof counts]++;
          } else {
            const score = p.scores?.sleep?.value || 0;
            if (score >= 0.85) counts.excellent_sleeper++;
            else if (score >= 0.65) counts.good_sleeper++;
            else if (score >= 0.45) counts.fair_sleeper++;
            else counts.poor_sleeper++;
          }
        });
        Object.assign(archetypeData, counts);
      } else if (archetypeType === 'mental') {
        const counts = { stressed: 0, balanced: 0, thriving: 0, optimal: 0 };
        deptProfiles.forEach((p: any) => {
          const archetype = p.archetypes?.mental_wellness?.value;
          if (archetype && counts.hasOwnProperty(archetype)) {
            counts[archetype as keyof typeof counts]++;
          } else {
            const score = p.scores?.mental_wellbeing?.value || 0;
            if (score >= 0.85) counts.optimal++;
            else if (score >= 0.65) counts.thriving++;
            else if (score >= 0.45) counts.balanced++;
            else counts.stressed++;
          }
        });
        Object.assign(archetypeData, counts);
      } else if (archetypeType === 'exercise') {
        const counts = { none: 0, occasional: 0, regular: 0, frequent: 0 };
        deptProfiles.forEach((p: any) => {
          const archetype = p.archetypes?.exercise_frequency?.value;
          if (archetype && counts.hasOwnProperty(archetype)) {
            counts[archetype as keyof typeof counts]++;
          } else {
            const score = p.scores?.activity?.value || 0;
            if (score >= 0.75) counts.frequent++;
            else if (score >= 0.5) counts.regular++;
            else if (score >= 0.25) counts.occasional++;
            else counts.none++;
          }
        });
        Object.assign(archetypeData, counts);
      }
      
      return archetypeData;
    }).filter(d => d.total > 0);
  };
  
  const activityData = processDepartmentArchetypes('activity');
  const sleepData = processDepartmentArchetypes('sleep');
  const mentalData = processDepartmentArchetypes('mental');
  const exerciseData = processDepartmentArchetypes('exercise');
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Comprehensive Archetype Analysis
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Department breakdown showing distribution of behavioral archetypes across the organization
      </Typography>
      
      <Grid container spacing={3}>
        {/* Activity Archetypes */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Level Archetypes by Department
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sedentary" stackId="a" fill={ARCHETYPE_COLORS.sedentary} name="Sedentary" />
                  <Bar dataKey="lightly_active" stackId="a" fill={ARCHETYPE_COLORS.lightly_active} name="Lightly Active" />
                  <Bar dataKey="moderately_active" stackId="a" fill={ARCHETYPE_COLORS.moderately_active} name="Moderately Active" />
                  <Bar dataKey="highly_active" stackId="a" fill={ARCHETYPE_COLORS.highly_active} name="Highly Active" />
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
                Sleep Pattern Archetypes by Department
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="poor_sleeper" stackId="a" fill={ARCHETYPE_COLORS.poor_sleeper} name="Poor Sleeper" />
                  <Bar dataKey="fair_sleeper" stackId="a" fill={ARCHETYPE_COLORS.fair_sleeper} name="Fair Sleeper" />
                  <Bar dataKey="good_sleeper" stackId="a" fill={ARCHETYPE_COLORS.good_sleeper} name="Good Sleeper" />
                  <Bar dataKey="excellent_sleeper" stackId="a" fill={ARCHETYPE_COLORS.excellent_sleeper} name="Excellent Sleeper" />
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
                Mental Wellness Archetypes by Department
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mentalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stressed" stackId="a" fill={ARCHETYPE_COLORS.stressed} name="Stressed" />
                  <Bar dataKey="balanced" stackId="a" fill={ARCHETYPE_COLORS.balanced} name="Balanced" />
                  <Bar dataKey="thriving" stackId="a" fill={ARCHETYPE_COLORS.thriving} name="Thriving" />
                  <Bar dataKey="optimal" stackId="a" fill={ARCHETYPE_COLORS.optimal} name="Optimal" />
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
                Exercise Frequency Archetypes by Department
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={exerciseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="none" stackId="a" fill={ARCHETYPE_COLORS.none} name="No Exercise" />
                  <Bar dataKey="occasional" stackId="a" fill={ARCHETYPE_COLORS.occasional} name="Occasional" />
                  <Bar dataKey="regular" stackId="a" fill={ARCHETYPE_COLORS.regular} name="Regular" />
                  <Bar dataKey="frequent" stackId="a" fill={ARCHETYPE_COLORS.frequent} name="Frequent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Department Summary Cards */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Wellness Summary
              </Typography>
              <Grid container spacing={2}>
                {departments.map(dept => {
                  const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
                  if (deptProfiles.length === 0) return null;
                  
                  // Calculate department metrics
                  const avgWellbeing = Math.round(
                    deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.wellbeing?.value || 0), 0) / 
                    deptProfiles.length * 100
                  );
                  
                  const highPerformers = deptProfiles.filter((p: any) => 
                    (p.scores?.wellbeing?.value || 0) >= 0.8
                  ).length;
                  
                  const needSupport = deptProfiles.filter((p: any) => 
                    (p.scores?.wellbeing?.value || 0) < 0.4
                  ).length;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={dept}>
                      <Paper sx={{ p: 2 }}>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {dept}
                            </Typography>
                            <Chip 
                              label={`${deptProfiles.length} employees`} 
                              size="small" 
                              sx={{ bgcolor: DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS], color: 'white' }}
                            />
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Average Wellbeing
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={avgWellbeing} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: avgWellbeing >= 70 ? 'success.main' : 
                                          avgWellbeing >= 50 ? 'warning.main' : 'error.main'
                                }
                              }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {avgWellbeing}%
                            </Typography>
                          </Box>
                          
                          <Box display="flex" gap={2}>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                High Performers
                              </Typography>
                              <Typography variant="body2" color="success.main" fontWeight="bold">
                                {highPerformers} ({Math.round(highPerformers / deptProfiles.length * 100)}%)
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                Need Support
                              </Typography>
                              <Typography variant="body2" color="error.main" fontWeight="bold">
                                {needSupport} ({Math.round(needSupport / deptProfiles.length * 100)}%)
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}