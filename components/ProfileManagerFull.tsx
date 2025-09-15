'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Stack,
  Collapse,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  InputAdornment,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  DeviceHub as DeviceHubIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  BugReport as BugReportIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  IndeterminateCheckBox as IndeterminateCheckBoxIcon,
  Cloud as CloudRounded,
  Storage as StorageRounded,
  Webhook as WebhookIcon,
} from '@mui/icons-material';

import {
  formatScore,
  formatTimeValue,
  formatArchetype,
  mergeProfileData,
  fetchAllWebhookData,
  hasWebhookData,
  getScoreStateColor,
  getScoreStateBackground,
} from '../lib/webhook-integration';

// Profile interface matching Sahha API structure
interface Profile {
  id?: string;
  profileId: string;
  externalId: string;
  editableProfileId?: string;
  deviceType?: string;
  isSampleProfile?: boolean;
  createdDateTime?: string;
  lastDataSync?: string;
  demographics?: {
    age?: number;
    gender?: string;
  };
  scores?: {
    wellbeing?: number | null;
    activity?: number | null;
    sleep?: number | null;
    mentalWellbeing?: number | null;
    readiness?: number | null;
  };
  wellbeingScore?: number;
  activityScore?: number;
  sleepScore?: number;
  mentalWellbeingScore?: number;
  readinessScore?: number;
  subScores?: any;
  archetypes?: string[];
  departmentRank?: number;
  scoreAvailability?: {
    wellbeing: boolean;
    activity: boolean;
    sleep: boolean;
    mentalWellbeing: boolean;
    readiness: boolean;
  };
  factors?: any[];
  hasWebhookData?: boolean;
  lastWebhookUpdate?: string;
}

interface ProfileManagerProps {
  darkMode?: boolean;
}

