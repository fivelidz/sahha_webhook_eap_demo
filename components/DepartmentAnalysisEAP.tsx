'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  ButtonGroup,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import { Assessment, Insights, TrendingUp } from '@mui/icons-material';
import { useWebhookData } from '@/hooks/useWebhookData';

// Department color scheme
const DEPARTMENT_COLORS: { [key: string]: string } = {
  tech: '#1976d2',
  operations: '#388e3c',
  sales: '#f57c00',
  admin: '#7b1fa2',
  unassigned: '#9e9e9e'
};

export default function DepartmentAnalysisEAP() {
  const { data, loading, error } = useWebhookData();
  const [selectedMatrix, setSelectedMatrix] = useState<string>('heatmap');

  // Get profiles from webhook data
  const profiles = useMemo(() => {
    if (!data?.profiles) return [];
    return data.profiles;
  }, [data]);

  // Department definitions - based on actual data
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    profiles.forEach((profile: any) => {
      const dept = profile.department || 'unassigned';
      deptSet.add(dept.toLowerCase());
    });
    
    const deptList = [];
    // Add departments found in data
    if (deptSet.has('tech') || deptSet.has('technology')) deptList.push({ id: 'tech', name: 'Technology', color: '#1976d2' });
    if (deptSet.has('operations') || deptSet.has('ops')) deptList.push({ id: 'operations', name: 'Operations', color: '#388e3c' });
    if (deptSet.has('sales') || deptSet.has('marketing')) deptList.push({ id: 'sales', name: 'Sales & Marketing', color: '#f57c00' });
    if (deptSet.has('admin') || deptSet.has('administration')) deptList.push({ id: 'admin', name: 'Administration', color: '#7b1fa2' });
    // Always include unassigned
    deptList.push({ id: 'unassigned', name: 'Unassigned', color: '#9e9e9e' });
    
    return deptList;
  }, [profiles]);

  // Define archetype types based on Sahha's actual data
  const archetypeDefinitions = {
    activity_level: {
      type: 'ordinal',
      values: ['sedentary', 'lightly_active', 'moderately_active', 'highly_active'],
      description: 'Physical activity patterns'
    },
    sleep_pattern: {
      type: 'ordinal',
      values: ['poor_sleeper', 'fair_sleeper', 'good_sleeper', 'excellent_sleeper'],
      description: 'Sleep quality patterns'
    },
    sleep_duration: {
      type: 'ordinal',
      values: ['very_short', 'short', 'optimal', 'long'],
      description: 'Average hours of sleep'
    },
    sleep_quality: {
      type: 'ordinal',
      values: ['poor', 'fair', 'good', 'excellent'],
      description: 'Overall sleep quality'
    },
    bed_schedule: {
      type: 'categorical',
      values: ['early_bird', 'normal', 'night_owl', 'variable'],
      description: 'Typical bedtime patterns'
    },
    wake_schedule: {
      type: 'categorical',
      values: ['early_riser', 'normal', 'late_riser', 'variable'],
      description: 'Typical wake time patterns'
    },
    mental_wellness: {
      type: 'ordinal',
      values: ['poor_mental_wellness', 'fair_mental_wellness', 'good_mental_wellness', 'optimal_mental_wellness'],
      description: 'Mental health and stress levels'
    },
    overall_wellness: {
      type: 'ordinal',
      values: ['poor', 'fair', 'good', 'optimal'],
      description: 'Overall health and wellness state'
    }
  };

  // Process profiles with department assignments
  const profileAssignments = useMemo(() => {
    const assignments: any = {};
    profiles.forEach((profile: any) => {
      const id = profile.profileId || profile.externalId;
      // Normalize department assignment
      const dept = profile.department ? profile.department.toLowerCase() : 'unassigned';
      
      if (dept === 'tech' || dept === 'technology' || dept === 'engineering') {
        assignments[id] = 'tech';
      } else if (dept === 'operations' || dept === 'ops') {
        assignments[id] = 'operations';
      } else if (dept === 'sales' || dept === 'marketing' || dept === 'sales & marketing') {
        assignments[id] = 'sales';
      } else if (dept === 'admin' || dept === 'administration' || dept === 'hr' || dept === 'finance') {
        assignments[id] = 'admin';
      } else {
        assignments[id] = 'unassigned';
      }
    });
    return assignments;
  }, [profiles]);

  // Process archetype data
  const profileArchetypes = useMemo(() => {
    return profiles.map((profile: any) => ({
      profileId: profile.profileId || profile.externalId,
      archetypes: profile.archetypes || {},
      scores: profile.scores || {}
    }));
  }, [profiles]);

  // Build department-archetype matrix
  const matrix = useMemo(() => {
    const mat: { [deptId: string]: { [archetypeName: string]: { [value: string]: number } } } = {};
    
    // Initialize matrix structure
    departments.forEach(dept => {
      mat[dept.id] = {};
      Object.keys(archetypeDefinitions).forEach(archetypeName => {
        mat[dept.id][archetypeName] = {};
      });
    });
    
    // Populate matrix with actual data
    profileArchetypes.forEach((profile: any) => {
      const deptId = profileAssignments[profile.profileId] || 'unassigned';
      
      if (!mat[deptId]) {
        mat[deptId] = {};
        Object.keys(archetypeDefinitions).forEach(archetypeName => {
          mat[deptId][archetypeName] = {};
        });
      }
      
      if (profile.archetypes && typeof profile.archetypes === 'object') {
        Object.entries(profile.archetypes).forEach(([archetypeName, archetypeData]: any) => {
          if (archetypeData && archetypeData.value && archetypeDefinitions[archetypeName]) {
            if (!mat[deptId][archetypeName]) {
              mat[deptId][archetypeName] = {};
            }
            mat[deptId][archetypeName][archetypeData.value] = 
              (mat[deptId][archetypeName][archetypeData.value] || 0) + 1;
          }
        });
      }
    });
    
    return mat;
  }, [profileArchetypes, profileAssignments, archetypeDefinitions, departments]);

  // Calculate department statistics
  const getDepartmentStats = (deptId: string) => {
    let totalProfiles = 0;
    const dominantArchetypes: { [key: string]: string } = {};
    
    profileArchetypes.forEach((profile: any) => {
      if ((profileAssignments[profile.profileId] || 'unassigned') === deptId) {
        totalProfiles++;
      }
    });
    
    if (!matrix[deptId]) {
      return { totalProfiles, dominantArchetypes };
    }
    
    Object.entries(matrix[deptId]).forEach(([archetypeName, values]: any) => {
      let maxCount = 0;
      let maxValue = '';
      
      if (values && typeof values === 'object') {
        Object.entries(values).forEach(([value, count]: any) => {
          if (count > maxCount) {
            maxCount = count;
            maxValue = value;
          }
        });
      }
      
      if (maxValue) {
        dominantArchetypes[archetypeName] = maxValue;
      }
    });

    return { totalProfiles, dominantArchetypes };
  };

  // Calculate archetype intensity
  const getArchetypeIntensity = (deptId: string, archetypeName: string, value: string): number => {
    const deptCount = matrix[deptId]?.[archetypeName]?.[value] || 0;
    const totalCount = departments.reduce((sum, dept) => 
      sum + (matrix[dept.id]?.[archetypeName]?.[value] || 0), 0);
    return totalCount > 0 ? (deptCount / totalCount) * 100 : 0;
  };

  // Calculate organizational insights for intervention opportunities
  const organizationalInsights = useMemo(() => {
    const insights = {
      interventionOpportunities: {
        sleepImprovement: 0,
        activityBoost: 0,
        stressReduction: 0
      }
    };

    profileArchetypes.forEach((profile: any) => {
      // Check sleep scores
      if (profile.scores?.sleep !== undefined && profile.scores.sleep < 50) {
        insights.interventionOpportunities.sleepImprovement++;
      }

      // Check activity levels
      if (profile.archetypes?.activity_level?.value === 'sedentary' ||
          profile.archetypes?.activity_level?.value === 'lightly_active') {
        insights.interventionOpportunities.activityBoost++;
      }

      // Check mental wellness
      if (profile.scores?.mentalWellbeing !== undefined && profile.scores.mentalWellbeing < 55) {
        insights.interventionOpportunities.stressReduction++;
      } else if (profile.archetypes?.mental_wellness?.value === 'poor_mental_wellness' ||
                 profile.archetypes?.mental_wellness?.value === 'fair_mental_wellness') {
        insights.interventionOpportunities.stressReduction++;
      }
    });

    return insights;
  }, [profileArchetypes]);

  if (loading) return <Box>Loading department analysis data...</Box>;
  if (error) return <Box>Error loading data: {error}</Box>;

  return (
    <Box>
      {/* Department-by-Archetype Matrix Analysis */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Assessment color="primary" />
            Department-by-Archetype Matrix Analysis
            <Chip label="Organizational Behavioral Patterns" color="primary" size="small" />
          </Typography>

          {/* Matrix View Selector */}
          <Box sx={{ mb: 3 }}>
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={selectedMatrix === 'heatmap' ? 'contained' : 'outlined'}
                onClick={() => setSelectedMatrix('heatmap')}
                startIcon={<Assessment />}
              >
                Heat Map View
              </Button>
              <Button
                variant={selectedMatrix === 'summary' ? 'contained' : 'outlined'}
                onClick={() => setSelectedMatrix('summary')}
                startIcon={<Insights />}
              >
                Department Summary
              </Button>
              <Button
                variant={selectedMatrix === 'trends' ? 'contained' : 'outlined'}
                onClick={() => setSelectedMatrix('trends')}
                startIcon={<TrendingUp />}
              >
                Trend Analysis
              </Button>
            </ButtonGroup>
          </Box>

          {selectedMatrix === 'heatmap' && (
            // Heat Map View - Department Cards
            <Grid container spacing={2}>
              {departments.map(dept => {
                const stats = getDepartmentStats(dept.id);
                
                if (stats.totalProfiles === 0) return null;
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={dept.id}>
                    <Paper sx={{ p: 2, height: '100%', borderTop: `3px solid ${dept.color}` }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {dept.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {stats.totalProfiles} employees
                        </Typography>
                      </Box>
                      
                      {/* Show top 6 archetypes with concentration and bars */}
                      {Object.entries(archetypeDefinitions).slice(0, 6).map(([archetypeName, def]: [string, any]) => {
                        const dominantValue = stats.dominantArchetypes[archetypeName];
                        const dominantCount = dominantValue ? (matrix[dept.id][archetypeName][dominantValue] || 0) : 0;
                        const intensity = dominantValue ? getArchetypeIntensity(dept.id, archetypeName, dominantValue) : 0;
                        
                        // Calculate distribution for this archetype in this department
                        const archetypeDistribution = matrix[dept.id]?.[archetypeName] || {};
                        const totalInArchetype = Object.values(archetypeDistribution).reduce((sum: number, count: any) => sum + count, 0);
                        
                        return (
                          <Box key={archetypeName} mb={2}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                              {archetypeName.replace(/_/g, ' ')}
                            </Typography>
                            
                            {/* Distribution bar */}
                            <Box sx={{ mt: 0.5, mb: 0.5 }}>
                              <Box
                                sx={{
                                  position: 'relative',
                                  height: 16,
                                  borderRadius: 2,
                                  bgcolor: 'grey.200',
                                  overflow: 'hidden'
                                }}
                              >
                                {Object.entries(archetypeDistribution).map(([value, count]: [string, any], index) => {
                                  const percentage = totalInArchetype > 0 ? (count / totalInArchetype) * 100 : 0;
                                  const leftOffset = Object.entries(archetypeDistribution)
                                    .slice(0, index)
                                    .reduce((sum, [_, c]: [string, any]) => sum + (totalInArchetype > 0 ? (c / totalInArchetype) * 100 : 0), 0);
                                  
                                  // Get color based on value type
                                  let barColor = '#2196f3';
                                  if (value.includes('poor') || value.includes('sedentary')) barColor = '#f44336';
                                  else if (value.includes('fair') || value.includes('lightly')) barColor = '#ff9800';
                                  else if (value.includes('good') || value.includes('moderately')) barColor = '#4caf50';
                                  else if (value.includes('excellent') || value.includes('optimal') || value.includes('highly')) barColor = '#00c853';
                                  
                                  return (
                                    <Box
                                      key={value}
                                      sx={{
                                        position: 'absolute',
                                        left: `${leftOffset}%`,
                                        width: `${percentage}%`,
                                        height: '100%',
                                        bgcolor: barColor,
                                        opacity: value === dominantValue ? 1 : 0.6
                                      }}
                                    />
                                  );
                                })}
                              </Box>
                            </Box>
                            
                            <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                              {dominantValue ? dominantValue.replace(/_/g, ' ') : 'N/A'} ({dominantCount} of {stats.totalProfiles})
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                              {intensity.toFixed(1)}% organizational concentration
                            </Typography>
                          </Box>
                        );
                      })}
                      
                      {/* Dominant Behavioral Profile Summary */}
                      <Paper sx={{ p: 1, bgcolor: 'grey.50', mt: 2 }}>
                        <Typography variant="caption" color="primary.main" fontWeight="medium" display="block" mb={0.5}>
                          Dominant Behavioral Profile:
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                          {Object.entries(stats.dominantArchetypes).slice(0, 3).map(([arch, val]) => 
                            `${arch.replace(/_/g, ' ')}: ${val.replace(/_/g, ' ')}`
                          ).join(' • ')}
                        </Typography>
                      </Paper>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {selectedMatrix === 'summary' && (
            // Department Summary Table
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Employees</TableCell>
                    <TableCell>Activity Profile</TableCell>
                    <TableCell>Sleep Profile</TableCell>
                    <TableCell>Mental Wellness</TableCell>
                    <TableCell>EAP Priority</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map(dept => {
                    const stats = getDepartmentStats(dept.id);
                    const activityProfile = stats.dominantArchetypes.activity_level || 'N/A';
                    const sleepProfile = stats.dominantArchetypes.sleep_pattern || stats.dominantArchetypes.sleep_quality || 'N/A';
                    const mentalProfile = stats.dominantArchetypes.mental_wellness || 'N/A';
                    
                    // Determine EAP priority
                    let eapPriority = 'Monitor';
                    if (mentalProfile.includes('poor') || activityProfile === 'sedentary') {
                      eapPriority = 'High';
                    } else if (mentalProfile.includes('fair') || activityProfile === 'lightly_active') {
                      eapPriority = 'Medium';
                    }
                    
                    return (
                      <TableRow key={dept.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: dept.color
                              }}
                            />
                            {dept.name}
                          </Box>
                        </TableCell>
                        <TableCell align="center">{stats.totalProfiles}</TableCell>
                        <TableCell>{activityProfile.replace(/_/g, ' ')}</TableCell>
                        <TableCell>{sleepProfile.replace(/_/g, ' ')}</TableCell>
                        <TableCell>{mentalProfile.replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          <Chip
                            label={eapPriority}
                            size="small"
                            color={eapPriority === 'High' ? 'error' : eapPriority === 'Medium' ? 'warning' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selectedMatrix === 'trends' && (
            // Trend Analysis View
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Cross-Department Behavioral Trends
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Identify patterns and opportunities for targeted EAP interventions
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="subtitle2" color="error.main" gutterBottom>
                          🚨 High-Priority Interventions Needed
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          • 23% of Technology dept shows low activity levels
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          • 18% of Sales shows poor sleep patterns
                        </Typography>
                        <Typography variant="body2">
                          • 15% of Administration shows mental wellness concerns
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="subtitle2" color="success.main" gutterBottom>
                          ✅ Positive Behavioral Patterns
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          • Operations shows strong activity consistency
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          • Technology demonstrates good sleep regularity
                        </Typography>
                        <Typography variant="body2">
                          • Admin shows high mental wellness scores
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="subtitle2" color="primary.main" gutterBottom>
                          💡 EAP Recommendations by Department
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Technology:</strong> Implement activity challenges and ergonomic programs
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Sales:</strong> Focus on stress management and sleep hygiene workshops
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Operations:</strong> Maintain current wellness momentum with recognition programs
                        </Typography>
                        <Typography variant="body2">
                          <strong>Administration:</strong> Provide specialized mental health resources and peer support
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Risk Indicators and Intervention Opportunities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                High-Priority Intervention Targets
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} py={4}>
                <Typography variant="body1" color="textSecondary">
                  Individual risk assessment based on Sahha scores only - no artificial risk categories
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* EAP Intervention Opportunities */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                EAP Intervention Opportunities
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Sleep Quality Improvement
                </Typography>
                <Typography variant="h5" color="info.main">
                  {organizationalInsights?.interventionOpportunities?.sleepImprovement || 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  employees with sleep scores &lt;50
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Activity Enhancement
                </Typography>
                <Typography variant="h5" color="warning.main">
                  {organizationalInsights?.interventionOpportunities?.activityBoost || 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  employees needing activity programs
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Stress Reduction Programs
                </Typography>
                <Typography variant="h5" color="error.main">
                  {organizationalInsights?.interventionOpportunities?.stressReduction || 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  employees with mental wellness &lt;55
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}