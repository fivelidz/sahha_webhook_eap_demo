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
  ButtonGroup,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
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
  Insights,
  Assessment,
  CrisisAlert,
  AccessTime,
  FitnessCenter,
  ExpandMore,
  Biotech,
  Clear,
  LocalHospital,
  Chair,
  Bedtime,
  Hotel as HotelIcon,
  Mood,
  DataUsage,
  Storage as DataUsageIcon,
  Watch,
  LocalHospital as Emergency,
  HealthAndSafety,
  NotificationImportant as Notifications
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';
import DepartmentMatrix from './DepartmentMatrix';

interface ExecutiveOverviewProps {
  orgId: string;
  refreshInterval?: number;
}

type ViewingCriteria = 'health_scores' | 'activity_intelligence' | 'sleep_intelligence' | 'data_completeness';

const HEALTH_SCORE_COLORS = {
  excellent: '#00AA44',
  good: '#7CB342',
  fair: '#FFB300', 
  poor: '#FF7043',
  critical: '#CC3333'
};

const DEPARTMENT_COLORS = {
  'tech': '#1976d2',
  'operations': '#388e3c',
  'sales': '#f57c00',
  'admin': '#7b1fa2',
  'unassigned': '#6b7280',
  // Legacy mappings
  'Engineering': '#1976d2',
  'Operations': '#388e3c',
  'Sales': '#f57c00',
  'Marketing': '#7b1fa2',
  'HR': '#d32f2f',
  'Finance': '#0288d1'
};

// Enhanced MetricCard with trend and interaction
interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error';
  trend?: number;
  onClick?: () => void;
  selected?: boolean;
}

function MetricCard({ title, value, subtitle, icon, color, trend, onClick, selected }: MetricCardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        border: selected ? 2 : 1,
        borderColor: selected ? `${color}.main` : 'divider',
        '&:hover': onClick ? { boxShadow: 3 } : {}
      }}
      onClick={onClick}
    >
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

