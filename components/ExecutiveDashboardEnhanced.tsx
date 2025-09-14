'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Paper,
  Button,
  ButtonGroup,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  LinearProgress,
  Alert,
  Stack,
  Tooltip,
  IconButton,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  People,
  Psychology,
  BusinessCenter,
  FilterList,
  Refresh,
  Download,
  DateRange,
  Assessment,
  Dashboard,
  Biotech,
  FitnessCenter,
  Hotel,
  Mood,
  CrisisAlert,
  LocalHospital,
  HealthAndSafety,
  DataUsage,
  NotificationImportant,
  Clear
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { useWebhookData, calculateDepartmentStats, calculateScoreDistribution } from '../hooks/useWebhookData';

interface ExecutiveDashboardProps {
  orgId?: string;
}

const COLORS = {
  excellent: '#00AA44',
  good: '#7CB342',
  fair: '#FFB300',
  poor: '#FF7043',
  critical: '#CC3333',
  primary: '#3b82f6',
  secondary: '#8b5cf6'
};

const SCORE_TYPES = ['wellbeing', 'mental_wellbeing', 'sleep', 'activity', 'readiness'];

type ViewingCriteria = 'health_scores' | 'risk_levels' | 'activity_archetypes' | 'sleep_archetypes' | 'wellness_archetypes' | 'data_completeness' | 'eap_insights';

