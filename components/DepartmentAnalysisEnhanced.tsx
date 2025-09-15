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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
  AvatarGroup,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Business,
  TrendingUp,
  Warning,
  Groups,
  Psychology,
  FitnessCenter,
  Mood,
  FilterList,
  Download,
  Refresh,
  InfoOutlined,
  Clear,
  AutoGraph,
  Speed,
  Hotel,
  DirectionsRun,
  SelfImprovement,
  CheckCircle,
  Cancel,
  ArrowUpward,
  ArrowDownward,
  BarChart as BarChartIcon,
  DonutLarge,
  Timeline,
  Compare,
  Assessment,
  WorkOutline,
  Engineering,
  Store,
  Campaign,
  People,
  BusinessCenter,
  AttachMoney
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Treemap,
  LabelList
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';

interface DepartmentAnalysisProps {
  orgId?: string;
}

// Department configuration
const DEPARTMENTS = {
  Engineering: { icon: Engineering, color: '#2196f3' },
  Sales: { icon: Store, color: '#4caf50' },
  Marketing: { icon: Campaign, color: '#ff9800' },
  HR: { icon: People, color: '#9c27b0' },
  Operations: { icon: BusinessCenter, color: '#607d8b' },
  Finance: { icon: AttachMoney, color: '#795548' }
};

type ViewMode = 'overview' | 'comparison' | 'trends' | 'risks' | 'recommendations';

