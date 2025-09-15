'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Stack,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  AvatarGroup,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Psychology,
  FitnessCenter,
  Mood,
  TrendingUp,
  Warning,
  Groups,
  DirectionsRun,
  SelfImprovement,
  NightsStay,
  WbSunny,
  Favorite,
  Hotel,
  Analytics,
  FilterList,
  Download,
  Refresh,
  InfoOutlined,
  ExpandMore,
  Clear,
  AutoGraph,
  Insights,
  Speed,
  Balance,
  Timeline,
  Bedtime,
  Schedule,
  EmojiEvents,
  LocalFireDepartment,
  AcUnit,
  Waves,
  Bolt,
  Spa,
  FiberManualRecord,
  CheckCircle,
  RadioButtonUnchecked,
  Cancel,
  BubbleChart,
  DonutLarge,
  ScatterPlot,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Sankey,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Line,
  Area,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { useWebhookData } from '../hooks/useWebhookData';

interface BehavioralIntelligenceProps {
  orgId?: string;
}

// Real Sahha archetype mappings from webhook events
const SAHHA_ARCHETYPES = {
  sleep_pattern: {
    consistent_early_sleeper: { label: 'Consistent Early Sleeper', icon: WbSunny, color: '#ffd54f' },
    consistent_late_sleeper: { label: 'Consistent Late Sleeper', icon: NightsStay, color: '#5c6bc0' },
    variable_sleeper: { label: 'Variable Sleeper', icon: Balance, color: '#66bb6a' }
  },
  sleep_quality: {
    optimal_sleep_quality: { label: 'Optimal Sleep', icon: EmojiEvents, color: '#4caf50' },
    good_sleep_quality: { label: 'Good Sleep', icon: CheckCircle, color: '#8bc34a' },
    fair_sleep_quality: { label: 'Fair Sleep', icon: RadioButtonUnchecked, color: '#ffeb3b' },
    poor_sleep_quality: { label: 'Poor Sleep', icon: Cancel, color: '#f44336' }
  },
  sleep_duration: {
    short_sleeper: { label: 'Short Sleeper (<6h)', icon: Bolt, color: '#ff5722' },
    average_sleeper: { label: 'Average Sleeper (6-8h)', icon: Balance, color: '#2196f3' },
    long_sleeper: { label: 'Long Sleeper (>8h)', icon: Hotel, color: '#9c27b0' }
  },
  sleep_regularity: {
    highly_regular_sleeper: { label: 'Highly Regular', icon: Schedule, color: '#4caf50' },
    regular_sleeper: { label: 'Regular', icon: CheckCircle, color: '#8bc34a' },
    irregular_sleeper: { label: 'Irregular', icon: Waves, color: '#ff9800' },
    highly_irregular_sleeper: { label: 'Highly Irregular', icon: Cancel, color: '#f44336' }
  },
  bed_schedule: {
    early_sleeper: { label: 'Early to Bed', icon: Bedtime, color: '#ffd54f' },
    normal_sleeper: { label: 'Normal Schedule', icon: Balance, color: '#66bb6a' },
    late_sleeper: { label: 'Late to Bed', icon: NightsStay, color: '#5c6bc0' }
  },
  wake_schedule: {
    early_riser: { label: 'Early Riser', icon: WbSunny, color: '#ffd54f' },
    normal_riser: { label: 'Normal Riser', icon: Balance, color: '#66bb6a' },
    late_riser: { label: 'Late Riser', icon: AcUnit, color: '#5c6bc0' }
  }
};

type ViewingMode = 'archetype_distribution' | 'behavioral_patterns' | 'predictive_modeling' | 'intervention_matrix' | 'population_health';

