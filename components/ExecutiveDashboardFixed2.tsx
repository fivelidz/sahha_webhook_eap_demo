'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  People,
  Psychology,
  Assessment,
  FitnessCenter,
  Bedtime,
  Mood,
  DataUsage,
  Refresh,
  Hotel as HotelIcon
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Legend,
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';

interface ExecutiveOverviewProps {
  orgId: string;
  refreshInterval?: number;
}

type ViewingCriteria = 'health_scores' | 'activity_intelligence' | 'sleep_intelligence' | 'data_completeness';

const DEPARTMENT_COLORS = {
  'Engineering': '#1976d2',
  'Sales': '#388e3c', 
  'Marketing': '#f57c00',
  'HR': '#d32f2f',
  'Operations': '#7b1fa2',
  'Finance': '#0288d1'
};

const ARCHETYPE_COLORS = {
  sedentary: '#FF7043',
  lightly_active: '#FFB300',
  moderately_active: '#2196F3',
  highly_active: '#4CAF50',
  none: '#FF7043',
  occasional: '#FFB300',
  regular: '#2196F3',
  frequent: '#4CAF50',
  poor_sleeper: '#FF7043',
  fair_sleeper: '#FFB300',
  good_sleeper: '#2196F3',
  excellent_sleeper: '#4CAF50',
  stressed: '#FF7043',
  balanced: '#FFB300',
  thriving: '#2196F3',
  optimal: '#4CAF50'
};

// Enhanced MetricCard
interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error';
  trend?: number;
}

