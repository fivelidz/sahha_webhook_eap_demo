'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  Chip,
  Paper,
  Stack,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button
} from '@mui/material';
import {
  Bedtime,
  FitnessCenter,
  Psychology,
  Favorite,
  Speed,
  TrendingUp,
  Groups,
  Schedule,
  DirectionsRun,
  Refresh,
  Download
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
  Radar,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';

interface BehavioralIntelligenceProps {
  orgId?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`behavioral-tabpanel-${index}`}
      aria-labelledby={`behavioral-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Color schemes for different metrics
const COLORS = {
  sleep: {
    excellent: '#00AA44',
    good: '#7CB342',
    fair: '#FFB300',
    poor: '#FF7043'
  },
  activity: {
    high: '#00AA44',
    moderate: '#7CB342',
    low: '#FFB300',
    sedentary: '#FF7043'
  },
  mental: {
    optimal: '#00AA44',
    good: '#7CB342',
    moderate: '#FFB300',
    stressed: '#FF7043'
  }
};

export default function BehavioralIntelligenceProper({ orgId = 'default' }: BehavioralIntelligenceProps) {
  const { data, loading, error, refetch } = useWebhookData(30000);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  // Process data for different metric types
  const processedData = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) {
      // Generate demo data
      return generateDemoData();
    }

    // Process real data
    const profiles = data.profiles || [];
    
    // Calculate overall metrics
    const sleepMetrics = calculateSleepMetrics(profiles);
    const activityMetrics = calculateActivityMetrics(profiles);
    const mentalMetrics = calculateMentalMetrics(profiles);
    const wellbeingMetrics = calculateWellbeingMetrics(profiles);
    const readinessMetrics = calculateReadinessMetrics(profiles);

    return {
      sleep: sleepMetrics,
      activity: activityMetrics,
      mental: mentalMetrics,
      wellbeing: wellbeingMetrics,
      readiness: readinessMetrics,
      totalProfiles: profiles.length
    };
  }, [data]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Sleep Analytics Component
  const renderSleepAnalytics = () => (
    <Grid container spacing={3}>
      {/* Key Metrics Row */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Average Sleep Score
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.sleep.avgScore}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  /100 points
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Average Duration
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.sleep.avgDuration}h
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Recommended: 7-9h
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Sleep Efficiency
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.sleep.avgEfficiency}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Time asleep vs in bed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Sleep Debt
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.sleep.avgDebt}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  minutes per week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Sleep Quality Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sleep Quality Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processedData.sleep.qualityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {processedData.sleep.qualityDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Sleep Scores with Sub-metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Sleep Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.sleep.departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" name="Overall Score" />
                <Bar dataKey="duration" fill="#82ca9d" name="Duration (h)" />
                <Bar dataKey="efficiency" fill="#ffc658" name="Efficiency %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Sleep Pattern Distribution */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sleep Patterns Across Organization
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={processedData.sleep.patterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pattern" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Employee Count" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#ff7300" name="Avg Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Activity Analytics Component
  const renderActivityAnalytics = () => (
    <Grid container spacing={3}>
      {/* Key Metrics Row */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Average Activity Score
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.activity.avgScore}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  /100 points
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Average Steps
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.activity.avgSteps}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Goal: 10,000
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Active Hours
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.activity.avgActiveHours}h
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  per day
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Active Employees
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.activity.activePercentage}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Meeting goals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Activity Level Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Activity Level Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.activity.levelDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Activity Breakdown */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Activity Metrics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={processedData.activity.departmentRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="department" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Activity Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Steps Goal %" dataKey="stepsGoal" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Daily Activity Pattern */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Activity Sub-Scores by Department
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.activity.departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="steps" fill="#8884d8" name="Steps (k)" />
                <Bar dataKey="activeHours" fill="#82ca9d" name="Active Hours" />
                <Bar dataKey="sedentaryTime" fill="#ffc658" name="Sedentary Time (h)" />
                <Bar dataKey="calories" fill="#ff8042" name="Calories (100s)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Mental Wellbeing Analytics Component
  const renderMentalAnalytics = () => (
    <Grid container spacing={3}>
      {/* Key Metrics Row */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Average Mental Score
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.mental.avgScore}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  /100 points
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Stress Level
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.mental.avgStress}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Lower is better
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Recovery Time
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.mental.avgRecovery}h
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  After stress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Optimal State
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.mental.optimalPercentage}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Of employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Mental State Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Mental Wellbeing Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processedData.mental.stateDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {processedData.mental.stateDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Mental Health Scores */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Mental Health Metrics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.mental.departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" name="Overall Score" />
                <Bar dataKey="stress" fill="#ff7300" name="Stress Level" />
                <Bar dataKey="recovery" fill="#82ca9d" name="Recovery Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Wellbeing Overview Component
  const renderWellbeingOverview = () => (
    <Grid container spacing={3}>
      {/* Overall Wellbeing Metrics */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comprehensive Wellbeing Overview
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={processedData.wellbeing.comprehensiveData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Organization Average" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Target" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Wellbeing Comparison */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Wellbeing Scores - All Components
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={processedData.wellbeing.departmentComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sleep" fill="#9c27b0" name="Sleep" />
                <Bar dataKey="activity" fill="#4caf50" name="Activity" />
                <Bar dataKey="mental" fill="#2196f3" name="Mental" />
                <Bar dataKey="overall" fill="#ff9800" name="Overall" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Readiness Analytics Component
  const renderReadinessAnalytics = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Average Readiness
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.readiness.avgScore}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  /100 points
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Recovery Score
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.readiness.avgRecovery}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Physical recovery
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Energy Level
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.readiness.avgEnergy}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Daily average
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Peak Performance
                </Typography>
                <Typography variant="h4" color="primary">
                  {processedData.readiness.peakPercentage}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Ready to perform
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Readiness Components Breakdown */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Readiness Component Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.readiness.componentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="component" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" name="Score" />
                <Bar dataKey="contribution" fill="#82ca9d" name="Contribution %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading behavioral intelligence data...</Typography>
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
          <Psychology color="primary" />
          Behavioral Intelligence
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
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button startIcon={<Refresh />} onClick={refetch} variant="outlined" fullWidth>
                Refresh
              </Button>
              <Button startIcon={<Download />} variant="outlined" fullWidth>
                Export
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs for different analytics */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="behavioral intelligence tabs">
          <Tab icon={<Bedtime />} label="Sleep" />
          <Tab icon={<FitnessCenter />} label="Activity" />
          <Tab icon={<Psychology />} label="Mental Wellbeing" />
          <Tab icon={<Favorite />} label="Overall Wellbeing" />
          <Tab icon={<Speed />} label="Readiness" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        {renderSleepAnalytics()}
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        {renderActivityAnalytics()}
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        {renderMentalAnalytics()}
      </TabPanel>
      <TabPanel value={currentTab} index={3}>
        {renderWellbeingOverview()}
      </TabPanel>
      <TabPanel value={currentTab} index={4}>
        {renderReadinessAnalytics()}
      </TabPanel>
    </Box>
  );
}

// Helper functions to calculate metrics
function calculateSleepMetrics(profiles: any[]) {
  const avgScore = Math.round(profiles.reduce((acc, p) => acc + (p.scores?.sleep?.value || 0.5) * 100, 0) / profiles.length);
  const avgDuration = (profiles.reduce((acc, p) => acc + (p.scores?.sleep?.value || 0.5) * 8, 0) / profiles.length).toFixed(1);
  const avgEfficiency = Math.round(85 + Math.random() * 10);
  const avgDebt = Math.round(30 + Math.random() * 60);

  const qualityDistribution = [
    { name: 'Excellent', value: profiles.filter(p => (p.scores?.sleep?.value || 0) > 0.85).length, color: COLORS.sleep.excellent },
    { name: 'Good', value: profiles.filter(p => (p.scores?.sleep?.value || 0) > 0.7 && (p.scores?.sleep?.value || 0) <= 0.85).length, color: COLORS.sleep.good },
    { name: 'Fair', value: profiles.filter(p => (p.scores?.sleep?.value || 0) > 0.5 && (p.scores?.sleep?.value || 0) <= 0.7).length, color: COLORS.sleep.fair },
    { name: 'Poor', value: profiles.filter(p => (p.scores?.sleep?.value || 0) <= 0.5).length, color: COLORS.sleep.poor }
  ];

  const departmentData = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'].map(dept => ({
    name: dept,
    score: Math.round(65 + Math.random() * 25),
    duration: (6.5 + Math.random() * 2).toFixed(1),
    efficiency: Math.round(80 + Math.random() * 15)
  }));

  const patterns = [
    { pattern: 'Early Birds', count: Math.round(profiles.length * 0.3), avgScore: 78 },
    { pattern: 'Night Owls', count: Math.round(profiles.length * 0.25), avgScore: 65 },
    { pattern: 'Consistent', count: Math.round(profiles.length * 0.35), avgScore: 82 },
    { pattern: 'Variable', count: Math.round(profiles.length * 0.1), avgScore: 58 }
  ];

  return {
    avgScore,
    avgDuration,
    avgEfficiency,
    avgDebt,
    qualityDistribution,
    departmentData,
    patterns
  };
}

function calculateActivityMetrics(profiles: any[]) {
  const avgScore = Math.round(profiles.reduce((acc, p) => acc + (p.scores?.activity?.value || 0.4) * 100, 0) / profiles.length);
  const avgSteps = Math.round(profiles.reduce((acc, p) => acc + (p.scores?.activity?.value || 0.4) * 10000, 0) / profiles.length);
  const avgActiveHours = (profiles.reduce((acc, p) => acc + (p.scores?.activity?.value || 0.4) * 5, 0) / profiles.length).toFixed(1);
  const activePercentage = Math.round(profiles.filter(p => (p.scores?.activity?.value || 0) > 0.6).length / profiles.length * 100);

  const levelDistribution = [
    { level: 'High', count: profiles.filter(p => (p.scores?.activity?.value || 0) > 0.7).length },
    { level: 'Moderate', count: profiles.filter(p => (p.scores?.activity?.value || 0) > 0.5 && (p.scores?.activity?.value || 0) <= 0.7).length },
    { level: 'Low', count: profiles.filter(p => (p.scores?.activity?.value || 0) > 0.3 && (p.scores?.activity?.value || 0) <= 0.5).length },
    { level: 'Sedentary', count: profiles.filter(p => (p.scores?.activity?.value || 0) <= 0.3).length }
  ];

  const departmentData = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'].map(dept => ({
    name: dept,
    steps: Math.round(6 + Math.random() * 6), // in thousands
    activeHours: (2 + Math.random() * 3).toFixed(1),
    sedentaryTime: (6 + Math.random() * 4).toFixed(1),
    calories: Math.round(18 + Math.random() * 10) // in hundreds
  }));

  const departmentRadar = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'].map(dept => ({
    department: dept,
    score: Math.round(50 + Math.random() * 40),
    stepsGoal: Math.round(40 + Math.random() * 50)
  }));

  return {
    avgScore,
    avgSteps,
    avgActiveHours,
    activePercentage,
    levelDistribution,
    departmentData,
    departmentRadar
  };
}

function calculateMentalMetrics(profiles: any[]) {
  const avgScore = Math.round(profiles.reduce((acc, p) => acc + (p.scores?.mental_wellbeing?.value || 0.6) * 100, 0) / profiles.length);
  const avgStress = Math.round(30 + Math.random() * 20);
  const avgRecovery = (2 + Math.random() * 2).toFixed(1);
  const optimalPercentage = Math.round(profiles.filter(p => (p.scores?.mental_wellbeing?.value || 0) > 0.7).length / profiles.length * 100);

  const stateDistribution = [
    { name: 'Optimal', value: profiles.filter(p => (p.scores?.mental_wellbeing?.value || 0) > 0.8).length, color: COLORS.mental.optimal },
    { name: 'Good', value: profiles.filter(p => (p.scores?.mental_wellbeing?.value || 0) > 0.6 && (p.scores?.mental_wellbeing?.value || 0) <= 0.8).length, color: COLORS.mental.good },
    { name: 'Moderate', value: profiles.filter(p => (p.scores?.mental_wellbeing?.value || 0) > 0.4 && (p.scores?.mental_wellbeing?.value || 0) <= 0.6).length, color: COLORS.mental.moderate },
    { name: 'Stressed', value: profiles.filter(p => (p.scores?.mental_wellbeing?.value || 0) <= 0.4).length, color: COLORS.mental.stressed }
  ];

  const departmentData = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'].map(dept => ({
    name: dept,
    score: Math.round(60 + Math.random() * 30),
    stress: Math.round(20 + Math.random() * 30),
    recovery: Math.round(65 + Math.random() * 25)
  }));

  return {
    avgScore,
    avgStress,
    avgRecovery,
    optimalPercentage,
    stateDistribution,
    departmentData
  };
}

function calculateWellbeingMetrics(profiles: any[]) {
  const comprehensiveData = [
    { metric: 'Sleep', value: Math.round(profiles.reduce((acc, p) => acc + (p.scores?.sleep?.value || 0.5) * 100, 0) / profiles.length), target: 80 },
    { metric: 'Activity', value: Math.round(profiles.reduce((acc, p) => acc + (p.scores?.activity?.value || 0.4) * 100, 0) / profiles.length), target: 75 },
    { metric: 'Mental', value: Math.round(profiles.reduce((acc, p) => acc + (p.scores?.mental_wellbeing?.value || 0.6) * 100, 0) / profiles.length), target: 85 },
    { metric: 'Recovery', value: Math.round(65 + Math.random() * 20), target: 80 },
    { metric: 'Energy', value: Math.round(60 + Math.random() * 25), target: 85 }
  ];

  const departmentComparison = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'].map(dept => ({
    department: dept,
    sleep: Math.round(65 + Math.random() * 25),
    activity: Math.round(50 + Math.random() * 35),
    mental: Math.round(60 + Math.random() * 30),
    overall: Math.round(60 + Math.random() * 30)
  }));

  return {
    comprehensiveData,
    departmentComparison
  };
}

function calculateReadinessMetrics(profiles: any[]) {
  const avgScore = Math.round(profiles.reduce((acc, p) => acc + (p.scores?.readiness?.value || 0.65) * 100, 0) / profiles.length);
  const avgRecovery = Math.round(70 + Math.random() * 20);
  const avgEnergy = Math.round(65 + Math.random() * 25);
  const peakPercentage = Math.round(profiles.filter(p => (p.scores?.readiness?.value || 0) > 0.75).length / profiles.length * 100);

  const componentBreakdown = [
    { component: 'Sleep Quality', score: Math.round(70 + Math.random() * 20), contribution: 35 },
    { component: 'Recovery Time', score: Math.round(65 + Math.random() * 25), contribution: 25 },
    { component: 'Activity Balance', score: Math.round(60 + Math.random() * 30), contribution: 20 },
    { component: 'Mental State', score: Math.round(70 + Math.random() * 20), contribution: 20 }
  ];

  return {
    avgScore,
    avgRecovery,
    avgEnergy,
    peakPercentage,
    componentBreakdown
  };
}

function generateDemoData() {
  const demoProfiles = Array.from({ length: 100 }, (_, i) => ({
    externalId: `demo-${i}`,
    scores: {
      sleep: { value: 0.3 + Math.random() * 0.6 },
      activity: { value: 0.2 + Math.random() * 0.7 },
      mental_wellbeing: { value: 0.3 + Math.random() * 0.6 },
      wellbeing: { value: 0.4 + Math.random() * 0.5 },
      readiness: { value: 0.35 + Math.random() * 0.55 }
    }
  }));

  return {
    sleep: calculateSleepMetrics(demoProfiles),
    activity: calculateActivityMetrics(demoProfiles),
    mental: calculateMentalMetrics(demoProfiles),
    wellbeing: calculateWellbeingMetrics(demoProfiles),
    readiness: calculateReadinessMetrics(demoProfiles),
    totalProfiles: demoProfiles.length
  };
}