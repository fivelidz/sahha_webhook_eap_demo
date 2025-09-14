'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Alert,
  LinearProgress,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PersonAdd,
  Business,
  Analytics,
  Save,
  AutoAwesome,
  Refresh
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Profile {
  profileId: string;
  externalId: string;
  deviceType: string;
  isSampleProfile: boolean;
  createdAtUtc?: string;
  department?: string;
}

interface DepartmentConfig {
  id: string;
  name: string;
  color: string;
  description: string;
  targetPercentage: number;
}

interface DepartmentAssignmentManagerProps {
  profiles: Profile[];
  onAssignmentChange: (assignments: { [profileId: string]: string }) => void;
}

const DEFAULT_DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'tech',
    name: 'Technology',
    color: '#1976d2',
    description: 'Software development, engineering, IT',
    targetPercentage: 35
  },
  {
    id: 'operations',
    name: 'Operations',
    color: '#388e3c',
    description: 'Operations, support, administration',
    targetPercentage: 25
  },
  {
    id: 'sales',
    name: 'Sales & Marketing',
    color: '#f57c00',
    description: 'Sales, marketing, business development',
    targetPercentage: 20
  },
  {
    id: 'admin',
    name: 'Administration',
    color: '#7b1fa2',
    description: 'HR, finance, executive, admin',
    targetPercentage: 20
  }
];

export default function DepartmentAssignmentManager({ 
  profiles, 
  onAssignmentChange 
}: DepartmentAssignmentManagerProps) {
  const [assignments, setAssignments] = useState<{ [profileId: string]: string }>({});
  const [departments] = useState<DepartmentConfig[]>(DEFAULT_DEPARTMENTS);
  const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);

  useEffect(() => {
    // Initialize assignments with current profile departments
    const initialAssignments: { [profileId: string]: string } = {};
    profiles.forEach(profile => {
      if (profile.department) {
        initialAssignments[profile.profileId] = profile.department;
      }
    });
    setAssignments(initialAssignments);
  }, [profiles]);

  const handleAssignment = (profileId: string, departmentId: string) => {
    const newAssignments = { ...assignments, [profileId]: departmentId };
    setAssignments(newAssignments);
    onAssignmentChange(newAssignments);
  };

  const handleAutoAssignment = () => {
    const newAssignments: { [profileId: string]: string } = {};
    
    // Intelligent auto-assignment based on profile characteristics
    profiles.forEach((profile, index) => {
      const externalId = profile.externalId.toLowerCase();
      
      // Assignment logic based on patterns
      if (externalId.includes('dev') || externalId.includes('eng') || externalId.includes('tech')) {
        newAssignments[profile.profileId] = 'tech';
      } else if (externalId.includes('sales') || externalId.includes('marketing') || externalId.includes('biz')) {
        newAssignments[profile.profileId] = 'sales';
      } else if (externalId.includes('ops') || externalId.includes('support') || externalId.includes('admin')) {
        newAssignments[profile.profileId] = 'operations';
      } else {
        // Distribute remaining profiles proportionally
        const deptOrder = ['tech', 'operations', 'sales', 'admin'];
        const targetIndex = index % deptOrder.length;
        newAssignments[profile.profileId] = deptOrder[targetIndex];
      }
    });
    
    setAssignments(newAssignments);
    onAssignmentChange(newAssignments);
    setAutoAssignDialogOpen(false);
  };

  const getUnassignedProfiles = () => {
    return profiles.filter(profile => !assignments[profile.profileId]);
  };

  const getProfilesByDepartment = (departmentId: string) => {
    return profiles.filter(profile => assignments[profile.profileId] === departmentId);
  };

  const getDepartmentCounts = () => {
    return departments.map(dept => ({
      name: dept.name,
      value: getProfilesByDepartment(dept.id).length,
      color: dept.color,
      percentage: Math.round((getProfilesByDepartment(dept.id).length / Math.max(profiles.length, 1)) * 100)
    }));
  };

  const unassignedCount = getUnassignedProfiles().length;
  const assignedCount = profiles.length - unassignedCount;
  const completionPercentage = Math.round((assignedCount / Math.max(profiles.length, 1)) * 100);

  if (profiles.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Department Assignment Manager
        </Typography>
        <Typography variant="body1" color="textSecondary">
          No profiles available. The department assignment manager will appear when real Sahha profiles are loaded.
        </Typography>
        <Alert severity="info" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="body2">
            This interface will allow you to assign your 57 Sahha profiles to different departments for organizational analytics once the API connection is fully established.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Department Assignment Manager
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Assign your {profiles.length} Sahha profiles to organizational departments
        </Typography>
      </Box>

      {/* Progress Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Assignment Progress: {assignedCount}/{profiles.length} profiles assigned ({completionPercentage}%)
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesome />}
                  onClick={() => setAutoAssignDialogOpen(true)}
                  disabled={assignedCount === profiles.length}
                >
                  Auto-Assign
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={() => console.log('Save assignments:', assignments)}
                >
                  Save
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Profile Assignment Panel */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader title="Profile Assignment" />
            <CardContent>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {profiles.slice(0, 10).map((profile) => (
                  <ListItem key={profile.profileId} divider>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={4}>
                        <ListItemText 
                          primary={profile.externalId}
                          secondary={`ID: ${profile.profileId.substring(0, 8)}...`}
                        />
                      </Grid>
                      
                      <Grid item xs={2}>
                        <Chip 
                          label={profile.deviceType} 
                          size="small" 
                          color={profile.deviceType === 'iOS' ? 'primary' : 'secondary'}
                        />
                      </Grid>
                      
                      <Grid item xs={2}>
                        {profile.isSampleProfile && (
                          <Chip label="Sample Data" size="small" color="success" />
                        )}
                      </Grid>
                      
                      <Grid item xs={4}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={assignments[profile.profileId] || ''}
                            onChange={(e) => handleAssignment(profile.profileId, e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Unassigned</em>
                            </MenuItem>
                            {departments.map(dept => (
                              <MenuItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
                {profiles.length > 10 && (
                  <ListItem>
                    <ListItemText 
                      primary={`... and ${profiles.length - 10} more profiles`}
                      secondary="Auto-assignment recommended for large profile sets"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Analytics Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Department Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={getDepartmentCounts()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {getDepartmentCounts().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <Box sx={{ mt: 2 }}>
                {getDepartmentCounts().map((dept) => (
                  <Box key={dept.name} display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Box display="flex" alignItems="center">
                      <Box 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: dept.color, 
                          borderRadius: '50%', 
                          mr: 1 
                        }} 
                      />
                      <Typography variant="body2">{dept.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {dept.value} ({dept.percentage}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Auto-Assignment Dialog */}
      <Dialog open={autoAssignDialogOpen} onClose={() => setAutoAssignDialogOpen(false)}>
        <DialogTitle>Intelligent Auto-Assignment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Automatically assign profiles to departments based on:
          </Typography>
          <ul>
            <li>External ID patterns (dev, eng, tech → Technology)</li>
            <li>Profile naming conventions (sales, marketing → Sales)</li>
            <li>Proportional distribution for unmatched profiles</li>
          </ul>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This will override existing assignments. Consider backing up current assignments first.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAutoAssignment} variant="contained" color="primary">
            Auto-Assign All Profiles
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}