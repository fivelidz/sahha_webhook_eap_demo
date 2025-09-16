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
  ButtonGroup,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Clear,
  FitnessCenter,
  AccessTime,
  Psychology,
  People,
  Biotech
} from '@mui/icons-material';
import { useWebhookData } from '@/hooks/useWebhookData';

interface BehavioralIntelligenceEAPProps {
  orgId: string;
}

export default function BehavioralIntelligenceEAP({ orgId }: BehavioralIntelligenceEAPProps) {
  const { data, loading, error } = useWebhookData(30000, true); // Use demo mode
  const [selectedArchetypeCategory, setSelectedArchetypeCategory] = useState<string>('activity');
  const [selectedArchetypeFilters, setSelectedArchetypeFilters] = useState<{ [key: string]: string }>({});
  const [drillDownData, setDrillDownData] = useState<any>(null);

  // Get profiles from webhook data
  const profiles = useMemo(() => {
    if (!data?.profiles) return [];
    return data.profiles;
  }, [data]);

  // Define ALL archetype types with proper categories
  const archetypeDefinitions = {
    // Activity Intelligence (5 archetypes)
    activity_level: {
      type: 'ordinal',
      values: ['sedentary', 'lightly_active', 'moderately_active', 'highly_active'],
      description: 'Overall activity patterns throughout the day',
      category: 'activity'
    },
    exercise_frequency: {
      type: 'ordinal',
      values: ['rare_exerciser', 'occasional_exerciser', 'regular_exerciser', 'frequent_exerciser'],
      description: 'How often the person engages in structured exercise',
      category: 'activity'
    },
    primary_exercise: {
      type: 'categorical',
      values: ['cardio', 'strength', 'flexibility', 'mixed', 'none'],
      description: 'Primary type of exercise performed',
      category: 'activity'
    },
    primary_exercise_type: {
      type: 'categorical',
      values: ['running', 'cycling', 'swimming', 'gym', 'yoga', 'walking', 'other'],
      description: 'Specific primary exercise activity',
      category: 'activity'
    },
    secondary_exercise: {
      type: 'categorical',
      values: ['cardio', 'strength', 'flexibility', 'mixed', 'none'],
      description: 'Secondary type of exercise performed',
      category: 'activity'
    },
    // Sleep Intelligence (7 archetypes)
    sleep_duration: {
      type: 'ordinal',
      values: ['very_short', 'short', 'optimal', 'long'],
      description: 'Average hours of sleep per night',
      category: 'sleep'
    },
    sleep_efficiency: {
      type: 'ordinal',
      values: ['poor', 'fair', 'good', 'excellent'],
      description: 'Quality of sleep based on time asleep vs time in bed',
      category: 'sleep'
    },
    sleep_quality: {
      type: 'ordinal',
      values: ['poor', 'fair', 'good', 'excellent'],
      description: 'Overall sleep quality and restfulness',
      category: 'sleep'
    },
    sleep_regularity: {
      type: 'ordinal',
      values: ['irregular', 'somewhat_regular', 'regular', 'very_regular'],
      description: 'Consistency of sleep schedule',
      category: 'sleep'
    },
    bed_schedule: {
      type: 'categorical',
      values: ['early_bird', 'normal', 'night_owl', 'variable'],
      description: 'Typical bedtime patterns',
      category: 'sleep'
    },
    wake_schedule: {
      type: 'categorical',
      values: ['early_riser', 'normal', 'late_riser', 'variable'],
      description: 'Typical wake time patterns',
      category: 'sleep'
    },
    sleep_pattern: {
      type: 'ordinal',
      values: ['poor_sleeper', 'fair_sleeper', 'good_sleeper', 'excellent_sleeper'],
      description: 'Overall sleep behavior pattern',
      category: 'sleep'
    },
    // Wellness Intelligence (2 archetypes)
    mental_wellness: {
      type: 'ordinal',
      values: ['poor_mental_wellness', 'fair_mental_wellness', 'good_mental_wellness', 'optimal_mental_wellness'],
      description: 'Mental health and emotional wellbeing',
      category: 'wellness'
    },
    overall_wellness: {
      type: 'ordinal',
      values: ['poor', 'fair', 'good', 'optimal'],
      description: 'Overall health and wellness state',
      category: 'wellness'
    }
  };

  // Process profiles with department assignments
  const profileAssignments = useMemo(() => {
    const assignments: any = {};
    profiles.forEach((profile: any) => {
      const id = profile.profileId || profile.externalId;
      // Normalize department assignment - only specific departments or 'unassigned'
      const dept = profile.department ? profile.department.toLowerCase() : 'unassigned';
      
      // Map known departments, everything else becomes 'unassigned'
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
      scores: profile.scores || {},
      department: profile.department || 'unassigned'
    }));
  }, [profiles]);

  // Get filtered profiles based on selected filters
  const getFilteredProfiles = () => {
    if (Object.keys(selectedArchetypeFilters).length === 0) {
      return profileArchetypes;
    }

    return profileArchetypes.filter((profile: any) => {
      return Object.entries(selectedArchetypeFilters).every(([archetypeName, value]) => {
        if (profile.archetypes && profile.archetypes[archetypeName]) {
          return profile.archetypes[archetypeName].value === value;
        }
        return false;
      });
    });
  };

  const filteredProfiles = getFilteredProfiles();

  // Process archetype data for visualization - only show archetypes that exist in data
  const getArchetypeDataByCategory = (category: string) => {
    // First, find which archetypes actually exist in the data
    const existingArchetypes = new Set<string>();
    profiles.forEach((profile: any) => {
      if (profile.archetypes) {
        Object.keys(profile.archetypes).forEach(arch => existingArchetypes.add(arch));
      }
    });

    const categoryArchetypes = Object.entries(archetypeDefinitions)
      .filter(([name, def]: [string, any]) => def.category === category && existingArchetypes.has(name));

    return categoryArchetypes.map(([archetypeName, definition]: [string, any]) => {
      // Build distribution from filtered profiles
      const distribution: { [key: string]: number } = {};
      definition.values.forEach((value: string) => {
        distribution[value] = 0;
      });

      filteredProfiles.forEach((profile: any) => {
        if (profile.archetypes && profile.archetypes[archetypeName]) {
          const value = profile.archetypes[archetypeName].value;
          if (value && distribution.hasOwnProperty(value)) {
            distribution[value] = (distribution[value] || 0) + 1;
          }
        }
      });

      const totalCount = Object.values(distribution).reduce((sum: number, count: any) => sum + (count || 0), 0);

      return {
        name: archetypeName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        archetypeName,
        definition,
        distribution,
        totalCount,
        dataType: definition.type
      };
    });
  };

  // Handle archetype selection for filtering
  const handleArchetypeSelection = (archetypeName: string, archetypeValue: string) => {
    setSelectedArchetypeFilters((prev: any) => {
      const newFilters = { ...prev };
      
      if (newFilters[archetypeName] === archetypeValue) {
        delete newFilters[archetypeName];
      } else {
        newFilters[archetypeName] = archetypeValue;
      }
      
      return newFilters;
    });
  };

  // Handle drill-down to see profiles
  const handleArchetypeDrillDown = (archetypeName: string, archetypeValue: string) => {
    const matchingProfiles = filteredProfiles.filter((profile: any) => {
      if (profile.archetypes && typeof profile.archetypes === 'object') {
        return profile.archetypes[archetypeName] && profile.archetypes[archetypeName].value === archetypeValue;
      }
      return false;
    });
    
    setDrillDownData({
      archetype: archetypeName,
      value: archetypeValue,
      profiles: matchingProfiles,
      isOpen: true
    });
  };

  const closeDrillDown = () => {
    setDrillDownData(null);
  };

  // Get department breakdown for an archetype value
  const getDepartmentBreakdown = (archetypeName: string, archetypeValue: string) => {
    const matchingProfiles = filteredProfiles.filter((profile: any) =>
      profile.archetypes &&
      profile.archetypes[archetypeName] &&
      profile.archetypes[archetypeName].value === archetypeValue
    );

    const departmentCounts: { [key: string]: { count: number, color: string, profiles: any[], name: string } } = {};

    matchingProfiles.forEach((profile: any) => {
      const deptId = profileAssignments[profile.profileId] || 'unassigned';

      let deptName = 'Unassigned';
      let deptColor = '#9e9e9e';

      switch (deptId) {
        case 'tech':
          deptName = 'Technology';
          deptColor = '#1976d2';
          break;
        case 'operations':
          deptName = 'Operations';
          deptColor = '#388e3c';
          break;
        case 'sales':
          deptName = 'Sales & Marketing';
          deptColor = '#f57c00';
          break;
        case 'admin':
          deptName = 'Administration';
          deptColor = '#7b1fa2';
          break;
        default:
          deptName = 'Unassigned';
          deptColor = '#9e9e9e';
      }

      if (!departmentCounts[deptId]) {
        departmentCounts[deptId] = {
          count: 0,
          color: deptColor,
          name: deptName,
          profiles: []
        };
      }
      departmentCounts[deptId].count++;
      departmentCounts[deptId].profiles.push(profile);
    });

    return departmentCounts;
  };

  // Calculate key insights
  const totalProfilesWithArchetypes = filteredProfiles.length;
  
  // Calculate average archetype completeness
  const averageArchetypeCompleteness = useMemo(() => {
    if (filteredProfiles.length === 0) return 0;
    
    const completenessScores = filteredProfiles.map((profile: any) => {
      const totalPossible = Object.keys(archetypeDefinitions).length;
      const completed = Object.keys(profile.archetypes || {}).length;
      return (completed / totalPossible) * 100;
    });
    
    return Math.round(completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length);
  }, [filteredProfiles]);

  // Count profiles with rich data (>75% completeness)
  const wearableDataProfiles = filteredProfiles.filter((profile: any) => {
    const totalPossible = Object.keys(archetypeDefinitions).length;
    const completed = Object.keys(profile.archetypes || {}).length;
    return (completed / totalPossible) > 0.75;
  }).length;

  // Count profiles with missing data
  const missingDataProfiles = filteredProfiles.filter((profile: any) => {
    const completed = Object.keys(profile.archetypes || {}).length;
    return completed < 5; // Less than 5 archetypes is considered missing data
  }).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedArchetypeFilters({});
  };

  // Get recommendation bullets based on archetype
  const getArchetypeRecommendations = (archetypeName: string, distribution: any) => {
    const recommendations: string[] = [];
    
    switch (archetypeName) {
      case 'activity_level':
        if (distribution.sedentary > 0) recommendations.push('Target sedentary employees for activity programs');
        if (distribution.moderately_active > 0) recommendations.push('Schedule walking meetings for moderately active staff');
        if (distribution.highly_active > 0) recommendations.push('Offer advanced fitness challenges for highly active employees');
        break;
      case 'sleep_pattern':
        if (distribution.poor_sleeper > 0) recommendations.push('Provide sleep hygiene workshops for poor sleepers');
        if (distribution.excellent_sleeper > 0) recommendations.push('Share success stories from excellent sleepers');
        break;
      case 'mental_wellness':
        if (distribution.poor_mental_wellness > 0) recommendations.push('Prioritize mental health support for struggling employees');
        if (distribution.optimal_mental_wellness > 0) recommendations.push('Create peer support programs led by thriving employees');
        break;
      default:
        recommendations.push('Monitor trends and adjust wellness programs accordingly');
    }
    
    return recommendations;
  };

  if (loading) return <Box>Loading behavioral intelligence data...</Box>;
  if (error) return <Box>Error loading data: {error}</Box>;

  return (
    <Box>
      {/* Header with filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Biotech color="secondary" />
          Sahha Behavioral Intelligence System
          <Chip label={`${totalProfilesWithArchetypes} Profiles`} color="secondary" size="small" />
          {Object.keys(selectedArchetypeFilters).length > 0 && (
            <Chip
              label={`${Object.keys(selectedArchetypeFilters).length} Filter${Object.keys(selectedArchetypeFilters).length > 1 ? 's' : ''}`}
              color="primary"
              size="small"
              variant="outlined"
            />
          )}
        </Typography>

        {Object.keys(selectedArchetypeFilters).length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={clearAllFilters}
            sx={{ textTransform: 'none' }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Active Filters Display */}
      {Object.keys(selectedArchetypeFilters).length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
          <Typography variant="subtitle2" color="primary.main" mb={1}>
            🔍 Active Filters (Power BI Style):
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {Object.entries(selectedArchetypeFilters).map(([archetype, value]) => (
              <Chip
                key={`${archetype}-${value}`}
                label={`${archetype.replace(/_/g, ' ')}: ${String(value).replace(/_/g, ' ')}`}
                onDelete={() => handleArchetypeSelection(archetype, String(value))}
                color="primary"
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="textSecondary" mt={1} display="block">
            Showing {totalProfilesWithArchetypes} employees matching all selected criteria. Other charts update automatically.
          </Typography>
        </Paper>
      )}

      {/* Executive Intelligence Summary */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Tooltip
              title="Average percentage of behavioral archetypes we have complete data for across all employees. Based on 14 total archetypes covering activity, sleep, and wellness patterns."
              arrow
            >
              <Box sx={{ cursor: 'help' }}>
                <Typography variant="h4" color="primary.main">{averageArchetypeCompleteness}%</Typography>
                <Typography variant="caption" color="textSecondary">
                  Average Archetype Completeness
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={3}>
            <Tooltip
              title="Total number of behavioral archetypes tracked by Sahha's intelligence system. Includes ordinal types (activity level, sleep quality) and categorical types (primary exercise, sleep patterns)."
              arrow
            >
              <Box sx={{ cursor: 'help' }}>
                <Typography variant="h4" color="info.main">{Object.keys(archetypeDefinitions).length}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Behavioral Archetypes Tracked
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={3}>
            <Tooltip
              title="Employees with rich data collection enabling advanced behavioral insights. These profiles typically have >75% data completeness and connected devices for comprehensive health monitoring."
              arrow
            >
              <Box sx={{ cursor: 'help' }}>
                <Typography variant="h4" color="success.main">{wearableDataProfiles}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Profiles with Wearable Intelligence
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={3}>
            <Tooltip
              title="Employees with incomplete archetype data that may limit the accuracy of behavioral intelligence. Consider encouraging app engagement or wearable adoption."
              arrow
            >
              <Box sx={{ cursor: 'help' }}>
                <Typography variant="h4" color="warning.main">{missingDataProfiles}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Profiles with Missing Data
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Archetype Category Selector */}
      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="outlined" size="small">
          {[
            { key: 'activity', label: '🏃 Activity Intelligence', icon: <FitnessCenter /> },
            { key: 'sleep', label: '😴 Sleep Intelligence', icon: <AccessTime /> },
            { key: 'wellness', label: '🧠 Wellness Intelligence', icon: <Psychology /> }
          ].map(({ key, label, icon }) => (
            <Button
              key={key}
              variant={selectedArchetypeCategory === key ? 'contained' : 'outlined'}
              onClick={() => setSelectedArchetypeCategory(key)}
              startIcon={icon}
              sx={{ textTransform: 'none' }}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Detailed Archetype Analysis Grid */}
      <Grid container spacing={3}>
        {getArchetypeDataByCategory(selectedArchetypeCategory).map((archetype) => (
          <Grid item xs={12} md={6} key={archetype.archetypeName}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" color="primary.main">
                    {archetype.name}
                  </Typography>
                  <Box display="flex" gap={1}>
                    {archetype.dataType && (
                      <Chip
                        label={archetype.dataType.toUpperCase()}
                        size="small"
                        color={archetype.dataType === 'ordinal' ? 'primary' : 'secondary'}
                      />
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {archetype.definition.description}
                </Typography>

                {/* Distribution Visualization */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, fontSize: '1rem', mb: 2 }}>
                    Distribution ({archetype.totalCount} profiles) • Click bars to filter
                  </Typography>
                  {Object.entries(archetype.distribution).map(([value, count]: [string, any]) => {
                    const percentage = archetype.totalCount > 0 ? (count / archetype.totalCount * 100) : 0;
                    const departmentBreakdown = getDepartmentBreakdown(archetype.archetypeName, value);
                    const totalDepartments = Object.keys(departmentBreakdown).length;
                    const isSelected = selectedArchetypeFilters[archetype.archetypeName] === value;

                    return (
                      <Box key={value} sx={{ mb: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{
                              textTransform: 'capitalize',
                              fontWeight: isSelected ? 'bold' : 'normal',
                              color: isSelected ? 'primary.main' : 'inherit',
                              fontSize: '0.95rem'
                            }}
                          >
                            {value.replace(/_/g, ' ')}
                            {isSelected && (
                              <Chip
                                label="FILTERED"
                                size="small"
                                color="primary"
                                sx={{ ml: 1, fontSize: '0.75rem', height: 18 }}
                              />
                            )}
                            {totalDepartments > 1 && Object.keys(departmentBreakdown).some(d => d !== 'unassigned') && (
                              <Chip
                                label={`${totalDepartments} depts`}
                                size="small"
                                sx={{ ml: 1, fontSize: '0.8rem', height: 20 }}
                              />
                            )}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight={isSelected ? 'bold' : 'medium'} sx={{ fontSize: '0.95rem' }}>
                              {count} ({percentage.toFixed(0)}%)
                            </Typography>
                            <Tooltip title={`Click to see ${count} employees with ${value.replace(/_/g, ' ')}`}>
                              <IconButton
                                size="small"
                                sx={{ width: 20, height: 20 }}
                                onClick={() => handleArchetypeDrillDown(archetype.archetypeName, value)}
                              >
                                <People fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* Horizontal Stacked Bar with Departments - MUCH WIDER */}
                        <Box
                          sx={{
                            position: 'relative',
                            height: isSelected ? 24 : 20,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid' : 'none',
                            borderColor: isSelected ? 'primary.main' : 'transparent',
                            '&:hover': {
                              height: isSelected ? 26 : 22,
                              transition: 'all 0.2s ease',
                              transform: 'translateY(-1px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => handleArchetypeSelection(archetype.archetypeName, value)}
                        >
                          {Object.keys(departmentBreakdown).length > 0 && Object.keys(departmentBreakdown).some(d => d !== 'unassigned') ? (
                            Object.entries(departmentBreakdown).map(([dept, data], deptIndex) => {
                              const deptPercentage = archetype.totalCount > 0 ? (data.count / archetype.totalCount * 100) : 0;
                              const leftOffset = Object.entries(departmentBreakdown)
                                .slice(0, deptIndex)
                                .reduce((sum, [_, d]) => sum + (archetype.totalCount > 0 ? (d.count / archetype.totalCount * 100) : 0), 0);

                              return (
                                <Box
                                  key={dept}
                                  sx={{
                                    position: 'absolute',
                                    left: `${leftOffset}%`,
                                    width: `${deptPercentage}%`,
                                    height: '100%',
                                    bgcolor: data.color,
                                    opacity: isSelected ? 1 : 0.8,
                                    '&:hover': { opacity: 1 },
                                    transition: 'all 0.2s ease'
                                  }}
                                />
                              );
                            })
                          ) : (
                            <Box
                              sx={{
                                width: `${percentage}%`,
                                height: '100%',
                                bgcolor: isSelected ? 'primary.main' :
                                  archetype.dataType === 'ordinal' ? 'primary.main' : 'secondary.main',
                                opacity: isSelected ? 1 : 0.7,
                                transition: 'all 0.2s ease'
                              }}
                            />
                          )}
                        </Box>

                        {/* Department Legend - Only show if multiple departments */}
                        {totalDepartments > 1 && Object.keys(departmentBreakdown).some(d => d !== 'unassigned') && (
                          <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                            {Object.entries(departmentBreakdown).map(([dept, data]) => (
                              <Chip
                                key={dept}
                                label={`${data.name}: ${data.count}`}
                                size="small"
                                sx={{
                                  fontSize: '0.75rem',
                                  height: 18,
                                  bgcolor: data.color,
                                  color: 'white'
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {/* Recommendations */}
                {getArchetypeRecommendations(archetype.archetypeName, archetype.distribution).length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    {getArchetypeRecommendations(archetype.archetypeName, archetype.distribution).map((rec, index) => (
                      <Typography key={index} variant="caption" display="block" color="textSecondary" sx={{ mb: 0.5 }}>
                        • {rec}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Drill-down Dialog */}
      {drillDownData && (
        <Dialog open={drillDownData.isOpen} onClose={closeDrillDown} maxWidth="md" fullWidth>
          <DialogTitle>
            {drillDownData.profiles.length} Employees with {drillDownData.value.replace(/_/g, ' ')}
          </DialogTitle>
          <DialogContent>
            <List>
              {drillDownData.profiles.map((profile: any) => (
                <ListItem key={profile.profileId}>
                  <ListItemText
                    primary={`Profile: ${profile.profileId}`}
                    secondary={`Department: ${profileAssignments[profile.profileId] || 'Unassigned'}`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDrillDown}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}