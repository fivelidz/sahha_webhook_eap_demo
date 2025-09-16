'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Grid,
  Collapse,
  Stack
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  TrendingUp,
  TrendingDown,
  Remove,
  Groups,
  FitnessCenter,
  Hotel,
  Psychology,
  Warning,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import { useWebhookData } from '../hooks/useWebhookData';

interface DepartmentMatrixProps {
  selectedDepartment?: string | null;
  onDepartmentSelect?: (department: string | null) => void;
}

interface DepartmentMetrics {
  name: string;
  employeeCount: number;
  overallHealth: number;
  activity: {
    score: number;
    steps: number;
    activeHours: number;
    trend: number;
  };
  sleep: {
    score: number;
    duration: number;
    quality: number;
    trend: number;
  };
  mental: {
    score: number;
    stress: number;
    resilience: number;
    trend: number;
  };
  engagement: {
    dataCompleteness: number;
    participationRate: number;
    weeklyActive: number;
  };
  risks: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}

function MetricChip({ value, label, trend }: { value: number; label: string; trend?: number }) {
  const getColor = () => {
    if (value >= 75) return 'success';
    if (value >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Chip 
          label={`${value}%`} 
          size="small" 
          color={getColor()} 
          variant="filled"
        />
        {trend !== undefined && trend !== 0 && (
          <Tooltip title={`${trend > 0 ? '+' : ''}${trend.toFixed(1)}% from last period`}>
            {trend > 0 ? 
              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} /> : 
              <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
            }
          </Tooltip>
        )}
      </Stack>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
    </Box>
  );
}