export default function ProfileManagerFull({ darkMode = false }: ProfileManagerProps) {
  // State management
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [dataMode, setDataMode] = useState<'demo' | 'api'>('api');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [editingIds, setEditingIds] = useState<{ [key: string]: string }>({});
  const [assignments, setAssignments] = useState<{ [key: string]: string }>({});
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkDepartment, setBulkDepartment] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [webhookData, setWebhookData] = useState<Record<string, any>>({});
  const [hasWebhook, setHasWebhook] = useState(false);

  const departments = ['unassigned', 'tech', 'operations', 'sales', 'admin', 'hr', 'finance'];

  // Fetch profiles from API
  const fetchProfiles = async () => {
    setLoading(true);
    addDebugLog('info', `Fetching profiles in ${dataMode} mode...`);
    
    try {
      // First check for webhook data
      const webhookAvailable = await hasWebhookData();
      setHasWebhook(webhookAvailable);
      
      if (webhookAvailable) {
        addDebugLog('success', '✅ Webhook data available, fetching...');
        const webhooks = await fetchAllWebhookData();
        setWebhookData(webhooks);
        addDebugLog('success', `📊 Loaded webhook data for ${Object.keys(webhooks).length} profiles`);
      }
      
      if (dataMode === 'api') {
        const response = await fetch('/api/sahha/profiles?includeScores=true');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        addDebugLog('info', `API returned ${data.profiles?.length || 0} profiles`);
        
        if (data.success && data.profiles && data.profiles.length > 0) {
          // Map the API response to our format
          const mappedProfiles = data.profiles.map((p: any, idx: number) => {
            // Merge with webhook data if available
            const webhook = webhookData[p.externalId];
            const merged = webhook ? mergeProfileData(p, webhook) : p;
            
            // Check which scores are actually available
            const scoreAvailability = {
              wellbeing: merged.scores?.wellbeing !== null && merged.scores?.wellbeing !== undefined,
              activity: merged.scores?.activity !== null && merged.scores?.activity !== undefined,
              sleep: merged.scores?.sleep !== null && merged.scores?.sleep !== undefined,
              mentalWellbeing: merged.scores?.mentalWellbeing !== null && merged.scores?.mentalWellbeing !== undefined,
              readiness: merged.scores?.readiness !== null && merged.scores?.readiness !== undefined
            };
            
            // Use actual Sahha scores or null if not available
            const actualScores = {
              wellbeing: merged.scores?.wellbeing || merged.wellbeingScore || null,
              activity: merged.scores?.activity || merged.activityScore || null,
              sleep: merged.scores?.sleep || merged.sleepScore || null,
              mentalWellbeing: merged.scores?.mentalWellbeing || merged.mentalWellbeingScore || null,
              readiness: merged.scores?.readiness || merged.readinessScore || null
            };
            
            return {
            profileId: merged.profileId || merged.externalId || merged.id,
            externalId: merged.externalId,
            id: merged.profileId || merged.id,
            editableProfileId: `EMP-${String(idx + 1).padStart(3, '0')}`,
            deviceType: merged.deviceType || 'Unknown',
            isSampleProfile: merged.isSampleProfile,
            demographics: {
              age: Math.floor(Math.random() * 20) + 30, // Mock data for now
              gender: Math.random() > 0.5 ? 'Male' : 'Female',
            },
            wellbeingScore: actualScores.wellbeing,
            activityScore: actualScores.activity,
            sleepScore: actualScores.sleep,
            mentalWellbeingScore: actualScores.mentalWellbeing,
            readinessScore: actualScores.readiness,
            subScores: merged.subScores || (merged.factors ? mapFactorsToSubScores(merged.factors) : null),
            scoreAvailability,
            lastDataSync: merged.lastWebhookUpdate || merged.dataLastReceivedAtUtc || new Date().toISOString(),
            archetypes: merged.archetypes || [],
            factors: merged.factors || [], // Store raw factors for debug
            hasWebhookData: !!webhook // Track if this profile has webhook data
          };
          });
          
          // Calculate department rankings
          calculateDepartmentRankings(mappedProfiles);
          
          setProfiles(mappedProfiles);
          setLastRefresh(new Date());
          addDebugLog('success', `Loaded ${mappedProfiles.length} profiles from API`);
          
          // Initialize assignments - all start as unassigned
          const newAssignments: any = {};
          mappedProfiles.forEach((p: Profile) => {
            newAssignments[p.profileId] = 'unassigned';
          });
          setAssignments(newAssignments);
        } else {
          addDebugLog('warning', 'No profiles returned from API');
          setProfiles([]);
        }
      } else {
        // Generate demo data
        const demoProfiles = generateDemoProfiles();
        setProfiles(demoProfiles);
        setLastRefresh(new Date());
        addDebugLog('success', `Loaded ${demoProfiles.length} demo profiles`);
        setApiError(null);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Unknown error';
      addDebugLog('error', `Failed to fetch profiles: ${errorMsg}`);
      setApiError(errorMsg);
      
      // If API fails, keep existing profiles if any, otherwise show empty
      if (profiles.length === 0) {
        if (dataMode === 'demo') {
          const demoProfiles = generateDemoProfiles();
          setProfiles(demoProfiles);
        }
        // If API mode and no existing profiles, stay empty to show error
      }
      // Don't clear existing profiles on error
    } finally {
      setLoading(false);
    }
  };

  // Generate demo profiles with Sahha-compliant structure
  const generateDemoProfiles = (): Profile[] => {
    addDebugLog('info', 'Generating 57 demo profiles...');
    
    const sahhaArchetypes = [
      'activity_level', 'exercise_frequency', 'mental_wellness', 
      'overall_wellness', 'sleep_duration', 'sleep_quality', 
      'sleep_regularity', 'primary_exercise', 'sleep_pattern'
    ];
    
    const demoProfiles = Array.from({ length: 57 }, (_, i) => ({
      profileId: `demo_${i + 1}`,
      externalId: `demo_ext_${i + 1}`,
      editableProfileId: `EMP-${String(i + 1).padStart(3, '0')}`,
      deviceType: i % 3 === 0 ? 'iOS' : i % 3 === 1 ? 'Android' : undefined,
      isSampleProfile: false,
      demographics: {
        age: 25 + Math.floor(Math.random() * 30),
        gender: i % 2 === 0 ? 'Male' : 'Female',
      },
      wellbeingScore: (60 + Math.floor(Math.random() * 40)) / 100, // 0-1 scale
      activityScore: (50 + Math.floor(Math.random() * 50)) / 100,
      sleepScore: (55 + Math.floor(Math.random() * 45)) / 100,
      mentalWellbeingScore: (60 + Math.floor(Math.random() * 40)) / 100, // Correct name
      readinessScore: (65 + Math.floor(Math.random() * 35)) / 100,
      subScores: generateSubScores(`demo_${i + 1}`),
      scoreAvailability: {
        wellbeing: true,
        activity: true,
        sleep: true,
        mentalWellbeing: true, // Correct name
        readiness: true
      },
      lastDataSync: new Date().toISOString(),
      archetypes: [
        sahhaArchetypes[i % sahhaArchetypes.length],
        sahhaArchetypes[(i + 3) % sahhaArchetypes.length]
      ],
      factors: [] // Empty for demo
    }));
    
    // Calculate department rankings
    calculateDepartmentRankings(demoProfiles);
    
    // Initialize demo assignments - all start as unassigned
    const newAssignments: any = {};
    demoProfiles.forEach((p: Profile) => {
      newAssignments[p.profileId] = 'unassigned';
    });
    setAssignments(newAssignments);
    
    return demoProfiles;
  };

  // Map Sahha factors to sub-scores
  const mapFactorsToSubScores = (factors: any[]) => {
    if (!factors || factors.length === 0) return generateSubScores('');
    
    const subScores: any = {
      activity: [],
      sleep: [],
      mentalWellbeing: [],
      readiness: [],
      wellbeing: []
    };
    
    factors.forEach(factor => {
      const score = {
        name: factor.name.replace(/_/g, ' '),
        value: factor.value,
        unit: factor.unit || '',
        goal: factor.goal,
        score: Math.round(factor.score * 100),
        state: factor.state
      };
      
      // Categorize factors
      if (['steps', 'active_calories', 'active_hours', 'extended_inactivity'].includes(factor.name)) {
        subScores.activity.push(score);
      } else if (['sleep_duration', 'sleep_regularity', 'sleep_debt', 'circadian_alignment'].includes(factor.name)) {
        subScores.sleep.push(score);
      } else {
        subScores.wellbeing.push(score);
      }
    });
    
    return subScores;
  };
  
  // Generate demo sub-scores as fallback
  const generateSubScores = (profileId: string) => {
    const seed = profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seed + min + max) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    return {
      activity: [
        { name: 'steps', value: random(3000, 12000), unit: 'steps' },
        { name: 'active hours', value: random(4, 16), unit: 'hrs' },
        { name: 'active calories', value: random(200, 800), unit: 'kcal' },
        { name: 'intense activity duration', value: random(0, 120), unit: 'mins' },
        { name: 'extended inactivity', value: `${random(2, 8)} hrs ${random(0, 59)} mins`, unit: '' },
        { name: 'floors climbed', value: random(0, 30), unit: 'floors' },
      ],
      sleep: [
        { name: 'sleep duration', value: random(5, 9), unit: 'hrs' },
        { name: 'sleep regularity', value: random(60, 95), unit: '%' },
        { name: 'sleep debt', value: random(0, 180), unit: 'mins' },
        { name: 'circadian alignment', value: random(0, 4), unit: 'hrs' },
      ],
      mentalWellbeing: [
        { name: 'stress level', value: random(1, 10), unit: 'score' },
        { name: 'mood score', value: random(60, 100), unit: '%' },
        { name: 'focus time', value: random(2, 8), unit: 'hrs' },
      ],
      readiness: [
        { name: 'recovery score', value: random(50, 100), unit: '%' },
        { name: 'energy level', value: random(1, 10), unit: 'score' },
        { name: 'training readiness', value: random(60, 100), unit: '%' },
      ],
      wellbeing: [
        { name: 'overall wellness', value: random(60, 95), unit: '%' },
        { name: 'consistency', value: random(50, 90), unit: '%' },
      ],
    };
  };

  // Add debug log
  const addDebugLog = (type: string, message: string) => {
    const log = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setDebugLogs(prev => [...prev.slice(-50), log]);
  };

  // Initialize on mount and when data mode changes
  useEffect(() => {
    console.log('Effect triggered - dataMode:', dataMode);
    fetchProfiles();
  }, [dataMode]);

  // Filter profiles
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.editableProfileId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.externalId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = 
      departmentFilter === 'all' || 
      assignments[profile.profileId] === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Pagination
  const paginatedProfiles = filteredProfiles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProfiles.length === paginatedProfiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(paginatedProfiles.map(p => p.profileId));
    }
  };

  // Handle department change for individual profile
  const handleDepartmentChange = (profileId: string, department: string) => {
    setAssignments(prev => ({
      ...prev,
      [profileId]: department
    }));
    addDebugLog('info', `Changed ${profileId} to department: ${department}`);
  };

  // Handle bulk assign
  const handleBulkAssign = () => {
    const newAssignments = { ...assignments };
    selectedProfiles.forEach(id => {
      newAssignments[id] = bulkDepartment;
    });
    setAssignments(newAssignments);
    setBulkAssignOpen(false);
    setSelectedProfiles([]);
    addDebugLog('success', `Assigned ${selectedProfiles.length} profiles to ${bulkDepartment}`);
  };

  // Stats calculation
  const stats = {
    total: profiles.length,
    assigned: Object.values(assignments).filter(a => a && a !== 'unassigned').length,
    unassigned: profiles.length - Object.values(assignments).filter(a => a && a !== 'unassigned').length,
    withDevice: profiles.filter(p => p.deviceType).length,
  };
  
  // Debug: Log current state
  console.log('Current profiles:', profiles.length, 'Mode:', dataMode);

  // Score color helper with visual gradient
  const getScoreColor = (score: number | null | undefined) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };
  
  // Get score background color for visual effect
  const getScoreBackground = (score: number | null | undefined) => {
    if (!score) return 'rgba(158, 158, 158, 0.1)';
    if (score >= 80) return 'rgba(76, 175, 80, 0.1)';
    if (score >= 60) return 'rgba(255, 193, 7, 0.1)';
    return 'rgba(244, 67, 54, 0.1)';
  };
  
  // Determine archetype based on scores
  const determineArchetype = (profile: Profile): string => {
    const scores = [
      profile.wellbeingScore || 0,
      profile.activityScore || 0,
      profile.sleepScore || 0,
      profile.mentalWellbeingScore || 0,
      profile.readinessScore || 0
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (avg >= 80) return 'Peak Performer';
    if (avg >= 70) return 'Wellness Champion';
    if (avg >= 60) return 'Health Conscious';
    if (avg >= 50) return 'Moderate Wellness';
    return 'Needs Support';
  };
  
  // Calculate department rankings
  const calculateDepartmentRankings = (profiles: Profile[]) => {
    const departmentGroups: { [key: string]: Profile[] } = {};
    
    profiles.forEach(profile => {
      const dept = assignments[profile.profileId] || 'unassigned';
      if (!departmentGroups[dept]) departmentGroups[dept] = [];
      departmentGroups[dept].push(profile);
    });
    
    Object.entries(departmentGroups).forEach(([dept, deptProfiles]) => {
      deptProfiles.sort((a, b) => {
        const aScore = (a.wellbeingScore || 0) + (a.activityScore || 0) + 
                      (a.sleepScore || 0) + (a.mentalWellbeingScore || 0) + 
                      (a.readinessScore || 0);
        const bScore = (b.wellbeingScore || 0) + (b.activityScore || 0) + 
                      (b.sleepScore || 0) + (b.mentalWellbeingScore || 0) + 
                      (b.readinessScore || 0);
        return bScore - aScore;
      });
      
      deptProfiles.forEach((profile, index) => {
        profile.departmentRank = index + 1;
      });
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage employee profiles and department assignments for organizational analytics
      </Typography>
      
      {/* API Error Alert */}
      {apiError && dataMode === 'api' && profiles.length === 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => {
                setDataMode('demo');
                setApiError(null);
              }}
            >
              Use Demo Data
            </Button>
          }
        >
          <Typography variant="body2">
            Unable to fetch data from Sahha API. {apiError}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            You can use demo data to explore the dashboard functionality.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Profiles
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.6 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.assigned}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned to Departments
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.6 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.unassigned}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unassigned
                  </Typography>
                </Box>
                <PersonAddIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.6 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.withDevice}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    With Device Info
                  </Typography>
                </Box>
                <DeviceHubIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.6 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            {/* Top Controls Row */}
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack spacing={1}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Last API refresh:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Data coverage:
                  </Typography>
                  {(() => {
                    const totalScores = profiles.length * 5;
                    const availableScores = profiles.reduce((acc, p) => {
                      let count = 0;
                      if (p.wellbeingScore !== null && p.wellbeingScore !== undefined) count++;
                      if (p.activityScore !== null && p.activityScore !== undefined) count++;
                      if (p.sleepScore !== null && p.sleepScore !== undefined) count++;
                      if (p.mentalWellbeingScore !== null && p.mentalWellbeingScore !== undefined) count++;
                      if (p.readinessScore !== null && p.readinessScore !== undefined) count++;
                      return acc + count;
                    }, 0);
                    const percentage = totalScores > 0 ? Math.round((availableScores / totalScores) * 100) : 0;
                    return (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage}
                          sx={{ width: 100, height: 6 }}
                        />
                        <Typography variant="caption" fontWeight="bold">
                          {percentage}% ({availableScores}/{totalScores} scores)
                        </Typography>
                      </Stack>
                    );
                  })()}
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={dataMode === 'api' ? 'contained' : 'outlined'}
                  color={dataMode === 'api' ? 'primary' : 'inherit'}
                  startIcon={<CloudRounded />}
                  onClick={() => {
                    if (dataMode !== 'api') {
                      setProfiles([]); // Clear profiles when switching
                      setDataMode('api');
                      setApiError(null);
                    }
                  }}
                  disabled={loading}
                >
                  API Data
                </Button>
                <Button
                  size="small"
                  variant={dataMode === 'demo' ? 'contained' : 'outlined'}
                  color={dataMode === 'demo' ? 'secondary' : 'inherit'}
                  startIcon={<StorageRounded />}
                  onClick={() => {
                    if (dataMode !== 'demo') {
                      setProfiles([]); // Clear profiles when switching
                      setDataMode('demo');
                      setApiError(null);
                    }
                  }}
                  disabled={loading}
                >
                  Demo Data
                </Button>
                <Tooltip title="Toggle Debug Panel">
                  <IconButton
                    onClick={() => setShowDebug(!showDebug)}
                    color={showDebug ? 'primary' : 'inherit'}
                  >
                    <BugReportIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Search and Filter Row */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => fetchProfiles()}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
              >
                Export
              </Button>
            </Stack>

            {/* Selection Actions */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="text"
                onClick={handleSelectAll}
                startIcon={
                  selectedProfiles.length === 0 ? <CheckBoxOutlineBlankIcon /> :
                  selectedProfiles.length === paginatedProfiles.length ? <CheckBoxIcon /> :
                  <IndeterminateCheckBoxIcon />
                }
              >
                {selectedProfiles.length === paginatedProfiles.length ? 'Deselect All' : 'Select Page'}
              </Button>
              {selectedProfiles.length > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {selectedProfiles.length} selected
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setBulkAssignOpen(true)}
                  >
                    Bulk Assign
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </CardContent>

        {loading && <LinearProgress />}
      </Card>

      {/* Debug Panel */}
      <Collapse in={showDebug}>
        <Card sx={{ mb: 3, bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Debug Panel</Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: darkMode ? 'grey.800' : 'white',
              }}
            >
              {debugLogs.map((log, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    color: log.type === 'error' ? 'error.main' :
                           log.type === 'success' ? 'success.main' : 'text.secondary',
                  }}
                >
                  [{log.timestamp}] {log.message}
                </Typography>
              ))}
            </Paper>
          </CardContent>
        </Card>
      </Collapse>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedProfiles.length > 0 && 
                    selectedProfiles.length < paginatedProfiles.length
                  }
                  checked={selectedProfiles.length === paginatedProfiles.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell />
              <TableCell>Profile ID</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>External ID</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell align="center">Activity</TableCell>
              <TableCell align="center">Sleep</TableCell>
              <TableCell align="center">Mental Wellbeing</TableCell>
              <TableCell align="center">Readiness</TableCell>
              <TableCell align="center">Wellbeing</TableCell>
              <TableCell>Archetypes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProfiles.map((profile) => (
              <React.Fragment key={profile.profileId}>
                <TableRow hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedProfiles.includes(profile.profileId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProfiles([...selectedProfiles, profile.profileId]);
                        } else {
                          setSelectedProfiles(selectedProfiles.filter(id => id !== profile.profileId));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (expandedRows.includes(profile.profileId)) {
                          setExpandedRows(expandedRows.filter(id => id !== profile.profileId));
                        } else {
                          setExpandedRows([...expandedRows, profile.profileId]);
                        }
                      }}
                    >
                      {expandedRows.includes(profile.profileId) ? 
                        <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {editingIds[profile.profileId] !== undefined ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          value={editingIds[profile.profileId]}
                          onChange={(e) => setEditingIds({
                            ...editingIds,
                            [profile.profileId]: e.target.value
                          })}
                        />
                        <IconButton
                          size="small"
                          onClick={() => {
                            const updatedProfiles = profiles.map(p => 
                              p.profileId === profile.profileId 
                                ? { ...p, editableProfileId: editingIds[profile.profileId] }
                                : p
                            );
                            setProfiles(updatedProfiles);
                            const newEditingIds = { ...editingIds };
                            delete newEditingIds[profile.profileId];
                            setEditingIds(newEditingIds);
                            addDebugLog('success', `Updated profile ID to ${editingIds[profile.profileId]}`);
                          }}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const newEditingIds = { ...editingIds };
                            delete newEditingIds[profile.profileId];
                            setEditingIds(newEditingIds);
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">{profile.editableProfileId}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => setEditingIds({
                            ...editingIds,
                            [profile.profileId]: profile.editableProfileId || ''
                          })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={assignments[profile.profileId] || 'unassigned'}
                        onChange={(e) => handleDepartmentChange(profile.profileId, e.target.value)}
                        size="small"
                      >
                        {departments.map(dept => (
                          <MenuItem key={dept} value={dept}>
                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={profile.externalId}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {profile.externalId}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={profile.deviceType || 'Unknown'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {profile.demographics?.age || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {profile.demographics?.gender || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: 1,
                      bgcolor: getScoreBackground(profile.activityScore)
                    }}>
                      <Chip
                        label={formatScore(profile.activityScore)}
                        size="small"
                        color={getScoreColor(profile.activityScore !== null && profile.activityScore !== undefined ? 
                               profile.activityScore * (profile.activityScore <= 1 ? 100 : 1) : null)}
                        sx={{ fontWeight: 'bold' }}
                      />
                      {profile.scoreAvailability?.activity && (
                        <CheckBoxIcon sx={{ ml: 0.5, fontSize: 16, color: 'success.main' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: 1,
                      bgcolor: getScoreBackground(profile.sleepScore)
                    }}>
                      <Chip
                        label={formatScore(profile.sleepScore)}
                        size="small"
                        color={getScoreColor(profile.sleepScore !== null && profile.sleepScore !== undefined ? 
                               profile.sleepScore * (profile.sleepScore <= 1 ? 100 : 1) : null)}
                        sx={{ fontWeight: 'bold' }}
                      />
                      {profile.scoreAvailability?.sleep && (
                        <CheckBoxIcon sx={{ ml: 0.5, fontSize: 16, color: 'success.main' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: 1,
                      bgcolor: getScoreBackground(profile.mentalWellbeingScore)
                    }}>
                      <Chip
                        label={formatScore(profile.mentalWellbeingScore)}
                        size="small"
                        color={getScoreColor(profile.mentalWellbeingScore !== null && profile.mentalWellbeingScore !== undefined ? 
                               profile.mentalWellbeingScore * (profile.mentalWellbeingScore <= 1 ? 100 : 1) : null)}
                        sx={{ fontWeight: 'bold' }}
                      />
                      {profile.scoreAvailability?.mentalWellbeing && (
                        <CheckBoxIcon sx={{ ml: 0.5, fontSize: 16, color: 'success.main' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: 1,
                      bgcolor: getScoreBackground(profile.readinessScore)
                    }}>
                      <Chip
                        label={formatScore(profile.readinessScore)}
                        size="small"
                        color={getScoreColor(profile.readinessScore !== null && profile.readinessScore !== undefined ? 
                               profile.readinessScore * (profile.readinessScore <= 1 ? 100 : 1) : null)}
                        sx={{ fontWeight: 'bold' }}
                      />
                      {profile.scoreAvailability?.readiness && (
                        <CheckBoxIcon sx={{ ml: 0.5, fontSize: 16, color: 'success.main' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: 1,
                      bgcolor: getScoreBackground(profile.wellbeingScore)
                    }}>
                      <Chip
                        label={formatScore(profile.wellbeingScore)}
                        size="small"
                        color={getScoreColor(profile.wellbeingScore !== null && profile.wellbeingScore !== undefined ? 
                               profile.wellbeingScore * (profile.wellbeingScore <= 1 ? 100 : 1) : null)}
                        sx={{ fontWeight: 'bold' }}
                      />
                      {profile.scoreAvailability?.wellbeing && (
                        <CheckBoxIcon sx={{ ml: 0.5, fontSize: 16, color: 'success.main' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {profile.archetypes && profile.archetypes.length > 0 ? (
                      <Stack spacing={0.5}>
                        {profile.archetypes.slice(0, 2).map((archetype, idx) => (
                          <Chip
                            key={idx}
                            label={archetype.replace(/_/g, ' ')}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {profile.archetypes.length > 2 && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                            +{profile.archetypes.length - 2} more
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => setExpandedRows(
                        expandedRows.includes(profile.profileId) 
                          ? expandedRows.filter(id => id !== profile.profileId)
                          : [...expandedRows, profile.profileId]
                      )}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
                
                {/* Expanded Row with Sub-scores */}
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    <Collapse in={expandedRows.includes(profile.profileId)} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="h6" component="div">
                            Detailed Metrics
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              Last sync:
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {profile.lastDataSync ? new Date(profile.lastDataSync).toLocaleString() : 'N/A'}
                            </Typography>
                          </Stack>
                        </Stack>
                        
                        {/* Archetype Summary */}
                        <Paper sx={{ p: 2, mb: 2, bgcolor: darkMode ? 'grey.800' : 'grey.50' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" fontWeight="bold">
                              Archetypes
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              {profile.archetypes && profile.archetypes.length > 0 ? (
                                profile.archetypes.map((archetype, idx) => (
                                  <Chip
                                    key={idx}
                                    label={archetype.replace(/_/g, ' ')}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))
                              ) : (
                                <Chip 
                                  label="No archetypes available"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </Stack>
                        </Paper>
                        
                        <Grid container spacing={2}>
                          {profile.subScores && Object.entries(profile.subScores).map(([category, scores]) => (
                            <Grid item xs={12} md={6} key={category}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                      {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </Typography>
                                    {profile.scoreAvailability && (
                                      <Chip 
                                        label={profile.scoreAvailability && profile.scoreAvailability[category as keyof typeof profile.scoreAvailability] ? 'Live' : 'No data'}
                                        size="small"
                                        color={profile.scoreAvailability && profile.scoreAvailability[category as keyof typeof profile.scoreAvailability] ? 'success' : 'default'}
                                        variant="outlined"
                                      />
                                    )}
                                  </Stack>
                                  <Stack spacing={1}>
                                    {(scores as any[]).map((score, idx) => (
                                      <Stack 
                                        key={idx} 
                                        direction="row" 
                                        justifyContent="space-between"
                                        alignItems="center"
                                      >
                                        <Typography variant="caption" color="text.secondary">
                                          {score.name}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={score.value !== '--' ? 'medium' : 'normal'}>
                                          {score.value} {score.unit}
                                        </Typography>
                                      </Stack>
                                    ))}
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredProfiles.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Bulk Assignment Dialog */}
      <Dialog open={bulkAssignOpen} onClose={() => setBulkAssignOpen(false)}>
        <DialogTitle>Bulk Assign Department</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Assign {selectedProfiles.length} selected profiles to a department
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={bulkDepartment}
              onChange={(e) => setBulkDepartment(e.target.value)}
              label="Department"
            >
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAssignOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkAssign} 
            variant="contained"
            disabled={!bulkDepartment}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}