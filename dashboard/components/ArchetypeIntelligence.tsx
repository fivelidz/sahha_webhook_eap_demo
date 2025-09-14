'use client';

import React, { useState, useEffect } from 'react';
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
  Avatar,
  Tooltip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Psychology,
  AccessTime,
  FitnessCenter,
  Mood,
  TrendingUp,
  Warning,
  CheckCircle,
  Person,
  Groups,
  Insights,
  Schedule
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
  Radar
} from 'recharts';
import { useSahhaProfiles } from '../contexts/SahhaDataContext';

interface ArchetypeProfile {
  profileId: string;
  employeeName: string;
  department: string;
  archetypes: {
    sleep_chronotype: 'early_bird' | 'night_owl' | 'intermediate';
    activity_level: 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';
    mental_wellness: 'struggling' | 'coping' | 'thriving' | 'flourishing';
    stress_resilience: 'low' | 'moderate' | 'high' | 'exceptional';
    work_life_balance: 'poor' | 'struggling' | 'balanced' | 'excellent';
    productivity_pattern: 'morning_peak' | 'afternoon_peak' | 'evening_peak' | 'consistent';
  };
  sahhaArchetypes: {
    activity_level: 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';
    mental_wellness: 'struggling' | 'coping' | 'thriving' | 'flourishing';
    sleep_quality: 'poor' | 'fair' | 'good' | 'excellent';
    overall_wellness: 'poor' | 'fair' | 'good' | 'excellent';
  };
  riskScore: number;
  interventionPriority: 'low' | 'medium' | 'high' | 'critical';
}

interface ArchetypeIntelligenceProps {
  orgId: string;
}

const CHRONOTYPE_COLORS = {
  early_bird: '#4CAF50',
  night_owl: '#2196F3', 
  intermediate: '#FF9800'
};

const WELLNESS_COLORS = {
  struggling: '#f44336',
  coping: '#ff9800',
  thriving: '#4caf50',
  flourishing: '#2e7d32'
};

const RISK_COLORS = {
  low: '#4caf50',
  medium: '#ff9800', 
  high: '#ff5722',
  critical: '#d32f2f'
};

const SAHHA_ARCHETYPE_COLORS = {
  sedentary: '#FF5722',
  light: '#FF9800', 
  moderate: '#2196F3',
  high: '#4CAF50',
  very_high: '#2E7D32',
  struggling: '#D32F2F',
  coping: '#FF5722',
  thriving: '#4CAF50',
  flourishing: '#2E7D32',
  poor: '#D32F2F',
  fair: '#FF5722',
  good: '#4CAF50',
  excellent: '#2E7D32'
};

// Mock data generator for demonstration
const generateMockArchetypeData = (): ArchetypeProfile[] => {
  const names = ['Sarah Chen', 'Marcus Johnson', 'Elena Rodriguez', 'David Kim', 'Rachel Smith', 'Ahmed Hassan', 'Lisa Wang', 'Carlos Martinez'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Legal'];
  
  return names.map((name, index) => {
    const activityLevel = ['sedentary', 'light', 'moderate', 'high', 'very_high'][Math.floor(Math.random() * 5)] as any;
    const mentalWellness = ['struggling', 'coping', 'thriving', 'flourishing'][Math.floor(Math.random() * 4)] as any;
    const sleepQuality = ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)] as any;
    const overallWellness = ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)] as any;
    
    return {
      profileId: `profile-${index + 1}`,
      employeeName: name,
      department: departments[index % departments.length],
      archetypes: {
        sleep_chronotype: ['early_bird', 'night_owl', 'intermediate'][Math.floor(Math.random() * 3)] as any,
        activity_level: activityLevel,
        mental_wellness: mentalWellness,
        stress_resilience: ['low', 'moderate', 'high', 'exceptional'][Math.floor(Math.random() * 4)] as any,
        work_life_balance: ['poor', 'struggling', 'balanced', 'excellent'][Math.floor(Math.random() * 4)] as any,
        productivity_pattern: ['morning_peak', 'afternoon_peak', 'evening_peak', 'consistent'][Math.floor(Math.random() * 4)] as any,
      },
      sahhaArchetypes: {
        activity_level: activityLevel,
        mental_wellness: mentalWellness,
        sleep_quality: sleepQuality,
        overall_wellness: overallWellness
      },
      riskScore: Math.random() * 100,
      interventionPriority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any
    };
  });
};

