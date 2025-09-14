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
  ToggleButtonGroup
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
  Mood
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
  Treemap,
  Sankey,
  ComposedChart
} from 'recharts';
import { useWebhookData, calculateDepartmentStats, calculateScoreDistribution } from '../hooks/useWebhookData';

interface ExecutiveDashboardProps {
  orgId?: string;
}

const COLORS = {
  excellent: '#4caf50',
  good: '#8bc34a',
  fair: '#ffeb3b',
  poor: '#ff9800',
  critical: '#f44336',
  primary: '#3b82f6',
  secondary: '#8b5cf6'
};

const SCORE_TYPES = ['wellbeing', 'mental_wellbeing', 'sleep', 'activity', 'readiness'];

export default function ExecutiveDashboard({ orgId = 'default' }: ExecutiveDashboardProps) {
  const { data, loading, error, refetch } = useWebhookData(30000);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('wellbeing');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [drilldownData, setDrilldownData] = useState<any>(null);

  // Filter profiles based on selections
  const filteredProfiles = useMemo(() => {
    if (!data?.profiles) return [];
    
    let profiles = [...data.profiles];
    
    if (selectedDepartment !== 'all') {
      profiles = profiles.filter(p => p.department === selectedDepartment);
    }
    
    return profiles;
  }, [data, selectedDepartment]);

  // Calculate executive metrics
  const executiveMetrics = useMemo(() => {
    if (!filteredProfiles.length) return null;
    
    const totalEmployees = filteredProfiles.length;
    const withData = filteredProfiles.filter(p => p.scores && Object.keys(p.scores).length > 0).length;
    
    // Risk analysis
    const criticalRisk = filteredProfiles.filter(p => {
      const minScore = Math.min(
        p.scores?.wellbeing?.value || 1,
        p.scores?.mental_wellbeing?.value || 1
      );
      return minScore < 0.3;
    }).length;
    
    const mediumRisk = filteredProfiles.filter(p => {
      const minScore = Math.min(
        p.scores?.wellbeing?.value || 1,
        p.scores?.mental_wellbeing?.value || 1
      );
      return minScore >= 0.3 && minScore < 0.5;
    }).length;
    
    // Average scores
    const avgScores: { [key: string]: number } = {};
    SCORE_TYPES.forEach(type => {
      const scores = filteredProfiles
        .map(p => p.scores?.[type]?.value)
        .filter(v => v !== undefined);
      avgScores[type] = scores.length ? 
        scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    });
    
    // Device distribution
    const deviceTypes: { [key: string]: number } = {};
    filteredProfiles.forEach(p => {
      const device = p.device?.source || 'Unknown';
      deviceTypes[device] = (deviceTypes[device] || 0) + 1;
    });
    
    return {
      totalEmployees,
      withData,
      dataCompleteness: Math.round((withData / totalEmployees) * 100),
      criticalRisk,
      mediumRisk,
      lowRisk: totalEmployees - criticalRisk - mediumRisk,
      avgScores,
      deviceTypes,
      departments: calculateDepartmentStats(filteredProfiles),
      distribution: calculateScoreDistribution(filteredProfiles)
    };
  }, [filteredProfiles]);

  // Department comparison data
  const departmentData = useMemo(() => {
    if (!executiveMetrics?.departments) return [];
    
    return executiveMetrics.departments.map(dept => ({
      name: dept.department,
      employees: dept.totalEmployees,
      wellbeing: dept.avgWellbeing,
      risk: dept.riskPercentage,
      color: dept.riskPercentage > 30 ? COLORS.critical : 
             dept.riskPercentage > 20 ? COLORS.poor : 
             dept.riskPercentage > 10 ? COLORS.fair : COLORS.good
    }));
  }, [executiveMetrics]);

  // Score distribution for pie chart
  const distributionData = useMemo(() => {
    if (!executiveMetrics?.distribution) return [];
    
    return Object.entries(executiveMetrics.distribution)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        color: COLORS[key as keyof typeof COLORS]
      }))
      .filter(item => item.value > 0);
  }, [executiveMetrics]);

  // Time series data (simulated for now)
  const timeSeriesData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    const now = Date.now();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        wellbeing: 65 + Math.random() * 20,
        activity: 55 + Math.random() * 25,
        sleep: 60 + Math.random() * 20,
        mental: 58 + Math.random() * 22
      });
    }
    
    return data;
  }, [timeRange]);

  // Handle chart click for drill-down
  const handleChartClick = (data: any, chartType: string) => {
    setSelectedChart(chartType);
    setDrilldownData(data);
    
    // Apply filter based on chart type
    if (chartType === 'department' && data?.name) {
      setSelectedDepartment(data.name);
    } else if (chartType === 'distribution' && data?.name) {
      // Filter by score range
      console.log('Filter by score range:', data.name);
    }
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
      metrics: executiveMetrics,
      profiles: filteredProfiles.map(p => ({
        id: p.externalId,
        department: p.department,
        scores: p.scores,
        device: p.device,
        demographics: p.demographics
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-dashboard-${new Date().toISOString()}.json`;
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
            <FormControl fullWidth size="small">
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                label="Metric"
              >
                {SCORE_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </MenuItem>
                ))}
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
            </ButtonGroup>
          </Grid>
        </Grid>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Data Completeness
              </Typography>
              <Typography variant="h4">
                {executiveMetrics?.dataCompleteness || 0}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={executiveMetrics?.dataCompleteness || 0} 
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="textSecondary">
                {executiveMetrics?.withData || 0} of {executiveMetrics?.totalEmployees || 0} profiles
              </Typography>
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
                {executiveMetrics?.criticalRisk || 0}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Warning color="error" fontSize="small" />
                <Typography variant="caption">
                  Immediate intervention needed
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
                {executiveMetrics?.mediumRisk || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Preventive care recommended
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
                {executiveMetrics?.lowRisk || 0}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <CheckCircle sx={{ color: COLORS.good }} fontSize="small" />
                <Typography variant="caption">
                  Maintain wellness programs
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts */}
      <Grid container spacing={3}>
        {/* Department Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Wellness Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={departmentData}
                  onClick={(data) => data && handleChartClick(data.activePayload?.[0]?.payload, 'department')}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="wellbeing" fill={COLORS.primary} name="Avg Wellbeing %" />
                  <Bar dataKey="risk" fill={COLORS.critical} name="Risk %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Health Score Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Health Score Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) => handleChartClick(data, 'distribution')}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Trend Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Wellness Trends - {timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="wellbeing" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    name="Wellbeing"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mental" 
                    stroke={COLORS.secondary} 
                    strokeWidth={2}
                    name="Mental Health"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activity" 
                    stroke="#ff9800" 
                    strokeWidth={2}
                    name="Activity"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke="#9c27b0" 
                    strokeWidth={2}
                    name="Sleep"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Score Breakdown by Type */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Scores by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={
                  SCORE_TYPES.map(type => ({
                    metric: type.replace('_', ' '),
                    score: Math.round((executiveMetrics?.avgScores[type] || 0) * 100)
                  }))
                }>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar 
                    name="Organization Average" 
                    dataKey="score" 
                    stroke={COLORS.primary} 
                    fill={COLORS.primary} 
                    fillOpacity={0.6} 
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(executiveMetrics?.deviceTypes || {}).map(([device, count]) => ({
                      name: device,
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {Object.entries(executiveMetrics?.deviceTypes || {}).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Selected Data Drill-down */}
      {drilldownData && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="subtitle2">
              Drill-down: {selectedChart} - {drilldownData.name || 'Selected'}
            </Typography>
            <Typography variant="caption">
              Click on any chart element to filter and explore the data
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
}