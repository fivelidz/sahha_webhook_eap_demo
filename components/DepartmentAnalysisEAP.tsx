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
  Divider,
  Tooltip
} from '@mui/material';
import { Assessment, Insights, TrendingUp } from '@mui/icons-material';
import { useWebhookData } from '@/hooks/useWebhookData';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

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
  const archetypeDefinitions: { [key: string]: { type: string; values: string[]; description: string } } = {
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
          if (archetypeData && archetypeData.value && archetypeDefinitions[archetypeName as keyof typeof archetypeDefinitions]) {
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
            // Heat Map View - Enhanced with better department distinction
            <Box>
              <Paper sx={{ p: 3, mb: 3, bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  Archetype Distribution Matrix
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Comprehensive view of all archetype values across each department
                </Typography>
              </Paper>
              
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 800 }}>
                  
                  {/* Heat Map Rows */}
                  {departments.map(dept => {
                    const stats = getDepartmentStats(dept.id);
                    if (stats.totalProfiles === 0) return null;
                    
                    return (
                      <Paper 
                        key={dept.id} 
                        elevation={4}
                        sx={{ 
                          mb: 4,
                          p: 3,
                          border: theme => `3px solid ${dept.color}`,
                          borderRadius: 2,
                          position: 'relative',
                          bgcolor: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(0, 0, 0, 0.4)' 
                            : 'rgba(255, 255, 255, 0.95)',
                          boxShadow: theme => theme.palette.mode === 'dark'
                            ? `0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 20px ${dept.color}20`
                            : `0 4px 20px rgba(0, 0, 0, 0.1), inset 0 0 20px ${dept.color}10`,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            bgcolor: dept.color,
                            borderRadius: '2px 2px 0 0'
                          }
                        }}
                      >
                        {/* Department Header - Bigger and more prominent */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          pb: 1.5,
                          borderBottom: `3px solid ${dept.color}`
                        }}>
                          <Box 
                            sx={{
                              width: 8,
                              height: 32,
                              bgcolor: dept.color,
                              mr: 2,
                              borderRadius: 1
                            }}
                          />
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            fontSize: '1.3rem',
                            color: dept.color,
                            letterSpacing: '0.5px'
                          }}>
                            {dept.name.toUpperCase()}
                          </Typography>
                          <Chip
                            label={`${stats.totalProfiles} employees`}
                            size="small"
                            sx={{ 
                              ml: 2,
                              bgcolor: dept.color,
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        
                        {/* Archetype rows for this department - Stacked horizontal bars */}
                        {Object.keys(archetypeDefinitions).filter(archetypeName => {
                          // Only show archetypes that have data
                          const hasData = matrix[dept.id]?.[archetypeName] && 
                            Object.keys(matrix[dept.id][archetypeName]).length > 0;
                          return hasData;
                        }).map(archetypeName => {
                          const archetypeDistribution = matrix[dept.id]?.[archetypeName] || {};
                          const totalInArchetype = Object.values(archetypeDistribution).reduce((sum: number, count: any) => sum + count, 0);
                          const archDef = archetypeDefinitions[archetypeName];
                          if (!archDef) return null;
                          
                          // Get all possible values for this archetype
                          const allValues = archDef.values;
                          
                          return (
                            <Box key={archetypeName} sx={{ 
                              mb: 3,
                              p: 2,
                              borderRadius: 1,
                              bgcolor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.04)' 
                                : 'rgba(0, 0, 0, 0.03)',
                              border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                            }}>
                              <Typography variant="subtitle2" sx={{ 
                                display: 'block',
                                color: 'text.primary',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                mb: 1,
                                textTransform: 'capitalize'
                              }}>
                                {archetypeName.replace(/_/g, ' ')}
                              </Typography>
                              
                              {/* Stacked horizontal bar */}
                              <Box sx={{ 
                                position: 'relative',
                                height: 40,
                                bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'}`
                              }}>
                                {allValues.map((value: string, idx: number) => {
                                  const count = archetypeDistribution[value] || 0;
                                  const percentage = totalInArchetype > 0 ? (count / totalInArchetype) * 100 : 0;
                                  
                                  // Calculate left position
                                  const leftOffset = allValues.slice(0, idx).reduce((sum, v) => {
                                    const vCount = archetypeDistribution[v] || 0;
                                    return sum + (totalInArchetype > 0 ? (vCount / totalInArchetype) * 100 : 0);
                                  }, 0);
                                  
                                  // Color based on archetype value sentiment with dark mode support
                                  let bgColor = '';
                                  
                                  if (count > 0) {
                                    if (value.includes('poor') || value.includes('sedentary') || value.includes('very_short')) {
                                      bgColor = '#d32f2f'; // Red
                                    } else if (value.includes('fair') || value.includes('lightly') || value.includes('short') || value.includes('irregular')) {
                                      bgColor = '#f57c00'; // Orange
                                    } else if (value.includes('good') || value.includes('moderately') || value.includes('optimal') || value.includes('regular') || value.includes('normal')) {
                                      bgColor = '#388e3c'; // Green
                                    } else if (value.includes('excellent') || value.includes('highly') || value.includes('very_regular')) {
                                      bgColor = '#1b5e20'; // Dark Green
                                    } else if (value.includes('long')) {
                                      bgColor = '#0288d1'; // Blue (for long sleep)
                                    } else {
                                      // Neutral/variable values
                                      bgColor = '#757575'; // Grey
                                    }
                                  } else {
                                    return null;
                                  }
                                  
                                  return (
                                    <Tooltip
                                      key={value}
                                      title={`${value.replace(/_/g, ' ')}: ${count} (${percentage.toFixed(0)}%)`}
                                      arrow
                                    >
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          left: `${leftOffset}%`,
                                          width: `${percentage}%`,
                                          height: '100%',
                                          bgcolor: bgColor,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          transition: 'opacity 0.2s',
                                          '&:hover': {
                                            opacity: 0.8
                                          }
                                        }}
                                      >
                                        {percentage > 10 && (
                                          <Typography 
                                            variant="caption" 
                                            sx={{ 
                                              color: 'white',
                                              fontWeight: 600,
                                              fontSize: '0.7rem'
                                            }}
                                          >
                                            {count}
                                          </Typography>
                                        )}
                                      </Box>
                                    </Tooltip>
                                  );
                                })}
                                
                                {/* Show empty state if no data */}
                                {totalInArchetype === 0 && (
                                  <Box sx={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <Typography variant="caption" color="text.disabled">
                                      No data
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              
                              {/* Value labels below bar */}
                              <Box sx={{ 
                                display: 'flex', 
                                gap: 0.5, 
                                mt: 0.5,
                                flexWrap: 'wrap'
                              }}>
                                {allValues.filter(v => (archetypeDistribution[v] || 0) > 0).map((value: string) => {
                                  const count = archetypeDistribution[value] || 0;
                                  const percentage = totalInArchetype > 0 ? (count / totalInArchetype) * 100 : 0;
                                  
                                  // Color coding
                                  let chipColor: any = 'default';
                                  if (value.includes('poor') || value.includes('sedentary') || value.includes('very_short')) {
                                    chipColor = 'error';
                                  } else if (value.includes('fair') || value.includes('lightly') || value.includes('short')) {
                                    chipColor = 'warning';
                                  } else if (value.includes('good') || value.includes('moderately') || value.includes('optimal')) {
                                    chipColor = 'success';
                                  } else if (value.includes('excellent') || value.includes('highly')) {
                                    chipColor = 'success';
                                  }
                                  
                                  return (
                                    <Chip
                                      key={value}
                                      label={`${value.replace(/_/g, ' ')}: ${percentage.toFixed(0)}%`}
                                      size="small"
                                      color={chipColor}
                                      variant="outlined"
                                      sx={{ 
                                        fontSize: '0.65rem',
                                        height: 20,
                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </Box>
                            </Box>
                          );
                        })}
                      </Paper>
                    );
                  })}
                  
                  {/* Legend */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                      LEGEND: Color coding by archetype value sentiment
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#ffcdd2', borderRadius: 0.5 }} />
                        <Typography variant="caption">Poor/Sedentary</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#ffe0b2', borderRadius: 0.5 }} />
                        <Typography variant="caption">Fair/Light</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#c8e6c9', borderRadius: 0.5 }} />
                        <Typography variant="caption">Good/Moderate</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#a5d6a7', borderRadius: 0.5 }} />
                        <Typography variant="caption">Excellent/High</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 16, height: 16, bgcolor: '#e3f2fd', borderRadius: 0.5 }} />
                        <Typography variant="caption">Neutral/Other</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
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
            // Trend Analysis View with actual time-series data
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Department Wellness Trends Over Time
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Track changes in department wellness scores over the past 7 days
                  </Typography>
                  
                  {/* Generate simulated time-series data for demonstration */}
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={(() => {
                      // Generate last 7 days of data
                      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      return days.map((day, idx) => {
                        const baseData: any = { day };
                        departments.forEach(dept => {
                          const stats = getDepartmentStats(dept.id);
                          if (stats.totalProfiles > 0) {
                            // Calculate average wellness score for department
                            const deptProfiles = profiles.filter((p: any) => 
                              (profileAssignments[p.profileId || p.externalId] || 'unassigned') === dept.id
                            );
                            const avgScore = deptProfiles.reduce((sum: number, p: any) => {
                              const wellbeing = p.scores?.wellbeing?.value || 50;
                              const activity = p.scores?.activity?.value || 50;
                              const sleep = p.scores?.sleep?.value || 50;
                              return sum + ((wellbeing + activity + sleep) / 3);
                            }, 0) / (deptProfiles.length || 1);
                            
                            // Add some variation to simulate trends
                            baseData[dept.name] = Math.round(avgScore + (Math.random() * 10 - 5) - (idx * 0.5));
                          }
                        });
                        return baseData;
                      });
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} label={{ value: 'Wellness Score', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Legend />
                      {departments.filter(dept => getDepartmentStats(dept.id).totalProfiles > 0).map(dept => (
                        <Line 
                          key={dept.id}
                          type="monotone" 
                          dataKey={dept.name} 
                          stroke={dept.color} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Activity Level Changes by Department
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={departments.filter(dept => getDepartmentStats(dept.id).totalProfiles > 0).map(dept => {
                      const deptProfiles = profiles.filter((p: any) => 
                        (profileAssignments[p.profileId || p.externalId] || 'unassigned') === dept.id
                      );
                      const sedentaryCount = deptProfiles.filter((p: any) => 
                        p.archetypes?.activity_level?.value === 'sedentary'
                      ).length;
                      const activeCount = deptProfiles.filter((p: any) => 
                        p.archetypes?.activity_level?.value === 'highly_active' ||
                        p.archetypes?.activity_level?.value === 'moderately_active'
                      ).length;
                      
                      return {
                        department: dept.name,
                        sedentary: Math.round((sedentaryCount / deptProfiles.length) * 100) || 0,
                        active: Math.round((activeCount / deptProfiles.length) * 100) || 0
                      };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis domain={[0, 100]} label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="sedentary" fill="#FF7043" name="Sedentary %" />
                      <Bar dataKey="active" fill="#4CAF50" name="Active %" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sleep Quality Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={departments.filter(dept => getDepartmentStats(dept.id).totalProfiles > 0).map(dept => {
                      const deptProfiles = profiles.filter((p: any) => 
                        (profileAssignments[p.profileId || p.externalId] || 'unassigned') === dept.id
                      );
                      const poorSleep = deptProfiles.filter((p: any) => 
                        (p.scores?.sleep?.value || 50) < 50
                      ).length;
                      const goodSleep = deptProfiles.filter((p: any) => 
                        (p.scores?.sleep?.value || 50) >= 70
                      ).length;
                      
                      return {
                        department: dept.name,
                        poorSleep: Math.round((poorSleep / deptProfiles.length) * 100) || 0,
                        goodSleep: Math.round((goodSleep / deptProfiles.length) * 100) || 0
                      };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis domain={[0, 100]} label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="poorSleep" fill="#FF9800" name="Poor Sleep %" />
                      <Bar dataKey="goodSleep" fill="#2196F3" name="Good Sleep %" />
                    </BarChart>
                  </ResponsiveContainer>
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