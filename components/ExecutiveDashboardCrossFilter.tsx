'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  TrendingUp,
  People,
  Psychology,
  FilterList,
  Refresh,
  Download,
  Assessment,
  FitnessCenter,
  Hotel,
  Mood,
  Speed,
  Favorite,
  Clear,
  FilterAlt
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';
import { useCrossFilter, applyFilters } from '../contexts/CrossFilterContext';

interface ExecutiveDashboardProps {
  orgId?: string;
}

const COLORS = {
  excellent: '#00AA44',
  good: '#7CB342',
  fair: '#FFB300',
  poor: '#FF7043',
  primary: '#3b82f6',
  secondary: '#8b5cf6'
};

const SCORE_RANGES = {
  excellent: { min: 0.8, max: 1, label: 'Excellent', color: '#00AA44' },
  good: { min: 0.6, max: 0.8, label: 'Good', color: '#7CB342' },
  fair: { min: 0.4, max: 0.6, label: 'Fair', color: '#FFB300' },
  poor: { min: 0, max: 0.4, label: 'Poor', color: '#FF7043' }
};

export default function ExecutiveDashboardCrossFilter({ orgId = 'default' }: ExecutiveDashboardProps) {
  const [demoMode, setDemoMode] = useState(false);
  const { data, loading, error, refetch } = useWebhookData(30000, demoMode);
  const { 
    filters, 
    toggleDepartment, 
    toggleScoreRange, 
    toggleArchetype,
    toggleMetric,
    clearFilters 
  } = useCrossFilter();

  // Process and filter data based on cross-filters
  const processedData = useMemo(() => {
    if (!data || !data.profiles || data.profiles.length === 0) {
      return {
        filteredProfiles: [],
        departmentStats: [],
        scoreDistributions: [],
        archetypeDistributions: [],
        trends: []
      };
    }

    // Apply cross-filters to profiles
    let filteredProfiles = [...data.profiles];

    // Filter by selected departments
    if (filters.departments.length > 0) {
      filteredProfiles = filteredProfiles.filter(p => 
        filters.departments.includes(p.department || 'Unknown')
      );
    }

    // Filter by score ranges
    if (filters.scoreRanges.length > 0) {
      filteredProfiles = filteredProfiles.filter(p => {
        const wellbeingScore = p.scores?.wellbeing?.value || 0;
        return filters.scoreRanges.some(range => {
          const rangeConfig = SCORE_RANGES[range.toLowerCase() as keyof typeof SCORE_RANGES];
          return wellbeingScore >= rangeConfig.min && wellbeingScore < rangeConfig.max;
        });
      });
    }

    // Filter by archetypes
    if (filters.archetypes.length > 0) {
      filteredProfiles = filteredProfiles.filter(p => {
        if (!p.archetypes) return false;
        return Object.values(p.archetypes).some((arch: any) => 
          filters.archetypes.includes(arch.value)
        );
      });
    }

    // Calculate department statistics
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
    const departmentStats = departments.map(dept => {
      const deptProfiles = filteredProfiles.filter(p => p.department === dept);
      const count = deptProfiles.length;
      
      const avgScores = {
        wellbeing: count > 0 ? deptProfiles.reduce((sum, p) => sum + (p.scores?.wellbeing?.value || 0), 0) / count : 0,
        sleep: count > 0 ? deptProfiles.reduce((sum, p) => sum + (p.scores?.sleep?.value || 0), 0) / count : 0,
        activity: count > 0 ? deptProfiles.reduce((sum, p) => sum + (p.scores?.activity?.value || 0), 0) / count : 0,
        mental: count > 0 ? deptProfiles.reduce((sum, p) => sum + (p.scores?.mental_wellbeing?.value || 0), 0) / count : 0,
        readiness: count > 0 ? deptProfiles.reduce((sum, p) => sum + (p.scores?.readiness?.value || 0), 0) / count : 0
      };

      return {
        department: dept,
        count,
        wellbeing: Math.round(avgScores.wellbeing * 100),
        sleep: Math.round(avgScores.sleep * 100),
        activity: Math.round(avgScores.activity * 100),
        mental: Math.round(avgScores.mental * 100),
        readiness: Math.round(avgScores.readiness * 100),
        isFiltered: filters.departments.includes(dept)
      };
    });

    // Calculate score distributions
    const scoreDistributions = Object.entries(SCORE_RANGES).map(([key, range]) => {
      const count = filteredProfiles.filter(p => {
        const score = p.scores?.wellbeing?.value || 0;
        return score >= range.min && score < range.max;
      }).length;

      return {
        name: range.label,
        value: count,
        percentage: filteredProfiles.length > 0 ? Math.round((count / filteredProfiles.length) * 100) : 0,
        color: range.color,
        isFiltered: filters.scoreRanges.includes(range.label)
      };
    });

    // Calculate archetype distributions
    const archetypeTypes = {
      activity: ['sedentary', 'lightly_active', 'moderately_active', 'highly_active'],
      sleep: ['poor_sleeper', 'fair_sleeper', 'good_sleeper', 'excellent_sleeper']
    };

    const archetypeDistributions = Object.entries(archetypeTypes).map(([category, types]) => {
      return types.map(type => {
        const count = filteredProfiles.filter(p => {
          if (!p.archetypes) return false;
          return Object.values(p.archetypes).some((arch: any) => arch.value === type);
        }).length;

        return {
          category,
          type,
          count,
          percentage: filteredProfiles.length > 0 ? Math.round((count / filteredProfiles.length) * 100) : 0,
          isFiltered: filters.archetypes.includes(type)
        };
      });
    }).flat();

    return {
      filteredProfiles,
      departmentStats,
      scoreDistributions,
      archetypeDistributions,
      trends: []
    };
  }, [data, filters]);

  // Handle bar click for department filtering
  const handleDepartmentClick = useCallback((data: any) => {
    if (data && data.department) {
      toggleDepartment(data.department);
    }
  }, [toggleDepartment]);

  // Handle pie slice click for score range filtering
  const handleScoreRangeClick = useCallback((data: any) => {
    if (data && data.name) {
      toggleScoreRange(data.name);
    }
  }, [toggleScoreRange]);

  // Handle archetype bar click
  const handleArchetypeClick = useCallback((data: any) => {
    if (data && data.type) {
      toggleArchetype(data.type);
    }
  }, [toggleArchetype]);

  // Custom tooltip to show click instruction
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      return (
        <Paper sx={{ p: 1 }}>
          <Typography variant="body2">{label || payload[0].name}</Typography>
          <Typography variant="body2" fontWeight="bold">
            Value: {payload[0].value}
          </Typography>
          <Typography variant="caption" color="primary">
            Click to filter
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading executive dashboard...</Typography>
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

  const hasActiveFilters = filters.departments.length > 0 || 
                           filters.scoreRanges.length > 0 || 
                           filters.archetypes.length > 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Filter Status */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment color="primary" />
              Executive Dashboard - Cross-Filter Enabled
              <Badge 
                badgeContent={processedData.filteredProfiles.length} 
                color="primary"
                max={999}
              >
                <Chip 
                  label="Profiles" 
                  size="small" 
                />
              </Badge>
            </Typography>
            
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <FilterAlt fontSize="small" color="primary" />
                  {filters.departments.map(dept => (
                    <Chip
                      key={dept}
                      label={dept}
                      size="small"
                      onDelete={() => toggleDepartment(dept)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {filters.scoreRanges.map(range => (
                    <Chip
                      key={range}
                      label={range}
                      size="small"
                      onDelete={() => toggleScoreRange(range)}
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                  {filters.archetypes.map(arch => (
                    <Chip
                      key={arch}
                      label={arch.replace('_', ' ')}
                      size="small"
                      onDelete={() => toggleArchetype(arch)}
                      color="success"
                      variant="outlined"
                    />
                  ))}
                  <Button
                    size="small"
                    startIcon={<Clear />}
                    onClick={clearFilters}
                    variant="text"
                  >
                    Clear All
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  color="primary"
                />
              }
              label={demoMode ? "Demo Mode" : "Live Data"}
            />
            <Button startIcon={<Refresh />} onClick={refetch} variant="outlined">
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Department Comparison - Clickable */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Health Scores
                <Typography variant="caption" display="block" color="textSecondary">
                  Click bars to filter by department
                </Typography>
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={processedData.departmentStats}
                  onClick={handleDepartmentClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="wellbeing" 
                    fill="#3b82f6"
                  >
                    {processedData.departmentStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isFiltered ? '#1976d2' : '#3b82f6'}
                        fillOpacity={entry.isFiltered ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Score Distribution - Clickable */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Wellbeing Score Distribution
                <Typography variant="caption" display="block" color="textSecondary">
                  Click segments to filter by score range
                </Typography>
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processedData.scoreDistributions}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    onClick={handleScoreRangeClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {processedData.scoreDistributions.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={entry.isFiltered ? '#000' : 'none'}
                        strokeWidth={entry.isFiltered ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend */}
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                {processedData.scoreDistributions.map(item => (
                  <Stack 
                    key={item.name} 
                    direction="row" 
                    alignItems="center" 
                    spacing={0.5}
                    sx={{ 
                      cursor: 'pointer',
                      opacity: item.isFiltered ? 1 : 0.7,
                      '&:hover': { opacity: 1 }
                    }}
                    onClick={() => toggleScoreRange(item.name)}
                  >
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: item.color,
                        border: item.isFiltered ? '2px solid #000' : 'none'
                      }} 
                    />
                    <Typography variant="caption">
                      {item.name}: {item.percentage}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Archetype Distribution - Clickable */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Level Archetypes
                <Typography variant="caption" display="block" color="textSecondary">
                  Click bars to filter by archetype
                </Typography>
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={processedData.archetypeDistributions.filter(a => a.category === 'activity')}
                  onClick={handleArchetypeClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="count">
                    {processedData.archetypeDistributions
                      .filter(a => a.category === 'activity')
                      .map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isFiltered ? '#1976d2' : '#3b82f6'}
                          fillOpacity={entry.isFiltered ? 1 : 0.7}
                        />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Filtered Data Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filtered Data Summary
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Total Count</TableCell>
                      <TableCell align="right">Filtered Count</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Profiles</TableCell>
                      <TableCell align="right">{data?.profiles?.length || 0}</TableCell>
                      <TableCell align="right">{processedData.filteredProfiles.length}</TableCell>
                      <TableCell align="right">
                        {data?.profiles && data.profiles.length > 0 
                          ? Math.round((processedData.filteredProfiles.length / data.profiles.length) * 100) 
                          : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Wellbeing</TableCell>
                      <TableCell align="right">
                        {data?.profiles && data.profiles.length > 0 
                          ? Math.round(data.profiles.reduce((sum: number, p: any) => 
                              sum + (p.scores?.wellbeing?.value || 0), 0) / data.profiles.length * 100)
                          : 0}
                      </TableCell>
                      <TableCell align="right">
                        {processedData.filteredProfiles.length > 0 
                          ? Math.round(processedData.filteredProfiles.reduce((sum, p) => 
                              sum + (p.scores?.wellbeing?.value || 0), 0) / processedData.filteredProfiles.length * 100)
                          : 0}
                      </TableCell>
                      <TableCell align="right">
                        {processedData.filteredProfiles.length > 0 && data?.profiles
                          ? `${Math.round(processedData.filteredProfiles.reduce((sum, p) => 
                              sum + (p.scores?.wellbeing?.value || 0), 0) / processedData.filteredProfiles.length * 100) - 
                              Math.round(data.profiles.reduce((sum: number, p: any) => 
                              sum + (p.scores?.wellbeing?.value || 0), 0) / (data.profiles.length || 1) * 100)}% diff`
                          : '0% diff'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}