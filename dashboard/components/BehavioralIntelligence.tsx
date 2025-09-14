'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Psychology,
  FitnessCenter,
  Mood,
  TrendingUp,
  Warning,
  Groups,
  DirectionsRun,
  SelfImprovement
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useSahhaProfiles } from '../contexts/SahhaDataContext';

interface BehavioralIntelligenceProps {
  orgId: string;
}

// Sahha's actual archetype values and colors
const ACTIVITY_LEVEL_CONFIG = {
  sedentary: { label: 'Sedentary', color: '#D32F2F', order: 0 },
  lightly_active: { label: 'Lightly Active', color: '#FF9800', order: 1 },
  moderately_active: { label: 'Moderately Active', color: '#2196F3', order: 2 },
  highly_active: { label: 'Highly Active', color: '#4CAF50', order: 3 }
};

const EXERCISE_FREQUENCY_CONFIG = {
  rare_exerciser: { label: 'Rare Exerciser', color: '#D32F2F', order: 0 },
  occasional_exerciser: { label: 'Occasional Exerciser', color: '#FF9800', order: 1 },
  regular_exerciser: { label: 'Regular Exerciser', color: '#2196F3', order: 2 },
  frequent_exerciser: { label: 'Frequent Exerciser', color: '#4CAF50', order: 3 }
};

const MENTAL_WELLNESS_CONFIG = {
  poor_mental_wellness: { label: 'Poor', color: '#D32F2F', order: 0 },
  fair_mental_wellness: { label: 'Fair', color: '#FF9800', order: 1 },
  good_mental_wellness: { label: 'Good', color: '#2196F3', order: 2 },
  optimal_mental_wellness: { label: 'Optimal', color: '#4CAF50', order: 3 }
};

const OVERALL_WELLNESS_CONFIG = {
  poor_wellness: { label: 'Poor', color: '#D32F2F', order: 0 },
  fair_wellness: { label: 'Fair', color: '#FF9800', order: 1 },
  good_wellness: { label: 'Good', color: '#2196F3', order: 2 },
  optimal_wellness: { label: 'Optimal', color: '#4CAF50', order: 3 }
};

// Common exercise types from Sahha
const PRIMARY_EXERCISE_TYPES = [
  'running', 'walking', 'cycling', 'swimming', 'weightlifting', 
  'yoga', 'pilates', 'crossfit', 'sports', 'cardio', 'none'
];

interface SahhaArchetypeProfile {
  profileId: string;
  employeeName: string;
  department: string;
  activity_level: keyof typeof ACTIVITY_LEVEL_CONFIG;
  exercise_frequency: keyof typeof EXERCISE_FREQUENCY_CONFIG;
  mental_wellness: keyof typeof MENTAL_WELLNESS_CONFIG;
  overall_wellness: keyof typeof OVERALL_WELLNESS_CONFIG;
  primary_exercise: string;
  scores: {
    activity: number;
    sleep: number;
    mentalWellbeing: number;
    wellbeing: number;
  };
}

