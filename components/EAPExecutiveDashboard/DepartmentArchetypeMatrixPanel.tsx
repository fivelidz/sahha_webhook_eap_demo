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
  Tooltip
} from '@mui/material';
import { Assessment, Insights } from '@mui/icons-material';

// Department color scheme
const DEPARTMENT_COLORS: { [key: string]: string } = {
  tech: '#1976d2',
  operations: '#388e3c',
  sales: '#f57c00',
  admin: '#7b1fa2',
  unassigned: '#9e9e9e'
};

export default function DepartmentArchetypeMatrixPanel({ 
  profileArchetypes, 
  profileAssignments, 
  archetypeDefinitions 
}: any) {
  const [selectedMatrix, setSelectedMatrix] = useState<string>('heatmap');

  // Department definitions
  const departments = [
    { id: 'tech', name: 'Technology', color: '#1976d2' },
    { id: 'operations', name: 'Operations', color: '#388e3c' },
    { id: 'sales', name: 'Sales & Marketing', color: '#f57c00' },
    { id: 'admin', name: 'Administration', color: '#7b1fa2' },
    { id: 'unassigned', name: 'Unassigned', color: '#9e9e9e' }
  ];

  // Build comprehensive department-archetype matrix
  const matrix = useMemo(() => {
    const mat: { [deptId: string]: { [archetypeName: string]: { [value: string]: number } } } = {};
    
    // Initialize matrix structure for known departments
    departments.forEach(dept => {
      mat[dept.id] = {};
      Object.keys(archetypeDefinitions).forEach(archetypeName => {
        mat[dept.id][archetypeName] = {};
      });
    });
    
    // Populate matrix with actual data
    profileArchetypes.forEach((profile: any) => {
      const deptId = profileAssignments[profile.profileId] || 'unassigned';
      
      // Ensure department exists in matrix (handle dynamic departments)
      if (!mat[deptId]) {
        mat[deptId] = {};
        Object.keys(archetypeDefinitions).forEach(archetypeName => {
          mat[deptId][archetypeName] = {};
        });
      }
      
      if (profile.archetypes && typeof profile.archetypes === 'object') {
        Object.entries(profile.archetypes).forEach(([archetypeName, archetypeData]: any) => {
          if (archetypeData && archetypeData.value && archetypeDefinitions[archetypeName]) {
            // Ensure archetype exists for this department
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
    
    // Count profiles in department
    profileArchetypes.forEach((profile: any) => {
      if ((profileAssignments[profile.profileId] || 'unassigned') === deptId) {
        totalProfiles++;
      }
    });
    
    // Check if department exists in matrix
    if (!matrix[deptId]) {
      return { totalProfiles, dominantArchetypes };
    }
    
    // Find dominant archetype value for each archetype type
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

  // Calculate archetype intensity (how concentrated an archetype value is in a department)
  const getArchetypeIntensity = (deptId: string, archetypeName: string, value: string): number => {
    const deptCount = matrix[deptId]?.[archetypeName]?.[value] || 0;
    const totalCount = departments.reduce((sum, dept) => 
      sum + (matrix[dept.id]?.[archetypeName]?.[value] || 0), 0);
    return totalCount > 0 ? (deptCount / totalCount) * 100 : 0;
  };

  return (
    <Card>
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
          </ButtonGroup>
        </Box>

        {selectedMatrix === 'heatmap' ? (
          // Heat Map Matrix View
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>
                    Department
                  </TableCell>
                  {Object.keys(archetypeDefinitions).map(archetypeName => (
                    <TableCell 
                      key={archetypeName} 
                      align="center"
                      sx={{ 
                        fontWeight: 'bold',
                        bgcolor: 'background.paper',
                        fontSize: '0.75rem',
                        textTransform: 'capitalize'
                      }}
                    >
                      {archetypeName.replace(/_/g, ' ')}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map(dept => {
                  const stats = getDepartmentStats(dept.id);
                  
                  return (
                    <TableRow key={dept.id} hover>
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
                          <Typography variant="body2">{dept.name}</Typography>
                          <Chip 
                            label={stats.totalProfiles} 
                            size="small" 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </TableCell>
                      {Object.entries(archetypeDefinitions).map(([archetypeName, def]: any) => {
                        const dominant = stats.dominantArchetypes[archetypeName];
                        const distribution = matrix[dept.id][archetypeName];
                        const totalInDept = Object.values(distribution).reduce((sum: any, count: any) => sum + count, 0) as number;
                        
                        // Calculate color intensity based on concentration
                        let intensity = 0;
                        if (dominant && totalInDept > 0) {
                          intensity = ((distribution[dominant] || 0) / totalInDept) * 100;
                        }
                        
                        return (
                          <TableCell key={archetypeName} align="center">
                            {dominant ? (
                              <Tooltip
                                title={
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      Dominant: {dominant.replace(/_/g, ' ')}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                      {distribution[dominant]} of {totalInDept} ({Math.round(intensity)}%)
                                    </Typography>
                                    {Object.entries(distribution).map(([value, count]: any) => (
                                      <Typography key={value} variant="caption" display="block">
                                        {value.replace(/_/g, ' ')}: {count}
                                      </Typography>
                                    ))}
                                  </Box>
                                }
                                arrow
                              >
                                <Box
                                  sx={{
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    bgcolor: `rgba(59, 130, 246, ${intensity / 100})`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: 1
                                    }
                                  }}
                                >
                                  <Typography variant="caption" sx={{ 
                                    fontSize: '0.65rem',
                                    fontWeight: intensity > 60 ? 'bold' : 'normal'
                                  }}>
                                    {dominant.split('_')[0]}
                                  </Typography>
                                  <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem' }}>
                                    {Math.round(intensity)}%
                                  </Typography>
                                </Box>
                              </Tooltip>
                            ) : (
                              <Box sx={{ color: 'text.disabled' }}>-</Box>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Department Summary View
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
                      <Chip 
                        label={`${stats.totalProfiles} employees`}
                        size="small"
                        sx={{ bgcolor: dept.color, color: 'white' }}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                      Dominant Behavioral Patterns:
                    </Typography>
                    
                    {Object.entries(stats.dominantArchetypes).map(([archetype, value]) => (
                      <Box key={archetype} mb={1}>
                        <Typography variant="caption" color="textSecondary">
                          {archetype.replace(/_/g, ' ')}:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          textTransform: 'capitalize',
                          color: value.includes('poor') || value.includes('sedentary') ? 'error.main' :
                                 value.includes('excellent') || value.includes('highly') ? 'success.main' :
                                 'text.primary'
                        }}>
                          {value.replace(/_/g, ' ')}
                        </Typography>
                      </Box>
                    ))}
                    
                    {/* Department Health Score */}
                    <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                      <Typography variant="caption" color="textSecondary">
                        Department Health Score
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" color="primary">
                          {(() => {
                            let score = 0;
                            let count = 0;
                            Object.entries(stats.dominantArchetypes).forEach(([archetype, value]) => {
                              const def = archetypeDefinitions[archetype];
                              if (def && def.values) {
                                const index = def.values.indexOf(value);
                                if (index >= 0) {
                                  score += ((index + 1) / def.values.length) * 100;
                                  count++;
                                }
                              }
                            });
                            return count > 0 ? Math.round(score / count) : 0;
                          })()}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          /100
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Matrix Insights */}
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Key Insights from Matrix Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="textSecondary">
                Most Active Department:
              </Typography>
              <Typography variant="body2">
                {(() => {
                  let maxScore = 0;
                  let bestDept = '';
                  departments.forEach(dept => {
                    const stats = getDepartmentStats(dept.id);
                    const activityDominant = stats.dominantArchetypes.activity_level;
                    if (activityDominant === 'highly_active' || activityDominant === 'moderately_active') {
                      if (stats.totalProfiles > maxScore) {
                        maxScore = stats.totalProfiles;
                        bestDept = dept.name;
                      }
                    }
                  });
                  return bestDept || 'None identified';
                })()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="textSecondary">
                Best Sleep Quality:
              </Typography>
              <Typography variant="body2">
                {(() => {
                  let bestDept = '';
                  departments.forEach(dept => {
                    const stats = getDepartmentStats(dept.id);
                    if (stats.dominantArchetypes.sleep_pattern === 'excellent_sleeper' || 
                        stats.dominantArchetypes.sleep_pattern === 'good_sleeper') {
                      bestDept = dept.name;
                    }
                  });
                  return bestDept || 'Needs improvement';
                })()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="textSecondary">
                Departments Needing Support:
              </Typography>
              <Typography variant="body2">
                {departments.filter(dept => {
                  const stats = getDepartmentStats(dept.id);
                  return stats.dominantArchetypes.mental_wellness === 'poor_mental_wellness' ||
                         stats.dominantArchetypes.activity_level === 'sedentary';
                }).map(d => d.name).join(', ') || 'All healthy'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </CardContent>
    </Card>
  );
}