function MetricCard({ title, value, subtitle, icon, color, trend }: MetricCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                {trend > 0 ? <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} /> : 
                 trend < 0 ? <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} /> : null}
                <Typography variant="caption" color={trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'textSecondary'}>
                  {trend > 0 ? '+' : ''}{trend}% vs last period
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ExecutiveDashboardFixed2({ orgId = 'default', refreshInterval = 30000 }: ExecutiveOverviewProps) {
  const { data, loading, error, refetch } = useWebhookData(refreshInterval);
  const [viewingCriteria, setViewingCriteria] = useState<ViewingCriteria>('health_scores');

  // Process webhook data
  const processedData = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) {
      return {
        totalEmployees: 0,
        avgWellbeing: 0,
        highPerformers: 0,
        needSupport: 0,
        departmentData: [],
        activityIntelligenceData: [],
        sleepIntelligenceData: [],
        activitySubscores: [],
        dataCompletenessData: []
      };
    }

    const profiles = data.profiles;
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
    
    // Calculate overall metrics
    const totalEmployees = profiles.length;
    const avgWellbeing = Math.round(
      profiles.reduce((sum: number, p: any) => sum + (p.scores?.wellbeing?.value || 0), 0) / profiles.length * 100
    );
    const highPerformers = profiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) >= 0.8).length;
    const needSupport = profiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) < 0.4).length;

    // Build department health scores data
    const departmentData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      
      if (count === 0) {
        return {
          name: dept,
          employeeCount: 0,
          overall_health: 0,
          wellbeing: 0,
          activity: 0,
          sleep: 0,
          mental_wellbeing: 0
        };
      }

      const metrics = {
        overall_health: Math.round(
          deptProfiles.reduce((sum: number, p: any) => {
            const scores = [
              p.scores?.wellbeing?.value || 0,
              p.scores?.sleep?.value || 0,
              p.scores?.activity?.value || 0,
              p.scores?.mental_wellbeing?.value || 0
            ];
            return sum + (scores.reduce((a, b) => a + b, 0) / scores.length);
          }, 0) / count * 100
        ),
        wellbeing: Math.round(
          deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.wellbeing?.value || 0), 0) / count * 100
        ),
        activity: Math.round(
          deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.activity?.value || 0), 0) / count * 100
        ),
        sleep: Math.round(
          deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.sleep?.value || 0), 0) / count * 100
        ),
        mental_wellbeing: Math.round(
          deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.mental_wellbeing?.value || 0), 0) / count * 100
        )
      };

      return {
        name: dept,
        employeeCount: count,
        ...metrics
      };
    }).filter(d => d.employeeCount > 0);

    // Build activity intelligence data (grouped bars)
    const activityIntelligenceData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      
      if (count === 0) return null;

      // Count archetypes
      const archetypeCounts = {
        sedentary: 0,
        lightly_active: 0,
        moderately_active: 0,
        highly_active: 0
      };

      deptProfiles.forEach((p: any) => {
        const archetype = p.archetypes?.activity_level?.value;
        if (archetype && archetypeCounts.hasOwnProperty(archetype)) {
          archetypeCounts[archetype as keyof typeof archetypeCounts]++;
        } else {
          // Fallback based on activity score
          const score = p.scores?.activity?.value || 0;
          if (score >= 0.75) archetypeCounts.highly_active++;
          else if (score >= 0.5) archetypeCounts.moderately_active++;
          else if (score >= 0.25) archetypeCounts.lightly_active++;
          else archetypeCounts.sedentary++;
        }
      });

      return {
        department: dept,
        ...archetypeCounts
      };
    }).filter(d => d !== null);

    // Build activity subscores data
    const activitySubscores = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      
      if (count === 0) return null;

      const dailySteps = Math.round(
        deptProfiles.reduce((sum: number, p: any) => 
          sum + (p.subScores?.activity?.steps || 7000), 0) / count / 1000
      ); // in thousands
      
      const activeMinutes = deptProfiles.reduce((sum: number, p: any) => 
        sum + (p.subScores?.activity?.activeMinutes || 30), 0) / count;
      const activeHours = Math.round(activeMinutes / 60);
      const inactiveHours = 24 - activeHours;
      
      const overallScore = Math.round(
        deptProfiles.reduce((sum: number, p: any) => 
          sum + (p.scores?.activity?.value || 0), 0) / count * 100
      );

      return {
        department: dept,
        dailySteps,
        activeHours,
        inactiveHours,
        overallScore
      };
    }).filter(d => d !== null);

    // Build sleep intelligence data (dual Y-axis)
    const sleepIntelligenceData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      
      if (count === 0) return null;

      const overallScore = Math.round(
        deptProfiles.reduce((sum: number, p: any) => 
          sum + (p.scores?.sleep?.value || 0), 0) / count * 100
      );
      
      const sleepRegularity = Math.round(
        deptProfiles.reduce((sum: number, p: any) => 
          sum + (p.subScores?.sleep?.efficiency || 0.85), 0) / count * 100
      );
      
      const duration = Math.round(
        deptProfiles.reduce((sum: number, p: any) => 
          sum + (p.subScores?.sleep?.duration || 7), 0) / count * 10
      ) / 10; // One decimal place
      
      const sleepDebt = Math.round((8 - duration) * 60); // in minutes
      
      const circadianAlign = Math.round(
        deptProfiles.reduce((sum: number, p: any) => {
          const midpoint = p.subScores?.sleep?.midpoint || 2;
          return sum + Math.abs(midpoint - 2);
        }, 0) / count * 10
      ) / 10; // hours from ideal

      return {
        department: dept,
        overallScore,
        sleepRegularity,
        duration,
        sleepDebt: Math.max(0, sleepDebt), // Don't show negative debt
        circadianAlign
      };
    }).filter(d => d !== null);

    // Build data completeness
    const dataCompletenessData = departments.map(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      const count = deptProfiles.length;
      
      if (count === 0) return null;

      const withSleep = deptProfiles.filter((p: any) => p.scores?.sleep?.value !== undefined).length;
      const withActivity = deptProfiles.filter((p: any) => p.scores?.activity?.value !== undefined).length;
      const withMental = deptProfiles.filter((p: any) => p.scores?.mental_wellbeing?.value !== undefined).length;
      const withArchetypes = deptProfiles.filter((p: any) => p.archetypes && Object.keys(p.archetypes).length > 0).length;
      
      return {
        department: dept,
        sleepData: Math.round((withSleep / count) * 100),
        activityData: Math.round((withActivity / count) * 100),
        mentalData: Math.round((withMental / count) * 100),
        archetypeData: Math.round((withArchetypes / count) * 100)
      };
    }).filter(d => d !== null);

    return {
      totalEmployees,
      avgWellbeing,
      highPerformers,
      needSupport,
      departmentData,
      activityIntelligenceData,
      sleepIntelligenceData,
      activitySubscores,
      dataCompletenessData
    };
  }, [data]);

  // Render different views based on criteria
  const renderMainChart = () => {
    switch (viewingCriteria) {
      case 'health_scores':
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Health Scores
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="overall_health" fill="#1e88e5" name="Overall Health" />
                  <Bar dataKey="wellbeing" fill="#43a047" name="Wellbeing" />
                  <Bar dataKey="activity" fill="#fb8c00" name="Activity" />
                  <Bar dataKey="sleep" fill="#8e24aa" name="Sleep" />
                  <Bar dataKey="mental_wellbeing" fill="#e53935" name="Mental Wellbeing" />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Department Summary Cards */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Department Summary
                </Typography>
                <Grid container spacing={2}>
                  {processedData.departmentData.map(dept => (
                    <Grid item xs={12} sm={6} md={4} key={dept.name}>
                      <Paper sx={{ p: 2 }}>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {dept.name}
                            </Typography>
                            <Chip 
                              label={`${dept.employeeCount} employees`} 
                              size="small" 
                              color="primary"
                            />
                          </Box>
                          <Divider />
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Average Scores
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                              <Box>
                                <Typography variant="caption">Health</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {dept.overall_health}%
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption">Activity</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {dept.activity}%
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption">Sleep</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {dept.sleep}%
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                          {dept.overall_health < 60 && (
                            <Alert severity="warning" sx={{ py: 0.5 }}>
                              <Typography variant="caption">
                                Department needs wellness intervention
                              </Typography>
                            </Alert>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        );

      case 'activity_intelligence':
        return (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Activity Intelligence - Archetype Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={processedData.activityIntelligenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="sedentary" fill={ARCHETYPE_COLORS.sedentary} name="Sedentary" />
                    <Bar dataKey="lightly_active" fill={ARCHETYPE_COLORS.lightly_active} name="Lightly Active" />
                    <Bar dataKey="moderately_active" fill={ARCHETYPE_COLORS.moderately_active} name="Moderately Active" />
                    <Bar dataKey="highly_active" fill={ARCHETYPE_COLORS.highly_active} name="Highly Active" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Activity Subscore Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData.activitySubscores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="dailySteps" fill="#4CAF50" name="Daily Steps (1000s)" />
                    <Bar dataKey="activeHours" fill="#2196F3" name="Active Hours" />
                    <Bar dataKey="inactiveHours" fill="#FF9800" name="Inactive Hours" />
                    <Bar dataKey="overallScore" fill="#9C27B0" name="Overall Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        );

      case 'sleep_intelligence':
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sleep Intelligence - Department Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={processedData.sleepIntelligenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis yAxisId="time" orientation="left" label={{ value: 'Time (hours/minutes)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="score" orientation="right" domain={[0, 100]} label={{ value: 'Score (%)', angle: 90, position: 'insideRight' }} />
                  <RechartsTooltip />
                  <Legend />
                  
                  {/* Time-based metrics */}
                  <Bar yAxisId="time" dataKey="duration" fill="#2196F3" name="Sleep Duration (hrs)" />
                  <Bar yAxisId="time" dataKey="sleepDebt" fill="#FF9800" name="Sleep Debt (min)" />
                  <Bar yAxisId="time" dataKey="circadianAlign" fill="#9C27B0" name="Circadian Misalignment (hrs)" />
                  
                  {/* Score-based metrics */}
                  <Line yAxisId="score" type="monotone" dataKey="overallScore" stroke="#4CAF50" strokeWidth={3} name="Overall Sleep Score" />
                  <Line yAxisId="score" type="monotone" dataKey="sleepRegularity" stroke="#00BCD4" strokeWidth={3} name="Sleep Regularity" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'data_completeness':
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Completeness by Department
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.dataCompletenessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis domain={[0, 100]} label={{ value: 'Completeness (%)', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="sleepData" fill="#2196F3" name="Sleep Data" />
                  <Bar dataKey="activityData" fill="#4CAF50" name="Activity Data" />
                  <Bar dataKey="mentalData" fill="#9C27B0" name="Mental Health Data" />
                  <Bar dataKey="archetypeData" fill="#FF9800" name="Archetype Data" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

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
      {/* Key Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Employees"
            value={processedData.totalEmployees}
            icon={<People sx={{ fontSize: 40 }} />}
            color="primary"
            trend={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Average Wellbeing"
            value={`${processedData.avgWellbeing}%`}
            icon={<Psychology sx={{ fontSize: 40 }} />}
            color={processedData.avgWellbeing >= 70 ? 'success' : processedData.avgWellbeing >= 50 ? 'warning' : 'error'}
            trend={processedData.avgWellbeing >= 70 ? 3 : -2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="High Performers"
            value={processedData.highPerformers}
            subtitle={`${Math.round((processedData.highPerformers / processedData.totalEmployees) * 100)}% of workforce`}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="success"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Need Support"
            value={processedData.needSupport}
            subtitle={`${Math.round((processedData.needSupport / processedData.totalEmployees) * 100)}% of workforce`}
            icon={<Warning sx={{ fontSize: 40 }} />}
            color="error"
            trend={-8}
          />
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        {/* Left Side - Controls */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Viewing Criteria
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select View</InputLabel>
                <Select
                  value={viewingCriteria}
                  onChange={(e) => setViewingCriteria(e.target.value as ViewingCriteria)}
                  label="Select View"
                >
                  <MenuItem value="health_scores">Health Scores</MenuItem>
                  <MenuItem value="activity_intelligence">Activity Intelligence</MenuItem>
                  <MenuItem value="sleep_intelligence">Sleep Intelligence</MenuItem>
                  <MenuItem value="data_completeness">Data Completeness</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ my: 3 }} />

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={refetch}
              >
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Chart */}
        <Grid item xs={12} md={9}>
          {renderMainChart()}
        </Grid>
      </Grid>
    </Box>
  );
}