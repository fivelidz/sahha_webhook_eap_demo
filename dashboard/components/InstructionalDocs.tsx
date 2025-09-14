'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Link,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  Psychology,
  FitnessCenter,
  Bedtime,
  SentimentSatisfied,
  Battery90,
  Biotech,
  Launch,
  Info,
  MenuBook,
  Close,
  Dashboard,
  DataUsage,
  Timeline,
  Assessment,
  Insights,
  OpenInNew,
  People,
  ArrowForward,
  CheckCircle
} from '@mui/icons-material';

interface InstructionalDocsProps {
  onClose?: () => void;
}

export default function InstructionalDocs({ onClose }: InstructionalDocsProps) {
  const [expanded, setExpanded] = useState<string | false>('overview');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBook color="primary" />
            Sahha EAP Dashboard - Complete Guide
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Comprehensive guide to Employee Assistance Program analytics powered by Sahha's health intelligence platform
          </Typography>
        </Box>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        )}
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This dashboard uses real-time data from <strong>Sahha's health intelligence platform</strong>. 
          All metrics are calculated from actual employee health data collected through wearables and smartphone sensors.
        </Typography>
      </Alert>

      {/* Overview Accordion */}
      <Accordion expanded={expanded === 'overview'} onChange={handleChange('overview')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Dashboard color="primary" />
            Dashboard Overview & Data Flow
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary">How the Dashboard Works:</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><People /></ListItemIcon>
                  <ListItemText 
                    primary="Profile Management Hub" 
                    secondary="Central data source - all analytics tabs pull from here"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><DataUsage /></ListItemIcon>
                  <ListItemText 
                    primary="Real-time Sahha API Integration" 
                    secondary="Live health scores, sub-scores, and archetype data"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Assessment /></ListItemIcon>
                  <ListItemText 
                    primary="Department Analytics" 
                    secondary="Assign employees to departments for comparative analysis"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Insights /></ListItemIcon>
                  <ListItemText 
                    primary="Advanced Intelligence" 
                    secondary="Behavioral archetypes and predictive insights"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary">Key Sahha Resources:</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  href="https://docs.sahha.ai"
                  target="_blank"
                  size="small"
                >
                  Sahha API Documentation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  href="https://sahha.ai/archetypes"
                  target="_blank"
                  size="small"
                >
                  Sahha Archetypes Guide
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  href="https://sahha.ai/health-scores"
                  target="_blank"
                  size="small"
                >
                  Health Scores Explained
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  href="https://sahha.ai/platform"
                  target="_blank"
                  size="small"
                >
                  Sahha Platform Overview
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Profile Management Accordion */}
      <Accordion expanded={expanded === 'profile-management'} onChange={handleChange('profile-management')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People color="primary" />
            Profile Management - Data Source Hub
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Profile Management is the heart of the dashboard</strong> - all other tabs get their data from here!
            </Typography>
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" gutterBottom>Data Flow Process:</Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" paragraph>
                  <strong>1. Profile Loading:</strong> Fetches 57 employee profiles from Sahha API<br/>
                  <strong>2. Health Scores:</strong> Loads wellbeing, activity, sleep, mental wellbeing, and readiness scores<br/>
                  <strong>3. Sub-scores:</strong> Detailed metrics like sleep duration, regularity, circadian alignment<br/>
                  <strong>4. Archetypes:</strong> Behavioral patterns (activity_level, mental_wellness, sleep_quality)<br/>
                  <strong>5. Department Assignment:</strong> Assign employees to departments for comparative analysis
                </Typography>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>How Other Tabs Use This Data:</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Executive Overview: Aggregates all health scores for organization-wide insights" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Wellbeing Analytics: Uses composite scores across all health dimensions" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Activity Analytics: Leverages activity scores and sub-scores" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Sleep Analytics: Extracts sleep sub-scores (duration, regularity, debt)" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Mental Wellbeing: Uses mental wellbeing score and related sub-scores" />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'primary.50' }}>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>Quick Start:</Typography>
                  <Typography variant="body2" paragraph>
                    1. Go to <strong>Profile Management</strong> tab<br/>
                    2. Wait for profiles to load (57 employees)<br/>
                    3. Assign employees to departments<br/>
                    4. Navigate to analytics tabs to see insights
                  </Typography>
                  <Alert severity="warning">
                    <Typography variant="caption">
                      If analytics show "No data available", check that Profile Management has loaded successfully.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Analytics Tabs Accordion */}
      <Accordion expanded={expanded === 'analytics-tabs'} onChange={handleChange('analytics-tabs')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment color="primary" />
            Analytics Tabs Explained
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Dashboard color="primary" />
                    Executive Overview
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    High-level organizational health metrics with trend analysis and risk identification.
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Data Source:</strong> Aggregated scores from all employees in Profile Management
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Psychology color="primary" />
                    Wellbeing Analytics
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Comprehensive wellbeing analysis across physical, mental, social, and emotional dimensions.
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Data Source:</strong> Composite scores from wellbeing, activity, sleep, mental health, readiness
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <FitnessCenter color="primary" />
                    Activity Analytics
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Physical activity insights with step counts, active hours, and inactivity patterns.
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Data Source:</strong> Activity scores and sub-scores (steps, active_hours, extended_inactivity)
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Bedtime color="primary" />
                    Sleep Analytics
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Sleep quality analysis with duration, regularity, debt, and circadian alignment metrics.
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Data Source:</strong> Sleep scores and sub-scores (sleep_duration, sleep_regularity, sleep_debt, circadian_alignment)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SentimentSatisfied color="primary" />
                    Mental Wellbeing Analytics
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Mental wellbeing insights with sub-score breakdown and improvement recommendations.
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Data Source:</strong> Mental wellbeing scores and sub-scores (circadian_alignment, steps, active_hours, activity_regularity, sleep_regularity)
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Battery90 color="primary" />
                    Readiness Analytics
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Energy levels, recovery patterns, and performance readiness metrics.
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Data Source:</strong> Readiness scores and recovery-related sub-scores
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Biotech color="primary" />
                    Behavioral Intelligence
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Advanced archetype analysis using Sahha's behavioral classification system.
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <strong>Data Source:</strong> Sahha archetypes (activity_level, mental_wellness, sleep_quality, exercise_frequency)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Sahha Integration Accordion */}
      <Accordion expanded={expanded === 'sahha-integration'} onChange={handleChange('sahha-integration')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OpenInNew color="primary" />
            Sahha Platform Integration
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary">Real Sahha Archetypes Used:</Typography>
              <Box sx={{ mb: 2 }}>
                <Chip label="activity_level" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="exercise_frequency" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="mental_wellness" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="overall_wellness" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="sleep_duration" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="sleep_quality" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="sleep_regularity" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="sleep_efficiency" size="small" sx={{ mr: 1, mb: 1 }} />
              </Box>
              
              <Typography variant="subtitle1" gutterBottom color="primary">Health Score Categories:</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Wellbeing Score" secondary="Overall health composite" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Activity Score" secondary="Physical movement and exercise" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Sleep Score" secondary="Sleep quality and patterns" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Mental Wellbeing Score" secondary="Psychological health indicators" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Readiness Score" secondary="Recovery and energy levels" />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom color="primary">Key Sahha Features:</Typography>
              <Typography variant="body2" paragraph>
                • <strong>Wearable Integration:</strong> Apple Health, Google Fit, Fitbit, Garmin<br/>
                • <strong>Smartphone Sensors:</strong> Movement, sleep, activity detection<br/>
                • <strong>Privacy-First:</strong> Edge processing, encrypted data transmission<br/>
                • <strong>Real-time Analytics:</strong> Live health intelligence and insights<br/>
                • <strong>Behavioral Archetypes:</strong> AI-powered pattern recognition<br/>
                • <strong>Sub-score Granularity:</strong> Detailed health component analysis
              </Typography>
              
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Learn More:</strong> Visit <Link href="https://sahha.ai" target="_blank">sahha.ai</Link> to 
                  understand how Sahha's platform collects and processes health data to generate these insights.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Technical Notes Accordion */}
      <Accordion expanded={expanded === 'technical-notes'} onChange={handleChange('technical-notes')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            Technical Implementation Notes
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Developer Pain Points Noted:</strong> Several areas where Sahha's API structure required 
              careful handling of null values, score field naming conventions, and archetype classification.
            </Typography>
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Key Technical Challenges:</Typography>
              <Typography variant="body2">
                • Score field naming: "mentalWellbeing" vs "mentalHealth"<br/>
                • Null value handling for incomplete profiles<br/>
                • Department assignment ID mapping<br/>
                • Sub-score extraction from nested objects<br/>
                • Real-time data synchronization<br/>
                • Archetype classification accuracy
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Data Quality Assurance:</Typography>
              <Typography variant="body2">
                • All metrics calculated from real API data<br/>
                • No fabricated or estimated values<br/>
                • Proper error handling for missing data<br/>
                • Consistent department mapping across tabs<br/>
                • Real Sahha archetype terminology used<br/>
                • Profile Management as single source of truth
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          For technical support or questions about Sahha integration, visit{' '}
          <Link href="https://docs.sahha.ai" target="_blank">docs.sahha.ai</Link> or contact the development team.
        </Typography>
      </Box>
    </Paper>
  );
}