export default function ExecutiveDashboardEnhanced({ orgId = 'default' }: ExecutiveDashboardProps) {
  const { data, loading, error, refetch } = useWebhookData(30000);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewingCriteria, setViewingCriteria] = useState<ViewingCriteria>('health_scores');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [drilldownData, setDrilldownData] = useState<any>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>({});

  // Filter profiles based on selections
  const filteredProfiles = useMemo(() => {
    if (!data?.profiles) return [];
    
    let profiles = [...data.profiles];
    
    if (selectedDepartment !== 'all') {
      profiles = profiles.filter(p => p.department === selectedDepartment);
    }
    
    // Apply additional filters from chart interactions
    if (selectedFilters.riskLevel) {
      profiles = profiles.filter(p => {
        const minScore = Math.min(
          p.scores?.wellbeing?.value || 1,
          p.scores?.mental_wellbeing?.value || 1
        );
        if (selectedFilters.riskLevel === 'critical') return minScore < 0.3;
        if (selectedFilters.riskLevel === 'poor') return minScore >= 0.3 && minScore < 0.5;
        if (selectedFilters.riskLevel === 'fair') return minScore >= 0.5 && minScore < 0.65;
        if (selectedFilters.riskLevel === 'good') return minScore >= 0.65 && minScore < 0.8;
        return minScore >= 0.8;
      });
    }
    
    return profiles;
  }, [data, selectedDepartment, selectedFilters]);

  // Calculate executive metrics with EAP intelligence
  const executiveMetrics = useMemo(() => {
    if (!filteredProfiles.length) return null;
    
    const totalEmployees = filteredProfiles.length;
    const withData = filteredProfiles.filter(p => p.scores && Object.keys(p.scores).length > 0).length;
    
    // EAP Intelligence metrics
    const crisisRisk = filteredProfiles.filter(p => {
      const minScore = Math.min(
        p.scores?.wellbeing?.value || 1,
        p.scores?.mental_wellbeing?.value || 1
      );
      return minScore < 0.25; // Crisis threshold
    }).length;
    
    const preventiveCare = filteredProfiles.filter(p => {
      const minScore = Math.min(
        p.scores?.wellbeing?.value || 1,
        p.scores?.mental_wellbeing?.value || 1
      );
      return minScore >= 0.25 && minScore < 0.5;
    }).length;
    
    const managerAlert = filteredProfiles.filter(p => {
      const trend = calculateTrend(p);
      return trend === 'rapid_decline';
    }).length;
    
    // Data completeness metrics
    const dataCompleteness: { [key: string]: number } = {};
    SCORE_TYPES.forEach(type => {
      const withType = filteredProfiles.filter(p => p.scores?.[type]?.value !== undefined).length;
      dataCompleteness[type] = Math.round((withType / totalEmployees) * 100);
    });
    
    // Calculate score distributions
    const distributions: { [key: string]: any } = {};
    SCORE_TYPES.forEach(type => {
      distributions[type] = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        critical: 0
      };
      
      filteredProfiles.forEach(p => {
        const score = p.scores?.[type]?.value;
        if (score !== undefined) {
          if (score >= 0.8) distributions[type].excellent++;
          else if (score >= 0.65) distributions[type].good++;
          else if (score >= 0.5) distributions[type].fair++;
          else if (score >= 0.3) distributions[type].poor++;
          else distributions[type].critical++;
        }
      });
    });
    
    // Average scores
    const avgScores: { [key: string]: number } = {};
    SCORE_TYPES.forEach(type => {
      const scores = filteredProfiles
        .map(p => p.scores?.[type]?.value)
        .filter(v => v !== undefined);
      avgScores[type] = scores.length ? 
        scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    });
    
    return {
      totalEmployees,
      withData,
      dataCompleteness,
      crisisRisk,
      preventiveCare,
      managerAlert,
      distributions,
      avgScores,
      eapEffectiveness: Math.round(((totalEmployees - crisisRisk) / totalEmployees) * 100),
      departments: calculateDepartmentStats(filteredProfiles)
    };
  }, [filteredProfiles]);

  // Build chart data based on viewing criteria
  const chartData = useMemo(() => {
    if (!executiveMetrics?.departments) return [];
    
    return executiveMetrics.departments.map(dept => {
      const deptProfiles = filteredProfiles.filter(p => p.department === dept.department);
      
      switch (viewingCriteria) {
        case 'health_scores':
          return {
            name: dept.department,
            overall: Math.round(dept.avgWellbeing),
            wellbeing: Math.round(dept.avgWellbeing),
            activity: Math.round(getAvgScore(deptProfiles, 'activity') * 100),
            sleep: Math.round(getAvgScore(deptProfiles, 'sleep') * 100),
            mentalWellbeing: Math.round(getAvgScore(deptProfiles, 'mental_wellbeing') * 100),
            employeeCount: dept.totalEmployees
          };
          
        case 'risk_levels':
          const trends = analyzeTrends(deptProfiles);
          return {
            name: dept.department,
            improving: trends.improving,
            stable: trends.stable,
            declining: trends.declining,
            rapidDecline: trends.rapidDecline,
            employeeCount: dept.totalEmployees
          };
          
        case 'activity_archetypes':
          const activityDist = getScoreDistribution(deptProfiles, 'activity');
          return {
            name: dept.department,
            activity_score: Math.round(getAvgScore(deptProfiles, 'activity') * 100),
            excellent_range: activityDist.excellent,
            good_range: activityDist.good,
            fair_range: activityDist.fair,
            poor_range: activityDist.poor,
            critical_range: activityDist.critical,
            employeeCount: dept.totalEmployees
          };
          
        case 'sleep_archetypes':
          const sleepDist = getScoreDistribution(deptProfiles, 'sleep');
          return {
            name: dept.department,
            sleep_score: Math.round(getAvgScore(deptProfiles, 'sleep') * 100),
            excellent_range: sleepDist.excellent,
            good_range: sleepDist.good,
            fair_range: sleepDist.fair,
            poor_range: sleepDist.poor,
            critical_range: sleepDist.critical,
            employeeCount: dept.totalEmployees
          };
          
        case 'wellness_archetypes':
          const wellnessDist = getScoreDistribution(deptProfiles, 'wellbeing');
          return {
            name: dept.department,
            wellbeing_score: Math.round(dept.avgWellbeing),
            excellent_range: wellnessDist.excellent,
            good_range: wellnessDist.good,
            fair_range: wellnessDist.fair,
            poor_range: wellnessDist.poor,
            critical_range: wellnessDist.critical,
            profiles_with_wellbeing_data: deptProfiles.filter(p => p.scores?.wellbeing).length,
            profiles_no_wellbeing_data: deptProfiles.filter(p => !p.scores?.wellbeing).length,
            employeeCount: dept.totalEmployees
          };
          
        case 'data_completeness':
          return {
            name: dept.department,
            activity_data_percentage: getDataCompleteness(deptProfiles, 'activity'),
            sleep_data_percentage: getDataCompleteness(deptProfiles, 'sleep'),
            wellbeing_data_percentage: getDataCompleteness(deptProfiles, 'wellbeing'),
            mental_wellbeing_data_percentage: getDataCompleteness(deptProfiles, 'mental_wellbeing'),
            readiness_data_percentage: getDataCompleteness(deptProfiles, 'readiness'),
            complete_profiles_percentage: getCompleteProfilesPercentage(deptProfiles),
            total_profiles: dept.totalEmployees,
            employeeCount: dept.totalEmployees
          };
          
        case 'eap_insights':
          const eapMetrics = calculateEAPMetrics(deptProfiles);
          return {
            name: dept.department,
            crisisRisk: eapMetrics.crisis,
            preventiveCare: eapMetrics.preventive,
            managerAlert: Math.round((eapMetrics.managerAlert / dept.totalEmployees) * 100),
            eapEffectiveness: Math.round(eapMetrics.effectiveness),
            employeeCount: dept.totalEmployees
          };
          
        default:
          return {
            name: dept.department,
            employeeCount: dept.totalEmployees
          };
      }
    });
  }, [executiveMetrics, filteredProfiles, viewingCriteria]);

  // Render bars based on viewing criteria
  const renderBars = () => {
    switch (viewingCriteria) {
      case 'activity_archetypes':
        return (
          <>
            <Bar 
              yAxisId="score" 
              dataKey="activity_score" 
              fill="#ff9800" 
              stroke="#e65100" 
              strokeWidth={3}
              fillOpacity={0.9}
              name="🎯 Average Activity Score" 
            />
            <Bar yAxisId="population" dataKey="excellent_range" fill={COLORS.excellent} name="Excellent (80-100)" />
            <Bar yAxisId="population" dataKey="good_range" fill={COLORS.good} name="Good (65-79)" />
            <Bar yAxisId="population" dataKey="fair_range" fill={COLORS.fair} name="Fair (50-64)" />
            <Bar yAxisId="population" dataKey="poor_range" fill={COLORS.poor} name="Poor (30-49)" />
            <Bar yAxisId="population" dataKey="critical_range" fill={COLORS.critical} name="Critical (<30)" />
          </>
        );
      case 'sleep_archetypes':
        return (
          <>
            <Bar 
              yAxisId="score" 
              dataKey="sleep_score" 
              fill="#2196f3" 
              stroke="#0d47a1" 
              strokeWidth={3}
              fillOpacity={0.9}
              name="🎯 Average Sleep Score" 
            />
            <Bar yAxisId="population" dataKey="excellent_range" fill={COLORS.excellent} name="Excellent (80-100)" />
            <Bar yAxisId="population" dataKey="good_range" fill={COLORS.good} name="Good (65-79)" />
            <Bar yAxisId="population" dataKey="fair_range" fill={COLORS.fair} name="Fair (50-64)" />
            <Bar yAxisId="population" dataKey="poor_range" fill={COLORS.poor} name="Poor (30-49)" />
            <Bar yAxisId="population" dataKey="critical_range" fill={COLORS.critical} name="Critical (<30)" />
          </>
        );
      case 'wellness_archetypes':
        return (
          <>
            <Bar 
              yAxisId="score" 
              dataKey="wellbeing_score" 
              fill="#9c27b0" 
              stroke="#4a148c" 
              strokeWidth={3}
              fillOpacity={0.9}
              name="🎯 Average Wellbeing Score" 
            />
            <Bar yAxisId="population" dataKey="excellent_range" fill={COLORS.excellent} name="Excellent (80-100)" />
            <Bar yAxisId="population" dataKey="good_range" fill={COLORS.good} name="Good (65-79)" />
            <Bar yAxisId="population" dataKey="fair_range" fill={COLORS.fair} name="Fair (50-64)" />
            <Bar yAxisId="population" dataKey="poor_range" fill={COLORS.poor} name="Poor (30-49)" />
            <Bar yAxisId="population" dataKey="critical_range" fill={COLORS.critical} name="Critical (<30)" />
          </>
        );
      case 'data_completeness':
        return (
          <>
            <Bar yAxisId="score" dataKey="activity_data_percentage" fill="#4caf50" name="Activity Data %" />
            <Bar yAxisId="score" dataKey="sleep_data_percentage" fill="#2196f3" name="Sleep Data %" />
            <Bar yAxisId="score" dataKey="wellbeing_data_percentage" fill="#ff9800" name="Wellbeing Data %" />
            <Bar yAxisId="score" dataKey="mental_wellbeing_data_percentage" fill="#9c27b0" name="Mental Health Data %" />
            <Bar yAxisId="score" dataKey="readiness_data_percentage" fill="#00acc1" name="Readiness Data %" />
            <Bar yAxisId="score" dataKey="complete_profiles_percentage" fill="#66bb6a" name="Complete Profiles %" />
          </>
        );
      case 'health_scores':
        return (
          <>
            <Bar yAxisId="score" dataKey="overall" fill="#1976d2" name="Overall Health" />
            <Bar yAxisId="score" dataKey="wellbeing" fill="#4caf50" name="Wellbeing" />
            <Bar yAxisId="score" dataKey="activity" fill="#ff9800" name="Activity" />
            <Bar yAxisId="score" dataKey="sleep" fill="#2196f3" name="Sleep" />
            <Bar yAxisId="score" dataKey="mentalWellbeing" fill="#9c27b0" name="Mental Health" />
          </>
        );
      case 'risk_levels':
        return (
          <>
            <Bar yAxisId="population" dataKey="improving" fill="#4caf50" name="Improving Trends" />
            <Bar yAxisId="population" dataKey="stable" fill="#2196f3" name="Stable Performance" />
            <Bar yAxisId="population" dataKey="declining" fill="#ff9800" name="Declining (At Risk)" />
            <Bar yAxisId="population" dataKey="rapidDecline" fill="#f44336" name="Rapid Decline Alert" />
          </>
        );
      case 'eap_insights':
        return (
          <>
            <Bar yAxisId="population" dataKey="crisisRisk" fill="#d32f2f" name="Crisis Intervention Needed" />
            <Bar yAxisId="population" dataKey="preventiveCare" fill="#f57c00" name="Preventive Care Opportunities" />
            <Bar yAxisId="score" dataKey="managerAlert" fill="#ff5722" name="Manager Alert Threshold %" />
            <Bar yAxisId="score" dataKey="eapEffectiveness" fill="#4caf50" name="EAP Effectiveness %" />
          </>
        );
      default:
        return <Bar yAxisId="population" dataKey="employeeCount" fill="#1976d2" name="Employee Count" />;
    }
  };

  // Get chart title based on viewing criteria
  const getChartTitle = () => {
    const filterText = Object.keys(selectedFilters || {}).length > 0 
      ? ` (${Object.keys(selectedFilters).length} filter${Object.keys(selectedFilters).length > 1 ? 's' : ''} active)`
      : '';
      
    switch (viewingCriteria) {
      case 'activity_archetypes':
        return `Department Activity Intelligence${filterText}`;
      case 'sleep_archetypes':
        return `Department Sleep Intelligence${filterText}`;
      case 'wellness_archetypes':
        return `Department Wellness Intelligence${filterText}`;
      case 'data_completeness':
        return `Data Quality Analysis by Department${filterText}`;
      case 'eap_insights':
        return `EAP Intelligence & Crisis Management${filterText}`;
      case 'risk_levels':
        return `Risk Trend Analysis by Department${filterText}`;
      default:
        return `Department Health Analysis${filterText}`;
    }
  };

  // Handle chart click for drill-down
  const handleBarClick = (data: any) => {
    if (data && data.activePayload) {
      const payload = data.activePayload[0].payload;
      setSelectedChart('department');
      setDrilldownData(payload);
      
      // Apply department filter
      if (payload.name) {
        setSelectedDepartment(payload.name);
      }
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedDepartment('all');
    setSelectedFilters({});
    setDrilldownData(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Export data
  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      organization: orgId,
      viewingCriteria,
      metrics: executiveMetrics,
      chartData,
      filters: {
        department: selectedDepartment,
        ...selectedFilters
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-dashboard-${viewingCriteria}-${new Date().toISOString()}.json`;
    a.click();
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

  const hasData = chartData && chartData.length > 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Dashboard color="primary" />
          Executive Dashboard
          <Chip 
            label={`${executiveMetrics?.totalEmployees || 0} Employees`} 
            color="primary" 
            size="small" 
          />
        </Typography>
        
        {/* Controls */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>View</InputLabel>
              <Select
                value={viewingCriteria}
                onChange={(e) => setViewingCriteria(e.target.value as ViewingCriteria)}
                label="View"
              >
                <MenuItem value="health_scores">Health Scores</MenuItem>
                <MenuItem value="risk_levels">Risk Levels</MenuItem>
                <MenuItem value="activity_archetypes">Activity Intelligence</MenuItem>
                <MenuItem value="sleep_archetypes">Sleep Intelligence</MenuItem>
                <MenuItem value="wellness_archetypes">Wellness Intelligence</MenuItem>
                <MenuItem value="data_completeness">Data Completeness</MenuItem>
                <MenuItem value="eap_insights">EAP Intelligence</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Operations">Operations</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(e, val) => val && setTimeRange(val)}
              size="small"
              fullWidth
            >
              <ToggleButton value="7d">7 Days</ToggleButton>
              <ToggleButton value="30d">30 Days</ToggleButton>
              <ToggleButton value="90d">90 Days</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <ButtonGroup fullWidth>
              <Button 
                startIcon={<Refresh />} 
                onClick={handleRefresh}
                variant="outlined"
              >
                Refresh
              </Button>
              <Button 
                startIcon={<Download />} 
                onClick={handleExport}
                variant="outlined"
              >
                Export
              </Button>
              {Object.keys(selectedFilters).length > 0 && (
                <Button 
                  startIcon={<Clear />} 
                  onClick={clearFilters}
                  variant="outlined"
                  color="secondary"
                >
                  Clear
                </Button>
              )}
            </ButtonGroup>
          </Grid>
        </Grid>
      </Box>

      {/* Key Metrics Cards - Update based on viewing criteria */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {viewingCriteria === 'eap_insights' ? (
          <>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: `4px solid ${COLORS.critical}` }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CrisisAlert color="error" />
                    <Typography color="textSecondary" gutterBottom>
                      Crisis Intervention
                    </Typography>
                  </Stack>
                  <Typography variant="h4" color="error">
                    {executiveMetrics?.crisisRisk || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Immediate support needed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: `4px solid ${COLORS.poor}` }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocalHospital sx={{ color: COLORS.poor }} />
                    <Typography color="textSecondary" gutterBottom>
                      Preventive Care
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ color: COLORS.poor }}>
                    {executiveMetrics?.preventiveCare || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Early intervention recommended
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: `4px solid #ff5722` }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <NotificationImportant sx={{ color: '#ff5722' }} />
                    <Typography color="textSecondary" gutterBottom>
                      Manager Alerts
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ color: '#ff5722' }}>
                    {executiveMetrics?.managerAlert || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Rapid decline detected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: `4px solid ${COLORS.good}` }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HealthAndSafety sx={{ color: COLORS.good }} />
                    <Typography color="textSecondary" gutterBottom>
                      EAP Effectiveness
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ color: COLORS.good }}>
                    {executiveMetrics?.eapEffectiveness || 0}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Program performance score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : viewingCriteria === 'data_completeness' ? (
          <>
            {SCORE_TYPES.slice(0, 4).map(type => (
              <Grid item xs={12} md={3} key={type}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Data
                    </Typography>
                    <Typography variant="h4">
                      {executiveMetrics?.dataCompleteness[type] || 0}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={executiveMetrics?.dataCompleteness[type] || 0} 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </>
        ) : (
          <>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Data Completeness
                  </Typography>
                  <Typography variant="h4">
                    {Math.round((executiveMetrics?.withData || 0) / (executiveMetrics?.totalEmployees || 1) * 100)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.round((executiveMetrics?.withData || 0) / (executiveMetrics?.totalEmployees || 1) * 100)} 
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: `4px solid ${COLORS.critical}` }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Critical Risk
                  </Typography>
                  <Typography variant="h4" color="error">
                    {executiveMetrics?.crisisRisk || 0}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Warning color="error" fontSize="small" />
                    <Typography variant="caption">
                      Immediate intervention
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: `4px solid ${COLORS.poor}` }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Medium Risk
                  </Typography>
                  <Typography variant="h4" sx={{ color: COLORS.poor }}>
                    {executiveMetrics?.preventiveCare || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Preventive care needed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ borderLeft: `4px solid ${COLORS.good}` }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Healthy
                  </Typography>
                  <Typography variant="h4" sx={{ color: COLORS.good }}>
                    {(executiveMetrics?.totalEmployees || 0) - (executiveMetrics?.crisisRisk || 0) - (executiveMetrics?.preventiveCare || 0)}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <CheckCircle sx={{ color: COLORS.good }} fontSize="small" />
                    <Typography variant="caption">
                      Maintain programs
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Main Chart with Dual Axis */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {getChartTitle()}
              </Typography>
              {!hasData ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={350}>
                  <DataUsage sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    NO DATA AVAILABLE
                  </Typography>
                  <Typography variant="body2" color="textSecondary" textAlign="center">
                    No data available for the selected criteria
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData} onClick={handleBarClick}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      yAxisId="population" 
                      orientation="left" 
                      label={{ value: 'Population Count', angle: -90, position: 'insideLeft' }} 
                    />
                    <YAxis 
                      yAxisId="score" 
                      orientation="right" 
                      domain={[0, 100]} 
                      label={{ value: 'Score / Percentage', angle: 90, position: 'insideRight' }} 
                    />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toLocaleString() : value, 
                        name
                      ]}
                    />
                    <Legend />
                    {renderBars()}
                  </BarChart>
                </ResponsiveContainer>
              )}
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                💡 Click bars to filter by department • {hasData ? chartData.reduce((sum: number, d: any) => sum + (d.employeeCount || 0), 0) : 0} total employees
                {Object.keys(selectedFilters || {}).length > 0 && ' • Cross-filtered data shown'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional insights based on viewing criteria */}
        {viewingCriteria === 'eap_insights' && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  EAP Action Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell align="center">Crisis Cases</TableCell>
                        <TableCell align="center">Preventive Cases</TableCell>
                        <TableCell align="center">Manager Alerts</TableCell>
                        <TableCell>Recommended Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chartData.map(dept => (
                        <TableRow key={dept.name}>
                          <TableCell>{dept.name}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={dept.crisisRisk} 
                              size="small"
                              color={dept.crisisRisk > 0 ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={dept.preventiveCare} 
                              size="small"
                              color={dept.preventiveCare > 0 ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {dept.managerAlert}%
                          </TableCell>
                          <TableCell>
                            {dept.crisisRisk > 0 ? 'Immediate intervention required' :
                             dept.preventiveCare > 5 ? 'Schedule wellness workshops' :
                             'Monitor and maintain'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Selected Data Drill-down */}
      {drilldownData && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="subtitle2">
              Drill-down: {drilldownData.name} Department
            </Typography>
            <Typography variant="caption">
              {drilldownData.employeeCount} employees • Click any chart to continue filtering
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
}

// Helper functions
function calculateTrend(profile: any): string {
  // Simulate trend calculation based on score patterns
  const wellbeing = profile.scores?.wellbeing?.value || 0.5;
  const mental = profile.scores?.mental_wellbeing?.value || 0.5;
  
  if (wellbeing < 0.3 && mental < 0.3) return 'rapid_decline';
  if (wellbeing < 0.5 || mental < 0.5) return 'declining';
  if (wellbeing > 0.7 && mental > 0.7) return 'improving';
  return 'stable';
}

function analyzeTrends(profiles: any[]): any {
  const trends = {
    improving: 0,
    stable: 0,
    declining: 0,
    rapidDecline: 0
  };
  
  profiles.forEach(p => {
    const trend = calculateTrend(p);
    trends[trend as keyof typeof trends]++;
  });
  
  return trends;
}

function getAvgScore(profiles: any[], scoreType: string): number {
  const scores = profiles
    .map(p => p.scores?.[scoreType]?.value)
    .filter(v => v !== undefined);
  
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
}

function getScoreDistribution(profiles: any[], scoreType: string): any {
  const dist = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    critical: 0
  };
  
  profiles.forEach(p => {
    const score = p.scores?.[scoreType]?.value;
    if (score !== undefined) {
      if (score >= 0.8) dist.excellent++;
      else if (score >= 0.65) dist.good++;
      else if (score >= 0.5) dist.fair++;
      else if (score >= 0.3) dist.poor++;
      else dist.critical++;
    }
  });
  
  return dist;
}

function getDataCompleteness(profiles: any[], scoreType: string): number {
  const withData = profiles.filter(p => p.scores?.[scoreType]?.value !== undefined).length;
  return profiles.length ? Math.round((withData / profiles.length) * 100) : 0;
}

function getCompleteProfilesPercentage(profiles: any[]): number {
  const complete = profiles.filter(p => {
    return SCORE_TYPES.every(type => p.scores?.[type]?.value !== undefined);
  }).length;
  
  return profiles.length ? Math.round((complete / profiles.length) * 100) : 0;
}

function calculateEAPMetrics(profiles: any[]): any {
  let crisis = 0;
  let preventive = 0;
  let managerAlert = 0;
  
  profiles.forEach(p => {
    const minScore = Math.min(
      p.scores?.wellbeing?.value || 1,
      p.scores?.mental_wellbeing?.value || 1
    );
    
    if (minScore < 0.25) crisis++;
    else if (minScore < 0.5) preventive++;
    
    if (calculateTrend(p) === 'rapid_decline') managerAlert++;
  });
  
  const effectiveness = profiles.length ? 
    ((profiles.length - crisis) / profiles.length) * 100 : 100;
  
  return { crisis, preventive, managerAlert, effectiveness };
}