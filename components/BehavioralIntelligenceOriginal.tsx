'use client';

import React, { useState, useMemo } from 'react';
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
import { useWebhookData } from '../hooks/useWebhookData';
import ArchetypeDistributionChart from './ArchetypeDistributionChart';
import ComprehensiveArchetypes from './ComprehensiveArchetypes';
import DepartmentArchetypeAnalysis from './DepartmentArchetypeAnalysis';
import DepartmentArchetypeAnalysisInteractive from './DepartmentArchetypeAnalysisInteractive';
import DepartmentAnalysisTab from './DepartmentAnalysisTab';

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
  none: { label: 'None', color: '#D32F2F', order: 0 },
  occasional: { label: 'Occasional', color: '#FF9800', order: 1 },
  regular: { label: 'Regular', color: '#2196F3', order: 2 },
  frequent: { label: 'Frequent', color: '#4CAF50', order: 3 }
};

const SLEEP_PATTERN_CONFIG = {
  poor_sleeper: { label: 'Poor Sleeper', color: '#D32F2F', order: 0 },
  fair_sleeper: { label: 'Fair Sleeper', color: '#FF9800', order: 1 },
  good_sleeper: { label: 'Good Sleeper', color: '#2196F3', order: 2 },
  excellent_sleeper: { label: 'Excellent Sleeper', color: '#4CAF50', order: 3 }
};

const MENTAL_WELLNESS_CONFIG = {
  stressed: { label: 'Stressed', color: '#D32F2F', order: 0 },
  balanced: { label: 'Balanced', color: '#FF9800', order: 1 },
  thriving: { label: 'Thriving', color: '#2196F3', order: 2 },
  optimal: { label: 'Optimal', color: '#4CAF50', order: 3 }
};