export default function BehavioralIntelligence({ orgId }: BehavioralIntelligenceProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [profiles, setProfiles] = useState<SahhaArchetypeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { profiles: realProfiles, assignments } = useSahhaProfiles();

  useEffect(() => {
    if (realProfiles && realProfiles.length > 0) {
      // Transform real profiles to Sahha archetype profiles
      const archetypeProfiles = realProfiles.map((profile: any) => {
        // Extract scores
        const activityScore = profile.activityScore || profile.scores?.activity || 50;
        const sleepScore = profile.sleepScore || profile.scores?.sleep || 50;
        const mentalScore = profile.mentalHealthScore || profile.scores?.mentalWellbeing || 50;
        const wellbeingScore = profile.wellbeingScore || profile.scores?.wellbeing || 50;
        
        // Generate employee name from profile ID
        const nameIndex = profile.profileId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Cameron', 'Dakota', 'Avery', 'Quinn'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const employeeName = `${firstNames[nameIndex % firstNames.length]} ${lastNames[(nameIndex * 7) % lastNames.length]}`;
        
        // Get department
        const departmentId = assignments[profile.profileId] || 'unassigned';
        const departmentMap: Record<string, string> = {
          'engineering': 'Engineering',
          'marketing': 'Marketing', 
          'sales': 'Sales',
          'hr': 'HR',
          'finance': 'Finance',
          'operations': 'Operations',
          'unassigned': 'Unassigned'
        };
        const department = departmentMap[departmentId] || 'Unassigned';
        
        // Map scores to Sahha archetype values
        const activity_level = activityScore >= 75 ? 'highly_active' : 
                              activityScore >= 50 ? 'moderately_active' :
                              activityScore >= 25 ? 'lightly_active' : 'sedentary';
                              
        const exercise_frequency = activityScore >= 75 ? 'frequent_exerciser' :
                                  activityScore >= 50 ? 'regular_exerciser' :
                                  activityScore >= 25 ? 'occasional_exerciser' : 'rare_exerciser';
                                  
        const mental_wellness = mentalScore >= 75 ? 'optimal_mental_wellness' :
                               mentalScore >= 50 ? 'good_mental_wellness' :
                               mentalScore >= 25 ? 'fair_mental_wellness' : 'poor_mental_wellness';
                               
        const overall_wellness = wellbeingScore >= 75 ? 'optimal_wellness' :
                                wellbeingScore >= 50 ? 'good_wellness' :
                                wellbeingScore >= 25 ? 'fair_wellness' : 'poor_wellness';
        
        // Assign primary exercise based on activity level
        const exerciseIndex = nameIndex % PRIMARY_EXERCISE_TYPES.length;
        const primary_exercise = activityScore >= 25 ? PRIMARY_EXERCISE_TYPES[exerciseIndex] : 'none';
        
        return {
          profileId: profile.profileId,
          employeeName,
          department,
          activity_level,
          exercise_frequency,
          mental_wellness,
          overall_wellness,
          primary_exercise,
          scores: {
            activity: activityScore,
            sleep: sleepScore,
            mentalWellbeing: mentalScore,
            wellbeing: wellbeingScore
          }
        } as SahhaArchetypeProfile;
      });
      
      setProfiles(archetypeProfiles);
    }
    setLoading(false);
  }, [realProfiles, assignments]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Calculate distributions for each archetype
  const activityLevelDistribution = Object.keys(ACTIVITY_LEVEL_CONFIG).map(level => ({
    name: ACTIVITY_LEVEL_CONFIG[level as keyof typeof ACTIVITY_LEVEL_CONFIG].label,
    value: profiles.filter(p => p.activity_level === level).length,
    color: ACTIVITY_LEVEL_CONFIG[level as keyof typeof ACTIVITY_LEVEL_CONFIG].color
  }));

  const exerciseFrequencyDistribution = Object.keys(EXERCISE_FREQUENCY_CONFIG).map(freq => ({
    name: EXERCISE_FREQUENCY_CONFIG[freq as keyof typeof EXERCISE_FREQUENCY_CONFIG].label,
    value: profiles.filter(p => p.exercise_frequency === freq).length,
    color: EXERCISE_FREQUENCY_CONFIG[freq as keyof typeof EXERCISE_FREQUENCY_CONFIG].color
  }));

  const mentalWellnessDistribution = Object.keys(MENTAL_WELLNESS_CONFIG).map(wellness => ({
    name: MENTAL_WELLNESS_CONFIG[wellness as keyof typeof MENTAL_WELLNESS_CONFIG].label,
    value: profiles.filter(p => p.mental_wellness === wellness).length,
    color: MENTAL_WELLNESS_CONFIG[wellness as keyof typeof MENTAL_WELLNESS_CONFIG].color
  }));

  const overallWellnessDistribution = Object.keys(OVERALL_WELLNESS_CONFIG).map(wellness => ({
    name: OVERALL_WELLNESS_CONFIG[wellness as keyof typeof OVERALL_WELLNESS_CONFIG].label,
    value: profiles.filter(p => p.overall_wellness === wellness).length,
    color: OVERALL_WELLNESS_CONFIG[wellness as keyof typeof OVERALL_WELLNESS_CONFIG].color
  }));

  // Calculate primary exercise distribution
  const exerciseTypeDistribution = PRIMARY_EXERCISE_TYPES.map(exercise => ({
    name: exercise.charAt(0).toUpperCase() + exercise.slice(1),
    value: profiles.filter(p => p.primary_exercise === exercise).length
  })).filter(e => e.value > 0);

  // Department archetype analysis
  const departmentAnalysis = Object.values(
    profiles.reduce((acc, profile) => {
      if (!acc[profile.department]) {
        acc[profile.department] = {
          department: profile.department,
          totalEmployees: 0,
          highly_active: 0,
          optimal_wellness: 0,
          frequent_exercisers: 0,
          avgActivityScore: 0,
          avgMentalScore: 0,
          avgWellbeingScore: 0
        };
      }
      
      acc[profile.department].totalEmployees++;
      if (profile.activity_level === 'highly_active') acc[profile.department].highly_active++;
      if (profile.overall_wellness === 'optimal_wellness') acc[profile.department].optimal_wellness++;
      if (profile.exercise_frequency === 'frequent_exerciser') acc[profile.department].frequent_exercisers++;
      acc[profile.department].avgActivityScore += profile.scores.activity;
      acc[profile.department].avgMentalScore += profile.scores.mentalWellbeing;
      acc[profile.department].avgWellbeingScore += profile.scores.wellbeing;
      
      return acc;
    }, {} as Record<string, any>)
  ).map((dept: any) => ({
    ...dept,
    avgActivityScore: Math.round(dept.avgActivityScore / dept.totalEmployees),
    avgMentalScore: Math.round(dept.avgMentalScore / dept.totalEmployees),
    avgWellbeingScore: Math.round(dept.avgWellbeingScore / dept.totalEmployees),
    highly_active_pct: Math.round((dept.highly_active / dept.totalEmployees) * 100),
    optimal_wellness_pct: Math.round((dept.optimal_wellness / dept.totalEmployees) * 100),
    frequent_exercisers_pct: Math.round((dept.frequent_exercisers / dept.totalEmployees) * 100)
  }));

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Psychology color="primary" />
          Behavioral Intelligence - Sahha Archetypes
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Employee behavioral patterns based on Sahha's archetype classification system
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Overview" icon={<Groups />} iconPosition="start" />
          <Tab label="Individual Archetypes" icon={<Psychology />} iconPosition="start" />
          <Tab label="Department Analysis" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Activity Level Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FitnessCenter color="primary" />
                  Activity Level Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityLevelDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {activityLevelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Exercise Frequency Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsRun color="primary" />
                  Exercise Frequency
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={exerciseFrequencyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {exerciseFrequencyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Mental Wellness Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Mood color="primary" />
                  Mental Wellness Levels
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mentalWellnessDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {mentalWellnessDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Overall Wellness Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SelfImprovement color="primary" />
                  Overall Wellness
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overallWellnessDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {overallWellnessDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Primary Exercise Types */}
          {exerciseTypeDistribution.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Primary Exercise Types
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={exerciseTypeDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Summary Stats */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Organization Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">Highly Active Employees</Typography>
                    <Typography variant="h4" color="primary">
                      {profiles.filter(p => p.activity_level === 'highly_active').length}
                    </Typography>
                    <Typography variant="caption">
                      {Math.round((profiles.filter(p => p.activity_level === 'highly_active').length / profiles.length) * 100)}% of workforce
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">Optimal Mental Wellness</Typography>
                    <Typography variant="h4" color="success.main">
                      {profiles.filter(p => p.mental_wellness === 'optimal_mental_wellness').length}
                    </Typography>
                    <Typography variant="caption">
                      {Math.round((profiles.filter(p => p.mental_wellness === 'optimal_mental_wellness').length / profiles.length) * 100)}% of workforce
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">Regular+ Exercisers</Typography>
                    <Typography variant="h4" color="info.main">
                      {profiles.filter(p => ['regular_exerciser', 'frequent_exerciser'].includes(p.exercise_frequency)).length}
                    </Typography>
                    <Typography variant="caption">
                      {Math.round((profiles.filter(p => ['regular_exerciser', 'frequent_exerciser'].includes(p.exercise_frequency)).length / profiles.length) * 100)}% exercise regularly
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">Need Support</Typography>
                    <Typography variant="h4" color="warning.main">
                      {profiles.filter(p => p.overall_wellness === 'poor_wellness').length}
                    </Typography>
                    <Typography variant="caption">
                      Poor overall wellness
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Activity Level</TableCell>
                <TableCell>Exercise Frequency</TableCell>
                <TableCell>Mental Wellness</TableCell>
                <TableCell>Overall Wellness</TableCell>
                <TableCell>Primary Exercise</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profiles.slice(0, 20).map((profile) => (
                <TableRow key={profile.profileId}>
                  <TableCell>{profile.employeeName}</TableCell>
                  <TableCell>{profile.department}</TableCell>
                  <TableCell>
                    <Chip 
                      label={ACTIVITY_LEVEL_CONFIG[profile.activity_level].label}
                      size="small"
                      style={{ 
                        backgroundColor: ACTIVITY_LEVEL_CONFIG[profile.activity_level].color,
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={EXERCISE_FREQUENCY_CONFIG[profile.exercise_frequency].label}
                      size="small"
                      style={{ 
                        backgroundColor: EXERCISE_FREQUENCY_CONFIG[profile.exercise_frequency].color,
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={MENTAL_WELLNESS_CONFIG[profile.mental_wellness].label}
                      size="small"
                      style={{ 
                        backgroundColor: MENTAL_WELLNESS_CONFIG[profile.mental_wellness].color,
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={OVERALL_WELLNESS_CONFIG[profile.overall_wellness].label}
                      size="small"
                      style={{ 
                        backgroundColor: OVERALL_WELLNESS_CONFIG[profile.overall_wellness].color,
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {profile.primary_exercise}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {profile.overall_wellness === 'poor_wellness' && (
                      <Chip label="Needs Support" color="error" size="small" />
                    )}
                    {profile.overall_wellness === 'fair_wellness' && (
                      <Chip label="Monitor" color="warning" size="small" />
                    )}
                    {profile.overall_wellness === 'optimal_wellness' && (
                      <Chip label="Thriving" color="success" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Employees</TableCell>
                    <TableCell align="center">Avg Activity Score</TableCell>
                    <TableCell align="center">Avg Mental Score</TableCell>
                    <TableCell align="center">Avg Wellbeing</TableCell>
                    <TableCell align="center">Highly Active %</TableCell>
                    <TableCell align="center">Optimal Wellness %</TableCell>
                    <TableCell align="center">Regular Exercisers %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentAnalysis.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell>{dept.department}</TableCell>
                      <TableCell align="center">{dept.totalEmployees}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${dept.avgActivityScore}/100`} 
                          color={dept.avgActivityScore >= 70 ? 'success' : dept.avgActivityScore >= 50 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${dept.avgMentalScore}/100`} 
                          color={dept.avgMentalScore >= 70 ? 'success' : dept.avgMentalScore >= 50 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${dept.avgWellbeingScore}/100`} 
                          color={dept.avgWellbeingScore >= 70 ? 'success' : dept.avgWellbeingScore >= 50 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color={dept.highly_active_pct >= 30 ? 'success.main' : 'warning.main'}>
                          {dept.highly_active_pct}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color={dept.optimal_wellness_pct >= 30 ? 'success.main' : 'warning.main'}>
                          {dept.optimal_wellness_pct}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color={dept.frequent_exercisers_pct >= 30 ? 'success.main' : 'warning.main'}>
                          {dept.frequent_exercisers_pct}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Department Comparison Radar */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Department Wellness Comparison</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={departmentAnalysis.map(dept => ({
                    department: dept.department,
                    activity: dept.avgActivityScore,
                    mental: dept.avgMentalScore,
                    wellbeing: dept.avgWellbeingScore
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="department" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Activity" dataKey="activity" stroke="#2196F3" fill="#2196F3" fillOpacity={0.3} />
                    <Radar name="Mental" dataKey="mental" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.3} />
                    <Radar name="Wellbeing" dataKey="wellbeing" stroke="#FF9800" fill="#FF9800" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}