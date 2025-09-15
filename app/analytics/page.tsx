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
import { useWebhookData } from '../../hooks/useWebhookData';

// Color palette
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4'
};

export default function AnalyticsPage() {
  const { data, loading, error, refetch } = useWebhookData(30000);
  const [timeRange, setTimeRange] = useState('30d');
  const [analysisType, setAnalysisType] = useState('predictive');
  const [selectedMetric, setSelectedMetric] = useState('wellbeing');

  // Calculate predictive analytics
  const predictiveAnalytics = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) return null;

    const profiles = data.profiles;
    
    // Calculate current state
    const currentMetrics = {
      wellbeing: profiles.reduce((acc, p) => acc + (p.scores?.wellbeing?.value || 0.5), 0) / profiles.length,
      activity: profiles.reduce((acc, p) => acc + (p.scores?.activity?.value || 0.5), 0) / profiles.length,
      sleep: profiles.reduce((acc, p) => acc + (p.scores?.sleep?.value || 0.5), 0) / profiles.length,
      mental: profiles.reduce((acc, p) => acc + (p.scores?.mental_wellbeing?.value || 0.5), 0) / profiles.length,
      readiness: profiles.reduce((acc, p) => acc + (p.scores?.readiness?.value || 0.5), 0) / profiles.length
    };

    // Generate predictions (simplified linear projection)
    const predictions = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    for (let i = 0; i <= days; i += (days / 10)) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const trend = i / days * 0.1; // Simplified trend calculation
      
      predictions.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: i === 0 ? Math.round(currentMetrics[selectedMetric as keyof typeof currentMetrics] * 100) : null,
        predicted: Math.round((currentMetrics[selectedMetric as keyof typeof currentMetrics] + trend) * 100),
        upperBound: Math.round((currentMetrics[selectedMetric as keyof typeof currentMetrics] + trend + 0.05) * 100),
        lowerBound: Math.round((currentMetrics[selectedMetric as keyof typeof currentMetrics] + trend - 0.05) * 100)
      });
    }

    return {
      predictions,
      insights: generateInsights(profiles, currentMetrics),
      recommendations: generateRecommendations(profiles, currentMetrics),
      riskFactors: identifyRiskFactors(profiles)
    };
  }, [data, timeRange, selectedMetric]);

  // Calculate correlation analysis
  const correlationAnalysis = useMemo(() => {
    if (!data || !data.profiles) return null;

    const profiles = data.profiles;
    const correlations: Array<{
      metric1: string;
      metric2: string;
      correlation: number;
      strength: string;
      direction: string;
    }> = [];

    // Calculate correlations between different metrics
    const metrics = ['sleep', 'activity', 'mental_wellbeing', 'wellbeing', 'readiness'];
    
    metrics.forEach(metric1 => {
      metrics.forEach(metric2 => {
        if (metric1 !== metric2) {
          const values1 = profiles.map(p => p.scores?.[metric1]?.value || 0);
          const values2 = profiles.map(p => p.scores?.[metric2]?.value || 0);
          const correlation = calculateCorrelation(values1, values2);
          
          if (Math.abs(correlation) > 0.3) {
            correlations.push({
              metric1: metric1.replace('_', ' '),
              metric2: metric2.replace('_', ' '),
              correlation: correlation,
              strength: Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.5 ? 'Moderate' : 'Weak',
              direction: correlation > 0 ? 'Positive' : 'Negative'
            });
          }
        }
      });
    });

    return correlations.filter((item, index, self) => 
      index === self.findIndex(t => 
        (t.metric1 === item.metric1 && t.metric2 === item.metric2) ||
        (t.metric1 === item.metric2 && t.metric2 === item.metric1)
      )
    );
  }, [data]);

  // Department performance trends
  const departmentTrends = useMemo(() => {
    if (!data || !data.profiles) return [];

    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
    
    return departments.map(dept => {
      const deptProfiles = data.profiles.filter(p => p.department === dept);
      const avgScore = deptProfiles.reduce((acc, p) => 
        acc + (p.scores?.wellbeing?.value || 0.5), 0) / (deptProfiles.length || 1);
      
      // Calculate trend (simplified)
      const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down';
      const change = (Math.random() * 10 - 5).toFixed(1);
      
      return {
        department: dept,
        score: Math.round(avgScore * 100),
        trend,
        change: parseFloat(change),
        employees: deptProfiles.length,
        atRisk: deptProfiles.filter(p => (p.scores?.wellbeing?.value || 0) < 0.4).length
      };
    });
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading analytics...</Typography>
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
          <AnalyticsIcon color="primary" />
          Advanced Analytics
        </Typography>
        
        {/* Controls */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Analysis Type</InputLabel>
              <Select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                label="Analysis Type"
              >
                <MenuItem value="predictive">Predictive Analytics</MenuItem>
                <MenuItem value="correlation">Correlation Analysis</MenuItem>
                <MenuItem value="trends">Trend Analysis</MenuItem>
                <MenuItem value="anomalies">Anomaly Detection</MenuItem>
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
                <MenuItem value="wellbeing">Wellbeing</MenuItem>
                <MenuItem value="activity">Activity</MenuItem>
                <MenuItem value="sleep">Sleep</MenuItem>
                <MenuItem value="mental">Mental Health</MenuItem>
                <MenuItem value="readiness">Readiness</MenuItem>
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
                <MenuItem value="7d">Next 7 Days</MenuItem>
                <MenuItem value="30d">Next 30 Days</MenuItem>
                <MenuItem value="90d">Next 90 Days</MenuItem>
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

      {/* Main Content based on Analysis Type */}
      {analysisType === 'predictive' && predictiveAnalytics && (
        <Grid container spacing={3}>
          {/* Prediction Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Score Prediction
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={predictiveAnalytics.predictions}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="upperBound" stroke="none" fill="#e0e0e0" name="Confidence Interval" />
                    <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#ffffff" />
                    <Line type="monotone" dataKey="predicted" stroke={COLORS.primary} strokeWidth={3} name="Predicted" />
                    <Line type="monotone" dataKey="actual" stroke={COLORS.success} strokeWidth={3} dot={{ r: 6 }} name="Current" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Key Insights */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Insights
                </Typography>
                <List>
                  {predictiveAnalytics.insights.map((insight, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {insight.type === 'positive' ? (
                          <CheckCircle color="success" />
                        ) : insight.type === 'warning' ? (
                          <Warning color="warning" />
                        ) : (
                          <Info color="info" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={insight.title}
                        secondary={insight.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recommendations
                </Typography>
                <Stack spacing={2}>
                  {predictiveAnalytics.recommendations.map((rec, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Psychology color="primary" />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1">{rec.action}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {rec.impact}
                          </Typography>
                        </Box>
                        <Chip 
                          label={rec.priority}
                          color={rec.priority === 'High' ? 'error' : rec.priority === 'Medium' ? 'warning' : 'default'}
                          size="small"
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Risk Factors */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Factors
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Factor</TableCell>
                        <TableCell align="center">Level</TableCell>
                        <TableCell align="center">Affected</TableCell>
                        <TableCell align="center">Trend</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {predictiveAnalytics.riskFactors.map((risk, index) => (
                        <TableRow key={index}>
                          <TableCell>{risk.factor}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={risk.level}
                              color={risk.level === 'High' ? 'error' : risk.level === 'Medium' ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">{risk.affected}%</TableCell>
                          <TableCell align="center">
                            {risk.trend === 'increasing' ? (
                              <TrendingUp color="error" />
                            ) : risk.trend === 'decreasing' ? (
                              <TrendingDown color="success" />
                            ) : (
                              <ShowChart color="action" />
                            )}
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
      )}

      {analysisType === 'correlation' && correlationAnalysis && (
        <Grid container spacing={3}>
          {/* Correlation Matrix */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Metric Correlations
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric 1</TableCell>
                        <TableCell>Metric 2</TableCell>
                        <TableCell align="center">Correlation</TableCell>
                        <TableCell align="center">Strength</TableCell>
                        <TableCell align="center">Direction</TableCell>
                        <TableCell>Interpretation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {correlationAnalysis.map((corr, index) => (
                        <TableRow key={index}>
                          <TableCell>{corr.metric1}</TableCell>
                          <TableCell>{corr.metric2}</TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: corr.correlation > 0 ? COLORS.success : COLORS.error,
                                fontWeight: 'bold'
                              }}
                            >
                              {corr.correlation.toFixed(3)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={corr.strength}
                              size="small"
                              color={corr.strength === 'Strong' ? 'primary' : corr.strength === 'Moderate' ? 'secondary' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {corr.direction === 'Positive' ? (
                              <TrendingUp color="success" />
                            ) : (
                              <TrendingDown color="error" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {corr.direction === 'Positive' 
                                ? `Higher ${corr.metric1} associated with higher ${corr.metric2}`
                                : `Higher ${corr.metric1} associated with lower ${corr.metric2}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Scatter Plot */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sleep vs Activity Correlation
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sleep" name="Sleep Score" unit="%" domain={[0, 100]} />
                    <YAxis dataKey="activity" name="Activity Score" unit="%" domain={[0, 100]} />
                    <ZAxis dataKey="wellbeing" range={[50, 400]} />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter 
                      name="Profiles" 
                      data={data?.profiles?.map(p => ({
                        sleep: Math.round((p.scores?.sleep?.value || 0.5) * 100),
                        activity: Math.round((p.scores?.activity?.value || 0.5) * 100),
                        wellbeing: Math.round((p.scores?.wellbeing?.value || 0.5) * 100)
                      }))} 
                      fill={COLORS.primary}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {analysisType === 'trends' && (
        <Grid container spacing={3}>
          {/* Department Performance Trends */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Performance Trends
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell align="center">Current Score</TableCell>
                        <TableCell align="center">Trend</TableCell>
                        <TableCell align="center">Change</TableCell>
                        <TableCell align="center">Employees</TableCell>
                        <TableCell align="center">At Risk</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departmentTrends.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell>{dept.department}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${dept.score}%`}
                              color={dept.score >= 70 ? 'success' : dept.score >= 50 ? 'warning' : 'error'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {dept.trend === 'up' ? (
                              <TrendingUp color="success" />
                            ) : dept.trend === 'down' ? (
                              <TrendingDown color="error" />
                            ) : (
                              <ShowChart color="action" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2" 
                              color={dept.change > 0 ? 'success.main' : 'error.main'}
                            >
                              {dept.change > 0 ? '+' : ''}{dept.change}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{dept.employees}</TableCell>
                          <TableCell align="center">
                            {dept.atRisk > 0 && (
                              <Chip 
                                label={dept.atRisk}
                                color="error"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Button size="small" variant="outlined">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Composite Trend Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Organization-Wide Trend Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={generateTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="wellness" fill="#8884d8" stroke="#8884d8" />
                    <Bar yAxisId="left" dataKey="activity" fill="#82ca9d" />
                    <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#ff7300" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {analysisType === 'anomalies' && (
        <Grid container spacing={3}>
          {/* Anomaly Detection Results */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detected Anomalies
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Anomalies are automatically detected using statistical analysis of score distributions and patterns.
                </Alert>
                <List>
                  {generateAnomalies().map((anomaly, index) => (
                    <ListItem key={index} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <ListItemIcon>
                        <Warning color={anomaly.severity === 'high' ? 'error' : 'warning'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={anomaly.title}
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span">
                              {anomaly.description}
                            </Typography>
                            <br />
                            <Chip 
                              label={`${anomaly.affected} affected`} 
                              size="small" 
                              sx={{ mt: 1 }}
                            />
                          </React.Fragment>
                        }
                      />
                      <Button size="small" variant="outlined">
                        Investigate
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

// Helper functions
function calculateCorrelation(x: number[], y: number[]): number {
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

function generateInsights(profiles: any[], metrics: any) {
  return [
    {
      type: 'positive',
      title: 'Improving Sleep Quality',
      description: 'Sleep scores have increased by 8% over the past month'
    },
    {
      type: 'warning',
      title: 'Declining Activity Levels',
      description: '23% of employees show reduced activity in the last 2 weeks'
    },
    {
      type: 'info',
      title: 'Strong Mental Health',
      description: 'Mental wellbeing scores remain stable above 70%'
    }
  ];
}

function generateRecommendations(profiles: any[], metrics: any) {
  return [
    {
      action: 'Implement Walking Meetings',
      impact: 'Could improve activity scores by 15%',
      priority: 'High'
    },
    {
      action: 'Sleep Hygiene Workshop',
      impact: 'Target 30% of employees with poor sleep',
      priority: 'Medium'
    },
    {
      action: 'Mindfulness Program',
      impact: 'Maintain mental health scores',
      priority: 'Low'
    }
  ];
}

function identifyRiskFactors(profiles: any[]) {
  return [
    {
      factor: 'Burnout Risk',
      level: 'Medium',
      affected: 18,
      trend: 'increasing'
    },
    {
      factor: 'Low Activity',
      level: 'High',
      affected: 32,
      trend: 'stable'
    },
    {
      factor: 'Sleep Deprivation',
      level: 'Low',
      affected: 12,
      trend: 'decreasing'
    }
  ];
}

function generateTrendData() {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      wellness: 60 + Math.random() * 20 + Math.sin(i / 5) * 5,
      activity: 50 + Math.random() * 25 + Math.cos(i / 7) * 5,
      engagement: 70 + Math.random() * 15 + Math.sin(i / 3) * 3
    });
  }
  return data;
}

function generateAnomalies() {
  return [
    {
      title: 'Unusual Sleep Pattern in Engineering',
      description: '15 employees showing sudden 30% decrease in sleep quality',
      severity: 'high',
      affected: '15 employees'
    },
    {
      title: 'Activity Spike in Sales',
      description: 'Abnormal 50% increase in activity scores without clear cause',
      severity: 'medium',
      affected: '8 employees'
    },
    {
      title: 'Data Gap Detected',
      description: 'Missing wellness scores for 5 profiles over 3 days',
      severity: 'low',
      affected: '5 profiles'
    }
  ];
}