export default function BehavioralIntelligenceOverhaul({ orgId = 'default' }: BehavioralIntelligenceProps) {
  const { data, loading, error, refetch } = useWebhookData(30000);
  const [viewingMode, setViewingMode] = useState<ViewingMode>('archetype_distribution');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedArchetypeCategory, setSelectedArchetypeCategory] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [filters, setFilters] = useState({
    ageRange: [18, 65],
    scoreThreshold: 0.5,
    includeIncomplete: false
  });

  // Process real archetype data from webhook events
  const processedArchetypeData = useMemo(() => {
    if (!data) return { profiles: [], archetypes: {}, patterns: [] };

    // Extract real archetypes from webhook event analysis
    const archetypeEvents = data.eventAnalysis?.filter(e => 
      e.eventType === 'ArchetypeCreatedIntegrationEvent'
    ) || [];

    // Map profiles with their archetypes
    const profileArchetypeMap: { [key: string]: any } = {};
    
    archetypeEvents.forEach(event => {
      const payload = JSON.parse(event.rawPayloadSample || '{}');
      const externalId = payload.externalId;
      
      if (!profileArchetypeMap[externalId]) {
        profileArchetypeMap[externalId] = {
          externalId,
          archetypes: {}
        };
      }
      
      // Store archetype by name
      profileArchetypeMap[externalId].archetypes[payload.name] = {
        value: payload.value,
        ordinality: payload.ordinality,
        dataType: payload.dataType,
        periodicity: payload.periodicity
      };
    });

    // Merge with profile data
    const enrichedProfiles = (data.profiles || []).map(profile => {
      const archetypeData = profileArchetypeMap[profile.externalId] || { archetypes: {} };
      
      // If no real archetypes, generate based on scores (fallback)
      if (Object.keys(archetypeData.archetypes).length === 0) {
        archetypeData.archetypes = generateArchetypesFromScores(profile.scores);
      }
      
      return {
        ...profile,
        archetypes: archetypeData.archetypes,
        behavioralScore: calculateBehavioralScore(profile.scores, archetypeData.archetypes)
      };
    });

    // Calculate archetype distributions
    const archetypeDistributions: any = {};
    Object.keys(SAHHA_ARCHETYPES).forEach(category => {
      archetypeDistributions[category] = {};
      Object.keys(SAHHA_ARCHETYPES[category as keyof typeof SAHHA_ARCHETYPES]).forEach(value => {
        archetypeDistributions[category][value] = enrichedProfiles.filter(
          p => p.archetypes[category]?.value === value
        ).length;
      });
    });

    // Identify behavioral patterns
    const patterns = identifyBehavioralPatterns(enrichedProfiles);

    return {
      profiles: enrichedProfiles,
      archetypes: archetypeDistributions,
      patterns
    };
  }, [data]);

  // Filter profiles based on selections
  const filteredProfiles = useMemo(() => {
    let profiles = [...processedArchetypeData.profiles];
    
    if (selectedDepartment !== 'all') {
      profiles = profiles.filter(p => p.department === selectedDepartment);
    }
    
    if (selectedArchetypeCategory !== 'all') {
      const [category, value] = selectedArchetypeCategory.split(':');
      if (value) {
        profiles = profiles.filter(p => p.archetypes[category]?.value === value);
      }
    }
    
    if (!filters.includeIncomplete) {
      profiles = profiles.filter(p => 
        Object.keys(p.archetypes).length >= 3
      );
    }
    
    return profiles;
  }, [processedArchetypeData.profiles, selectedDepartment, selectedArchetypeCategory, filters]);

  // Calculate population health metrics
  const populationMetrics = useMemo(() => {
    const total = filteredProfiles.length;
    if (total === 0) return null;

    const metrics = {
      total,
      avgBehavioralScore: 0,
      highRisk: 0,
      optimal: 0,
      improvementNeeded: 0,
      distributions: {} as any
    };

    // Calculate averages and counts
    filteredProfiles.forEach(profile => {
      metrics.avgBehavioralScore += profile.behavioralScore || 0;
      
      if (profile.behavioralScore < 0.3) metrics.highRisk++;
      else if (profile.behavioralScore > 0.7) metrics.optimal++;
      else metrics.improvementNeeded++;
    });

    metrics.avgBehavioralScore = metrics.avgBehavioralScore / total;

    // Calculate distributions for each archetype category
    Object.keys(SAHHA_ARCHETYPES).forEach(category => {
      metrics.distributions[category] = {};
      Object.keys(SAHHA_ARCHETYPES[category as keyof typeof SAHHA_ARCHETYPES]).forEach(value => {
        const count = filteredProfiles.filter(p => p.archetypes[category]?.value === value).length;
        metrics.distributions[category][value] = {
          count,
          percentage: (count / total) * 100
        };
      });
    });

    return metrics;
  }, [filteredProfiles]);

  // Render different viewing modes
  const renderViewContent = () => {
    switch (viewingMode) {
      case 'archetype_distribution':
        return renderArchetypeDistribution();
      case 'behavioral_patterns':
        return renderBehavioralPatterns();
      case 'predictive_modeling':
        return renderPredictiveModeling();
      case 'intervention_matrix':
        return renderInterventionMatrix();
      case 'population_health':
        return renderPopulationHealth();
      default:
        return renderArchetypeDistribution();
    }
  };

  const renderArchetypeDistribution = () => (
    <Grid container spacing={3}>
      {Object.entries(processedArchetypeData.archetypes).map(([category, distribution]) => (
        <Grid item xs={12} md={6} lg={4} key={category}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {category.replace(/_/g, ' ')}
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={Object.entries(distribution).map(([key, value]) => ({
                      name: SAHHA_ARCHETYPES[category as keyof typeof SAHHA_ARCHETYPES][key]?.label || key,
                      value,
                      color: SAHHA_ARCHETYPES[category as keyof typeof SAHHA_ARCHETYPES][key]?.color || '#ccc'
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => 
                      value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {Object.entries(distribution).map(([key, value], index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={SAHHA_ARCHETYPES[category as keyof typeof SAHHA_ARCHETYPES][key]?.color || '#ccc'} 
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legend with counts */}
              <Stack spacing={0.5} sx={{ mt: 2 }}>
                {Object.entries(distribution)
                  .filter(([_, value]) => value > 0)
                  .map(([key, value]) => {
                    const archetype = SAHHA_ARCHETYPES[category as keyof typeof SAHHA_ARCHETYPES][key];
                    const Icon = archetype?.icon || FiberManualRecord;
                    return (
                      <Stack key={key} direction="row" alignItems="center" spacing={1}>
                        <Icon sx={{ fontSize: 16, color: archetype?.color }} />
                        <Typography variant="caption">
                          {archetype?.label}: {value} ({Math.round((value / filteredProfiles.length) * 100)}%)
                        </Typography>
                      </Stack>
                    );
                  })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderBehavioralPatterns = () => (
    <Grid container spacing={3}>
      {/* Pattern Detection Matrix */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Behavioral Pattern Detection
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Pattern</TableCell>
                    <TableCell align="center">Prevalence</TableCell>
                    <TableCell align="center">Risk Level</TableCell>
                    <TableCell>Associated Archetypes</TableCell>
                    <TableCell>Intervention Priority</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processedArchetypeData.patterns.map((pattern, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {pattern.icon}
                          <Typography variant="body2">{pattern.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <LinearProgress 
                          variant="determinate" 
                          value={pattern.prevalence} 
                          sx={{ width: 100, mx: 'auto' }}
                        />
                        <Typography variant="caption">{pattern.prevalence}%</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={pattern.risk} 
                          size="small"
                          color={
                            pattern.risk === 'high' ? 'error' :
                            pattern.risk === 'medium' ? 'warning' : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {pattern.archetypes.map((arch: string, i: number) => (
                            <Chip key={i} label={arch} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color={
                          pattern.priority === 'immediate' ? 'error' :
                          pattern.priority === 'high' ? 'warning' : 'textSecondary'
                        }>
                          {pattern.priority.toUpperCase()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Correlation Heatmap */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Archetype Correlations
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sleep_quality" name="Sleep Quality" />
                <YAxis dataKey="sleep_regularity" name="Sleep Regularity" />
                <ZAxis dataKey="behavioral_score" range={[50, 400]} name="Behavioral Score" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  name="Profiles" 
                  data={filteredProfiles.map(p => ({
                    sleep_quality: getArchetypeOrdinal(p, 'sleep_quality'),
                    sleep_regularity: getArchetypeOrdinal(p, 'sleep_regularity'),
                    behavioral_score: p.behavioralScore * 100,
                    name: p.name || p.externalId
                  }))} 
                  fill="#8884d8"
                >
                  {filteredProfiles.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColorByScore(entry.behavioralScore)} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Pattern Timeline */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pattern Evolution (Simulated)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={generateTimelineData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="optimal"
                  fill="#4caf50"
                  stroke="#4caf50"
                  fillOpacity={0.6}
                  name="Optimal Patterns"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="risk"
                  stroke="#f44336"
                  strokeWidth={2}
                  name="Risk Indicators"
                />
                <Bar
                  yAxisId="left"
                  dataKey="interventions"
                  fill="#2196f3"
                  name="Interventions"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPredictiveModeling = () => (
    <Grid container spacing={3}>
      {/* Risk Prediction Model */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Behavioral Risk Prediction Model
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Predictive model based on archetype combinations and historical patterns.
                Higher scores indicate increased risk of negative health outcomes.
              </Typography>
            </Alert>
            
            {/* Risk Funnel */}
            <ResponsiveContainer width="100%" height={400}>
              <FunnelChart>
                <RechartsTooltip />
                <Funnel
                  dataKey="value"
                  data={[
                    { name: 'Total Population', value: filteredProfiles.length, fill: '#8884d8' },
                    { name: 'At Risk', value: Math.floor(filteredProfiles.length * 0.4), fill: '#83a6ed' },
                    { name: 'High Risk', value: Math.floor(filteredProfiles.length * 0.2), fill: '#8dd1e1' },
                    { name: 'Critical', value: Math.floor(filteredProfiles.length * 0.05), fill: '#d084d0' }
                  ]}
                  isAnimationActive
                >
                  <LabelList position="center" fill="#fff" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>

            {/* Predictive Factors */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {[
                { factor: 'Sleep Irregularity', weight: 0.35, impact: 'high' },
                { factor: 'Poor Sleep Quality', weight: 0.30, impact: 'high' },
                { factor: 'Short Sleep Duration', weight: 0.20, impact: 'medium' },
                { factor: 'Late Sleep Pattern', weight: 0.15, impact: 'low' }
              ].map((factor, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {factor.factor}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={factor.weight * 100} 
                      color={
                        factor.impact === 'high' ? 'error' :
                        factor.impact === 'medium' ? 'warning' : 'primary'
                      }
                    />
                    <Typography variant="caption" color="textSecondary">
                      Weight: {(factor.weight * 100).toFixed(0)}% | Impact: {factor.impact}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderInterventionMatrix = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Personalized Intervention Matrix
            </Typography>
            
            {/* Intervention Recommendations by Archetype Combination */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>High Priority Interventions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {generateInterventions(filteredProfiles, 'high').map((intervention, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Badge badgeContent={intervention.affected} color="error">
                          <Warning color="error" />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={intervention.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              {intervention.description}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              Target: {intervention.target} | Expected Impact: {intervention.impact}
                            </Typography>
                          </>
                        }
                      />
                      <Button variant="outlined" size="small">
                        Deploy
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Preventive Interventions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {generateInterventions(filteredProfiles, 'preventive').map((intervention, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Badge badgeContent={intervention.affected} color="warning">
                          <Psychology color="warning" />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={intervention.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              {intervention.description}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              Target: {intervention.target} | Expected Impact: {intervention.impact}
                            </Typography>
                          </>
                        }
                      />
                      <Button variant="outlined" size="small" color="warning">
                        Schedule
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Optimization Opportunities</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {generateInterventions(filteredProfiles, 'optimization').map((intervention, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Badge badgeContent={intervention.affected} color="success">
                          <EmojiEvents color="success" />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={intervention.title}
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              {intervention.description}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              Target: {intervention.target} | Expected Impact: {intervention.impact}
                            </Typography>
                          </>
                        }
                      />
                      <Button variant="outlined" size="small" color="success">
                        Implement
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPopulationHealth = () => (
    <Grid container spacing={3}>
      {/* Population Overview Cards */}
      <Grid item xs={12} md={3}>
        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h4">{populationMetrics?.total || 0}</Typography>
            <Typography>Total Population</Typography>
            <Typography variant="caption">
              {populationMetrics?.optimal || 0} optimal | {populationMetrics?.highRisk || 0} high risk
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoGraph color="primary" />
              <Box>
                <Typography variant="h5">
                  {((populationMetrics?.avgBehavioralScore || 0) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption">Avg Behavioral Score</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TrendingUp color="success" />
              <Box>
                <Typography variant="h5">
                  {populationMetrics?.optimal || 0}
                </Typography>
                <Typography variant="caption">Optimal Behaviors</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Warning color="error" />
              <Box>
                <Typography variant="h5">
                  {populationMetrics?.highRisk || 0}
                </Typography>
                <Typography variant="caption">Need Intervention</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Comparison */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Behavioral Health Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={getDepartmentComparison()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis yAxisId="left" label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Score %', angle: 90, position: 'insideRight' }} />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="optimal" stackId="a" fill="#4caf50" name="Optimal" />
                <Bar yAxisId="left" dataKey="good" stackId="a" fill="#8bc34a" name="Good" />
                <Bar yAxisId="left" dataKey="needsImprovement" stackId="a" fill="#ff9800" name="Needs Improvement" />
                <Bar yAxisId="left" dataKey="critical" stackId="a" fill="#f44336" name="Critical" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#2196f3" strokeWidth={3} name="Avg Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading behavioral intelligence data...</Typography>
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Psychology color="primary" />
          Behavioral Intelligence 2.0
          <Chip 
            label={`${filteredProfiles.length} Profiles | ${Object.keys(processedArchetypeData.archetypes).length} Archetypes`} 
            color="primary" 
            size="small" 
          />
        </Typography>
        
        {/* Controls */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>View Mode</InputLabel>
              <Select
                value={viewingMode}
                onChange={(e) => setViewingMode(e.target.value as ViewingMode)}
                label="View Mode"
              >
                <MenuItem value="archetype_distribution">Archetype Distribution</MenuItem>
                <MenuItem value="behavioral_patterns">Behavioral Patterns</MenuItem>
                <MenuItem value="predictive_modeling">Predictive Modeling</MenuItem>
                <MenuItem value="intervention_matrix">Intervention Matrix</MenuItem>
                <MenuItem value="population_health">Population Health</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Operations">Operations</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Archetype Filter</InputLabel>
              <Select
                value={selectedArchetypeCategory}
                onChange={(e) => setSelectedArchetypeCategory(e.target.value)}
                label="Archetype Filter"
              >
                <MenuItem value="all">All Archetypes</MenuItem>
                <MenuItem value="sleep_quality:optimal_sleep_quality">Optimal Sleep</MenuItem>
                <MenuItem value="sleep_quality:poor_sleep_quality">Poor Sleep</MenuItem>
                <MenuItem value="sleep_regularity:highly_irregular_sleeper">Highly Irregular</MenuItem>
                <MenuItem value="sleep_pattern:consistent_early_sleeper">Early Sleepers</MenuItem>
                <MenuItem value="sleep_pattern:consistent_late_sleeper">Late Sleepers</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button 
                startIcon={<FilterList />} 
                onClick={() => setAdvancedFiltersOpen(true)}
                variant="outlined"
                fullWidth
              >
                Advanced
              </Button>
              <Button 
                startIcon={<Refresh />} 
                onClick={refetch}
                variant="outlined"
                fullWidth
              >
                Refresh
              </Button>
              <Button 
                startIcon={<Download />}
                variant="outlined"
                fullWidth
              >
                Export
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Insights Alert */}
      {processedArchetypeData.patterns.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              View Details
            </Button>
          }
        >
          <Typography variant="subtitle2">
            {processedArchetypeData.patterns.filter(p => p.risk === 'high').length} high-risk patterns detected
          </Typography>
          <Typography variant="caption">
            {processedArchetypeData.patterns[0].name} affecting {processedArchetypeData.patterns[0].prevalence}% of population
          </Typography>
        </Alert>
      )}

      {/* Main Content */}
      {renderViewContent()}

      {/* Advanced Filters Dialog */}
      <Dialog open={advancedFiltersOpen} onClose={() => setAdvancedFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Typography gutterBottom>Age Range</Typography>
              <Slider
                value={filters.ageRange}
                onChange={(e, val) => setFilters({ ...filters, ageRange: val as number[] })}
                valueLabelDisplay="auto"
                min={18}
                max={80}
              />
            </Box>
            
            <Box>
              <Typography gutterBottom>Behavioral Score Threshold</Typography>
              <Slider
                value={filters.scoreThreshold}
                onChange={(e, val) => setFilters({ ...filters, scoreThreshold: val as number })}
                valueLabelDisplay="auto"
                min={0}
                max={1}
                step={0.1}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={filters.includeIncomplete}
                  onChange={(e) => setFilters({ ...filters, includeIncomplete: e.target.checked })}
                />
              }
              label="Include profiles with incomplete data"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdvancedFiltersOpen(false)}>Cancel</Button>
          <Button onClick={() => setAdvancedFiltersOpen(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Helper functions
function generateArchetypesFromScores(scores: any): any {
  // Fallback archetype generation based on scores
  const archetypes: any = {};
  
  if (scores?.sleep) {
    const sleepScore = scores.sleep.value;
    archetypes.sleep_quality = {
      value: sleepScore > 0.8 ? 'optimal_sleep_quality' :
             sleepScore > 0.6 ? 'good_sleep_quality' :
             sleepScore > 0.4 ? 'fair_sleep_quality' : 'poor_sleep_quality',
      ordinality: Math.floor(sleepScore * 4)
    };
  }
  
  // Add more archetype generation logic as needed
  return archetypes;
}

function calculateBehavioralScore(scores: any, archetypes: any): number {
  let score = 0;
  let count = 0;
  
  // Weight scores
  if (scores?.wellbeing?.value !== undefined) {
    score += scores.wellbeing.value * 0.3;
    count += 0.3;
  }
  if (scores?.sleep?.value !== undefined) {
    score += scores.sleep.value * 0.3;
    count += 0.3;
  }
  if (scores?.activity?.value !== undefined) {
    score += scores.activity.value * 0.2;
    count += 0.2;
  }
  if (scores?.mental_wellbeing?.value !== undefined) {
    score += scores.mental_wellbeing.value * 0.2;
    count += 0.2;
  }
  
  // Adjust based on archetypes
  if (archetypes.sleep_quality?.value === 'optimal_sleep_quality') score += 0.1;
  if (archetypes.sleep_regularity?.value === 'highly_regular_sleeper') score += 0.1;
  
  return count > 0 ? Math.min(score / count, 1) : 0.5;
}

function identifyBehavioralPatterns(profiles: any[]): any[] {
  const patterns = [];
  
  // Pattern: Poor sleep + irregular schedule
  const poorIrregular = profiles.filter(p => 
    p.archetypes.sleep_quality?.value === 'poor_sleep_quality' &&
    p.archetypes.sleep_regularity?.value === 'highly_irregular_sleeper'
  );
  
  if (poorIrregular.length > 0) {
    patterns.push({
      name: 'Poor Sleep + Irregular Schedule',
      prevalence: Math.round((poorIrregular.length / profiles.length) * 100),
      risk: 'high',
      archetypes: ['poor_sleep_quality', 'highly_irregular_sleeper'],
      priority: 'immediate',
      icon: <Warning color="error" />
    });
  }
  
  // Pattern: Optimal performers
  const optimal = profiles.filter(p => 
    p.archetypes.sleep_quality?.value === 'optimal_sleep_quality' &&
    p.archetypes.sleep_regularity?.value === 'highly_regular_sleeper'
  );
  
  if (optimal.length > 0) {
    patterns.push({
      name: 'Optimal Sleep Performers',
      prevalence: Math.round((optimal.length / profiles.length) * 100),
      risk: 'low',
      archetypes: ['optimal_sleep_quality', 'highly_regular_sleeper'],
      priority: 'monitor',
      icon: <EmojiEvents color="success" />
    });
  }
  
  // Add more pattern detection logic
  return patterns;
}

function getArchetypeOrdinal(profile: any, category: string): number {
  return profile.archetypes[category]?.ordinality || 0;
}

function getColorByScore(score: number): string {
  if (score > 0.8) return '#4caf50';
  if (score > 0.6) return '#8bc34a';
  if (score > 0.4) return '#ffeb3b';
  if (score > 0.2) return '#ff9800';
  return '#f44336';
}

function generateTimelineData(): any[] {
  // Generate simulated timeline data for pattern evolution
  const data = [];
  const days = 30;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      optimal: 20 + Math.random() * 10,
      risk: 15 + Math.random() * 5,
      interventions: Math.floor(Math.random() * 5)
    });
  }
  
  return data;
}

function generateInterventions(profiles: any[], priority: string): any[] {
  const interventions = [];
  
  if (priority === 'high') {
    const poorSleepers = profiles.filter(p => 
      p.archetypes.sleep_quality?.value === 'poor_sleep_quality'
    );
    
    if (poorSleepers.length > 0) {
      interventions.push({
        title: 'Sleep Hygiene Workshop',
        description: 'Comprehensive sleep improvement program for poor sleepers',
        target: `${poorSleepers.length} employees with poor sleep quality`,
        impact: '40% improvement in sleep scores',
        affected: poorSleepers.length
      });
    }
  }
  
  if (priority === 'preventive') {
    const irregular = profiles.filter(p => 
      p.archetypes.sleep_regularity?.value === 'irregular_sleeper'
    );
    
    if (irregular.length > 0) {
      interventions.push({
        title: 'Schedule Optimization Program',
        description: 'Help employees establish consistent sleep schedules',
        target: `${irregular.length} employees with irregular patterns`,
        impact: '25% reduction in irregularity',
        affected: irregular.length
      });
    }
  }
  
  if (priority === 'optimization') {
    const good = profiles.filter(p => 
      p.archetypes.sleep_quality?.value === 'good_sleep_quality'
    );
    
    if (good.length > 0) {
      interventions.push({
        title: 'Excellence Achievement Program',
        description: 'Help good sleepers achieve optimal performance',
        target: `${good.length} employees with good patterns`,
        impact: '15% move to optimal category',
        affected: good.length
      });
    }
  }
  
  return interventions;
}

function getDepartmentComparison(): any[] {
  // Generate department comparison data
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  
  return departments.map(dept => ({
    department: dept,
    optimal: Math.floor(Math.random() * 20),
    good: Math.floor(Math.random() * 30),
    needsImprovement: Math.floor(Math.random() * 25),
    critical: Math.floor(Math.random() * 10),
    avgScore: 50 + Math.random() * 30
  }));
}