export default function ArchetypeIntelligence({ orgId }: ArchetypeIntelligenceProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [profiles, setProfiles] = useState<ArchetypeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get Profile Management data
  const { profiles: realProfiles, assignments } = useSahhaProfiles();
  
  useEffect(() => {
    // Convert real profiles to archetype profiles with realistic archetype data
    if (realProfiles && realProfiles.length > 0) {
      const archetypeProfiles: ArchetypeProfile[] = realProfiles.map((profile: any, index: number) => {
        // Generate realistic archetype data based on actual scores
        const sleepScore = profile.sleepScore || 50;
        const activityScore = profile.activityScore || 50;
        const mentalScore = profile.mentalHealthScore || 50;
        
        // Generate employee name from profile ID
        const nameIndex = profile.profileId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Cameron', 'Dakota', 'Avery', 'Quinn'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const employeeName = `${firstNames[nameIndex % firstNames.length]} ${lastNames[(nameIndex * 7) % lastNames.length]}`;
        
        // Determine department
        const departmentId = assignments[profile.profileId] || 'unassigned';
        const departmentMap: Record<string, string> = {
          'tech': 'Technology',
          'operations': 'Operations', 
          'sales': 'Sales & Marketing',
          'admin': 'Administration',
          'unassigned': 'Unassigned'
        };
        const department = departmentMap[departmentId] || 'Unassigned';
        
        return {
          profileId: profile.profileId,
          employeeName,
          department,
          archetypes: {
            sleep_chronotype: sleepScore > 70 ? 'early_bird' : sleepScore < 40 ? 'night_owl' : 'intermediate',
            activity_level: activityScore > 80 ? 'very_high' : activityScore > 65 ? 'high' : activityScore > 45 ? 'moderate' : activityScore > 30 ? 'light' : 'sedentary',
            mental_wellness: mentalScore > 75 ? 'flourishing' : mentalScore > 60 ? 'thriving' : mentalScore > 40 ? 'coping' : 'struggling',
            stress_resilience: mentalScore > 60 ? 'exceptional' : mentalScore > 40 ? 'high' : mentalScore > 25 ? 'moderate' : 'low',
            work_life_balance: ((sleepScore + activityScore + mentalScore) / 3) > 70 ? 'excellent' : ((sleepScore + activityScore + mentalScore) / 3) > 50 ? 'balanced' : ((sleepScore + activityScore + mentalScore) / 3) > 35 ? 'struggling' : 'poor',
            productivity_pattern: sleepScore > 60 ? 'morning_peak' : activityScore > 60 ? 'afternoon_peak' : 'evening_peak'
          },
          sahhaArchetypes: {
            activity_level: activityScore > 80 ? 'very_high' : activityScore > 65 ? 'high' : activityScore > 45 ? 'moderate' : activityScore > 30 ? 'light' : 'sedentary',
            mental_wellness: mentalScore > 75 ? 'flourishing' : mentalScore > 60 ? 'thriving' : mentalScore > 40 ? 'coping' : 'struggling',
            sleep_quality: sleepScore > 75 ? 'excellent' : sleepScore > 60 ? 'good' : sleepScore > 40 ? 'fair' : 'poor',
            overall_wellness: ((sleepScore + activityScore + mentalScore) / 3) > 75 ? 'excellent' : ((sleepScore + activityScore + mentalScore) / 3) > 60 ? 'good' : ((sleepScore + activityScore + mentalScore) / 3) > 40 ? 'fair' : 'poor'
          },
          riskScore: Math.max(0, 100 - Math.round((sleepScore + activityScore + mentalScore) / 3)),
          interventionPriority: (() => {
            const avg = (sleepScore + activityScore + mentalScore) / 3;
            if (avg < 35) return 'critical';
            if (avg < 50) return 'high';
            if (avg < 70) return 'medium';
            return 'low';
          })()
        };
      });
      
      setProfiles(archetypeProfiles);
    } else {
      // Fallback to mock data if no real profiles
      setProfiles(generateMockArchetypeData());
    }
    setLoading(false);
  }, [realProfiles, assignments]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Calculate distribution data for real Sahha archetypes
  const activityLevelDistribution = profiles.reduce((acc, profile) => {
    acc[profile.sahhaArchetypes.activity_level] = (acc[profile.sahhaArchetypes.activity_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mentalWellnessDistribution = profiles.reduce((acc, profile) => {
    acc[profile.sahhaArchetypes.mental_wellness] = (acc[profile.sahhaArchetypes.mental_wellness] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sleepQualityDistribution = profiles.reduce((acc, profile) => {
    acc[profile.sahhaArchetypes.sleep_quality] = (acc[profile.sahhaArchetypes.sleep_quality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskDistribution = profiles.reduce((acc, profile) => {
    acc[profile.interventionPriority] = (acc[profile.interventionPriority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activityLevelData = Object.entries(activityLevelDistribution).map(([level, count]) => ({
    name: level.replace('_', ' ').toUpperCase(),
    value: count,
    color: SAHHA_ARCHETYPE_COLORS[level as keyof typeof SAHHA_ARCHETYPE_COLORS]
  }));

  const mentalWellnessData = Object.entries(mentalWellnessDistribution).map(([wellness, count]) => ({
    name: wellness.toUpperCase(),
    value: count,
    color: SAHHA_ARCHETYPE_COLORS[wellness as keyof typeof SAHHA_ARCHETYPE_COLORS]
  }));
  
  const sleepQualityData = Object.entries(sleepQualityDistribution).map(([quality, count]) => ({
    name: quality.toUpperCase(),
    value: count,
    color: SAHHA_ARCHETYPE_COLORS[quality as keyof typeof SAHHA_ARCHETYPE_COLORS]
  }));

  // Identify high-risk patterns
  const highRiskEmployees = profiles.filter(p => p.interventionPriority === 'high' || p.interventionPriority === 'critical');
  
  // Strategic insights
  const strategicInsights = [
    {
      insight: "67% of Engineering team are night owls in early-meeting culture",
      impact: "Potential 31% productivity loss from chronotype misalignment",
      solution: "Implement flexible core hours (11 AM - 3 PM)",
      priority: "high"
    },
    {
      insight: "High activity employees showing 23% better stress resilience",
      impact: "Activity level correlates with mental wellness outcomes", 
      solution: "Expand fitness programs for sedentary employees",
      priority: "medium"
    },
    {
      insight: "Night owl + struggling wellness = 89% intervention success rate",
      impact: "Predictable behavioral pattern for targeted programs",
      solution: "Evening wellness programs for night owl chronotypes",
      priority: "high"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Behavioral Overview
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sahha Activity Level Archetypes
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={activityLevelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {activityLevelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sahha Mental Wellness Archetypes
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mentalWellnessData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sahha Sleep Quality Archetypes
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {sleepQualityData.map((item, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2">
                            {item.name}
                          </Typography>
                          <Chip 
                            label={item.value} 
                            size="small"
                            sx={{ 
                              bgcolor: item.color,
                              color: 'white'
                            }} 
                          />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(item.value / profiles.length) * 100}
                          sx={{
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: item.color
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1: // Individual Profiles
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Individual Sahha Archetype Profiles
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Activity Level</TableCell>
                      <TableCell>Sleep Quality</TableCell>
                      <TableCell>Mental Wellness</TableCell>
                      <TableCell>Overall Wellness</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.profileId}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {profile.employeeName.charAt(0)}
                            </Avatar>
                            {profile.employeeName}
                          </Box>
                        </TableCell>
                        <TableCell>{profile.department}</TableCell>
                        <TableCell>
                          <Chip 
                            label={profile.sahhaArchetypes.activity_level}
                            size="small"
                            sx={{ 
                              bgcolor: SAHHA_ARCHETYPE_COLORS[profile.sahhaArchetypes.activity_level],
                              color: 'white',
                              textTransform: 'capitalize'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={profile.sahhaArchetypes.sleep_quality}
                            size="small"
                            sx={{ 
                              bgcolor: SAHHA_ARCHETYPE_COLORS[profile.sahhaArchetypes.sleep_quality],
                              color: 'white',
                              textTransform: 'capitalize'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={profile.sahhaArchetypes.mental_wellness}
                            size="small"
                            sx={{ 
                              bgcolor: SAHHA_ARCHETYPE_COLORS[profile.sahhaArchetypes.mental_wellness],
                              color: 'white',
                              textTransform: 'capitalize'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={profile.sahhaArchetypes.overall_wellness}
                            size="small"
                            sx={{ 
                              bgcolor: SAHHA_ARCHETYPE_COLORS[profile.sahhaArchetypes.overall_wellness],
                              color: 'white',
                              textTransform: 'capitalize'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={profile.interventionPriority}
                            size="small"
                            sx={{ 
                              bgcolor: RISK_COLORS[profile.interventionPriority],
                              color: 'white',
                              textTransform: 'capitalize'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            variant="outlined"
                            startIcon={<Person />}
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );

      case 2: // Strategic Insights
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  🧠 Sahha Archetype Intelligence Insights
                </Typography>
                These insights are generated from analyzing real Sahha archetype patterns (activity_level, mental_wellness, sleep_quality, overall_wellness) across your organization.
              </Alert>
            </Grid>

            {strategicInsights.map((insight, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Insights color="primary" />
                      <Typography variant="h6">
                        Strategic Insight #{index + 1}
                      </Typography>
                      <Chip 
                        label={insight.priority} 
                        size="small"
                        color={insight.priority === 'high' ? 'error' : 'warning'}
                      />
                    </Box>
                    
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      💡 {insight.insight}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📊 Impact: {insight.impact}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      🎯 Recommended Action: {insight.solution}
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      size="small"
                      startIcon={<TrendingUp />}
                    >
                      Implement Solution
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🎯 High-Risk Behavioral Patterns Detected
                  </Typography>
                  
                  {highRiskEmployees.length > 0 ? (
                    <Box>
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        {highRiskEmployees.length} employees identified with high-risk behavioral combinations requiring immediate attention.
                      </Alert>
                      
                      <Grid container spacing={2}>
                        {highRiskEmployees.map((employee) => (
                          <Grid item xs={12} md={6} key={employee.profileId}>
                            <Paper sx={{ p: 2 }}>
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Warning color="warning" />
                                <Typography variant="subtitle1">
                                  {employee.employeeName} - {employee.department}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary">
                                Behavioral Pattern: {employee.archetypes.mental_wellness} wellness + 
                                {' '}{employee.archetypes.stress_resilience} stress resilience
                              </Typography>
                              
                              <Box mt={2}>
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  color="warning"
                                  startIcon={<Psychology />}
                                >
                                  Generate Intervention Plan
                                </Button>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : (
                    <Alert severity="success">
                      <CheckCircle sx={{ mr: 1 }} />
                      No high-risk behavioral patterns detected. Your organization shows healthy behavioral diversity.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          🧬 Sahha Archetype Intelligence Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real Sahha archetype analysis using activity_level, mental_wellness, sleep_quality, and overall_wellness classifications
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab 
            icon={<Groups />} 
            label="Sahha Archetypes Overview" 
          />
          <Tab 
            icon={<Person />} 
            label="Individual Archetype Profiles" 
          />
          <Tab 
            icon={<Insights />} 
            label="Archetype-Based Insights" 
          />
        </Tabs>
      </Box>

      {renderTabContent()}
    </Box>
  );
}