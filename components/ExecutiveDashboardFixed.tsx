'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  LinearProgress,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Psychology,
  FilterList,
  Refresh,
  Download,
  Assessment,
  FitnessCenter,
  Hotel,
  Mood,
  Speed,
  Favorite,
  DataUsage,
  Insights,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  ReferenceLine
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';
import { useCrossFilter } from '../contexts/CrossFilterContext';

interface ExecutiveDashboardProps {
  orgId?: string;
}

const COLORS = {
  excellent: '#00AA44',
  good: '#7CB342',
  fair: '#FFB300',
  poor: '#FF7043',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  tertiary: '#ec4899',
  quaternary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e'
};

// All 7 viewing criteria as per original EAP
type ViewingCriteria = 
  | 'health_scores' 
  | 'risk_levels' 
  | 'activity_archetypes' 
  | 'sleep_archetypes' 
  | 'wellness_archetypes' 
  | 'data_completeness' 
  | 'eap_insights';

const SCORE_RANGES = {
  excellent: { min: 0.8, max: 1, label: 'Excellent', color: '#00AA44' },
  good: { min: 0.6, max: 0.8, label: 'Good', color: '#7CB342' },
  fair: { min: 0.4, max: 0.6, label: 'Fair', color: '#FFB300' },
  poor: { min: 0, max: 0.4, label: 'Poor', color: '#FF7043' }
};

