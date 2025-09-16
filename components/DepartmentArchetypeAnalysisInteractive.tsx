'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
  Button
} from '@mui/material';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';
import { FilterList, Clear } from '@mui/icons-material';

const DEPARTMENT_COLORS = {
  'Engineering': '#1976d2',
  'Sales': '#388e3c', 
  'Marketing': '#f57c00',
  'HR': '#d32f2f',
  'Operations': '#7b1fa2',
  'Finance': '#0288d1'
};

export default function DepartmentArchetypeAnalysisInteractive() {
  const { data } = useWebhookData(30000);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  
  if (!data || !data.profiles || data.profiles.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No data available. Waiting for webhook data...</Typography>
      </Box>
    );
  }
  
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  
  // Process data to create archetype distributions
  // This matches the ArchetypeDistributionChart logic exactly
  
  // Activity archetypes - using score-based calculation since archetypes might not be present
  const activityArchetypes = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Highly Active'];
  const activityData = activityArchetypes.map(archetype => {
    const row: any = { archetype };
    
    departments.forEach(dept => {
      if (selectedDepartment && dept !== selectedDepartment) {
        row[dept] = 0;
      } else {
        const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
        let count = 0;
        
        deptProfiles.forEach((p: any) => {
          const score = p.scores?.activity?.value || 0;
          let profileArchetype = '';
          
          if (score < 0.25) profileArchetype = 'Sedentary';
          else if (score < 0.5) profileArchetype = 'Lightly Active';
          else if (score < 0.75) profileArchetype = 'Moderately Active';
          else profileArchetype = 'Highly Active';
          
          if (profileArchetype === archetype) count++;
        });
        
        row[dept] = count;
      }
    });
    
    return row;
  });
  
  // Sleep archetypes
  const sleepArchetypes = ['Poor Sleeper', 'Fair Sleeper', 'Good Sleeper', 'Excellent Sleeper'];
  const sleepData = sleepArchetypes.map(archetype => {
    const row: any = { archetype };
    
    departments.forEach(dept => {
      if (selectedDepartment && dept !== selectedDepartment) {
        row[dept] = 0;
      } else {
        const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
        let count = 0;
        
        deptProfiles.forEach((p: any) => {
          const score = p.scores?.sleep?.value || 0;
          let profileArchetype = '';
          
          if (score < 0.45) profileArchetype = 'Poor Sleeper';
          else if (score < 0.65) profileArchetype = 'Fair Sleeper';
          else if (score < 0.85) profileArchetype = 'Good Sleeper';
          else profileArchetype = 'Excellent Sleeper';
          
          if (profileArchetype === archetype) count++;
        });
        
        row[dept] = count;
      }
    });
    
    return row;
  });
  
  // Mental wellness archetypes
  const mentalArchetypes = ['Stressed', 'Balanced', 'Thriving', 'Optimal'];
  const mentalData = mentalArchetypes.map(archetype => {
    const row: any = { archetype };
    
    departments.forEach(dept => {
      if (selectedDepartment && dept !== selectedDepartment) {
        row[dept] = 0;
      } else {
        const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
        let count = 0;
        
        deptProfiles.forEach((p: any) => {
          const score = p.scores?.mental_wellbeing?.value || 0;
          let profileArchetype = '';
          
          if (score < 0.45) profileArchetype = 'Stressed';
          else if (score < 0.65) profileArchetype = 'Balanced';
          else if (score < 0.85) profileArchetype = 'Thriving';
          else profileArchetype = 'Optimal';
          
          if (profileArchetype === archetype) count++;
        });
        
        row[dept] = count;
      }
    });
    
    return row;
  });
  
  // Exercise frequency archetypes
  const exerciseArchetypes = ['None', 'Occasional', 'Regular', 'Frequent'];
  const exerciseData = exerciseArchetypes.map(archetype => {
    const row: any = { archetype };
    
    departments.forEach(dept => {
      if (selectedDepartment && dept !== selectedDepartment) {
        row[dept] = 0;
      } else {
        const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
        let count = 0;
        
        deptProfiles.forEach((p: any) => {
          // Use activity score as proxy for exercise frequency
          const score = p.scores?.activity?.value || 0;
          let profileArchetype = '';
          
          if (score < 0.25) profileArchetype = 'None';
          else if (score < 0.5) profileArchetype = 'Occasional';
          else if (score < 0.75) profileArchetype = 'Regular';
          else profileArchetype = 'Frequent';
          
          if (profileArchetype === archetype) count++;
        });
        
        row[dept] = count;
      }
    });
    
    return row;
  });
  
  const handleBarClick = (data: any) => {
    // Extract department name from the click data
    if (data && data.activeTooltipIndex !== undefined && data.activePayload) {
      // Find which department was clicked
      const clickedData = data.activePayload[0];
      if (clickedData) {
        const deptName = clickedData.dataKey;
        if (departments.includes(deptName)) {
          if (selectedDepartment === deptName) {
            setSelectedDepartment(null);
          } else {
            setSelectedDepartment(deptName);
          }
        }
      }
    }
  };
  
  const clearFilters = () => {
    setSelectedDepartment(null);
  };
  
  // Calculate totals for summary
  const totalProfiles = data.profiles.length;
  const departmentCounts = departments.map(dept => ({
    dept,
    count: data.profiles.filter((p: any) => p.department === dept).length
  }));
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Filter Controls */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5">
            Department Archetype Analysis
          </Typography>
          {selectedDepartment && (
            <>
              <Chip 
                label={`Filtered: ${selectedDepartment}`}
                onDelete={clearFilters}
                color="primary"
                icon={<FilterList />}
              />
              <Button
                startIcon={<Clear />}
                onClick={clearFilters}
                size="small"
              >
                Clear Filter
              </Button>
            </>
          )}
        </Stack>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Total Profiles: {totalProfiles} | Click on any department bar segment to filter all charts
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Activity Archetypes */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Level Distribution
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                Y-axis: Activity levels | X-axis: Population count | Bars: Department segments
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={activityData} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, bottom: 40, left: 100 }}
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    label={{ value: 'Population', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="archetype" 
                    width={90} 
                  />
                  <Tooltip />
                  <Legend />
                  
                  {departments.map(dept => (
                    <Bar 
                      key={dept}
                      dataKey={dept} 
                      stackId="a" 
                      fill={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}
                      opacity={selectedDepartment && selectedDepartment !== dept ? 0.3 : 1}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Sleep Archetypes */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sleep Pattern Distribution
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                Y-axis: Sleep patterns | X-axis: Population count | Bars: Department segments
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={sleepData} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, bottom: 40, left: 100 }}
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    label={{ value: 'Population', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="archetype" 
                    width={90} 
                  />
                  <Tooltip />
                  <Legend />
                  
                  {departments.map(dept => (
                    <Bar 
                      key={dept}
                      dataKey={dept} 
                      stackId="a" 
                      fill={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}
                      opacity={selectedDepartment && selectedDepartment !== dept ? 0.3 : 1}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Mental Wellness Archetypes */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mental Wellness Distribution
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                Y-axis: Mental wellness levels | X-axis: Population count | Bars: Department segments
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={mentalData} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, bottom: 40, left: 100 }}
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    label={{ value: 'Population', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="archetype" 
                    width={90} 
                  />
                  <Tooltip />
                  <Legend />
                  
                  {departments.map(dept => (
                    <Bar 
                      key={dept}
                      dataKey={dept} 
                      stackId="a" 
                      fill={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}
                      opacity={selectedDepartment && selectedDepartment !== dept ? 0.3 : 1}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Exercise Frequency Archetypes */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exercise Frequency Distribution
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                Y-axis: Exercise frequency | X-axis: Population count | Bars: Department segments
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={exerciseData} 
                  layout="horizontal"
                  margin={{ top: 20, right: 30, bottom: 40, left: 100 }}
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    label={{ value: 'Population', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="archetype" 
                    width={90} 
                  />
                  <Tooltip />
                  <Legend />
                  
                  {departments.map(dept => (
                    <Bar 
                      key={dept}
                      dataKey={dept} 
                      stackId="a" 
                      fill={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}
                      opacity={selectedDepartment && selectedDepartment !== dept ? 0.3 : 1}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Summary Statistics */}
      {selectedDepartment && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedDepartment} Department Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="body2" color="textSecondary">Total Employees</Typography>
                <Typography variant="h4">
                  {data.profiles.filter((p: any) => p.department === selectedDepartment).length}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="textSecondary">Highly Active</Typography>
                <Typography variant="h4">
                  {activityData[3][selectedDepartment]}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="textSecondary">Excellent Sleepers</Typography>
                <Typography variant="h4">
                  {sleepData[3][selectedDepartment]}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="textSecondary">Optimal Mental Health</Typography>
                <Typography variant="h4">
                  {mentalData[3][selectedDepartment]}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Department Summary */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Department Population
          </Typography>
          <Grid container spacing={2}>
            {departmentCounts.map(({ dept, count }) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={dept}>
                <Box 
                  sx={{ 
                    p: 1, 
                    textAlign: 'center',
                    bgcolor: selectedDepartment === dept ? 'primary.light' : 'grey.100',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedDepartment(dept === selectedDepartment ? null : dept)}
                >
                  <Typography variant="subtitle2" color={DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]}>
                    {dept}
                  </Typography>
                  <Typography variant="h6">
                    {count}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}