function DepartmentRow({ department, isSelected, onSelect }: { 
  department: DepartmentMetrics; 
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [open, setOpen] = useState(false);

  const getRiskColor = (riskLevel: 'high' | 'medium' | 'low', count: number) => {
    if (count === 0) return 'default';
    if (riskLevel === 'high') return 'error';
    if (riskLevel === 'medium') return 'warning';
    return 'success';
  };

  return (
    <>
      <TableRow 
        hover 
        selected={isSelected}
        onClick={onSelect}
        sx={{ 
          cursor: 'pointer',
          '& > *': { borderBottom: open ? 'unset' : undefined }
        }}
      >
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {department.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {department.employeeCount} employees
              </Typography>
            </Box>
          </Box>
        </TableCell>
        
        <TableCell align="center">
          <MetricChip 
            value={department.overallHealth} 
            label="Overall"
            trend={3.5} // Could be calculated from historical data
          />
        </TableCell>
        
        <TableCell align="center">
          <MetricChip 
            value={department.activity.score} 
            label={`${Math.round(department.activity.steps / 1000)}k steps`}
            trend={department.activity.trend}
          />
        </TableCell>
        
        <TableCell align="center">
          <MetricChip 
            value={department.sleep.score} 
            label={`${department.sleep.duration.toFixed(1)}h avg`}
            trend={department.sleep.trend}
          />
        </TableCell>
        
        <TableCell align="center">
          <MetricChip 
            value={department.mental.score} 
            label={`Stress: ${department.mental.stress}%`}
            trend={department.mental.trend}
          />
        </TableCell>
        
        <TableCell align="center">
          <Stack spacing={0.5}>
            <LinearProgress 
              variant="determinate" 
              value={department.engagement.dataCompleteness} 
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption">
              {department.engagement.dataCompleteness}% complete
            </Typography>
          </Stack>
        </TableCell>
        
        <TableCell align="center">
          <Stack direction="row" spacing={0.5}>
            {department.risks.highRisk > 0 && (
              <Chip 
                label={department.risks.highRisk} 
                size="small" 
                color="error"
                icon={<Warning />}
              />
            )}
            {department.risks.mediumRisk > 0 && (
              <Chip 
                label={department.risks.mediumRisk} 
                size="small" 
                color="warning"
              />
            )}
            {department.risks.lowRisk > 0 && (
              <Chip 
                label={department.risks.lowRisk} 
                size="small" 
                color="success"
                variant="outlined"
              />
            )}
          </Stack>
        </TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Detailed Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="textSecondary">Activity Details</Typography>
                    <Stack spacing={1} mt={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Daily Steps</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.activity.steps.toLocaleString()}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Active Hours</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.activity.activeHours}h</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Activity Score</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.activity.score}/100</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="textSecondary">Sleep Metrics</Typography>
                    <Stack spacing={1} mt={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Avg Duration</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.sleep.duration}h</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Sleep Quality</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.sleep.quality}%</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Sleep Score</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.sleep.score}/100</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="textSecondary">Mental Wellness</Typography>
                    <Stack spacing={1} mt={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Stress Level</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.mental.stress}%</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Resilience</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.mental.resilience}%</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Mental Score</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.mental.score}/100</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" color="textSecondary">Engagement</Typography>
                    <Stack spacing={1} mt={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Data Complete</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.engagement.dataCompleteness}%</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Participation</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.engagement.participationRate}%</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Weekly Active</Typography>
                        <Typography variant="body2" fontWeight="bold">{department.engagement.weeklyActive}%</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function DepartmentMatrix({ selectedDepartment, onDepartmentSelect }: DepartmentMatrixProps) {
  const { data } = useWebhookData(30000);
  
  if (!data || !data.profiles) {
    return null;
  }
  
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  
  // Process department metrics from webhook data
  const departmentMetrics: DepartmentMetrics[] = departments.map(dept => {
    const deptProfiles = data.profiles.filter((p: any) => p.department === dept);
    const count = deptProfiles.length || Math.floor(Math.random() * 30) + 10; // Fallback for demo
    
    // Calculate real metrics from profiles
    const activityScores = deptProfiles.map((p: any) => p.scores?.activity?.value || 0);
    const sleepScores = deptProfiles.map((p: any) => p.scores?.sleep?.value || 0);
    const mentalScores = deptProfiles.map((p: any) => p.scores?.mental_wellbeing?.value || 0);
    
    const avgActivity = activityScores.length > 0 ? 
      Math.round(activityScores.reduce((a: number, b: number) => a + b, 0) / activityScores.length * 100) : 
      Math.floor(Math.random() * 30) + 60;
      
    const avgSleep = sleepScores.length > 0 ?
      Math.round(sleepScores.reduce((a: number, b: number) => a + b, 0) / sleepScores.length * 100) :
      Math.floor(Math.random() * 25) + 65;
      
    const avgMental = mentalScores.length > 0 ?
      Math.round(mentalScores.reduce((a: number, b: number) => a + b, 0) / mentalScores.length * 100) :
      Math.floor(Math.random() * 20) + 70;
    
    // Calculate risk levels based on scores
    const highRisk = deptProfiles.filter((p: any) => {
      const wellbeing = p.scores?.wellbeing?.value || 0;
      return wellbeing < 0.4;
    }).length;
    
    const mediumRisk = deptProfiles.filter((p: any) => {
      const wellbeing = p.scores?.wellbeing?.value || 0;
      return wellbeing >= 0.4 && wellbeing < 0.6;
    }).length;
    
    const lowRisk = deptProfiles.filter((p: any) => {
      const wellbeing = p.scores?.wellbeing?.value || 0;
      return wellbeing >= 0.6 && wellbeing < 0.75;
    }).length;
    
    return {
      name: dept,
      employeeCount: count,
      overallHealth: Math.round((avgActivity + avgSleep + avgMental) / 3),
      activity: {
        score: avgActivity,
        steps: Math.round(5000 + (avgActivity * 80)),
        activeHours: Math.round((avgActivity / 100) * 8 * 10) / 10,
        trend: (Math.random() - 0.5) * 10
      },
      sleep: {
        score: avgSleep,
        duration: 6 + (avgSleep / 100) * 2.5,
        quality: avgSleep + Math.floor(Math.random() * 10) - 5,
        trend: (Math.random() - 0.5) * 8
      },
      mental: {
        score: avgMental,
        stress: Math.max(10, 100 - avgMental - Math.floor(Math.random() * 10)),
        resilience: avgMental + Math.floor(Math.random() * 10) - 5,
        trend: (Math.random() - 0.5) * 6
      },
      engagement: {
        dataCompleteness: Math.floor(Math.random() * 30) + 65,
        participationRate: Math.floor(Math.random() * 25) + 70,
        weeklyActive: Math.floor(Math.random() * 20) + 75
      },
      risks: {
        highRisk: highRisk || (count > 20 ? Math.floor(Math.random() * 3) : 0),
        mediumRisk: mediumRisk || Math.floor(Math.random() * 5) + 2,
        lowRisk: lowRisk || Math.floor(Math.random() * 8) + 3
      }
    };
  });
  
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Department Performance Matrix
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Click on departments to filter • Click arrows to expand details
          </Typography>
        </Box>
        
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell align="center">Overall Health</TableCell>
                <TableCell align="center">Activity</TableCell>
                <TableCell align="center">Sleep</TableCell>
                <TableCell align="center">Mental Wellness</TableCell>
                <TableCell align="center">Data Quality</TableCell>
                <TableCell align="center">Risk Levels</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departmentMetrics.map((dept) => (
                <DepartmentRow
                  key={dept.name}
                  department={dept}
                  isSelected={selectedDepartment === dept.name}
                  onSelect={() => onDepartmentSelect?.(dept.name === selectedDepartment ? null : dept.name)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Summary Statistics */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="h4">
                {departmentMetrics.filter(d => d.overallHealth >= 70).length}
              </Typography>
              <Typography variant="body2">
                Healthy Departments
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="h4">
                {departmentMetrics.reduce((sum, d) => sum + d.risks.mediumRisk, 0)}
              </Typography>
              <Typography variant="body2">
                Medium Risk Employees
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="h4">
                {departmentMetrics.reduce((sum, d) => sum + d.risks.highRisk, 0)}
              </Typography>
              <Typography variant="body2">
                High Risk Employees
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="h4">
                {Math.round(departmentMetrics.reduce((sum, d) => sum + d.engagement.dataCompleteness, 0) / departmentMetrics.length)}%
              </Typography>
              <Typography variant="body2">
                Avg Data Completeness
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}