export default function ExecutiveDashboardFixed({ orgId = 'default' }: ExecutiveDashboardProps) {
  const [demoMode, setDemoMode] = useState(false);
  const { data, loading, error, refetch } = useWebhookData(30000, demoMode);
  const [viewingCriteria, setViewingCriteria] = useState<ViewingCriteria>('health_scores');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');
  
  // Cross-filtering support
  const { 
    filters, 
    toggleDepartment, 
    toggleScoreRange, 
    toggleArchetype,
    clearFilters 
  } = useCrossFilter();

  // Process data with memoization
  const processedData = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) {
      return {
        totalProfiles: 0,
        departments: [],
        overallHealth: { wellbeing: 0, sleep: 0, activity: 0, mental: 0, readiness: 0 },
        healthScoreData: [],
        riskLevelData: [],
        activityArchetypeData: [],
        sleepArchetypeData: [],
        wellnessArchetypeData: [],
        dataCompletenessData: [],
        eapInsightsData: [],
        topMetrics: []
      };
    }

    const profiles = data.profiles;
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
    
    // Calculate health scores by department (dual axis: population + average score)
    const healthScoreData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      const avgWellbeing = count > 0 
        ? deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.wellbeing?.value || 0), 0) / count 
        : 0;
      
      // Score distribution within department
      const excellent = deptProfiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) >= 0.8).length;
      const good = deptProfiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) >= 0.6 && (p.scores?.wellbeing?.value || 0) < 0.8).length;
      const fair = deptProfiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) >= 0.4 && (p.scores?.wellbeing?.value || 0) < 0.6).length;
      const poor = deptProfiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) < 0.4).length;
      
      return {
        department: dept,
        population: count,
        averageScore: Math.round(avgWellbeing * 100),
        excellent,
        good,
        fair,
        poor
      };
    });

    // Calculate risk levels by department
    const riskLevelData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      
      // Determine risk based on multiple factors
      const highRisk = deptProfiles.filter((p: any) => {
        const wellbeing = p.scores?.wellbeing?.value || 0;
        const sleep = p.scores?.sleep?.value || 0;
        const activity = p.scores?.activity?.value || 0;
        return wellbeing < 0.4 || sleep < 0.4 || activity < 0.3;
      }).length;
      
      const mediumRisk = deptProfiles.filter((p: any) => {
        const wellbeing = p.scores?.wellbeing?.value || 0;
        const sleep = p.scores?.sleep?.value || 0;
        const activity = p.scores?.activity?.value || 0;
        const isHighRisk = wellbeing < 0.4 || sleep < 0.4 || activity < 0.3;
        const isMediumRisk = wellbeing < 0.6 || sleep < 0.6 || activity < 0.5;
        return !isHighRisk && isMediumRisk;
      }).length;
      
      const lowRisk = count - highRisk - mediumRisk;
      
      return {
        department: dept,
        population: count,
        highRisk,
        mediumRisk,
        lowRisk,
        riskScore: count > 0 ? Math.round(((highRisk * 3 + mediumRisk * 2 + lowRisk) / (count * 3)) * 100) : 0
      };
    });

    // Calculate activity archetypes by department
    const activityArchetypeData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      const avgActivity = count > 0 
        ? deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.activity?.value || 0), 0) / count 
        : 0;
      
      const sedentary = deptProfiles.filter((p: any) => 
        p.archetypes?.activity_level?.value === 'sedentary').length;
      const lightlyActive = deptProfiles.filter((p: any) => 
        p.archetypes?.activity_level?.value === 'lightly_active').length;
      const moderatelyActive = deptProfiles.filter((p: any) => 
        p.archetypes?.activity_level?.value === 'moderately_active').length;
      const highlyActive = deptProfiles.filter((p: any) => 
        p.archetypes?.activity_level?.value === 'highly_active').length;
      
      return {
        department: dept,
        population: count,
        averageActivityScore: Math.round(avgActivity * 100),
        sedentary,
        lightlyActive,
        moderatelyActive,
        highlyActive
      };
    });

    // Calculate sleep archetypes by department
    const sleepArchetypeData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      const avgSleep = count > 0 
        ? deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.sleep?.value || 0), 0) / count 
        : 0;
      
      const poorSleeper = deptProfiles.filter((p: any) => 
        p.archetypes?.sleep_pattern?.value === 'poor_sleeper').length;
      const fairSleeper = deptProfiles.filter((p: any) => 
        p.archetypes?.sleep_pattern?.value === 'fair_sleeper').length;
      const goodSleeper = deptProfiles.filter((p: any) => 
        p.archetypes?.sleep_pattern?.value === 'good_sleeper').length;
      const excellentSleeper = deptProfiles.filter((p: any) => 
        p.archetypes?.sleep_pattern?.value === 'excellent_sleeper').length;
      
      return {
        department: dept,
        population: count,
        averageSleepScore: Math.round(avgSleep * 100),
        poorSleeper,
        fairSleeper,
        goodSleeper,
        excellentSleeper
      };
    });

    // Calculate wellness archetypes by department
    const wellnessArchetypeData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      const avgMental = count > 0 
        ? deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.mental_wellbeing?.value || 0), 0) / count 
        : 0;
      
      const stressed = deptProfiles.filter((p: any) => 
        p.archetypes?.mental_wellness?.value === 'stressed').length;
      const balanced = deptProfiles.filter((p: any) => 
        p.archetypes?.mental_wellness?.value === 'balanced').length;
      const thriving = deptProfiles.filter((p: any) => 
        p.archetypes?.mental_wellness?.value === 'thriving').length;
      const optimal = deptProfiles.filter((p: any) => 
        p.archetypes?.mental_wellness?.value === 'optimal').length;
      
      return {
        department: dept,
        population: count,
        averageMentalScore: Math.round(avgMental * 100),
        stressed,
        balanced,
        thriving,
        optimal
      };
    });

    // Calculate data completeness by department
    const dataCompletenessData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      
      const withSleep = deptProfiles.filter((p: any) => p.scores?.sleep?.value !== undefined).length;
      const withActivity = deptProfiles.filter((p: any) => p.scores?.activity?.value !== undefined).length;
      const withMental = deptProfiles.filter((p: any) => p.scores?.mental_wellbeing?.value !== undefined).length;
      const withReadiness = deptProfiles.filter((p: any) => p.scores?.readiness?.value !== undefined).length;
      
      const completeness = count > 0 
        ? Math.round(((withSleep + withActivity + withMental + withReadiness) / (count * 4)) * 100)
        : 0;
      
      return {
        department: dept,
        population: count,
        dataCompleteness: completeness,
        withSleep,
        withActivity,
        withMental,
        withReadiness
      };
    });

    // Calculate EAP insights by department
    const eapInsightsData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      
      // Calculate engagement score based on data freshness and completeness
      const recentData = deptProfiles.filter((p: any) => {
        const lastUpdate = new Date(p.lastUpdated || p.createdAt);
        const daysSince = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      }).length;
      
      const engagementScore = count > 0 ? Math.round((recentData / count) * 100) : 0;
      
      // Identify top concerns
      const avgScores = {
        sleep: count > 0 ? deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.sleep?.value || 0), 0) / count : 0,
        activity: count > 0 ? deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.activity?.value || 0), 0) / count : 0,
        mental: count > 0 ? deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.mental_wellbeing?.value || 0), 0) / count : 0
      };
      
      const lowestScore = Math.min(avgScores.sleep, avgScores.activity, avgScores.mental);
      let primaryConcern = 'None';
      if (lowestScore === avgScores.sleep && avgScores.sleep < 0.6) primaryConcern = 'Sleep';
      else if (lowestScore === avgScores.activity && avgScores.activity < 0.6) primaryConcern = 'Activity';
      else if (lowestScore === avgScores.mental && avgScores.mental < 0.6) primaryConcern = 'Mental Health';
      
      return {
        department: dept,
        population: count,
        engagementScore,
        recentUpdates: recentData,
        primaryConcern,
        avgWellbeing: Math.round((count > 0 ? deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.wellbeing?.value || 0), 0) / count : 0) * 100)
      };
    });

    // Calculate overall health metrics
    const overallHealth = {
      wellbeing: Math.round((profiles.reduce((sum: number, p: any) => sum + (p.scores?.wellbeing?.value || 0), 0) / profiles.length) * 100),
      sleep: Math.round((profiles.reduce((sum: number, p: any) => sum + (p.scores?.sleep?.value || 0), 0) / profiles.length) * 100),
      activity: Math.round((profiles.reduce((sum: number, p: any) => sum + (p.scores?.activity?.value || 0), 0) / profiles.length) * 100),
      mental: Math.round((profiles.reduce((sum: number, p: any) => sum + (p.scores?.mental_wellbeing?.value || 0), 0) / profiles.length) * 100),
      readiness: Math.round((profiles.reduce((sum: number, p: any) => sum + (p.scores?.readiness?.value || 0), 0) / profiles.length) * 100)
    };

    // Calculate top metrics
    const topMetrics = [
      {
        label: 'Total Employees',
        value: profiles.length,
        icon: People,
        color: COLORS.primary,
        trend: '+5%'
      },
      {
        label: 'Average Wellbeing',
        value: `${overallHealth.wellbeing}%`,
        icon: Favorite,
        color: overallHealth.wellbeing >= 70 ? COLORS.success : overallHealth.wellbeing >= 50 ? COLORS.warning : COLORS.danger,
        trend: overallHealth.wellbeing >= 70 ? '+2%' : '-1%'
      },
      {
        label: 'High Performers',
        value: profiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) >= 0.8).length,
        icon: TrendingUp,
        color: COLORS.success,
        trend: '+12%'
      },
      {
        label: 'Need Support',
        value: profiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) < 0.4).length,
        icon: Warning,
        color: COLORS.danger,
        trend: '-8%'
      }
    ];

    return {
      totalProfiles: profiles.length,
      departments,
      overallHealth,
      healthScoreData,
      riskLevelData,
      activityArchetypeData,
      sleepArchetypeData,
      wellnessArchetypeData,
      dataCompletenessData,
      eapInsightsData,
      topMetrics
    };
  }, [data]);

  // Custom dual-axis tooltip
  const CustomDualAxisTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" fontWeight="bold">{label}</Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="caption" sx={{ color: entry.color, display: 'block' }}>
              {entry.name}: {entry.value}{entry.name.includes('Score') || entry.name.includes('Completeness') ? '%' : ''}
            </Typography>
          ))}
          <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
            Click to filter
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Render bars function based on viewing criteria
  const renderBars = () => {
    switch (viewingCriteria) {
      case 'health_scores':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={processedData.healthScoreData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis yAxisId="left" label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Average Score (%)', angle: 90, position: 'insideRight' }} />
              <RechartsTooltip content={<CustomDualAxisTooltip />} />
              <Legend />
              
              {/* Stacked bars for score distribution */}
              <Bar yAxisId="left" dataKey="excellent" stackId="a" fill={COLORS.excellent} name="Excellent" />
              <Bar yAxisId="left" dataKey="good" stackId="a" fill={COLORS.good} name="Good" />
              <Bar yAxisId="left" dataKey="fair" stackId="a" fill={COLORS.fair} name="Fair" />
              <Bar yAxisId="left" dataKey="poor" stackId="a" fill={COLORS.poor} name="Poor" />
              
              {/* Line for average score */}
              <Line yAxisId="right" type="monotone" dataKey="averageScore" stroke={COLORS.primary} strokeWidth={3} name="Average Score" />
              
              {/* Reference line for target */}
              <ReferenceLine yAxisId="right" y={70} stroke={COLORS.success} strokeDasharray="5 5" label="Target" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'risk_levels':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={processedData.riskLevelData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis yAxisId="left" label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Risk Score (%)', angle: 90, position: 'insideRight' }} />
              <RechartsTooltip content={<CustomDualAxisTooltip />} />
              <Legend />
              
              <Bar yAxisId="left" dataKey="highRisk" stackId="a" fill={COLORS.danger} name="High Risk" />
              <Bar yAxisId="left" dataKey="mediumRisk" stackId="a" fill={COLORS.warning} name="Medium Risk" />
              <Bar yAxisId="left" dataKey="lowRisk" stackId="a" fill={COLORS.success} name="Low Risk" />
              
              <Line yAxisId="right" type="monotone" dataKey="riskScore" stroke={COLORS.secondary} strokeWidth={3} name="Overall Risk Score" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'activity_archetypes':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={processedData.activityArchetypeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis yAxisId="left" label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Activity Score (%)', angle: 90, position: 'insideRight' }} />
              <RechartsTooltip content={<CustomDualAxisTooltip />} />
              <Legend />
              
              <Bar yAxisId="left" dataKey="sedentary" stackId="a" fill={COLORS.poor} name="Sedentary" />
              <Bar yAxisId="left" dataKey="lightlyActive" stackId="a" fill={COLORS.fair} name="Lightly Active" />
              <Bar yAxisId="left" dataKey="moderatelyActive" stackId="a" fill={COLORS.good} name="Moderately Active" />
              <Bar yAxisId="left" dataKey="highlyActive" stackId="a" fill={COLORS.excellent} name="Highly Active" />
              
              <Line yAxisId="right" type="monotone" dataKey="averageActivityScore" stroke={COLORS.primary} strokeWidth={3} name="Average Activity Score" />
              <ReferenceLine yAxisId="right" y={60} stroke={COLORS.success} strokeDasharray="5 5" label="Target" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'sleep_archetypes':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={processedData.sleepArchetypeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis yAxisId="left" label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Sleep Score (%)', angle: 90, position: 'insideRight' }} />
              <RechartsTooltip content={<CustomDualAxisTooltip />} />
              <Legend />
              
              <Bar yAxisId="left" dataKey="poorSleeper" stackId="a" fill={COLORS.poor} name="Poor Sleeper" />
              <Bar yAxisId="left" dataKey="fairSleeper" stackId="a" fill={COLORS.fair} name="Fair Sleeper" />
              <Bar yAxisId="left" dataKey="goodSleeper" stackId="a" fill={COLORS.good} name="Good Sleeper" />
              <Bar yAxisId="left" dataKey="excellentSleeper" stackId="a" fill={COLORS.excellent} name="Excellent Sleeper" />
              
              <Line yAxisId="right" type="monotone" dataKey="averageSleepScore" stroke={COLORS.secondary} strokeWidth={3} name="Average Sleep Score" />
              <ReferenceLine yAxisId="right" y={70} stroke={COLORS.success} strokeDasharray="5 5" label="Target" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'wellness_archetypes':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={processedData.wellnessArchetypeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis yAxisId="left" label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Mental Score (%)', angle: 90, position: 'insideRight' }} />
              <RechartsTooltip content={<CustomDualAxisTooltip />} />
              <Legend />
              
              <Bar yAxisId="left" dataKey="stressed" stackId="a" fill={COLORS.danger} name="Stressed" />
              <Bar yAxisId="left" dataKey="balanced" stackId="a" fill={COLORS.warning} name="Balanced" />
              <Bar yAxisId="left" dataKey="thriving" stackId="a" fill={COLORS.good} name="Thriving" />
              <Bar yAxisId="left" dataKey="optimal" stackId="a" fill={COLORS.excellent} name="Optimal" />
              
              <Line yAxisId="right" type="monotone" dataKey="averageMentalScore" stroke={COLORS.tertiary} strokeWidth={3} name="Average Mental Score" />
              <ReferenceLine yAxisId="right" y={65} stroke={COLORS.success} strokeDasharray="5 5" label="Target" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'data_completeness':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={processedData.dataCompletenessData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis yAxisId="left" label={{ value: 'Profiles with Data', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Completeness (%)', angle: 90, position: 'insideRight' }} />
              <RechartsTooltip content={<CustomDualAxisTooltip />} />
              <Legend />
              
              <Bar yAxisId="left" dataKey="withSleep" fill={COLORS.primary} name="Sleep Data" />
              <Bar yAxisId="left" dataKey="withActivity" fill={COLORS.secondary} name="Activity Data" />
              <Bar yAxisId="left" dataKey="withMental" fill={COLORS.tertiary} name="Mental Data" />
              <Bar yAxisId="left" dataKey="withReadiness" fill={COLORS.quaternary} name="Readiness Data" />
              
              <Line yAxisId="right" type="monotone" dataKey="dataCompleteness" stroke={COLORS.success} strokeWidth={3} name="Data Completeness" />
              <ReferenceLine yAxisId="right" y={80} stroke={COLORS.warning} strokeDasharray="5 5" label="Target" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'eap_insights':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={processedData.eapInsightsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis yAxisId="left" label={{ value: 'Recent Updates', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Scores (%)', angle: 90, position: 'insideRight' }} />
              <RechartsTooltip content={<CustomDualAxisTooltip />} />
              <Legend />
              
              <Bar yAxisId="left" dataKey="recentUpdates" fill={COLORS.primary} name="Recent Updates (7d)" />
              <Bar yAxisId="left" dataKey="population" fill={COLORS.secondary} opacity={0.3} name="Total Population" />
              
              <Line yAxisId="right" type="monotone" dataKey="engagementScore" stroke={COLORS.success} strokeWidth={3} name="Engagement Score" />
              <Line yAxisId="right" type="monotone" dataKey="avgWellbeing" stroke={COLORS.tertiary} strokeWidth={3} name="Avg Wellbeing" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Handle bar click for cross-filtering
  const handleBarClick = useCallback((data: any) => {
    if (data && data.activeLabel) {
      toggleDepartment(data.activeLabel);
    }
  }, [toggleDepartment]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading executive dashboard...</Typography>
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
    <Box sx={{ p: 3 }}>
      {/* Top Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {processedData.topMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}05 100%)`,
              borderLeft: `4px solid ${metric.color}`
            }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {metric.label}
                    </Typography>
                    <Typography variant="h4" sx={{ color: metric.color, my: 0.5 }}>
                      {metric.value}
                    </Typography>
                    <Chip 
                      label={metric.trend} 
                      size="small" 
                      color={metric.trend.startsWith('+') ? 'success' : 'error'}
                      icon={metric.trend.startsWith('+') ? <TrendingUp /> : <TrendingDown />}
                    />
                  </Box>
                  <metric.icon sx={{ fontSize: 40, color: metric.color, opacity: 0.3 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Header and Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment color="primary" />
              Executive Dashboard
            </Typography>
            
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Viewing Criteria</InputLabel>
                <Select
                  value={viewingCriteria}
                  onChange={(e) => setViewingCriteria(e.target.value as ViewingCriteria)}
                  label="Viewing Criteria"
                >
                  <MenuItem value="health_scores">Health Scores</MenuItem>
                  <MenuItem value="risk_levels">Risk Levels</MenuItem>
                  <MenuItem value="activity_archetypes">Activity Archetypes</MenuItem>
                  <MenuItem value="sleep_archetypes">Sleep Archetypes</MenuItem>
                  <MenuItem value="wellness_archetypes">Wellness Archetypes</MenuItem>
                  <MenuItem value="data_completeness">Data Completeness</MenuItem>
                  <MenuItem value="eap_insights">EAP Insights</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="all">All</MenuItem>
                  {processedData.departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={demoMode}
                    onChange={(e) => setDemoMode(e.target.checked)}
                    color="primary"
                  />
                }
                label={demoMode ? "Demo" : "Live"}
              />

              <IconButton onClick={refetch} color="primary">
                <Refresh />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Main Chart Area */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {viewingCriteria.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')} Analysis
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Click on bars to filter by department • Dual axis shows population (bars) and scores (line)
            </Typography>
          </Box>
          
          <Box onClick={handleBarClick} sx={{ cursor: 'pointer' }}>
            {renderBars()}
          </Box>
        </CardContent>
      </Card>

      {/* Active Filters Display */}
      {filters.departments.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterList color="primary" />
              <Typography variant="subtitle2">Active Filters:</Typography>
              {filters.departments.map(dept => (
                <Chip
                  key={dept}
                  label={dept}
                  size="small"
                  onDelete={() => toggleDepartment(dept)}
                  color="primary"
                />
              ))}
              <Button size="small" onClick={clearFilters}>Clear All</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Insights Panel */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Insights color="primary" />
            Key Insights
          </Typography>
          <Grid container spacing={2}>
            {viewingCriteria === 'eap_insights' && (
              <>
                {processedData.eapInsightsData.map(dept => (
                  <Grid item xs={12} md={4} key={dept.department}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>{dept.department}</Typography>
                      {dept.primaryConcern !== 'None' && (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                          Primary concern: {dept.primaryConcern}
                        </Alert>
                      )}
                      <Typography variant="body2">
                        Engagement: {dept.engagementScore}%
                      </Typography>
                      <Typography variant="body2">
                        Recent updates: {dept.recentUpdates}/{dept.population}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </>
            )}
            
            {viewingCriteria === 'risk_levels' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    {processedData.riskLevelData.filter(d => d.highRisk > 0).length} departments have employees at high risk.
                    Focus intervention on departments with risk scores above 30%.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {viewingCriteria === 'data_completeness' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Average data completeness: {
                      Math.round(processedData.dataCompletenessData.reduce((sum, d) => sum + d.dataCompleteness, 0) / 
                      processedData.dataCompletenessData.length)
                    }%. 
                    Encourage employees to sync their devices regularly for better insights.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}