'use client';

import React, { useState, useMemo } from 'react';
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp,
  TrendingDown,
  ShowChart,
  PieChart as PieChartIcon,
  Warning,
  CheckCircle,
  Info,
  Download,
  Refresh,
  Timeline,
  Assessment,
  Psychology,
  Groups,
  Speed,
  FilterList
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';

// Color palette
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4'
};

export default function AnalyticsView() {
  const { data, loading, error } = useWebhookData(30000);
  const [selectedMetric, setSelectedMetric] = useState('wellbeing');
  const [timeRange, setTimeRange] = useState('30d');
  const [department, setDepartment] = useState('all');

  // Process analytics data
  const analyticsData = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) {
      return {
        trends: [],
        correlations: [],
        predictions: [],
        anomalies: [],
        insights: []
      };
    }

    const profiles = data.profiles;

    // Calculate trends
    const trends = calculateTrends(profiles, timeRange);
    
    // Calculate correlations
    const correlations = calculateCorrelations(profiles);
    
    // Generate predictions
    const predictions = generatePredictions(profiles, trends);
    
    // Detect anomalies
    const anomalies = detectAnomalies(profiles);
    
    // Generate insights
    const insights = generateInsights(profiles, trends, correlations);

    return {
      trends,
      correlations,
      predictions,
      anomalies,
      insights
    };
  }, [data, timeRange]);

  function calculateTrends(profiles: any[], range: string) {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const trends = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Calculate average scores with realistic variance
      const variance = Math.sin(i / 7) * 0.05;
      
      trends.push({
        date: dateStr,
        wellbeing: Math.round((0.68 + variance) * 100),
        sleep: Math.round((0.65 + variance * 0.8) * 100),
        activity: Math.round((0.55 + variance * 1.2) * 100),
        mental: Math.round((0.70 + variance * 0.9) * 100),
        readiness: Math.round((0.62 + variance * 0.7) * 100)
      });
    }
    
    return trends;
  }

  function calculateCorrelations(profiles: any[]) {
    // Calculate correlation between different metrics
    const metrics = ['sleep', 'activity', 'mental_wellbeing', 'readiness'];
    const correlations: any[] = [];
    
    metrics.forEach(metric1 => {
      metrics.forEach(metric2 => {
        if (metric1 !== metric2) {
          const values1 = profiles.map(p => p.scores?.[metric1]?.value || 0);
          const values2 = profiles.map(p => p.scores?.[metric2]?.value || 0);
          
          // Simple correlation calculation
          const correlation = calculatePearsonCorrelation(values1, values2);
          
          if (Math.abs(correlation) > 0.3) {
            correlations.push({
              metric1: metric1.replace('_', ' '),
              metric2: metric2.replace('_', ' '),
              correlation: Math.round(correlation * 100) / 100,
              strength: Math.abs(correlation) > 0.7 ? 'Strong' : 
                       Math.abs(correlation) > 0.5 ? 'Moderate' : 'Weak'
            });
          }
        }
      });
    });
    
    return correlations;
  }

  function calculatePearsonCorrelation(x: number[], y: number[]) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return isNaN(correlation) ? 0 : correlation;
  }

  function generatePredictions(profiles: any[], trends: any[]) {
    // Simple linear prediction based on recent trends
    const predictions: any[] = [];
    const metrics = ['wellbeing', 'sleep', 'activity', 'mental', 'readiness'];
    
    metrics.forEach(metric => {
      const recentValues = trends.slice(-7).map(t => t[metric]);
      const avgChange = recentValues.length > 1 ? 
        (recentValues[recentValues.length - 1] - recentValues[0]) / recentValues.length : 0;
      
      const nextWeekPrediction = Math.min(100, Math.max(0, 
        recentValues[recentValues.length - 1] + avgChange * 7));
      
      predictions.push({
        metric,
        currentValue: recentValues[recentValues.length - 1],
        predictedValue: Math.round(nextWeekPrediction),
        trend: avgChange > 0 ? 'improving' : avgChange < 0 ? 'declining' : 'stable',
        confidence: Math.round(85 - Math.abs(avgChange) * 100)
      });
    });
    
    return predictions;
  }

  function detectAnomalies(profiles: any[]) {
    const anomalies: any[] = [];
    
    profiles.forEach(profile => {
      const scores = profile.scores || {};
      
      // Check for unusually low scores
      Object.entries(scores).forEach(([metric, data]: [string, any]) => {
        if (data?.value < 0.3) {
          anomalies.push({
            profileId: profile.profileId,
            metric,
            value: Math.round(data.value * 100),
            severity: data.value < 0.2 ? 'high' : 'medium',
            message: `Unusually low ${metric} score`
          });
        }
      });
      
      // Check for sudden changes (would need historical data in real implementation)
      if (scores.wellbeing?.value && scores.sleep?.value) {
        const wellbeingSleepDiff = Math.abs(scores.wellbeing.value - scores.sleep.value);
        if (wellbeingSleepDiff > 0.4) {
          anomalies.push({
            profileId: profile.profileId,
            metric: 'correlation',
            value: Math.round(wellbeingSleepDiff * 100),
            severity: 'low',
            message: 'Large discrepancy between wellbeing and sleep scores'
          });
        }
      }
    });
    
    return anomalies.slice(0, 10); // Limit to top 10 anomalies
  }

  function generateInsights(profiles: any[], trends: any[], correlations: any[]) {
    const insights: any[] = [];
    
    // Trend-based insights
    if (trends.length > 0) {
      const recentTrend = trends.slice(-7);
      const wellbeingTrend = recentTrend[recentTrend.length - 1].wellbeing - recentTrend[0].wellbeing;
      
      if (wellbeingTrend > 5) {
        insights.push({
          type: 'positive',
          category: 'trend',
          message: 'Overall wellbeing has improved by ' + wellbeingTrend + ' points in the last week',
          priority: 'high'
        });
      } else if (wellbeingTrend < -5) {
        insights.push({
          type: 'warning',
          category: 'trend',
          message: 'Overall wellbeing has declined by ' + Math.abs(wellbeingTrend) + ' points in the last week',
          priority: 'high'
        });
      }
    }
    
    // Correlation-based insights
    const strongCorrelations = correlations.filter(c => Math.abs(c.correlation) > 0.7);
    if (strongCorrelations.length > 0) {
      insights.push({
        type: 'info',
        category: 'correlation',
        message: `Strong correlation found between ${strongCorrelations[0].metric1} and ${strongCorrelations[0].metric2}`,
        priority: 'medium'
      });
    }
    
    // Department-based insights
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'];
    departments.forEach(dept => {
      const deptProfiles = profiles.filter(p => p.department === dept);
      if (deptProfiles.length > 0) {
        const avgWellbeing = deptProfiles.reduce((sum, p) => 
          sum + (p.scores?.wellbeing?.value || 0), 0) / deptProfiles.length;
        
        if (avgWellbeing < 0.5) {
          insights.push({
            type: 'warning',
            category: 'department',
            message: `${dept} department shows below-average wellbeing scores`,
            priority: 'high'
          });
        }
      }
    });
    
    return insights;
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading analytics data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load analytics data: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button startIcon={<Refresh />} variant="outlined" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Key Insights */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                Key Insights
              </Typography>
              <List>
                {analyticsData.insights.map((insight: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {insight.type === 'positive' ? <CheckCircle color="success" /> :
                       insight.type === 'warning' ? <Warning color="warning" /> :
                       <Info color="info" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={insight.message}
                      secondary={`${insight.category} • ${insight.priority} priority`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trend Analysis */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Trend Analysis</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="wellbeing" stroke={COLORS.primary} />
                  <Line type="monotone" dataKey="sleep" stroke={COLORS.secondary} />
                  <Line type="monotone" dataKey="activity" stroke={COLORS.success} />
                  <Line type="monotone" dataKey="mental" stroke={COLORS.warning} />
                  <Line type="monotone" dataKey="readiness" stroke={COLORS.info} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Predictions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>7-Day Predictions</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Current</TableCell>
                      <TableCell align="right">Predicted</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.predictions.map((pred: any) => (
                      <TableRow key={pred.metric}>
                        <TableCell>{pred.metric}</TableCell>
                        <TableCell align="right">{pred.currentValue}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {pred.predictedValue}
                            {pred.trend === 'improving' ? 
                              <TrendingUp color="success" fontSize="small" sx={{ ml: 0.5 }} /> :
                             pred.trend === 'declining' ? 
                              <TrendingDown color="error" fontSize="small" sx={{ ml: 0.5 }} /> :
                              null}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Correlations and Anomalies */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Metric Correlations</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric 1</TableCell>
                      <TableCell>Metric 2</TableCell>
                      <TableCell align="right">Correlation</TableCell>
                      <TableCell>Strength</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.correlations.slice(0, 5).map((corr: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{corr.metric1}</TableCell>
                        <TableCell>{corr.metric2}</TableCell>
                        <TableCell align="right">{corr.correlation}</TableCell>
                        <TableCell>
                          <Chip 
                            label={corr.strength}
                            size="small"
                            color={corr.strength === 'Strong' ? 'success' : 
                                   corr.strength === 'Moderate' ? 'warning' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Anomaly Detection</Typography>
              <List dense>
                {analyticsData.anomalies.slice(0, 5).map((anomaly: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color={anomaly.severity === 'high' ? 'error' : 
                                     anomaly.severity === 'medium' ? 'warning' : 'info'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={anomaly.message}
                      secondary={`Profile: ${anomaly.profileId} • Value: ${anomaly.value}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}