'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Groups as GroupsIcon,
  Insights as InsightsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Bedtime as BedtimeIcon,
  DirectionsRun as ActivityIcon,
  Favorite as WellbeingIcon,
  Psychology as MentalIcon
} from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CodeIcon from '@mui/icons-material/Code';

export default function DashboardGuidePage() {
  const router = useRouter();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Navigation Bar */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<CodeIcon />}
          onClick={() => router.push('/mcp-guide')}
        >
          Technical MCP Guide
        </Button>
      </Box>
      <Typography variant="h2" fontWeight="bold" gutterBottom>
        Transform Your EAP with Sahha Behavioral Intelligence
      </Typography>
      
      <Typography variant="h5" color="primary" paragraph>
        Unlock the Power of Archetypes and Predictive Analytics for Employee Wellness
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="bold">
          Understanding Behavioral Archetypes for Workplace Wellness
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          This guide explains how Sahha's behavioral archetypes provide actionable insights for improving employee readiness, performance, and mental wellness through targeted interventions.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Introduction to Archetypes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                What Are Behavioral Archetypes?
              </Typography>
              
              <Typography paragraph sx={{ fontSize: '1.1rem' }}>
                Behavioral archetypes are data-driven patterns identified from continuous monitoring of sleep, activity, and wellness metrics. 
                Unlike simple averages or thresholds, archetypes represent complex behavioral patterns that predict future wellness states and performance readiness.
              </Typography>

              <Typography paragraph>
                Sahha analyzes multiple data streams to identify these patterns:
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Sleep Architecture Patterns"
                    secondary="Timing, duration, consistency, and recovery patterns from sleep debt"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Activity Rhythm Patterns"
                    secondary="Movement distribution throughout the day, sedentary periods, and exercise timing"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Stress Response Patterns"
                    secondary="How individuals respond to and recover from stressors"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Circadian Alignment"
                    secondary="Natural biological rhythms and their alignment with work schedules"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Archetype Breakdown */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                <PsychologyIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Core Archetype Categories & Intervention Strategies
              </Typography>
              
              <Typography paragraph sx={{ fontSize: '1.1rem' }}>
                Each archetype provides specific insights for improving readiness and performance through targeted interventions.
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Sleep Archetypes Section */}
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
                <BedtimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Sleep Pattern Archetypes
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      1. The Early Bird (Morning Chronotype)
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Peak alertness 6am-10am, sleep onset typically before 10pm, 
                      highest cognitive performance in early morning hours.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> These individuals show 25-30% higher error rates in afternoon/evening work. 
                      Critical decisions and complex tasks should be scheduled before noon.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Schedule important meetings and complex work before noon. 
                      Avoid late meetings or overtime. Consider flexible start times (6-7am starts with earlier departure).
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      2. The Night Owl (Evening Chronotype)
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Peak alertness 6pm-10pm, natural sleep onset after midnight, 
                      struggle with traditional 9am starts, best cognitive performance in late afternoon/evening.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Show reduced performance and higher stress markers when forced into 
                      early schedules. May exhibit "social jet lag" symptoms including reduced immune function.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Allow later start times (10-11am) when possible. Schedule creative 
                      and complex work for afternoon. Implement "core hours" (11am-3pm) rather than fixed schedules. 
                      Provide sleep hygiene education to improve adaptation when early starts are necessary.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      3. The Sleep Debt Accumulator
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Progressive decline in sleep duration over workweek (7hr Monday to 5hr Friday), 
                      weekend "catch-up" sleep exceeding 10 hours, chronic sleep debt markers in biodata.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Cognitive performance decreases 10-15% per day of accumulated debt. 
                      Increased risk of errors, accidents, and poor decision-making by week's end. Higher burnout risk.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Implement "sleep protected time" policies - no meetings before 9am or after 5pm. 
                      Education on sleep debt consequences. Consider 4-day work weeks or regular recovery days. 
                      Monitor for burnout indicators and mandate time off when debt exceeds thresholds.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      4. The Irregular Sleeper
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> High variability in sleep timing (greater than 2hr standard deviation), 
                      inconsistent sleep duration, no clear circadian pattern, often correlated with shift work or travel.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Consistently lower readiness scores, higher error rates, 
                      increased sick days, difficulty with routine tasks, mood instability.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Prioritize sleep consistency over duration. Implement strict sleep 
                      scheduling protocols. Provide light therapy devices for circadian anchoring. Consider role reassignment 
                      away from safety-critical tasks during adaptation periods.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Activity Archetypes Section */}
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
                <ActivityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Activity Pattern Archetypes
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="secondary.main" gutterBottom>
                      1. The Desk Warrior
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Less than 8 hours of movement per week, more than 10 hours daily sitting, 
                      minimal step counts (under 3000/day), long uninterrupted sedentary periods.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Afternoon energy crashes, reduced creative thinking, 
                      higher stress markers, increased musculoskeletal complaints affecting work quality.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Mandatory movement breaks every 90 minutes. Standing desk 
                      provisions. Walking meetings for 1:1s. Gamified step challenges with team components. 
                      Micro-movement reminders through apps.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="secondary.main" gutterBottom>
                      2. The Burst Exerciser
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Intense weekend activity (exceeding 150% weekly average), 
                      minimal weekday movement, high variance in daily activity levels, "weekend warrior" pattern.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Monday fatigue from weekend overexertion, midweek energy 
                      decline, higher injury risk affecting attendance, inconsistent daily performance.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Encourage activity distribution - "10 minutes daily beats 2 hours weekly". 
                      Provide onsite micro-workout facilities. Lunchtime activity programs. Education on recovery and 
                      consistent movement benefits.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="secondary.main" gutterBottom>
                      3. The Consistent Mover
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Regular daily activity (over 7000 steps), consistent exercise timing, 
                      balanced activity distribution, low variance in movement patterns.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Higher sustained energy, better stress resilience, 
                      consistent cognitive performance, lower sick days, positive influence on team culture.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Leverage as wellness champions and peer mentors. 
                      Create buddy systems pairing them with sedentary colleagues. Recognize and reward their 
                      consistency to encourage others.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Mental Wellness & Stress Archetypes */}
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
                <MentalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Mental Wellness & Stress Response Archetypes
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      1. The Stress Accumulator
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Progressive decline in HRV throughout week, elevated resting 
                      heart rate trends, sleep quality degradation under pressure, slow recovery from stressors.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Declining decision quality under sustained pressure, 
                      increased errors during high-demand periods, higher absenteeism, burnout risk within 3-6 months 
                      if pattern persists.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Implement stress-buffering protocols: mandatory breaks during 
                      high-pressure periods, access to quiet/recovery spaces, stress inoculation training, workload 
                      redistribution during peak times. Monitor for early burnout indicators and provide proactive support.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      2. The Resilient Adapter
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Quick HRV recovery after stressors, maintained sleep quality 
                      during challenges, stable performance under pressure, positive stress response patterns.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Consistent performance regardless of external pressures, 
                      natural leadership during crises, positive influence on team morale, lower turnover risk.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Utilize in high-pressure roles and crisis management. 
                      Pair with stress-sensitive colleagues for support. Study their coping mechanisms for team training. 
                      Ensure they're not overloaded due to their perceived resilience.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      3. The Cyclic Responder
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Predictable monthly/seasonal stress patterns, performance 
                      variations aligned with external factors (deadlines, seasons), recovery periods between stress cycles.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Predictable performance fluctuations, higher support needs 
                      during known stress periods, excellent performance during low-stress cycles.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Proactive support scheduling aligned with known stress cycles. 
                      Workload adjustment during vulnerable periods. Preparation protocols before high-stress periods. 
                      Leverage high-performance periods for critical projects.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Readiness Archetypes */}
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4 }}>
                <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Daily Readiness Archetypes
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      1. The Slow Starter
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Low morning readiness scores (below 50 before 10am), 
                      gradual improvement throughout day, peak performance in afternoon, slow cognitive warm-up period.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Poor performance in early meetings, higher error rates 
                      in morning work, missed opportunities in AM collaboration, frustration from misaligned expectations.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Avoid critical decisions before 10am. Schedule routine tasks 
                      for mornings, complex work for afternoons. Provide flexibility in start times. Morning routine 
                      optimization training.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      2. The Afternoon Crasher
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Sharp readiness decline 2-4pm (over 30% drop), post-lunch 
                      energy trough, reduced cognitive performance in afternoon, compensatory caffeine consumption.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Afternoon meeting ineffectiveness, increased errors after 
                      lunch, project delays from afternoon productivity loss, reliance on stimulants.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Strategic lunch timing and composition guidance. Power nap 
                      facilities (20-minute rest periods). Afternoon light exposure. Schedule creative work for mornings, 
                      routine tasks for afternoon lows.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      3. The Steady Performer
                    </Typography>
                    <Typography paragraph>
                      <strong>Pattern Identification:</strong> Consistent readiness scores throughout day (variance under 15%), 
                      stable energy levels, predictable performance patterns, minimal fluctuation in cognitive capacity.
                    </Typography>
                    <Typography paragraph>
                      <strong>Performance Implications:</strong> Reliable for time-sensitive tasks, consistent quality output, 
                      good for client-facing roles, natural project anchors, lower error rates.
                    </Typography>
                    <Typography paragraph>
                      <strong>Intervention Strategy:</strong> Utilize for critical consistent-performance roles. Protect 
                      their stability patterns from disruption. Use as baseline for team scheduling. Ensure they're 
                      not taken for granted due to reliability.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Department-Level Application */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                <GroupsIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Applying Archetypes at Department Level
              </Typography>
              
              <Typography paragraph sx={{ fontSize: '1.1rem' }}>
                Understanding archetype distribution within departments enables targeted organizational interventions.
              </Typography>

              <Paper sx={{ p: 3, bgcolor: 'info.50', mt: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Department Archetype Analysis Framework
                </Typography>
                
                <Typography paragraph>
                  <strong>Step 1: Identify Dominant Patterns</strong><br/>
                  Analyze the distribution of archetypes within each department to identify predominant patterns.
                </Typography>
                
                <Typography paragraph>
                  <strong>Step 2: Map to Role Requirements</strong><br/>
                  Compare identified patterns against role demands to find alignment or mismatches.
                </Typography>
                
                <Typography paragraph>
                  <strong>Step 3: Design Targeted Interventions</strong><br/>
                  Create department-specific wellness programs based on dominant archetype needs.
                </Typography>
                
                <Typography paragraph>
                  <strong>Step 4: Monitor Impact</strong><br/>
                  Track changes in readiness, performance, and wellness metrics post-intervention.
                </Typography>
              </Paper>

              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                Example Department Interventions:
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      Engineering Team (70% Night Owls, 60% Desk Warriors)
                    </Typography>
                    <Typography variant="body2">
                      • Implement flexible start times (10am-6pm core hours)<br/>
                      • Provide standing desks and movement reminders<br/>
                      • Schedule complex problem-solving for afternoons<br/>
                      • Create quiet zones for deep work periods
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                      Sales Team (50% Stress Accumulators, 40% Burst Exercisers)
                    </Typography>
                    <Typography variant="body2">
                      • Introduce mandatory recovery breaks between call blocks<br/>
                      • Provide stress management training and tools<br/>
                      • Encourage daily micro-workouts vs weekend marathons<br/>
                      • Implement performance metrics that reward consistency
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                      Operations (60% Early Birds, 70% Steady Performers)
                    </Typography>
                    <Typography variant="body2">
                      • Optimize for early morning productivity<br/>
                      • Schedule critical operations before noon<br/>
                      • Leverage consistency for process improvement<br/>
                      • Protect stable patterns from unnecessary disruption
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                      Customer Support (Mixed Chronotypes, 80% Afternoon Crashers)
                    </Typography>
                    <Typography variant="body2">
                      • Implement shift selection based on chronotype<br/>
                      • Provide afternoon energy management strategies<br/>
                      • Rotate high-stress tickets during peak readiness<br/>
                      • Create recovery protocols between difficult calls
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Using Archetypes for Prediction and Prevention */}
        <Grid item xs={12}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                <TimelineIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Using Archetypes for Early Intervention
              </Typography>
              
              <Typography paragraph>
                Behavioral archetypes enable predictive intervention by identifying risk patterns before they manifest as performance or wellness issues.
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'error.50' }}>
                    <Typography variant="h6" fontWeight="bold" color="error.main">
                      <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Burnout Risk Identification
                    </Typography>
                    <Typography paragraph sx={{ mt: 2 }}>
                      <strong>Early Warning Signals from Archetype Shifts:</strong>
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Steady Performer to Sleep Debt Accumulator"
                          secondary="Indicates unsustainable workload or life stressors"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Consistent Mover to Desk Warrior"
                          secondary="Suggests overwhelm and abandonment of self-care"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Resilient Adapter to Stress Accumulator"
                          secondary="Signals capacity exceeded, immediate intervention needed"
                        />
                      </ListItem>
                    </List>
                    <Typography paragraph>
                      <strong>Intervention Timeline:</strong> When archetype shifts are detected, interventions within 2 weeks 
                      can prevent progression to clinical burnout in 85% of cases.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Performance Optimization
                    </Typography>
                    <Typography paragraph sx={{ mt: 2 }}>
                      <strong>Archetype-Based Performance Predictions:</strong>
                    </Typography>
                    <Typography paragraph>
                      • <strong>Night Owls in early morning roles:</strong> 25-30% performance deficit before 10am<br/>
                      • <strong>Afternoon Crashers in post-lunch meetings:</strong> 40% reduced engagement and decision quality<br/>
                      • <strong>Sleep Debt Accumulators by Thursday:</strong> Error rates increase by 15-20%<br/>
                      • <strong>Burst Exercisers on Mondays:</strong> 20% reduction in cognitive performance from weekend overexertion
                    </Typography>
                    <Typography paragraph>
                      <strong>Optimization Strategy:</strong> Align role requirements and schedules with archetype strengths 
                      to unlock 15-25% performance improvements without additional resources.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 3, bgcolor: 'success.50' }}>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      <InsightsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Mental Wellness Interventions
                    </Typography>
                    <Typography paragraph sx={{ mt: 2 }}>
                      <strong>Archetype-Specific Mental Health Support:</strong>
                    </Typography>
                    <Typography paragraph>
                      • <strong>Stress Accumulators:</strong> Benefit from cognitive behavioral techniques and stress inoculation training<br/>
                      • <strong>Cyclic Responders:</strong> Respond well to seasonal light therapy and scheduled support<br/>
                      • <strong>Irregular Sleepers:</strong> Show improvement with sleep restriction therapy and circadian anchoring<br/>
                      • <strong>Desk Warriors:</strong> Experience mood improvements with movement-based interventions
                    </Typography>
                    <Typography paragraph>
                      <strong>Targeted Approach Benefits:</strong> Archetype-matched interventions show 3x higher engagement 
                      and 2x better outcomes compared to generic wellness programs.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Implementation Guide */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Implementing Archetype-Based Wellness Programs
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                Phase 1: Data Collection & Analysis (Weeks 1-4)
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Deploy Sahha SDK or wearable integration"
                    secondary="Establish baseline data collection for sleep, activity, and wellness metrics"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Ensure minimum 2-week data collection"
                    secondary="Required for accurate archetype identification"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Generate initial archetype distribution report"
                    secondary="Identify predominant patterns at individual and department levels"
                  />
                </ListItem>
              </List>

              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                Phase 2: Intervention Design (Weeks 5-6)
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Map archetypes to role requirements"
                    secondary="Identify alignment and friction points"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Design targeted interventions"
                    secondary="Create specific programs for each dominant archetype group"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Set measurable success metrics"
                    secondary="Define KPIs for readiness, performance, and wellness improvements"
                  />
                </ListItem>
              </List>

              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                Phase 3: Pilot Implementation (Weeks 7-12)
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Start with highest-impact interventions"
                    secondary="Focus on departments with clearest archetype patterns"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Monitor archetype shifts weekly"
                    secondary="Track changes as early indicators of intervention effectiveness"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Adjust based on real-time feedback"
                    secondary="Use archetype shifts to refine intervention strategies"
                  />
                </ListItem>
              </List>

              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                Phase 4: Scale & Optimize (Weeks 13+)
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Expand successful interventions organization-wide"
                    secondary="Roll out proven strategies to all departments"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Implement automated archetype monitoring"
                    secondary="Set up alerts for concerning archetype shifts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Create archetype-based wellness policies"
                    secondary="Formalize flexibility and support structures"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Measuring Success */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Measuring Success with Archetype Analytics
              </Typography>
              
              <Typography paragraph>
                Track the impact of archetype-based interventions through quantifiable metrics:
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>Individual Metrics</Typography>
                    <Typography variant="body2">
                      • Archetype stability over time<br/>
                      • Readiness score improvements<br/>
                      • Sleep debt reduction<br/>
                      • Activity consistency increase<br/>
                      • Stress recovery time reduction
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>Organizational Metrics</Typography>
                    <Typography variant="body2">
                      • Department archetype diversity<br/>
                      • Role-archetype alignment score<br/>
                      • Intervention engagement rates<br/>
                      • Productivity metrics by archetype<br/>
                      • Wellness program ROI by intervention type
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                Expected Outcomes Timeline:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="2-4 weeks: Initial archetype identification"
                    secondary="Baseline patterns established, risk employees identified"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="4-8 weeks: Early intervention impact"
                    secondary="Reduced stress markers, improved sleep patterns in targeted groups"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="8-12 weeks: Performance improvements"
                    secondary="Measurable increases in readiness scores and productivity metrics"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="3-6 months: Organizational transformation"
                    secondary="Sustained archetype improvements, reduced sick days, higher engagement"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Call to Action */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Start Your Archetype-Based Wellness Journey
              </Typography>
              <Typography variant="h6" paragraph>
                Learn how Sahha's behavioral archetypes can transform your organization's approach to employee wellness
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }} alignItems="center">
                <Typography variant="h5">
                  🌐 <a href="https://sahha.ai/start" style={{ color: 'white' }}>sahha.ai/start</a>
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Get started with a pilot program tailored to your organization's needs
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Bottom Navigation */}
        <Grid item xs={12}>
          <Box sx={{ mt: 6, mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<DashboardIcon />}
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<CodeIcon />}
              onClick={() => router.push('/mcp-guide')}
            >
              View Technical Guide
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}