'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  Grid,
  Chip,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

export default function DashboardGuidePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Dashboard User Guide
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Complete guide to using the Sahha Wellness Dashboard
      </Typography>

      <Alert severity="success" sx={{ mb: 4 }}>
        Welcome to the Sahha Wellness Platform! This guide will help you navigate and utilize all features effectively.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Getting Started
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Profile Manager"
                    secondary="View and manage all employee wellness profiles in one place"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Department Analytics"
                    secondary="Analyze wellness metrics by department for organizational insights"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Executive Dashboard"
                    secondary="High-level overview of organizational wellness trends"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Understanding Wellness Scores
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="80-100" color="success" size="small" />
                    <Typography variant="body2">Excellent wellness</Typography>
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="60-79" color="warning" size="small" />
                    <Typography variant="body2">Good wellness, room for improvement</Typography>
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="0-59" color="error" size="small" />
                    <Typography variant="body2">Needs attention</Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Score Categories
              </Typography>
              
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Wellbeing:</strong> Overall health and wellness measure
                </Typography>
                <Typography variant="body2">
                  <strong>Activity:</strong> Physical activity and movement patterns
                </Typography>
                <Typography variant="body2">
                  <strong>Sleep:</strong> Sleep quality and duration metrics
                </Typography>
                <Typography variant="body2">
                  <strong>Mental Health:</strong> Stress and mental wellness indicators
                </Typography>
                <Typography variant="body2">
                  <strong>Readiness:</strong> Daily performance readiness score
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Key Features
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="h6" gutterBottom>Search & Filter</Typography>
                    <Typography variant="body2">
                      Quickly find profiles using search and department filters
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'secondary.50' }}>
                    <Typography variant="h6" gutterBottom>Bulk Actions</Typography>
                    <Typography variant="body2">
                      Select multiple profiles and perform bulk assignments
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                    <Typography variant="h6" gutterBottom>Export Data</Typography>
                    <Typography variant="body2">
                      Export wellness data for reporting and analysis
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Profile Management Tips
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                  <ListItemText 
                    primary="Editable Profile IDs"
                    secondary="Click the edit icon next to any profile ID to customize it for your organization"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                  <ListItemText 
                    primary="Expandable Rows"
                    secondary="Click the arrow icon to view detailed sub-scores for each wellness category"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                  <ListItemText 
                    primary="Debug Panel"
                    secondary="Toggle the debug panel to view API responses and system logs"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                  <ListItemText 
                    primary="Dark Mode"
                    secondary="Use the dark mode toggle in the sidebar for comfortable viewing"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Data Privacy & Security
              </Typography>
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    • All wellness data is encrypted in transit and at rest
                  </Typography>
                  <Typography variant="body2">
                    • Profile data is anonymized with configurable IDs
                  </Typography>
                  <Typography variant="body2">
                    • Access is restricted to authorized administrators only
                  </Typography>
                  <Typography variant="body2">
                    • Regular security audits ensure data protection compliance
                  </Typography>
                </Stack>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Need Help?
              </Typography>
              
              <Typography paragraph>
                For additional support or questions:
              </Typography>
              
              <Stack spacing={1}>
                <Typography variant="body2">
                  📧 Email: support@sahha.ai
                </Typography>
                <Typography variant="body2">
                  📚 Documentation: docs.sahha.ai
                </Typography>
                <Typography variant="body2">
                  💬 Community: community.sahha.ai
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}