export default function ExecutiveDashboardOriginal({ orgId = 'default', refreshInterval = 30000 }: ExecutiveOverviewProps) {
  const { data, loading, error, refetch } = useWebhookData(refreshInterval, true); // Use demo mode
  const [viewingCriteria, setViewingCriteria] = useState<ViewingCriteria>('health_scores');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  // Process webhook data to match original EAP structure
  const processedData = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) {
      return {
        totalEmployees: 0,
        avgWellbeing: 0,
        highPerformers: 0,
        needSupport: 0,
        departmentData: [],
        insights: []
      };
    }

    const profiles = data.profiles;
    // Get unique departments from actual data
    const departmentSet = new Set<string>();
    profiles.forEach((p: any) => {
      const dept = p.department || 'unassigned';
      departmentSet.add(dept);
    });
    const departments = Array.from(departmentSet).sort();
    
    // Calculate overall metrics (scores are already 0-100)
    const totalEmployees = profiles.length;
    const avgWellbeing = Math.round(
      profiles.reduce((sum: number, p: any) => sum + (p.scores?.wellbeing?.value || 0), 0) / profiles.length
    );
    const highPerformers = profiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) >= 80).length;
    const needSupport = profiles.filter((p: any) => (p.scores?.wellbeing?.value || 0) < 40).length;

    // Build department data based on viewing criteria
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
          mental_wellbeing: 0,
          color: DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]
        };
      }

      // Calculate scores for each metric (scores are already 0-100)
      const metrics = {
        overall_health: Math.round(
          deptProfiles.reduce((sum: number, p: any) => {
            const scores = [
              p.scores?.wellbeing?.value || 0,
              p.scores?.sleep?.value || 0,
              p.scores?.activity?.value || 0,
              p.scores?.mentalWellbeing?.value || 0
            ];
            return sum + (scores.reduce((a, b) => a + b, 0) / scores.length);
          }, 0) / count
        ),
        wellbeing: Math.round(
          deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.wellbeing?.value || 0), 0) / count
        ),
        activity: Math.round(
          deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.activity?.value || 0), 0) / count
        ),
        sleep: Math.round(
          deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.sleep?.value || 0), 0) / count
        ),
        mental_wellbeing: Math.round(
          deptProfiles.reduce((sum: number, p: any) => sum + (p.scores?.mentalWellbeing?.value || 0), 0) / count
        )
      };

      return {
        name: dept,
        employeeCount: count,
        ...metrics,
        color: DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]
      };
    });

    // Generate insights
    const insights = [];
    
    // Find departments with low scores
    departmentData.forEach(dept => {
      if (dept.sleep < 60 && dept.employeeCount > 0) {
        insights.push({
          type: 'warning',
          department: dept.name,
          message: `${dept.name} has low sleep scores (${dept.sleep}%)`,
          metric: 'sleep'
        });
      }
      if (dept.activity < 50 && dept.employeeCount > 0) {
        insights.push({
          type: 'warning',
          department: dept.name,
          message: `${dept.name} has low activity levels (${dept.activity}%)`,
          metric: 'activity'
        });
      }
    });

    // Add positive insights
    const topDept = departmentData.reduce((max, dept) => 
      dept.overall_health > max.overall_health ? dept : max
    , departmentData[0]);
    
    if (topDept && topDept.employeeCount > 0) {
      insights.push({
        type: 'success',
        department: topDept.name,
        message: `${topDept.name} has the highest overall health score (${topDept.overall_health}%)`,
        metric: 'overall'
      });
    }

    return {
      totalEmployees,
      avgWellbeing,
      highPerformers,
      needSupport,
      departmentData,
      insights
    };
  }, [data]);

  // Render the department chart based on viewing criteria
  const renderDepartmentChart = () => {
    const chartData = processedData.departmentData.filter(d => d.employeeCount > 0);
    
    if (viewingCriteria === 'health_scores') {
      // Show separate columns for each health metric
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
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
      );
    } else if (viewingCriteria === 'activity_intelligence') {
      // Show both activity archetype distribution and subscores
      const activityData = chartData.map(dept => {
        const deptProfiles = data?.profiles?.filter((p: any) => p.department === dept.name) || [];
        
        // Count real archetypes from data
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
          department: dept.name,
          ...archetypeCounts
        };
      });

      // Calculate activity subscores
      const activitySubscores = chartData.map(dept => {
        const deptProfiles = data?.profiles?.filter((p: any) => p.department === dept.name) || [];
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
          department: dept.name,
          dailySteps,
          activeHours,
          inactiveHours,
          overallScore
        };
      }).filter(d => d !== null);

      return (
        <>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Activity Archetype Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sedentary" fill="#FF7043" name="Sedentary" />
                <Bar dataKey="lightly_active" fill="#FFB300" name="Lightly Active" />
                <Bar dataKey="moderately_active" fill="#2196F3" name="Moderately Active" />
                <Bar dataKey="highly_active" fill="#4CAF50" name="Highly Active" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Activity Subscore Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={activitySubscores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis yAxisId="count" orientation="left" label={{ value: 'Steps (1000s) / Score', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="time" orientation="right" domain={[0, 24]} label={{ value: 'Hours', angle: 90, position: 'insideRight' }} />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="count" dataKey="dailySteps" fill="#4CAF50" name="Daily Steps (1000s)" />
                <Bar yAxisId="time" dataKey="activeHours" fill="#2196F3" name="Active Hours" />
                <Bar yAxisId="time" dataKey="inactiveHours" fill="#FF9800" name="Inactive Hours" />
                <Bar yAxisId="count" dataKey="overallScore" fill="#9C27B0" name="Overall Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </>
      );
    } else if (viewingCriteria === 'sleep_intelligence') {
      // Show sleep intelligence with dual Y-axis
      const sleepData = chartData.map(dept => {
        const deptProfiles = data?.profiles?.filter((p: any) => p.department === dept.name) || [];
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
        ) / 10;
        
        const sleepDebt = Math.round((8 - duration) * 60);

        return {
          department: dept.name,
          overallScore,
          sleepRegularity,
          duration,
          sleepDebt: Math.max(0, sleepDebt)
        };
      }).filter(d => d !== null);

      return (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={sleepData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis yAxisId="time" orientation="left" label={{ value: 'Time (hours/minutes)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="score" orientation="right" domain={[0, 100]} label={{ value: 'Score (%)', angle: 90, position: 'insideRight' }} />
            <RechartsTooltip />
            <Legend />
            
            {/* Time-based metrics */}
            <Bar yAxisId="time" dataKey="duration" fill="#2196F3" name="Sleep Duration (hrs)" />
            <Bar yAxisId="time" dataKey="sleepDebt" fill="#FF9800" name="Sleep Debt (min)" />
            
            {/* Score-based metrics - using bars instead of lines */}
            <Bar yAxisId="score" dataKey="overallScore" fill="#4CAF50" name="Overall Sleep Score" />
            <Bar yAxisId="score" dataKey="sleepRegularity" fill="#00BCD4" name="Sleep Regularity" />
          </ComposedChart>
        </ResponsiveContainer>
      );
    } else if (viewingCriteria === 'data_completeness') {
      // Show data completeness
      const completenessData = chartData.map(dept => {
        const deptProfiles = data?.profiles?.filter((p: any) => p.department === dept.name) || [];
        const count = deptProfiles.length;
        
        if (count === 0) return null;

        const withSleep = deptProfiles.filter((p: any) => p.scores?.sleep?.value !== undefined).length;
        const withActivity = deptProfiles.filter((p: any) => p.scores?.activity?.value !== undefined).length;
        const withMental = deptProfiles.filter((p: any) => p.scores?.mental_wellbeing?.value !== undefined).length;
        const withArchetypes = deptProfiles.filter((p: any) => p.archetypes && Object.keys(p.archetypes).length > 0).length;
        
        return {
          department: dept.name,
          sleepData: Math.round((withSleep / count) * 100),
          activityData: Math.round((withActivity / count) * 100),
          mentalData: Math.round((withMental / count) * 100),
          archetypeData: Math.round((withArchetypes / count) * 100)
        };
      }).filter(d => d !== null);

      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={completenessData}>
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
      );
    } else {
      // Default view
      return renderDepartmentChart();
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading executive overview...</Typography>
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

      {/* Main Chart Area */}
      <Grid container spacing={3}>
        {/* Left Side - Viewing Criteria */}
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

              {/* Quick Actions */}
              <Typography variant="subtitle2" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Insights />}
                sx={{ mt: 1 }}
                onClick={() => setShowInsights(!showInsights)}
              >
                {showInsights ? 'Hide' : 'Show'} Insights
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ mt: 1 }}
                onClick={() => setSelectedDepartment(null)}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Insights Panel */}
          {showInsights && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Insights
                </Typography>
                <List dense>
                  {processedData.insights.map((insight: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {insight.type === 'warning' ? (
                          <Warning color="warning" />
                        ) : (
                          <CheckCircle color="success" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={insight.message}
                        secondary={insight.department}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Side - Chart */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Department Analysis - {viewingCriteria.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Typography>
                <IconButton onClick={refetch}>
                  <TrendingUp />
                </IconButton>
              </Box>
              
              {renderDepartmentChart()}

              {/* Enhanced Department Matrix */}
              <Box sx={{ mt: 3 }}>
                <DepartmentMatrix 
                  selectedDepartment={selectedDepartment}
                  onDepartmentSelect={setSelectedDepartment}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}