export default function DepartmentAnalysisEnhanced({ orgId = 'default' }: DepartmentAnalysisProps) {
  const { data, loading, error, refetch } = useWebhookData(30000);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedMetric, setSelectedMetric] = useState('wellbeing');
  const [comparisonMode, setComparisonMode] = useState<'scores' | 'archetypes' | 'risks'>('scores');
  const [timeRange, setTimeRange] = useState('7d');

  // Process department data
  const departmentData = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) {
      // Generate demo data
      return generateDemoDepartmentData();
    }

    const deptMap: any = {};
    
    // Initialize departments
    Object.keys(DEPARTMENTS).forEach(dept => {
      deptMap[dept] = {
        name: dept,
        profiles: [],
        scores: {
          wellbeing: { total: 0, count: 0, avg: 0 },
          sleep: { total: 0, count: 0, avg: 0 },
          activity: { total: 0, count: 0, avg: 0 },
          mental_wellbeing: { total: 0, count: 0, avg: 0 },
          readiness: { total: 0, count: 0, avg: 0 }
        },
        risks: {
          high: 0,
          medium: 0,
          low: 0
        },
        archetypes: {},
        trends: []
      };
    });

    // Process profiles
    data.profiles.forEach(profile => {
      const dept = profile.department || 'Engineering';
      if (!deptMap[dept]) return;

      deptMap[dept].profiles.push(profile);

      // Aggregate scores
      Object.keys(deptMap[dept].scores).forEach(scoreType => {
        if (profile.scores?.[scoreType]?.value !== undefined) {
          deptMap[dept].scores[scoreType].total += profile.scores[scoreType].value;
          deptMap[dept].scores[scoreType].count++;
        }
      });

      // Count risk levels
      const avgScore = profile.scores?.wellbeing?.value || 0;
      if (avgScore < 0.4) deptMap[dept].risks.high++;
      else if (avgScore < 0.7) deptMap[dept].risks.medium++;
      else deptMap[dept].risks.low++;
    });

    // Calculate averages
    Object.values(deptMap).forEach((dept: any) => {
      Object.keys(dept.scores).forEach(scoreType => {
        if (dept.scores[scoreType].count > 0) {
          dept.scores[scoreType].avg = dept.scores[scoreType].total / dept.scores[scoreType].count;
        }
      });

      // Generate trend data (simulated)
      dept.trends = generateTrendData(dept.scores.wellbeing.avg);
    });

    return deptMap;
  }, [data]);

  // Filter departments based on selection
  const filteredDepartments = useMemo(() => {
    if (selectedDepartment === 'all') {
      return Object.values(departmentData);
    }
    return [departmentData[selectedDepartment]].filter(Boolean);
  }, [departmentData, selectedDepartment]);

  // Calculate department rankings
  const departmentRankings = useMemo(() => {
    const rankings = Object.values(departmentData)
      .map((dept: any) => ({
        name: dept.name,
        score: dept.scores[selectedMetric].avg,
        profileCount: dept.profiles.length,
        riskScore: (dept.risks.high * 3 + dept.risks.medium * 2 + dept.risks.low) / Math.max(dept.profiles.length, 1),
        icon: DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS]?.icon,
        color: DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS]?.color
      }))
      .sort((a, b) => b.score - a.score);

    return rankings;
  }, [departmentData, selectedMetric]);

  // Render view modes
  const renderViewContent = () => {
    switch (viewMode) {
      case 'overview':
        return renderOverview();
      case 'comparison':
        return renderComparison();
      case 'trends':
        return renderTrends();
      case 'risks':
        return renderRisks();
      case 'recommendations':
        return renderRecommendations();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Department Cards */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Department Health Overview</Typography>
        <Grid container spacing={2}>
          {departmentRankings.map((dept, index) => {
            const Icon = dept.icon || Business;
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={dept.name}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedDepartment === dept.name ? 2 : 0,
                    borderColor: 'primary.main',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => setSelectedDepartment(dept.name)}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <Icon sx={{ color: dept.color }} />
                      <Typography variant="subtitle2">{dept.name}</Typography>
                    </Stack>
                    <Typography variant="h4" color={dept.color}>
                      {(dept.score * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {dept.profileCount} employees
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={dept.score * 100} 
                      sx={{ mt: 1, bgcolor: 'grey.200' }}
                      color={dept.score > 0.7 ? 'success' : dept.score > 0.4 ? 'warning' : 'error'}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Grid>

      {/* Department Comparison Chart */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Performance Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={departmentRankings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Employees', angle: 90, position: 'insideRight' }} />
                <RechartsTooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="score" 
                  fill="#8884d8" 
                  name="Health Score"
                  onClick={(data) => setSelectedDepartment(data.name)}
                >
                  {departmentRankings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cursor="pointer" />
                  ))}
                  <LabelList dataKey="score" position="top" formatter={(value: number) => `${(value * 100).toFixed(0)}%`} />
                </Bar>
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="profileCount" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  name="Employee Count"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Risk Distribution */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Risk Distribution by Department
            </Typography>
            <List>
              {Object.values(departmentData).map((dept: any) => (
                <ListItem key={dept.name}>
                  <ListItemIcon>
                    {DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS]?.icon && 
                      React.createElement(DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS].icon, {
                        sx: { color: DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS].color }
                      })
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary={dept.name}
                    secondary={
                      <Stack direction="row" spacing={1} mt={0.5}>
                        <Chip 
                          label={`${dept.risks.high} High`} 
                          size="small" 
                          color="error" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`${dept.risks.medium} Med`} 
                          size="small" 
                          color="warning" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`${dept.risks.low} Low`} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Performers */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Performing Teams
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Score</TableCell>
                    <TableCell align="center">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentRankings.slice(0, 3).map((dept, index) => (
                    <TableRow key={dept.name}>
                      <TableCell>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </TableCell>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${(dept.score * 100).toFixed(0)}%`}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TrendingUp color="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Needs Attention */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Needs Attention
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Risk Level</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentRankings.slice(-3).reverse().map((dept) => (
                    <TableRow key={dept.name}>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={dept.score < 0.4 ? 'High' : 'Medium'}
                          color={dept.score < 0.4 ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined">
                          Intervene
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
    </Grid>
  );

  const renderComparison = () => (
    <Grid container spacing={3}>
      {/* Comparison Mode Selector */}
      <Grid item xs={12}>
        <ToggleButtonGroup
          value={comparisonMode}
          exclusive
          onChange={(e, value) => value && setComparisonMode(value)}
          size="small"
        >
          <ToggleButton value="scores">Score Comparison</ToggleButton>
          <ToggleButton value="archetypes">Archetype Distribution</ToggleButton>
          <ToggleButton value="risks">Risk Analysis</ToggleButton>
        </ToggleButtonGroup>
      </Grid>

      {comparisonMode === 'scores' && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Multi-Metric Department Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={generateRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  {Object.keys(DEPARTMENTS).map((dept, index) => (
                    <Radar
                      key={dept}
                      name={dept}
                      dataKey={dept}
                      stroke={DEPARTMENTS[dept as keyof typeof DEPARTMENTS].color}
                      fill={DEPARTMENTS[dept as keyof typeof DEPARTMENTS].color}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      )}

      {comparisonMode === 'archetypes' && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Behavioral Archetype Distribution by Department
              </Typography>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={generateArchetypeComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="archetype" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  {Object.keys(DEPARTMENTS).map((dept) => (
                    <Bar
                      key={dept}
                      dataKey={dept}
                      fill={DEPARTMENTS[dept as keyof typeof DEPARTMENTS].color}
                      stackId="a"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      )}

      {comparisonMode === 'risks' && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Level Distribution Across Departments
              </Typography>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={generateRiskComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="high" stackId="a" fill="#f44336" name="High Risk" />
                  <Bar dataKey="medium" stackId="a" fill="#ff9800" name="Medium Risk" />
                  <Bar dataKey="low" stackId="a" fill="#4caf50" name="Low Risk" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  const renderTrends = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Health Trends (30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={generateTrendChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {Object.keys(DEPARTMENTS).map((dept) => (
                  <Line
                    key={dept}
                    type="monotone"
                    dataKey={dept}
                    stroke={DEPARTMENTS[dept as keyof typeof DEPARTMENTS].color}
                    strokeWidth={2}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Trend Cards */}
      {Object.values(departmentData).map((dept: any) => (
        <Grid item xs={12} md={6} lg={4} key={dept.name}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {dept.name} Trend Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={dept.trends}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS]?.color}
                    fill={DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS]?.color}
                    fillOpacity={0.3}
                  />
                  <RechartsTooltip />
                </AreaChart>
              </ResponsiveContainer>
              <Stack direction="row" justifyContent="space-between" mt={2}>
                <Typography variant="caption">
                  Current: {(dept.scores.wellbeing.avg * 100).toFixed(0)}%
                </Typography>
                <Typography variant="caption" color={dept.trends[dept.trends.length - 1]?.value > dept.trends[0]?.value ? 'success.main' : 'error.main'}>
                  {dept.trends[dept.trends.length - 1]?.value > dept.trends[0]?.value ? '↑' : '↓'} 
                  {Math.abs(((dept.trends[dept.trends.length - 1]?.value - dept.trends[0]?.value) / dept.trends[0]?.value) * 100).toFixed(1)}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderRisks = () => (
    <Grid container spacing={3}>
      {Object.values(departmentData).map((dept: any) => (
        <Grid item xs={12} md={6} key={dept.name}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                {DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS]?.icon && 
                  React.createElement(DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS].icon, {
                    sx: { color: DEPARTMENTS[dept.name as keyof typeof DEPARTMENTS].color }
                  })
                }
                <Typography variant="h6">{dept.name} Risk Profile</Typography>
              </Stack>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="h4">{dept.risks.high}</Typography>
                    <Typography variant="caption">High Risk</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Typography variant="h4">{dept.risks.medium}</Typography>
                    <Typography variant="caption">Medium Risk</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h4">{dept.risks.low}</Typography>
                    <Typography variant="caption">Low Risk</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>Key Risk Factors</Typography>
              <List dense>
                {generateRiskFactors(dept).map((factor: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color={factor.severity} />
                    </ListItemIcon>
                    <ListItemText
                      primary={factor.factor}
                      secondary={`Impact: ${factor.impact} | ${factor.affected} affected`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderRecommendations = () => (
    <Grid container spacing={3}>
      {Object.values(departmentData).map((dept: any) => (
        <Grid item xs={12} key={dept.name}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommendations for {dept.name}
              </Typography>
              
              <Alert severity={dept.scores.wellbeing.avg > 0.7 ? 'success' : dept.scores.wellbeing.avg > 0.4 ? 'warning' : 'error'} sx={{ mb: 2 }}>
                Overall Health Score: {(dept.scores.wellbeing.avg * 100).toFixed(0)}% - 
                {dept.scores.wellbeing.avg > 0.7 ? ' Excellent' : dept.scores.wellbeing.avg > 0.4 ? ' Needs Improvement' : ' Critical'}
              </Alert>

              <Grid container spacing={2}>
                {generateRecommendations(dept).map((rec: any, index: number) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        {rec.icon}
                        <Typography variant="subtitle2">{rec.title}</Typography>
                      </Stack>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {rec.description}
                      </Typography>
                      <Typography variant="caption" display="block" mb={1}>
                        Expected Impact: {rec.impact}
                      </Typography>
                      <Button variant="outlined" size="small" fullWidth>
                        {rec.action}
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading department analysis...</Typography>
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
          <Business color="primary" />
          Department Analysis
          <Chip 
            label={`${Object.keys(departmentData).length} Departments`} 
            color="primary" 
            size="small" 
          />
        </Typography>
        
        {/* Controls */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>View Mode</InputLabel>
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                label="View Mode"
              >
                <MenuItem value="overview">Overview</MenuItem>
                <MenuItem value="comparison">Comparison</MenuItem>
                <MenuItem value="trends">Trends</MenuItem>
                <MenuItem value="risks">Risk Analysis</MenuItem>
                <MenuItem value="recommendations">Recommendations</MenuItem>
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
                {Object.keys(DEPARTMENTS).map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
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
                <MenuItem value="sleep">Sleep</MenuItem>
                <MenuItem value="activity">Activity</MenuItem>
                <MenuItem value="mental_wellbeing">Mental Wellbeing</MenuItem>
                <MenuItem value="readiness">Readiness</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button 
                startIcon={<Refresh />} 
                onClick={refetch}
                variant="outlined"
                fullWidth
              >
                Refresh
              </Button>
              <Button 
                startIcon={<Download />}
                variant="outlined"
                fullWidth
              >
                Export
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      {renderViewContent()}
    </Box>
  );
}

// Helper functions
function generateDemoDepartmentData(): any {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  const deptMap: any = {};

  departments.forEach(dept => {
    const profileCount = 20 + Math.floor(Math.random() * 30);
    const profiles = [];
    
    for (let i = 0; i < profileCount; i++) {
      profiles.push({
        externalId: `${dept}-${i}`,
        name: `Employee ${i}`,
        department: dept,
        scores: {
          wellbeing: { value: 0.3 + Math.random() * 0.6 },
          sleep: { value: 0.3 + Math.random() * 0.6 },
          activity: { value: 0.2 + Math.random() * 0.7 },
          mental_wellbeing: { value: 0.3 + Math.random() * 0.6 },
          readiness: { value: 0.4 + Math.random() * 0.5 }
        }
      });
    }

    const scores: any = {
      wellbeing: { total: 0, count: 0, avg: 0 },
      sleep: { total: 0, count: 0, avg: 0 },
      activity: { total: 0, count: 0, avg: 0 },
      mental_wellbeing: { total: 0, count: 0, avg: 0 },
      readiness: { total: 0, count: 0, avg: 0 }
    };

    profiles.forEach(profile => {
      Object.keys(scores).forEach(scoreType => {
        scores[scoreType].total += (profile.scores as any)[scoreType].value;
        scores[scoreType].count++;
      });
    });

    Object.keys(scores).forEach(scoreType => {
      scores[scoreType].avg = scores[scoreType].total / scores[scoreType].count;
    });

    const risks = {
      high: Math.floor(profileCount * 0.15),
      medium: Math.floor(profileCount * 0.35),
      low: profileCount - Math.floor(profileCount * 0.15) - Math.floor(profileCount * 0.35)
    };

    deptMap[dept] = {
      name: dept,
      profiles,
      scores,
      risks,
      trends: generateTrendData(scores.wellbeing.avg)
    };
  });

  return deptMap;
}

function generateTrendData(baseScore: number): any[] {
  const trends = [];
  for (let i = 0; i < 30; i++) {
    trends.push({
      day: i,
      value: Math.max(0, Math.min(1, baseScore + (Math.random() - 0.5) * 0.2))
    });
  }
  return trends;
}

function generateRadarData(): any[] {
  const metrics = ['Wellbeing', 'Sleep', 'Activity', 'Mental Health', 'Readiness'];
  return metrics.map(metric => {
    const data: any = { metric };
    Object.keys(DEPARTMENTS).forEach(dept => {
      data[dept] = 50 + Math.random() * 40;
    });
    return data;
  });
}

function generateArchetypeComparisonData(): any[] {
  const archetypes = ['Early Sleeper', 'Late Sleeper', 'Variable Sleeper', 'Good Sleep', 'Poor Sleep'];
  return archetypes.map(archetype => {
    const data: any = { archetype };
    Object.keys(DEPARTMENTS).forEach(dept => {
      data[dept] = Math.floor(Math.random() * 20);
    });
    return data;
  });
}

function generateRiskComparisonData(): any[] {
  return Object.keys(DEPARTMENTS).map(dept => ({
    department: dept,
    high: Math.floor(Math.random() * 10),
    medium: Math.floor(Math.random() * 20),
    low: Math.floor(Math.random() * 30)
  }));
}

function generateTrendChartData(): any[] {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
    const dataPoint: any = {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    Object.keys(DEPARTMENTS).forEach(dept => {
      dataPoint[dept] = 50 + Math.random() * 30 + Math.sin(i / 5) * 10;
    });
    data.push(dataPoint);
  }
  return data;
}

function generateRiskFactors(dept: any): any[] {
  const factors = [
    { factor: 'Poor Sleep Quality', impact: 'High', severity: 'error', affected: `${Math.floor(dept.risks.high * 0.6)} employees` },
    { factor: 'Low Activity Levels', impact: 'Medium', severity: 'warning', affected: `${Math.floor(dept.risks.medium * 0.4)} employees` },
    { factor: 'Irregular Schedules', impact: 'Medium', severity: 'warning', affected: `${Math.floor(dept.risks.medium * 0.3)} employees` }
  ];
  return factors;
}

function generateRecommendations(dept: any): any[] {
  const recommendations = [];
  
  if (dept.scores.sleep.avg < 0.6) {
    recommendations.push({
      icon: <Hotel color="primary" />,
      title: 'Sleep Hygiene Workshop',
      description: 'Implement sleep education program focusing on consistent schedules and environment optimization.',
      impact: '25% improvement in sleep scores',
      action: 'Schedule Workshop'
    });
  }
  
  if (dept.scores.activity.avg < 0.5) {
    recommendations.push({
      icon: <FitnessCenter color="primary" />,
      title: 'Activity Challenge',
      description: 'Launch department-wide step challenge with team competitions and rewards.',
      impact: '30% increase in daily activity',
      action: 'Launch Challenge'
    });
  }
  
  if (dept.scores.mental_wellbeing.avg < 0.6) {
    recommendations.push({
      icon: <Psychology color="primary" />,
      title: 'Mental Wellness Program',
      description: 'Provide access to meditation apps and stress management resources.',
      impact: '20% reduction in stress levels',
      action: 'Implement Program'
    });
  }
  
  return recommendations;
}