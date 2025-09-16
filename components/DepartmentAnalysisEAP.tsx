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
  const { data, loading, error } = useWebhookData(30000, true); // Use demo mode
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
            // Heat Map View - Simplified Grid
            <Paper sx={{ p: 3 }}>
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 800 }}>
                  {/* Column Headers */}
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <Box sx={{ width: 150, pr: 1 }} />
                    {['Sedentary/Poor', 'Light/Fair', 'Moderate/Good', 'High/Excellent'].map((label, idx) => (
                      <Box key={label} sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600,
                          color: idx === 0 ? '#f44336' : idx === 1 ? '#ff9800' : idx === 2 ? '#4caf50' : '#00c853'
                        }}>
                          {label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Heat Map Rows */}
                  {departments.map(dept => {
                    const stats = getDepartmentStats(dept.id);
                    if (stats.totalProfiles === 0) return null;
                    
                    return (
                      <Box key={dept.id} sx={{ mb: 3 }}>
                        {/* Department Header */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1,
                          pb: 1,
                          borderBottom: `2px solid ${dept.color}`
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600,
                            width: 150,
                            color: dept.color
                          }}>
                            {dept.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ({stats.totalProfiles} employees)
                          </Typography>
                        </Box>
                        
                        {/* Archetype rows for this department */}
                        {['activity_level', 'sleep_quality', 'mental_wellness'].map(archetypeName => {
                          const archetypeDistribution = matrix[dept.id]?.[archetypeName] || {};
                          const totalInArchetype = Object.values(archetypeDistribution).reduce((sum: number, count: any) => sum + count, 0);
                          const archDef = archetypeDefinitions[archetypeName];
                          if (!archDef) return null;
                          
                          // Group values into 4 categories
                          const categories = [0, 0, 0, 0]; // [poor/sedentary, fair/light, good/moderate, excellent/high]
                          
                          Object.entries(archetypeDistribution).forEach(([value, count]: [string, any]) => {
                            if (value.includes('sedentary') || value.includes('poor')) categories[0] += count;
                            else if (value.includes('lightly') || value.includes('fair')) categories[1] += count;
                            else if (value.includes('moderately') || value.includes('good')) categories[2] += count;
                            else if (value.includes('highly') || value.includes('excellent') || value.includes('optimal')) categories[3] += count;
                          });
                          
                          return (
                            <Box key={archetypeName} sx={{ display: 'flex', mb: 1.5 }}>
                              <Typography variant="caption" sx={{ 
                                width: 150, 
                                pr: 1,
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}>
                                {archetypeName.replace(/_/g, ' ').toUpperCase()}
                              </Typography>
                              
                              {/* Heat map cells */}
                              {categories.map((count, idx) => {
                                const percentage = totalInArchetype > 0 ? (count / totalInArchetype) * 100 : 0;
                                
                                // Color intensity based on percentage
                                let bgColor = '#f5f5f5';
                                let textColor = 'text.secondary';
                                
                                if (percentage > 0) {
                                  if (idx === 0) { // Poor/Sedentary - Red
                                    bgColor = percentage > 50 ? '#d32f2f' : percentage > 25 ? '#ef5350' : '#ffcdd2';
                                    textColor = percentage > 25 ? 'white' : 'text.primary';
                                  } else if (idx === 1) { // Fair/Light - Orange
                                    bgColor = percentage > 50 ? '#f57c00' : percentage > 25 ? '#ff9800' : '#ffe0b2';
                                    textColor = percentage > 25 ? 'white' : 'text.primary';
                                  } else if (idx === 2) { // Good/Moderate - Light Green
                                    bgColor = percentage > 50 ? '#388e3c' : percentage > 25 ? '#66bb6a' : '#c8e6c9';
                                    textColor = percentage > 25 ? 'white' : 'text.primary';
                                  } else { // Excellent/High - Dark Green
                                    bgColor = percentage > 50 ? '#1b5e20' : percentage > 25 ? '#43a047' : '#a5d6a7';
                                    textColor = percentage > 25 ? 'white' : 'text.primary';
                                  }
                                }
                                
                                return (
                                  <Box key={idx} sx={{ 
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 32,
                                    mx: 0.5,
                                    borderRadius: 1,
                                    bgcolor: bgColor,
                                    color: textColor,
                                    border: percentage > 0 ? 'none' : '1px solid #e0e0e0'
                                  }}>
                                    {percentage > 0 && (
                                      <Typography variant="caption" sx={{ fontWeight: percentage > 25 ? 600 : 400 }}>
                                        {count} ({percentage.toFixed(0)}%)
                                      </Typography>
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })}
                  
                  {/* Legend */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                      LEGEND: Cell color intensity indicates percentage concentration
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#ffcdd2', borderRadius: 0.5 }} />
                        <Typography variant="caption">Low (&lt;25%)</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#ef5350', borderRadius: 0.5 }} />
                        <Typography variant="caption">Medium (25-50%)</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#d32f2f', borderRadius: 0.5 }} />
                        <Typography variant="caption">High (&gt;50%)</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
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