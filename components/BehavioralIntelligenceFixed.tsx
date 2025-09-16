'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
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
  Download,
  SelfImprovement,
  Hotel,
  Mood,
  FilterList,
  Info
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
  ComposedChart,
  Treemap
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';
import { useCrossFilter } from '../contexts/CrossFilterContext';

interface BehavioralIntelligenceProps {
  orgId?: string;
}

// Sahha's actual archetype structure
const SAHHA_ARCHETYPES = {
  activity_level: {
    name: 'Activity Level',
    icon: FitnessCenter,
    values: ['sedentary', 'lightly_active', 'moderately_active', 'highly_active'],
    colors: {
      sedentary: '#FF7043',
      lightly_active: '#FFB300',
      moderately_active: '#7CB342',
      highly_active: '#00AA44'
    },
    descriptions: {
      sedentary: 'Less than 30 min activity/day',
      lightly_active: '30-60 min activity/day',
      moderately_active: '60-120 min activity/day',
      highly_active: 'More than 120 min activity/day'
    }
  },
  exercise_frequency: {
    name: 'Exercise Frequency',
    icon: DirectionsRun,
    values: ['none', 'occasional', 'regular', 'frequent'],
    colors: {
      none: '#FF7043',
      occasional: '#FFB300',
      regular: '#7CB342',
      frequent: '#00AA44'
    },
    descriptions: {
      none: 'No structured exercise',
      occasional: '1-2 times per week',
      regular: '3-4 times per week',
      frequent: '5+ times per week'
    }
  },
  sleep_pattern: {
    name: 'Sleep Pattern',
    icon: Bedtime,
    values: ['poor_sleeper', 'fair_sleeper', 'good_sleeper', 'excellent_sleeper'],
    colors: {
      poor_sleeper: '#FF7043',
      fair_sleeper: '#FFB300',
      good_sleeper: '#7CB342',
      excellent_sleeper: '#00AA44'
    },
    descriptions: {
      poor_sleeper: 'Less than 6 hours or poor quality',
      fair_sleeper: '6-7 hours or fair quality',
      good_sleeper: '7-8 hours with good quality',
      excellent_sleeper: '8+ hours with excellent quality'
    }
  },
  mental_wellness: {
    name: 'Mental Wellness',
    icon: Psychology,
    values: ['stressed', 'balanced', 'thriving', 'optimal'],
    colors: {
      stressed: '#FF7043',
      balanced: '#FFB300',
      thriving: '#7CB342',
      optimal: '#00AA44'
    },
    descriptions: {
      stressed: 'High stress, low resilience',
      balanced: 'Moderate stress, managing well',
      thriving: 'Low stress, good coping',
      optimal: 'Minimal stress, excellent wellbeing'
    }
  }
};

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BehavioralIntelligenceFixed({ orgId = 'default' }: BehavioralIntelligenceProps) {
  const { data, loading, error, refetch } = useWebhookData(30000);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedArchetype, setSelectedArchetype] = useState<keyof typeof SAHHA_ARCHETYPES>('activity_level');
  
  // Cross-filtering support
  const { filters, toggleArchetype, toggleDepartment } = useCrossFilter();

  // Process data with proper Sahha archetype structure
  const processedData = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) {
      return {
        totalProfiles: 0,
        archetypeDistributions: {},
        departmentArchetypes: {},
        subScoreBreakdowns: {},
        profilesWithArchetypes: 0,
        topPatterns: []
      };
    }

    const profiles = data.profiles;
    let filteredProfiles = profiles;

    // Apply department filter if selected
    if (selectedDepartment !== 'all') {
      filteredProfiles = profiles.filter((p: any) => p.department === selectedDepartment);
    }

    // Apply cross-filter if active
    if (filters.departments.length > 0) {
      filteredProfiles = filteredProfiles.filter((p: any) => 
        filters.departments.includes(p.department || 'Unknown')
      );
    }

    // Calculate archetype distributions for each category
    const archetypeDistributions: any = {};
    Object.entries(SAHHA_ARCHETYPES).forEach(([category, config]) => {
      const distribution = config.values.map(value => {
        const count = filteredProfiles.filter((p: any) => 
          p.archetypes && p.archetypes[category]?.value === value
        ).length;
        
        return {
          name: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: count,
          percentage: filteredProfiles.length > 0 ? Math.round((count / filteredProfiles.length) * 100) : 0,
          color: config.colors[value as keyof typeof config.colors],
          description: config.descriptions[value as keyof typeof config.descriptions]
        };
      });
      
      archetypeDistributions[category] = distribution;
    });

    // Calculate department-wise archetype distributions
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
    const departmentArchetypes: any = {};
    
    departments.forEach(dept => {
      const deptProfiles = profiles.filter((p: any) => p.department === dept);
      departmentArchetypes[dept] = {};
      
      Object.entries(SAHHA_ARCHETYPES).forEach(([category, config]) => {
        const distribution = config.values.map(value => {
          const count = deptProfiles.filter((p: any) => 
            p.archetypes && p.archetypes[category]?.value === value
          ).length;
          
          return {
            archetype: value,
            count,
            percentage: deptProfiles.length > 0 ? Math.round((count / deptProfiles.length) * 100) : 0
          };
        });
        
        departmentArchetypes[dept][category] = {
          distribution,
          dominant: distribution.reduce((max, curr) => curr.count > max.count ? curr : max, distribution[0])?.archetype || 'none',
          avgScore: deptProfiles.length > 0 
            ? Math.round(deptProfiles.reduce((sum: number, p: any) => {
                const score = category === 'activity_level' ? p.scores?.activity?.value :
                             category === 'exercise_frequency' ? p.scores?.activity?.value :
                             category === 'sleep_pattern' ? p.scores?.sleep?.value :
                             category === 'mental_wellness' ? p.scores?.mental_wellbeing?.value : 0;
                return sum + (score || 0);
              }, 0) / deptProfiles.length * 100)
            : 0
        };
      });
    });

    // Calculate sub-score breakdowns for profiles with archetypes
    const subScoreBreakdowns: any = {};
    Object.keys(SAHHA_ARCHETYPES).forEach(category => {
      const profilesWithCategory = filteredProfiles.filter((p: any) => 
        p.archetypes && p.archetypes[category]
      );
      
      if (profilesWithCategory.length > 0) {
        // Get relevant sub-scores based on category
        let subScores: any = {};
        
        if (category === 'sleep_pattern') {
          subScores = {
            duration: profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.sleep?.duration || 7), 0) / profilesWithCategory.length,
            efficiency: profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.sleep?.efficiency || 0.85), 0) / profilesWithCategory.length * 100,
            remSleep: profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.sleep?.rem || 0.2), 0) / profilesWithCategory.length * 100,
            deepSleep: profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.sleep?.deep || 0.15), 0) / profilesWithCategory.length * 100,
            latency: profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.sleep?.latency || 15), 0) / profilesWithCategory.length
          };
        } else if (category === 'activity_level' || category === 'exercise_frequency') {
          subScores = {
            steps: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.activity?.steps || 7000), 0) / profilesWithCategory.length),
            activeMinutes: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.activity?.activeMinutes || 30), 0) / profilesWithCategory.length),
            caloriesBurned: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.activity?.calories || 2000), 0) / profilesWithCategory.length),
            heartRateVariability: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.activity?.hrv || 50), 0) / profilesWithCategory.length),
            vo2Max: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.activity?.vo2Max || 40), 0) / profilesWithCategory.length)
          };
        } else if (category === 'mental_wellness') {
          subScores = {
            stressLevel: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + ((1 - (p.subScores?.mental?.stress || 0.3)) * 100), 0) / profilesWithCategory.length),
            resilience: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.mental?.resilience || 0.7), 0) / profilesWithCategory.length * 100),
            focus: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.mental?.focus || 0.65), 0) / profilesWithCategory.length * 100),
            mood: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.mental?.mood || 0.7), 0) / profilesWithCategory.length * 100),
            energy: Math.round(profilesWithCategory.reduce((sum: number, p: any) => 
              sum + (p.subScores?.mental?.energy || 0.6), 0) / profilesWithCategory.length * 100)
          };
        }
        
        subScoreBreakdowns[category] = subScores;
      }
    });

    // Identify top behavioral patterns (combinations of archetypes)
    const patternCounts: { [key: string]: number } = {};
    filteredProfiles.forEach((profile: any) => {
      if (profile.archetypes) {
        const pattern = [
          profile.archetypes.activity_level?.value || 'unknown',
          profile.archetypes.sleep_pattern?.value || 'unknown'
        ].join('-');
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
      }
    });

    const topPatterns = Object.entries(patternCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([pattern, count]) => {
        const [activity, sleep] = pattern.split('-');
        return {
          pattern,
          activity,
          sleep,
          count,
          percentage: filteredProfiles.length > 0 ? Math.round((count / filteredProfiles.length) * 100) : 0,
          insight: generatePatternInsight(activity, sleep)
        };
      });

    const profilesWithArchetypes = filteredProfiles.filter((p: any) => p.archetypes).length;

    return {
      totalProfiles: filteredProfiles.length,
      archetypeDistributions,
      departmentArchetypes,
      subScoreBreakdowns,
      profilesWithArchetypes,
      topPatterns
    };
  }, [data, selectedDepartment, filters]);

  // Generate insights based on archetype patterns
  function generatePatternInsight(activity: string, sleep: string): string {
    if (activity === 'highly_active' && sleep === 'excellent_sleeper') {
      return 'Peak performers - optimal health';
    } else if (activity === 'sedentary' && sleep === 'poor_sleeper') {
      return 'High risk - needs intervention';
    } else if (activity === 'highly_active' && sleep === 'poor_sleeper') {
      return 'Overtraining risk - needs recovery focus';
    } else if (activity === 'sedentary' && sleep === 'excellent_sleeper') {
      return 'Good rest but needs more activity';
    } else {
      return 'Moderate profile - room for improvement';
    }
  }

  // Render archetype distribution chart
  const renderArchetypeChart = (category: keyof typeof SAHHA_ARCHETYPES) => {
    const config = SAHHA_ARCHETYPES[category];
    const distribution = processedData.archetypeDistributions[category] || [];

    return (
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <config.icon color="primary" />
              {config.name} Distribution
            </Typography>
            <Chip 
              label={`${processedData.profilesWithArchetypes} profiles`} 
              size="small" 
              color="primary"
            />
          </Stack>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {distribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                content={({ active, payload }: any) => {
                  if (active && payload && payload[0]) {
                    return (
                      <Paper sx={{ p: 1.5 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {payload[0].name}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Count: {payload[0].value}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Percentage: {payload[0].payload.percentage}%
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {payload[0].payload.description}
                        </Typography>
                      </Paper>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend with descriptions */}
          <Grid container spacing={1} sx={{ mt: 2 }}>
            {distribution.map((item: any) => (
              <Grid item xs={6} key={item.name}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: item.color,
                    borderRadius: '2px'
                  }} />
                  <Box>
                    <Typography variant="caption" fontWeight="bold">
                      {item.name} ({item.percentage}%)
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Render department comparison
  const renderDepartmentComparison = () => {
    const departments = Object.keys(processedData.departmentArchetypes);
    const chartData = departments.map(dept => {
      const deptData = processedData.departmentArchetypes[dept];
      const categoryData = deptData[selectedArchetype];
      
      return {
        department: dept,
        avgScore: categoryData?.avgScore || 0,
        dominant: categoryData?.dominant?.replace(/_/g, ' ') || 'none',
        ...categoryData?.distribution.reduce((acc: any, item: any) => {
          acc[item.archetype] = item.percentage;
          return acc;
        }, {})
      };
    });

    const config = SAHHA_ARCHETYPES[selectedArchetype];

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Department {config.name} Comparison
          </Typography>

          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis yAxisId="left" label={{ value: 'Distribution (%)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Average Score', angle: 90, position: 'insideRight' }} />
              <RechartsTooltip />
              <Legend />
              
              {/* Stacked bars for archetype distribution */}
              {config.values.map((value, index) => (
                <Bar 
                  key={value}
                  yAxisId="left"
                  dataKey={value}
                  stackId="a"
                  fill={config.colors[value as keyof typeof config.colors]}
                  name={value.replace(/_/g, ' ')}
                />
              ))}
              
              {/* Line for average score */}
              <Line 
                yAxisId="right"
                type="monotone"
                dataKey="avgScore"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Average Score"
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Department dominant archetypes table */}
          <TableContainer sx={{ mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell>Dominant Archetype</TableCell>
                  <TableCell align="right">Average Score</TableCell>
                  <TableCell align="right">Top Pattern %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map(row => (
                  <TableRow key={row.department}>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.dominant}
                        size="small"
                        sx={{ 
                          backgroundColor: config.colors[row.dominant.replace(/ /g, '_') as keyof typeof config.colors] + '20',
                          color: config.colors[row.dominant.replace(/ /g, '_') as keyof typeof config.colors]
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">{row.avgScore}%</TableCell>
                    <TableCell align="right">
                      {Math.max(...config.values.map(v => row[v] || 0))}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  // Render sub-score breakdown
  const renderSubScoreBreakdown = () => {
    const subScores = processedData.subScoreBreakdowns[selectedArchetype];
    
    if (!subScores || Object.keys(subScores).length === 0) {
      return (
        <Card>
          <CardContent>
            <Alert severity="info">
              No sub-score data available for {SAHHA_ARCHETYPES[selectedArchetype].name}
            </Alert>
          </CardContent>
        </Card>
      );
    }

    const chartData = Object.entries(subScores).map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: typeof value === 'number' ? Math.round(value * 10) / 10 : value,
      fullMark: getSubScoreMax(key)
    }));

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {SAHHA_ARCHETYPES[selectedArchetype].name} Sub-Score Analysis
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Average"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {Object.entries(subScores).map(([key, value]) => (
                  <Box key={key}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {typeof value === 'number' ? Math.round(value * 10) / 10 : String(value)}
                        {getSubScoreUnit(key)}
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate"
                      value={normalizeSubScore(key, value as number)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Helper functions for sub-scores
  function getSubScoreMax(key: string): number {
    const maxValues: { [key: string]: number } = {
      duration: 10,
      efficiency: 100,
      remSleep: 30,
      deepSleep: 25,
      latency: 60,
      steps: 15000,
      activeMinutes: 120,
      caloriesBurned: 3000,
      heartRateVariability: 100,
      vo2Max: 60,
      stressLevel: 100,
      resilience: 100,
      focus: 100,
      mood: 100,
      energy: 100
    };
    return maxValues[key] || 100;
  }

  function getSubScoreUnit(key: string): string {
    const units: { [key: string]: string } = {
      duration: ' hrs',
      efficiency: '%',
      remSleep: '%',
      deepSleep: '%',
      latency: ' min',
      steps: '',
      activeMinutes: ' min',
      caloriesBurned: ' kcal',
      heartRateVariability: ' ms',
      vo2Max: '',
      stressLevel: '%',
      resilience: '%',
      focus: '%',
      mood: '%',
      energy: '%'
    };
    return units[key] || '';
  }

  function normalizeSubScore(key: string, value: number): number {
    const max = getSubScoreMax(key);
    return Math.min((value / max) * 100, 100);
  }

  // Render behavioral patterns
  const renderBehavioralPatterns = () => {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Behavioral Patterns
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Most common archetype combinations in the organization
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {processedData.topPatterns.map((pattern, index) => (
              <Grid item xs={12} key={index}>
                <Paper sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          label={pattern.activity.replace(/_/g, ' ')}
                          size="small"
                          sx={{ 
                            backgroundColor: SAHHA_ARCHETYPES.activity_level.colors[
                              pattern.activity as keyof typeof SAHHA_ARCHETYPES.activity_level.colors
                            ] + '20'
                          }}
                        />
                        <Typography variant="body2">+</Typography>
                        <Chip 
                          label={pattern.sleep.replace(/_/g, ' ')}
                          size="small"
                          sx={{ 
                            backgroundColor: SAHHA_ARCHETYPES.sleep_pattern.colors[
                              pattern.sleep as keyof typeof SAHHA_ARCHETYPES.sleep_pattern.colors
                            ] + '20'
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        {pattern.insight}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6">{pattern.count}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {pattern.percentage}% of population
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading behavioral intelligence...</Typography>
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
          <Chip 
            label={`${processedData.totalProfiles} Profiles`} 
            color="primary" 
            size="small" 
          />
        </Typography>

        {/* Controls */}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
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

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Archetype Category</InputLabel>
            <Select
              value={selectedArchetype}
              onChange={(e) => setSelectedArchetype(e.target.value as keyof typeof SAHHA_ARCHETYPES)}
              label="Archetype Category"
            >
              {Object.entries(SAHHA_ARCHETYPES).map(([key, config]) => (
                <MenuItem key={key} value={key}>{config.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button startIcon={<Refresh />} onClick={refetch} variant="outlined">
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Tabs for different views */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label="Archetype Distribution" />
          <Tab label="Department Analysis" />
          <Tab label="Sub-Score Breakdown" />
          <Tab label="Behavioral Patterns" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {Object.keys(SAHHA_ARCHETYPES).map(category => (
              <Grid item xs={12} md={6} key={category}>
                {renderArchetypeChart(category as keyof typeof SAHHA_ARCHETYPES)}
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {renderDepartmentComparison()}
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {renderSubScoreBreakdown()}
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {renderBehavioralPatterns()}
        </TabPanel>
      </Card>

      {/* Insights Panel */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            Key Insights
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Data Coverage:</strong> {processedData.profilesWithArchetypes} out of {processedData.totalProfiles} profiles have archetype data ({
                    processedData.totalProfiles > 0 
                      ? Math.round((processedData.profilesWithArchetypes / processedData.totalProfiles) * 100)
                      : 0
                  }%)
                </Typography>
              </Alert>
            </Grid>
            
            {processedData.topPatterns.length > 0 && (
              <Grid item xs={12} md={4}>
                <Alert severity={
                  processedData.topPatterns[0].insight.includes('Peak') ? 'success' :
                  processedData.topPatterns[0].insight.includes('risk') ? 'warning' : 'info'
                }>
                  <Typography variant="body2">
                    <strong>Most Common Pattern:</strong> {processedData.topPatterns[0].activity.replace(/_/g, ' ')} + {processedData.topPatterns[0].sleep.replace(/_/g, ' ')} ({processedData.topPatterns[0].percentage}%)
                  </Typography>
                </Alert>
              </Grid>
            )}
            
            <Grid item xs={12} md={4}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Department Filter:</strong> {selectedDepartment === 'all' ? 'All departments' : selectedDepartment}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}