'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Stack,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  AvatarGroup,
  Badge,
  Divider
} from '@mui/material';
import {
  Psychology,
  FitnessCenter,
  Mood,
  TrendingUp,
  Warning,
  Groups,
  DirectionsRun,
  SelfImprovement,
  NightsStay,
  WbSunny,
  Favorite,
  Hotel,
  Analytics,
  FilterList,
  Download,
  Refresh,
  InfoOutlined
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
  Treemap,
  Sankey,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';

interface BehavioralIntelligenceProps {
  orgId?: string;
}

// Archetype configurations based on Sahha's 14 behavioral archetypes
const ARCHETYPES = {
  chronotype: {
    early_bird: { label: 'Early Bird', icon: WbSunny, color: '#ffd54f' },
    night_owl: { label: 'Night Owl', icon: NightsStay, color: '#5c6bc0' },
    flexible: { label: 'Flexible', icon: Psychology, color: '#66bb6a' }
  },
  activity_level: {
    sedentary: { label: 'Sedentary', color: '#f44336', risk: 'high' },
    lightly_active: { label: 'Lightly Active', color: '#ff9800', risk: 'medium' },
    moderately_active: { label: 'Moderately Active', color: '#2196f3', risk: 'low' },
    highly_active: { label: 'Highly Active', color: '#4caf50', risk: 'none' }
  },
  exercise_frequency: {
    rare: { label: 'Rare Exerciser', color: '#f44336' },
    occasional: { label: 'Occasional', color: '#ff9800' },
    regular: { label: 'Regular', color: '#2196f3' },
    frequent: { label: 'Frequent', color: '#4caf50' }
  },
  sleep_quality: {
    poor: { label: 'Poor Sleep', color: '#f44336', recommendation: 'Sleep hygiene intervention' },
    fair: { label: 'Fair Sleep', color: '#ff9800', recommendation: 'Monitor patterns' },
    good: { label: 'Good Sleep', color: '#2196f3', recommendation: 'Maintain routine' },
    excellent: { label: 'Excellent Sleep', color: '#4caf50', recommendation: 'Model behavior' }
  },
  wellness_state: {
    struggling: { label: 'Struggling', color: '#d32f2f', priority: 1 },
    coping: { label: 'Coping', color: '#f57c00', priority: 2 },
    balanced: { label: 'Balanced', color: '#388e3c', priority: 3 },
    thriving: { label: 'Thriving', color: '#1976d2', priority: 4 }
  }
};

export default function BehavioralIntelligenceEnhanced({ orgId = 'default' }: BehavioralIntelligenceProps) {
  const { data, loading, error, refetch } = useWebhookData(30000);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // Generate demo archetypes for profiles since Sahha isn't sending them yet
  const profilesWithArchetypes = useMemo(() => {
    if (!data?.profiles) return [];
    
    return data.profiles.map((profile, index) => {
      // Generate consistent archetypes based on profile characteristics
      const scores = {
        wellbeing: profile.scores?.wellbeing?.value || profile.scores?.mental_wellbeing?.value || 0.5,
        activity: profile.scores?.activity?.value || 0.5,
        sleep: profile.scores?.sleep?.value || 0.5,
        readiness: profile.scores?.readiness?.value || 0.5
      };
      
      // Determine archetypes based on scores
      const archetypes = {
        chronotype: scores.sleep > 0.7 ? 'early_bird' : scores.sleep < 0.4 ? 'night_owl' : 'flexible',
        activity_level: scores.activity > 0.75 ? 'highly_active' : 
                       scores.activity > 0.5 ? 'moderately_active' :
                       scores.activity > 0.25 ? 'lightly_active' : 'sedentary',
        exercise_frequency: scores.activity > 0.7 ? 'frequent' :
                          scores.activity > 0.5 ? 'regular' :
                          scores.activity > 0.3 ? 'occasional' : 'rare',
        sleep_quality: scores.sleep > 0.8 ? 'excellent' :
                      scores.sleep > 0.6 ? 'good' :
                      scores.sleep > 0.4 ? 'fair' : 'poor',
        wellness_state: scores.wellbeing > 0.75 ? 'thriving' :
                       scores.wellbeing > 0.5 ? 'balanced' :
                       scores.wellbeing > 0.3 ? 'coping' : 'struggling'
      };
      
      return {
        ...profile,
        archetypes,
        scores,
        riskScore: calculateRiskScore(scores, archetypes)
      };
    });
  }, [data]);

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let profiles = [...profilesWithArchetypes];
    
    if (selectedDepartment !== 'all') {
      profiles = profiles.filter(p => p.department === selectedDepartment);
    }
    
    if (selectedArchetype !== 'all') {
      const [category, value] = selectedArchetype.split(':');
      profiles = profiles.filter(p => p.archetypes[category] === value);
    }
    
    return profiles;
  }, [profilesWithArchetypes, selectedDepartment, selectedArchetype]);

  // Calculate archetype distributions
  const archetypeDistributions = useMemo(() => {
    const distributions: any = {};
    
    Object.keys(ARCHETYPES).forEach(category => {
      distributions[category] = {};
      Object.keys(ARCHETYPES[category as keyof typeof ARCHETYPES]).forEach(value => {
        distributions[category][value] = filteredProfiles.filter(
          p => p.archetypes[category] === value
        ).length;
      });
    });
    
    return distributions;
  }, [filteredProfiles]);

  // Behavioral patterns and insights
  const behavioralInsights = useMemo(() => {
    const insights = [];
    
    // Night owl + poor wellness pattern
    const nightOwlsStruggling = filteredProfiles.filter(
      p => p.archetypes.chronotype === 'night_owl' && p.archetypes.wellness_state === 'struggling'
    );
    
    if (nightOwlsStruggling.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Night Owl Risk Pattern',
        description: `${nightOwlsStruggling.length} night owls showing poor wellness indicators`,
        action: 'Consider flexible work hours or evening wellness programs',
        affected: nightOwlsStruggling.length
      });
    }
    
    // Sedentary lifestyle risk
    const sedentaryCount = filteredProfiles.filter(
      p => p.archetypes.activity_level === 'sedentary'
    ).length;
    
    if (sedentaryCount > filteredProfiles.length * 0.3) {
      insights.push({
        type: 'critical',
        title: 'High Sedentary Population',
        description: `${Math.round((sedentaryCount / filteredProfiles.length) * 100)}% of employees are sedentary`,
        action: 'Implement workplace activity programs',
        affected: sedentaryCount
      });
    }
    
    // Positive patterns
    const thrivingActive = filteredProfiles.filter(
      p => p.archetypes.wellness_state === 'thriving' && p.archetypes.activity_level === 'highly_active'
    );
    
    if (thrivingActive.length > 0) {
      insights.push({
        type: 'success',
        title: 'Wellness Champions',
        description: `${thrivingActive.length} employees showing excellent health behaviors`,
        action: 'Leverage as wellness ambassadors',
        affected: thrivingActive.length
      });
    }
    
    return insights;
  }, [filteredProfiles]);

  // Scatter plot data for correlation analysis
  const correlationData = useMemo(() => {
    return filteredProfiles.map(p => ({
      x: (p.scores.activity || 0) * 100,
      y: (p.scores.wellbeing || 0) * 100,
      z: (p.scores.sleep || 0) * 100,
      name: p.name || p.externalId,
      department: p.department,
      chronotype: p.archetypes.chronotype
    }));
  }, [filteredProfiles]);

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
          <Chip label={`${filteredProfiles.length} Profiles`} color="primary" size="small" />
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
              <InputLabel>Archetype Filter</InputLabel>
              <Select
                value={selectedArchetype}
                onChange={(e) => setSelectedArchetype(e.target.value)}
                label="Archetype Filter"
              >
                <MenuItem value="all">All Archetypes</MenuItem>
                <MenuItem value="chronotype:night_owl">Night Owls</MenuItem>
                <MenuItem value="chronotype:early_bird">Early Birds</MenuItem>
                <MenuItem value="activity_level:sedentary">Sedentary</MenuItem>
                <MenuItem value="activity_level:highly_active">Highly Active</MenuItem>
                <MenuItem value="wellness_state:struggling">Struggling</MenuItem>
                <MenuItem value="wellness_state:thriving">Thriving</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, val) => val && setViewMode(val)}
              size="small"
              fullWidth
            >
              <ToggleButton value="grid">Grid View</ToggleButton>
              <ToggleButton value="list">List View</ToggleButton>
            </ToggleButtonGroup>
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

      {/* Behavioral Insights Alert */}
      {behavioralInsights.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {behavioralInsights.map((insight, index) => (
            <Alert 
              key={index}
              severity={insight.type === 'critical' ? 'error' : insight.type === 'warning' ? 'warning' : 'success'}
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2" fontWeight="bold">{insight.title}</Typography>
              <Typography variant="body2">{insight.description}</Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Recommended Action: {insight.action} • Affects {insight.affected} employees
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, val) => setSelectedTab(val)}>
          <Tab label="Archetype Overview" />
          <Tab label="Behavioral Patterns" />
          <Tab label="Risk Analysis" />
          <Tab label="Recommendations" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {/* Archetype Distribution Cards */}
          {Object.entries(archetypeDistributions).map(([category, distribution]) => (
            <Grid item xs={12} md={6} key={category}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {category.replace('_', ' ').charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={Object.entries(distribution).map(([key, value]) => ({
                          name: ARCHETYPES[category as keyof typeof ARCHETYPES][key].label,
                          value,
                          color: ARCHETYPES[category as keyof typeof ARCHETYPES][key].color
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {Object.entries(distribution).map(([key, value], index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={ARCHETYPES[category as keyof typeof ARCHETYPES][key].color} 
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={3}>
          {/* Correlation Analysis */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Activity vs Wellbeing Correlation
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" name="Activity Score" unit="%" />
                    <YAxis dataKey="y" name="Wellbeing Score" unit="%" />
                    <ZAxis dataKey="z" range={[50, 400]} name="Sleep Score" unit="%" />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter 
                      name="Employees" 
                      data={correlationData} 
                      fill="#8884d8"
                    >
                      {correlationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.chronotype === 'night_owl' ? '#5c6bc0' :
                            entry.chronotype === 'early_bird' ? '#ffd54f' : '#66bb6a'
                          } 
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="center">
                  <Chip icon={<NightsStay />} label="Night Owls" sx={{ bgcolor: '#5c6bc0', color: 'white' }} />
                  <Chip icon={<WbSunny />} label="Early Birds" sx={{ bgcolor: '#ffd54f' }} />
                  <Chip icon={<Psychology />} label="Flexible" sx={{ bgcolor: '#66bb6a', color: 'white' }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Pattern Matrix */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Behavioral Pattern Matrix
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Pattern</TableCell>
                        <TableCell align="center">Count</TableCell>
                        <TableCell align="center">Percentage</TableCell>
                        <TableCell>Risk Level</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        {
                          pattern: 'Night Owl + Sedentary',
                          filter: (p: any) => p.archetypes.chronotype === 'night_owl' && p.archetypes.activity_level === 'sedentary',
                          risk: 'high',
                          action: 'Priority intervention'
                        },
                        {
                          pattern: 'Early Bird + Active',
                          filter: (p: any) => p.archetypes.chronotype === 'early_bird' && p.archetypes.activity_level === 'highly_active',
                          risk: 'none',
                          action: 'Wellness champion'
                        },
                        {
                          pattern: 'Poor Sleep + Struggling',
                          filter: (p: any) => p.archetypes.sleep_quality === 'poor' && p.archetypes.wellness_state === 'struggling',
                          risk: 'critical',
                          action: 'Immediate support'
                        },
                        {
                          pattern: 'Regular Exercise + Good Sleep',
                          filter: (p: any) => p.archetypes.exercise_frequency === 'regular' && p.archetypes.sleep_quality === 'good',
                          risk: 'none',
                          action: 'Maintain programs'
                        }
                      ].map((item, index) => {
                        const count = filteredProfiles.filter(item.filter).length;
                        const percentage = Math.round((count / filteredProfiles.length) * 100);
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>{item.pattern}</TableCell>
                            <TableCell align="center">{count}</TableCell>
                            <TableCell align="center">{percentage}%</TableCell>
                            <TableCell>
                              <Chip 
                                label={item.risk} 
                                size="small"
                                color={
                                  item.risk === 'critical' ? 'error' :
                                  item.risk === 'high' ? 'warning' :
                                  item.risk === 'none' ? 'success' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>{item.action}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          {/* Risk Matrix */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Behavioral Risk Assessment
                </Typography>
                <Grid container spacing={2}>
                  {['critical', 'high', 'medium', 'low'].map(riskLevel => {
                    const riskProfiles = filteredProfiles.filter(p => {
                      const risk = p.riskScore;
                      if (riskLevel === 'critical') return risk > 0.75;
                      if (riskLevel === 'high') return risk > 0.5 && risk <= 0.75;
                      if (riskLevel === 'medium') return risk > 0.25 && risk <= 0.5;
                      return risk <= 0.25;
                    });
                    
                    return (
                      <Grid item xs={12} md={3} key={riskLevel}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            borderLeft: `4px solid ${
                              riskLevel === 'critical' ? '#f44336' :
                              riskLevel === 'high' ? '#ff9800' :
                              riskLevel === 'medium' ? '#ffc107' : '#4caf50'
                            }`
                          }}
                        >
                          <Typography variant="h4">{riskProfiles.length}</Typography>
                          <Typography variant="subtitle2" textTransform="capitalize">
                            {riskLevel} Risk
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {Math.round((riskProfiles.length / filteredProfiles.length) * 100)}% of population
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {selectedTab === 3 && (
        <Grid container spacing={3}>
          {/* Recommendations */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personalized Intervention Recommendations
                </Typography>
                <Stack spacing={2}>
                  {generateRecommendations(archetypeDistributions, filteredProfiles).map((rec, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: rec.color }}>
                          {rec.icon}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {rec.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {rec.description}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Target: {rec.target} • Priority: {rec.priority} • Expected Impact: {rec.impact}
                          </Typography>
                        </Box>
                        <Button variant="outlined" size="small">
                          View Details
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

// Helper functions
function calculateRiskScore(scores: any, archetypes: any): number {
  let risk = 0;
  
  // Low wellness is high risk
  if (scores.wellbeing < 0.3) risk += 0.3;
  else if (scores.wellbeing < 0.5) risk += 0.2;
  
  // Sedentary lifestyle
  if (archetypes.activity_level === 'sedentary') risk += 0.25;
  else if (archetypes.activity_level === 'lightly_active') risk += 0.15;
  
  // Poor sleep
  if (archetypes.sleep_quality === 'poor') risk += 0.25;
  else if (archetypes.sleep_quality === 'fair') risk += 0.15;
  
  // Struggling wellness state
  if (archetypes.wellness_state === 'struggling') risk += 0.2;
  else if (archetypes.wellness_state === 'coping') risk += 0.1;
  
  return Math.min(risk, 1);
}

function generateRecommendations(distributions: any, profiles: any[]): any[] {
  const recommendations = [];
  
  // Check for high sedentary population
  const sedentaryPercentage = (distributions.activity_level?.sedentary || 0) / profiles.length;
  if (sedentaryPercentage > 0.3) {
    recommendations.push({
      title: 'Workplace Activity Initiative',
      description: 'Implement standing desks, walking meetings, and hourly movement reminders',
      target: `${distributions.activity_level.sedentary} sedentary employees`,
      priority: 'High',
      impact: '40% reduction in sedentary time',
      color: '#ff9800',
      icon: <FitnessCenter />
    });
  }
  
  // Night owl support
  if (distributions.chronotype?.night_owl > profiles.length * 0.2) {
    recommendations.push({
      title: 'Flexible Schedule Program',
      description: 'Allow night owls to start later and provide evening wellness activities',
      target: `${distributions.chronotype.night_owl} night owl employees`,
      priority: 'Medium',
      impact: '25% improvement in wellness scores',
      color: '#5c6bc0',
      icon: <NightsStay />
    });
  }
  
  // Sleep improvement
  const poorSleepCount = distributions.sleep_quality?.poor || 0;
  if (poorSleepCount > 0) {
    recommendations.push({
      title: 'Sleep Hygiene Workshop',
      description: 'Educational sessions on sleep improvement techniques and stress management',
      target: `${poorSleepCount} employees with poor sleep`,
      priority: 'High',
      impact: '30% improvement in sleep quality',
      color: '#9c27b0',
      icon: <Hotel />
    });
  }
  
  // Wellness champions
  const thrivingCount = distributions.wellness_state?.thriving || 0;
  if (thrivingCount > 0) {
    recommendations.push({
      title: 'Wellness Ambassador Program',
      description: 'Leverage thriving employees as peer mentors and wellness advocates',
      target: `${thrivingCount} thriving employees`,
      priority: 'Low',
      impact: 'Improved team morale and engagement',
      color: '#4caf50',
      icon: <Favorite />
    });
  }
  
  return recommendations;
}