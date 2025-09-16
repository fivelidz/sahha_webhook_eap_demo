import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Tooltip,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  BarChart, Bar, PieChart, Pie, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer
} from 'recharts';
import { Info } from '@mui/icons-material';

// Color palettes for different archetypes
const ARCHETYPE_COLORS: { [key: string]: string[] } = {
  activity_level: ['#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66'],
  exercise_frequency: ['#fa5252', '#fd7e14', '#fab005', '#40c057'],
  sleep_pattern: ['#e64980', '#f06595', '#d0bfff', '#9775fa'],
  mental_wellness: ['#ff8787', '#ffa94d', '#74c0fc', '#4dabf7']
};

export default function ComprehensiveArchetypeIntelligencePanel({ 
  organizationalArchetypeDistribution, 
  departmentArchetypeAnalysis, 
  archetypeDefinitions,
  profileArchetypes,
  profileAssignments,
  selectedFilters,
  onFiltersChange
}: any) {
  
  // Calculate insights from archetype data
  const calculateArchetypeInsights = () => {
    const insights: any = {};
    
    Object.entries(organizationalArchetypeDistribution).forEach(([archetypeName, distribution]: any) => {
      const total = Object.values(distribution).reduce((sum: any, count: any) => sum + count, 0) as number;
      
      // Find dominant value
      let maxCount = 0;
      let dominantValue = '';
      Object.entries(distribution).forEach(([value, count]: any) => {
        if (count > maxCount) {
          maxCount = count;
          dominantValue = value;
        }
      });
      
      insights[archetypeName] = {
        total,
        dominant: dominantValue,
        dominantPercentage: total > 0 ? Math.round((maxCount / total) * 100) : 0,
        distribution
      };
    });
    
    return insights;
  };
  
  const archetypeInsights = calculateArchetypeInsights();
  
  // Prepare data for radar chart
  const prepareRadarData = () => {
    const data: any[] = [];
    
    Object.entries(archetypeDefinitions).forEach(([archetypeName, def]: any) => {
      const insight = archetypeInsights[archetypeName];
      if (!insight) return;
      
      // Calculate health score based on archetype values
      let score = 50; // Default neutral score
      if (def.values && def.values.length > 0) {
        const valueIndex = def.values.indexOf(insight.dominant);
        score = valueIndex >= 0 ? ((valueIndex + 1) / def.values.length) * 100 : 50;
      }
      
      data.push({
        archetype: archetypeName.replace(/_/g, ' '),
        score: Math.round(score),
        fullMark: 100
      });
    });
    
    return data;
  };
  
  const radarData = prepareRadarData();
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🧬 Sahha Behavioral Intelligence System
            <Chip label={`${profileArchetypes.length} Profiles`} color="secondary" size="small" />
          </Typography>
          <Tooltip title="Behavioral archetypes provide deep insights into employee wellness patterns, activity levels, and health behaviors.">
            <IconButton size="small">
              <Info />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Grid container spacing={3}>
          {/* Archetype Distribution Cards */}
          {Object.entries(archetypeInsights).map(([archetypeName, insight]: any) => {
            const def = archetypeDefinitions[archetypeName];
            const colors = ARCHETYPE_COLORS[archetypeName] || ['#8884d8'];
            
            return (
              <Grid item xs={12} md={6} key={archetypeName}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {archetypeName.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                    {def?.description || 'Behavioral pattern analysis'}
                  </Typography>
                  
                  {/* Distribution Bar Chart */}
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={
                      Object.entries(insight.distribution).map(([value, count]: any) => ({
                        value: value.replace(/_/g, ' '),
                        count,
                        fullValue: value
                      }))
                    }>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="value" 
                        tick={{ fontSize: 10 }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill={colors[0]}>
                        {Object.entries(insight.distribution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Chip 
                      label={`Dominant: ${insight.dominant.replace(/_/g, ' ')}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="textSecondary">
                      {insight.dominantPercentage}% of population
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        
        {/* Organizational Health Radar */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Organizational Behavioral Health Profile
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="archetype" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Health Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
          <Typography variant="caption" color="textSecondary" display="block" textAlign="center" mt={2}>
            Higher scores indicate better health behaviors and wellness patterns across the organization
          </Typography>
        </Paper>
        
        {/* Department Insights */}
        {departmentArchetypeAnalysis && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Behavioral Patterns
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(departmentArchetypeAnalysis).map(([dept, analysis]: any) => {
                // Count profiles in this department
                const deptProfileCount = Object.values(profileAssignments).filter(d => d === dept).length;
                if (deptProfileCount === 0) return null;
                
                return (
                  <Grid item xs={12} md={4} key={dept}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                        {dept === 'unassigned' ? 'Unassigned' : dept}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {deptProfileCount} employees
                      </Typography>
                      
                      {/* Show dominant archetype for department */}
                      {Object.entries(analysis).map(([archetype, distribution]: any) => {
                        const values = Object.entries(distribution);
                        if (values.length === 0) return null;
                        
                        const dominant = values.reduce((max: any, [value, count]: any) => 
                          count > (max[1] || 0) ? [value, count] : max, ['', 0]);
                        
                        if (!dominant[0]) return null;
                        
                        return (
                          <Box key={archetype} mt={1}>
                            <Typography variant="caption" color="textSecondary">
                              {archetype.replace(/_/g, ' ')}:
                            </Typography>
                            <Typography variant="caption" display="block">
                              {dominant[0].replace(/_/g, ' ')}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}