export default function BehavioralIntelligenceOriginal({ orgId }: BehavioralIntelligenceProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { data, loading, error } = useWebhookData(30000);

  // Process webhook data to extract archetype information
  const processedData = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) {
      return {
        profiles: [],
        activityLevelDist: [],
        exerciseFreqDist: [],
        sleepPatternDist: [],
        mentalWellnessDist: [],
        departmentAnalysis: [],
        summaryStats: {
          highlyActive: 0,
          optimalMental: 0,
          regularExercisers: 0,
          needSupport: 0,
          total: 0
        }
      };
    }

    const profiles = data.profiles;
    
    // Generate employee names from profile IDs
    const getEmployeeName = (profileId: string) => {
      const nameIndex = profileId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Cameron', 'Dakota', 'Avery', 'Quinn'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
      return `${firstNames[nameIndex % firstNames.length]} ${lastNames[(nameIndex * 7) % lastNames.length]}`;
    };

    // Transform profiles to include employee names and archetype data
    const transformedProfiles = profiles.map((profile: any) => ({
      ...profile,
      employeeName: getEmployeeName(profile.externalId || profile.profileId || Math.random().toString()),
      activity_level: profile.archetypes?.activity_level?.value || 'sedentary',
      exercise_frequency: profile.archetypes?.exercise_frequency?.value || 'none',
      sleep_pattern: profile.archetypes?.sleep_pattern?.value || 'poor_sleeper',
      mental_wellness: profile.archetypes?.mental_wellness?.value || 'stressed'
    }));

    // Calculate distributions for activity level
    const activityLevelDist = Object.keys(ACTIVITY_LEVEL_CONFIG).map(level => ({
      name: ACTIVITY_LEVEL_CONFIG[level as keyof typeof ACTIVITY_LEVEL_CONFIG].label,
      value: transformedProfiles.filter(p => p.activity_level === level).length,
      color: ACTIVITY_LEVEL_CONFIG[level as keyof typeof ACTIVITY_LEVEL_CONFIG].color
    }));

    // Calculate distributions for exercise frequency
    const exerciseFreqDist = Object.keys(EXERCISE_FREQUENCY_CONFIG).map(freq => ({
      name: EXERCISE_FREQUENCY_CONFIG[freq as keyof typeof EXERCISE_FREQUENCY_CONFIG].label,
      value: transformedProfiles.filter(p => p.exercise_frequency === freq).length,
      color: EXERCISE_FREQUENCY_CONFIG[freq as keyof typeof EXERCISE_FREQUENCY_CONFIG].color
    }));

    // Calculate distributions for sleep patterns
    const sleepPatternDist = Object.keys(SLEEP_PATTERN_CONFIG).map(pattern => ({
      name: SLEEP_PATTERN_CONFIG[pattern as keyof typeof SLEEP_PATTERN_CONFIG].label,
      value: transformedProfiles.filter(p => p.sleep_pattern === pattern).length,
      color: SLEEP_PATTERN_CONFIG[pattern as keyof typeof SLEEP_PATTERN_CONFIG].color
    }));

    // Calculate distributions for mental wellness
    const mentalWellnessDist = Object.keys(MENTAL_WELLNESS_CONFIG).map(wellness => ({
      name: MENTAL_WELLNESS_CONFIG[wellness as keyof typeof MENTAL_WELLNESS_CONFIG].label,
      value: transformedProfiles.filter(p => p.mental_wellness === wellness).length,
      color: MENTAL_WELLNESS_CONFIG[wellness as keyof typeof MENTAL_WELLNESS_CONFIG].color
    }));

    // Department archetype analysis
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
    const departmentAnalysis = departments.map(dept => {
      const deptProfiles = transformedProfiles.filter(p => p.department === dept);
      const totalEmployees = deptProfiles.length;
      
      if (totalEmployees === 0) {
        return {
          department: dept,
          totalEmployees: 0,
          highly_active: 0,
          optimal_wellness: 0,
          frequent_exercisers: 0,
          avgActivityScore: 0,
          avgMentalScore: 0,
          avgWellbeingScore: 0,
          highly_active_pct: 0,
          optimal_wellness_pct: 0,
          frequent_exercisers_pct: 0
        };
      }
      
      const highly_active = deptProfiles.filter(p => p.activity_level === 'highly_active').length;
      const optimal_wellness = deptProfiles.filter(p => p.mental_wellness === 'optimal').length;
      const frequent_exercisers = deptProfiles.filter(p => p.exercise_frequency === 'frequent').length;
      
      const avgActivityScore = Math.round(
        deptProfiles.reduce((sum, p) => sum + (p.scores?.activity?.value || 0), 0) / totalEmployees * 100
      );
      const avgMentalScore = Math.round(
        deptProfiles.reduce((sum, p) => sum + (p.scores?.mental_wellbeing?.value || 0), 0) / totalEmployees * 100
      );
      const avgWellbeingScore = Math.round(
        deptProfiles.reduce((sum, p) => sum + (p.scores?.wellbeing?.value || 0), 0) / totalEmployees * 100
      );
      
      return {
        department: dept,
        totalEmployees,
        highly_active,
        optimal_wellness,
        frequent_exercisers,
        avgActivityScore,
        avgMentalScore,
        avgWellbeingScore,
        highly_active_pct: Math.round((highly_active / totalEmployees) * 100),
        optimal_wellness_pct: Math.round((optimal_wellness / totalEmployees) * 100),
        frequent_exercisers_pct: Math.round((frequent_exercisers / totalEmployees) * 100)
      };
    }).filter(d => d.totalEmployees > 0);

    // Calculate summary statistics
    const summaryStats = {
      highlyActive: transformedProfiles.filter(p => p.activity_level === 'highly_active').length,
      optimalMental: transformedProfiles.filter(p => p.mental_wellness === 'optimal').length,
      regularExercisers: transformedProfiles.filter(p => 
        ['regular', 'frequent'].includes(p.exercise_frequency)
      ).length,
      needSupport: transformedProfiles.filter(p => 
        p.activity_level === 'sedentary' || p.mental_wellness === 'stressed'
      ).length,
      total: transformedProfiles.length
    };

    return {
      profiles: transformedProfiles,
      activityLevelDist,
      exerciseFreqDist,
      sleepPatternDist,
      mentalWellnessDist,
      departmentAnalysis,
      summaryStats
    };
  }, [data]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
        <Box>
          {/* Use the interactive horizontal stacked bar charts for overview */}
          <DepartmentArchetypeAnalysisInteractive />
        </Box>
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
                <TableCell>Sleep Pattern</TableCell>
                <TableCell>Mental Wellness</TableCell>
                <TableCell>Wellbeing Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processedData.profiles.slice(0, 20).map((profile: any) => (
                <TableRow key={profile.externalId || profile.profileId}>
                  <TableCell>{profile.employeeName}</TableCell>
                  <TableCell>{profile.department || 'Unassigned'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={ACTIVITY_LEVEL_CONFIG[profile.activity_level as keyof typeof ACTIVITY_LEVEL_CONFIG]?.label || 'Unknown'}
                      size="small"
                      style={{ 
                        backgroundColor: ACTIVITY_LEVEL_CONFIG[profile.activity_level as keyof typeof ACTIVITY_LEVEL_CONFIG]?.color || '#999',
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={EXERCISE_FREQUENCY_CONFIG[profile.exercise_frequency as keyof typeof EXERCISE_FREQUENCY_CONFIG]?.label || 'Unknown'}
                      size="small"
                      style={{ 
                        backgroundColor: EXERCISE_FREQUENCY_CONFIG[profile.exercise_frequency as keyof typeof EXERCISE_FREQUENCY_CONFIG]?.color || '#999',
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={SLEEP_PATTERN_CONFIG[profile.sleep_pattern as keyof typeof SLEEP_PATTERN_CONFIG]?.label || 'Unknown'}
                      size="small"
                      style={{ 
                        backgroundColor: SLEEP_PATTERN_CONFIG[profile.sleep_pattern as keyof typeof SLEEP_PATTERN_CONFIG]?.color || '#999',
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={MENTAL_WELLNESS_CONFIG[profile.mental_wellness as keyof typeof MENTAL_WELLNESS_CONFIG]?.label || 'Unknown'}
                      size="small"
                      style={{ 
                        backgroundColor: MENTAL_WELLNESS_CONFIG[profile.mental_wellness as keyof typeof MENTAL_WELLNESS_CONFIG]?.color || '#999',
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.round((profile.scores?.wellbeing?.value || 0) * 100)} 
                      sx={{ width: 100 }}
                    />
                    <Typography variant="caption">
                      {Math.round((profile.scores?.wellbeing?.value || 0) * 100)}%
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <Box>
          {/* Enhanced Department Analysis with multiple views */}
          <DepartmentAnalysisTab />
        </Box>
      )}
    </Box>
  );
}