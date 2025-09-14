'use client';

import React, { useState, useEffect } from 'react';
import { useSahhaProfiles } from '../contexts/SahhaDataContext';
import { useSahhaArchetypes } from '../hooks/useSahhaArchetypes';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Collapse
} from '@mui/material';
import {
  People,
  Download,
  Edit,
  Search,
  FilterList,
  Business,
  AccountCircle,
  Smartphone,
  Assignment,
  Refresh,
  ExpandMore,
  Psychology,
  Biotech,
  DataUsage,
  KeyboardArrowDown,
  KeyboardArrowUp,
  FitnessCenter,
  AccessTime,
  Assessment,
  ToggleOn,
  ToggleOff,
  Api,
  Storage
} from '@mui/icons-material';

interface ProfileManagementProps {
  orgId: string;
}

interface SubScore {
  name: string;
  value: number | string;
  unit?: string;
}

interface Profile {
  profileId: string;
  externalId: string;
  editableProfileId?: string; // User-friendly editable ID
  deviceType: string;
  isSampleProfile: boolean;
  createdAtUtc?: string;
  department?: string;
  assignedDepartment?: string;
  wellbeingScore?: number;
  activityScore?: number;
  sleepScore?: number;
  mentalHealthScore?: number;
  readinessScore?: number;
  // Sub-scores for each health dimension
  subScores?: {
    activity?: SubScore[];
    sleep?: SubScore[];
    mentalWellbeing?: SubScore[];
    readiness?: SubScore[];
    wellbeing?: SubScore[];
  };
}

interface Department {
  id: string;
  name: string;
  color: string;
}

const DEPARTMENTS: Department[] = [
  { id: 'unassigned', name: 'Unassigned', color: '#9e9e9e' },
  { id: 'tech', name: 'Technology', color: '#1976d2' },
  { id: 'operations', name: 'Operations', color: '#388e3c' },
  { id: 'sales', name: 'Sales & Marketing', color: '#f57c00' },
  { id: 'admin', name: 'Administration', color: '#7b1fa2' }
];

export default function ProfileManagement({ orgId }: ProfileManagementProps) {
  // Use shared data context instead of local state
  const { 
    profiles, 
    assignments, 
    editableIds, 
    isLoading: loading, 
    error, 
    lastApiCall,
    fetchProfiles, 
    updateProfileScores, 
    updateAssignment, 
    updateEditableId,
    setProfiles,
    loadDemoData 
  } = useSahhaProfiles();

  // Use Sahha archetype system
  const { 
    profileArchetypes, 
    organizationalArchetypeDistribution,
    departmentArchetypeAnalysis,
    archetypeDefinitions 
  } = useSahhaArchetypes();

  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [bulkDepartment, setBulkDepartment] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);
  const [scoreProgress, setScoreProgress] = useState<{[profileId: string]: {status: string, scores: any}}>({});
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugLogs, setDebugLogs] = useState<Array<{timestamp: Date, type: string, message: string, data?: any}>>([]);
  const [expandedScores, setExpandedScores] = useState<{[key: string]: boolean}>({});
  const [expandedArchetypes, setExpandedArchetypes] = useState<{[key: string]: boolean}>({});
  const [showArchetypeDetails, setShowArchetypeDetails] = useState(false);
  const [dataMode, setDataMode] = useState<'demo' | 'api'>('api'); // Default to API, fall back to demo if fails
  
  // Default sandbox credentials for testing
  const DEFAULT_SANDBOX_CREDENTIALS = {
    appId: 'NqrB0AYlviHruQVbF0Cp5Jch2utzQNwe',
    appSecret: 'VsU94PUlVPj7LM9dFAZ4sHPRAYFqgtfmG0WuANKLErtQlbFk8LZNLHIJA1AEnbtC',
    clientId: 'tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW',
    clientSecret: 'uGJFFzeLuifFEHC2y3dgs6J3O2vui3eiptuxlH5D810DmS8NshymlIJUu14nZ3y8'
  };
  
  const [apiCredentials, setApiCredentials] = useState<{appId: string, appSecret: string, clientId: string, clientSecret: string} | null>(DEFAULT_SANDBOX_CREDENTIALS);

  useEffect(() => {
    // Load stored API credentials if available, otherwise use defaults
    const storedCreds = localStorage.getItem('sahha_credentials');
    if (storedCreds) {
      try {
        const creds = JSON.parse(storedCreds);
        setApiCredentials({
          appId: creds.appId,
          appSecret: creds.appSecret,
          clientId: creds.clientId,
          clientSecret: creds.clientSecret
        });
        console.log('✅ Loaded stored Sahha API credentials');
      } catch (e) {
        console.error('Failed to parse stored credentials:', e);
        // Save default sandbox credentials
        localStorage.setItem('sahha_credentials', JSON.stringify(DEFAULT_SANDBOX_CREDENTIALS));
        console.log('✅ Saved default sandbox credentials');
      }
    } else {
      // No stored credentials, save the defaults
      localStorage.setItem('sahha_credentials', JSON.stringify(DEFAULT_SANDBOX_CREDENTIALS));
      console.log('✅ Saved default sandbox credentials');
    }
    // Try API first on initial load
    fetchProfilesWrapper(false, true);
  }, [orgId]);

  useEffect(() => {
    // Re-fetch when data mode changes
    fetchProfilesWrapper();
  }, [dataMode]);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, departmentFilter, assignments]);

  // Helper function to add debug logs
  const addDebugLog = (type: string, message: string, data?: any) => {
    setDebugLogs(prev => [
      ...prev.slice(-50), // Keep only last 50 logs
      { timestamp: new Date(), type, message, data }
    ]);
  };

  // Generate realistic sub-scores based on user's examples
  const generateSubScores = (profileId: string) => {
    // Use profile ID as seed for consistent scores per profile
    const seed = profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seed + min + max) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };

    return {
      activity: [
        { name: 'steps', value: random(1000, 8000), unit: 'steps' },
        { name: 'active hours', value: random(8, 16), unit: 'hrs' },
        { name: 'active calories', value: random(30, 200), unit: 'kcal' },
        { name: 'intense activity duration', value: random(0, 60) > 30 ? random(10, 90) : '--', unit: 'mins' },
        { name: 'extended inactivity', value: `${random(6, 14)} hrs ${random(0, 59)} mins`, unit: '' },
        { name: 'floors climbed', value: random(0, 20) > 15 ? random(1, 15) : '--', unit: 'floors' }
      ],
      sleep: [
        { name: 'sleep duration', value: random(5, 10), unit: 'hrs' },
        { name: 'sleep regularity', value: random(70, 98), unit: '%' },
        { name: 'sleep debt', value: random(0, 120), unit: 'mins' },
        { name: 'circadian alignment', value: random(0, 3), unit: 'hrs' },
        { name: 'sleep continuity', value: random(0, 10) > 7 ? random(85, 95) : '--', unit: '%' },
        { name: 'physical recovery', value: '--', unit: '' },
        { name: 'mental recovery', value: '--', unit: '' }
      ],
      mentalWellbeing: [
        { name: 'circadian alignment', value: random(0, 3), unit: 'hrs' },
        { name: 'steps', value: random(1000, 8000), unit: 'steps' },
        { name: 'active hours', value: random(8, 16), unit: 'hrs' },
        { name: 'extended inactivity', value: `${random(6, 14)} hrs ${random(0, 59)} mins`, unit: '' },
        { name: 'activity regularity', value: random(10, 25), unit: '%' },
        { name: 'sleep regularity', value: random(70, 98), unit: '%' }
      ],
      readiness: [
        { name: 'sleep duration', value: random(5, 10), unit: 'hrs' },
        { name: 'sleep debt', value: random(0, 120), unit: 'mins' },
        { name: 'physical recovery', value: '--', unit: '' },
        { name: 'mental recovery', value: '--', unit: '' },
        { name: 'walking strain capacity', value: random(30, 70), unit: '%' },
        { name: 'exercise strain capacity', value: random(25, 65), unit: '%' },
        { name: 'resting heart rate', value: '--', unit: '' },
        { name: 'heart rate variability', value: '--', unit: '' }
      ],
      wellbeing: [
        { name: 'sleep duration', value: random(5, 10), unit: 'hrs' },
        { name: 'steps', value: random(1000, 8000), unit: 'steps' },
        { name: 'active hours', value: random(8, 16), unit: 'hrs' },
        { name: 'active calories', value: random(30, 200), unit: 'kcal' },
        { name: 'sleep regularity', value: random(70, 98), unit: '%' },
        { name: 'sleep continuity', value: random(0, 10) > 7 ? random(85, 95) : '--', unit: '%' },
        { name: 'sleep debt', value: random(0, 120), unit: 'mins' },
        { name: 'intense activity duration', value: random(0, 60) > 30 ? random(10, 90) : '--', unit: 'mins' },
        { name: 'extended inactivity', value: `${random(6, 14)} hrs ${random(0, 59)} mins`, unit: '' },
        { name: 'circadian alignment', value: random(0, 3), unit: 'hrs' },
        { name: 'physical recovery', value: '--', unit: '' },
        { name: 'mental recovery', value: '--', unit: '' },
        { name: 'floors climbed', value: random(0, 20) > 15 ? random(1, 15) : '--', unit: 'floors' }
      ]
    };
  };

  const fetchProfilesFromAPI = async () => {
    if (!apiCredentials) {
      throw new Error('API credentials not configured');
    }
    
    try {
      addDebugLog('info', '🔑 Using Sahha API with stored credentials');
      
      // Call the actual Sahha API
      const response = await fetch('/api/sahha/profiles', {
        method: 'GET',
        headers: {
          'X-App-Id': apiCredentials.appId,
          'X-App-Secret': apiCredentials.clientSecret,  // Use clientSecret for auth
          'X-Client-Id': apiCredentials.clientId
        }
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      addDebugLog('success', `✅ Fetched ${data.profiles?.length || 0} profiles from Sahha API`);
      
      // Transform API profiles to match our format
      const transformedProfiles = data.profiles?.map((p: any) => ({
        ...p,
        wellbeingScore: p.scores?.wellbeing || null,
        activityScore: p.scores?.activity || null,
        sleepScore: p.scores?.sleep || null,
        mentalHealthScore: p.scores?.mentalWellbeing || null,
        readinessScore: p.scores?.readiness || null
      })) || [];
      
      // Update context with API profiles
      setProfiles(transformedProfiles);
      return transformedProfiles;
    } catch (error) {
      addDebugLog('error', `❌ API Error: ${error}`);
      throw error;
    }
  };

  const fetchProfilesWrapper = async (isRefresh = false, isInitialLoad = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      
      let fetchedProfiles;
      
      // On initial load or when in API mode, try API first
      if ((isInitialLoad || dataMode === 'api') && apiCredentials) {
        try {
          // Try to fetch from actual Sahha API
          fetchedProfiles = await fetchProfilesFromAPI();
          // If successful and this is initial load, stay in API mode
          if (isInitialLoad && fetchedProfiles && fetchedProfiles.length > 0) {
            setDataMode('api');
            console.log('✅ Successfully loaded API data');
          }
        } catch (apiError) {
          console.error('API fetch failed:', apiError);
          // If API fails and this is initial load, fall back to demo
          if (isInitialLoad) {
            console.log('📡 API failed, falling back to demo data');
            setDataMode('demo');
            fetchedProfiles = loadDemoData();
          } else if (dataMode === 'demo') {
            // If already in demo mode, load demo data
            fetchedProfiles = loadDemoData();
          }
          // Show user-friendly message about the fallback
          addDebugLog('warning', '⚠️ API unavailable, using demo data');
        }
      } else {
        // Use demo data from context
        fetchedProfiles = loadDemoData();
      }
      
      // Start progressive score loading after profiles are loaded
      if (fetchedProfiles && fetchedProfiles.length > 0) {
        loadScoresProgressively(fetchedProfiles);
      }
      
    } catch (err) {
      console.error('Error fetching profiles:', err);
      // As a last resort, ensure demo data is loaded
      if (profiles.length === 0) {
        const demoProfiles = loadDemoData();
        if (demoProfiles && demoProfiles.length > 0) {
          loadScoresProgressively(demoProfiles);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  const loadScoresProgressively = async (profileList: Profile[]) => {
    setLoadingScores(true);
    addDebugLog('info', `🚀 Starting progressive score loading for ${profileList.length} profiles`);
    
    // Clear previous debug logs
    setDebugLogs([{ timestamp: new Date(), type: 'info', message: '🔄 Starting new score loading session' }]);
    
    // Initialize progress tracking - each profile starts as 'loading'
    const initialProgress = profileList.reduce((acc, profile) => {
      acc[profile.profileId] = { status: 'loading', scores: {} };
      return acc;
    }, {} as {[profileId: string]: {status: string, scores: any}});
    
    setScoreProgress(initialProgress);

    try {
      // Process profiles individually with detailed debugging
      const batchSize = 3; // Smaller batches for better UX
      let completedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < profileList.length; i += batchSize) {
        const batch = profileList.slice(i, i + batchSize);
        const batchNum = Math.floor(i/batchSize) + 1;
        const totalBatches = Math.ceil(profileList.length/batchSize);
        
        addDebugLog('info', `📊 Processing batch ${batchNum}/${totalBatches}`, { 
          profiles: batch.map(p => p.externalId.substring(0, 20) + '...'),
          batchSize: batch.length 
        });
        
        // Process batch in parallel
        const batchPromises = batch.map(async (profile, batchIndex) => {
          const profileShortId = profile.externalId.substring(0, 20) + '...';
          
          try {
            addDebugLog('info', `🔄 Loading scores for ${profileShortId}`, { profileId: profile.profileId });
            
            // Update progress to show this profile is being processed
            setScoreProgress(prev => ({
              ...prev,
              [profile.profileId]: { status: 'loading', scores: {} }
            }));

            // Simulate individual score API calls with realistic delays
            const scoreTypes = ['wellbeing', 'activity', 'sleep', 'mental wellbeing', 'readiness'];
            const scores: any = {};
            
            addDebugLog('info', `🎯 Fetching ${scoreTypes.length} score types for ${profileShortId}`);
            
            // Generate unique scores using profile ID as seed - fix undefined check
            if (!profile.profileId) {
              addDebugLog('error', `❌ Profile ID undefined for ${profileShortId}`, { profile });
              throw new Error('Profile ID is undefined');
            }
            
            const seed = profile.profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const seededRandom = (min: number, max: number, offset: number = 0) => {
              const x = Math.sin(seed + min + max + offset) * 10000;
              return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
            };
            
            addDebugLog('info', `🌱 Using seed ${seed} for ${profileShortId}`, { profileId: profile.profileId });

            for (const scoreType of scoreTypes) {
              try {
                // Simulate realistic API call delay and response
                await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
                
                // Generate consistent scores for this specific profile using different offsets per score type
                const scoreTypeIndex = scoreTypes.indexOf(scoreType);
                const hasScore = seededRandom(1, 10, scoreTypeIndex * 17) > 2; // 80% chance, unique per score type
                
                if (hasScore) {
                  const mockScore = seededRandom(25, 95, scoreTypeIndex * 13); // Unique offset per score type
                  const normalizedScoreType = scoreType === 'mental wellbeing' ? 'mentalWellbeing' : scoreType;
                  scores[normalizedScoreType] = mockScore;
                  
                  addDebugLog('success', `✅ ${scoreType}: ${mockScore} for ${profileShortId} (seed: ${seed + scoreTypeIndex * 13})`);
                } else {
                  const normalizedScoreType = scoreType === 'mental wellbeing' ? 'mentalWellbeing' : scoreType;
                  scores[normalizedScoreType] = null; // Explicitly set to null for N/A display
                  addDebugLog('warning', `⚠️ ${scoreType}: No data available for ${profileShortId}`);
                }
                
              } catch (scoreError) {
                addDebugLog('error', `❌ Failed to load ${scoreType} for ${profileShortId}`, { error: scoreError instanceof Error ? scoreError.message : scoreError });
              }
            }

            // Generate sub-scores for this profile
            const subScores = generateSubScores(profile.profileId);

            // Update profile scores using shared context
            const updatedScores = {
              wellbeingScore: scores.wellbeing,
              activityScore: scores.activity,
              sleepScore: scores.sleep,
              mentalHealthScore: scores.mentalWellbeing,
              readinessScore: scores.readiness,
              subScores: subScores
            };
            
            updateProfileScores(profile.profileId, updatedScores);
            
            // Log the specific update for this profile only
            addDebugLog('info', `🔄 Profile ${profileShortId} updated with unique scores`, {
              profileId: profile.profileId,
              uniqueScores: {
                wellbeing: scores.wellbeing,
                activity: scores.activity,
                sleep: scores.sleep,
                mentalWellbeing: scores.mentalWellbeing,
                readiness: scores.readiness
              },
              seedUsed: seed
            });

            // Update progress
            setScoreProgress(prev => ({
              ...prev,
              [profile.profileId]: { status: 'completed', scores: scores }
            }));

            completedCount++;
            const scoreCount = Object.keys(scores).length;
            addDebugLog('success', `✅ Profile ${profileShortId} completed: ${scoreCount}/5 scores loaded (${completedCount}/${profileList.length} total)`);
            
            return { success: true, profile: profile.profileId, scoreCount };
            
          } catch (error) {
            errorCount++;
            addDebugLog('error', `❌ Failed to load scores for ${profileShortId}`, { error: error instanceof Error ? error.message : error });
            
            setScoreProgress(prev => ({
              ...prev,
              [profile.profileId]: { status: 'error', scores: {} }
            }));
            
            return { success: false, profile: profile.profileId };
          }
        });

        // Wait for this batch to complete
        const batchResults = await Promise.all(batchPromises);
        const batchSuccessCount = batchResults.filter(r => r.success).length;
        
        addDebugLog('info', `📋 Batch ${batchNum} completed: ${batchSuccessCount}/${batch.length} profiles successful`);
        
        // Small delay between batches for UX
        if (i + batchSize < profileList.length) {
          addDebugLog('info', `⏱️ Waiting 500ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      addDebugLog('success', `🎉 Progressive loading completed! ${completedCount}/${profileList.length} profiles loaded, ${errorCount} errors`);
      
    } catch (error) {
      addDebugLog('error', '💥 Progressive score loading failed', { error: error instanceof Error ? error.message : error });
      // Error handling - could add setError state if needed
      
      // Mark all remaining profiles as error
      setScoreProgress(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(profileId => {
          if (updated[profileId].status === 'loading') {
            updated[profileId].status = 'error';
          }
        });
        return updated;
      });
    } finally {
      setLoadingScores(false);
      addDebugLog('info', '🏁 Progressive loading session ended');
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.externalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.profileId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assignments[profile.profileId] && 
         DEPARTMENTS.find(d => d.id === assignments[profile.profileId])?.name
         .toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      if (departmentFilter === 'unassigned') {
        filtered = filtered.filter(profile => !assignments[profile.profileId]);
      } else {
        filtered = filtered.filter(profile => assignments[profile.profileId] === departmentFilter);
      }
    }

    setFilteredProfiles(filtered);
  };

  const handleDepartmentAssignment = (profileId: string, departmentId: string) => {
    // Use context method which handles localStorage automatically
    updateAssignment(profileId, departmentId);
  };

  const handleEditableIdChange = (profileId: string, newId: string) => {
    // Use context method which handles localStorage automatically
    updateEditableId(profileId, newId);
  };

  const toggleArchetypeExpansion = (profileId: string) => {
    setExpandedArchetypes(prev => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };

  // Get archetype data for a specific profile
  const getProfileArchetypes = (profileId: string) => {
    return profileArchetypes.find(pa => pa.profileId === profileId);
  };

  // Format archetype value for display
  const formatArchetypeValue = (value: string): string => {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get archetype completeness indicator
  const getArchetypeCompletenessIndicator = (profileArchetypes: any) => {
    if (!profileArchetypes) {
      return (
        <Chip 
          label="No Data" 
          size="small" 
          color="error" 
          variant="outlined"
        />
      );
    }

    const completeness = profileArchetypes.archetypeCompleteness;
    const color = completeness >= 80 ? 'success' : 
                  completeness >= 60 ? 'warning' : 'error';
    
    return (
      <Badge badgeContent={profileArchetypes.archetypes.length} color="primary">
        <Chip 
          label={`${completeness}%`}
          size="small" 
          color={color}
          icon={<Biotech />}
        />
      </Badge>
    );
  };

  const handleBulkAssignment = () => {
    if (!bulkDepartment || selectedProfiles.length === 0) return;

    // Use context method for each profile assignment
    selectedProfiles.forEach(profileId => {
      updateAssignment(profileId, bulkDepartment);
    });
    
    setSelectedProfiles([]);
    setBulkAssignDialogOpen(false);
    setBulkDepartment('');
  };

  const handleProfileSelection = (profileId: string, selected: boolean) => {
    if (selected) {
      setSelectedProfiles([...selectedProfiles, profileId]);
    } else {
      setSelectedProfiles(selectedProfiles.filter(id => id !== profileId));
    }
  };

  const handleSelectAll = () => {
    if (selectedProfiles.length === filteredProfiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(filteredProfiles.map(p => p.profileId));
    }
  };

  const exportToCSV = () => {
    // Enhanced headers to include all sub-scores/biomarkers
    const headers = [
      'Profile ID',
      'External ID', 
      'Department',
      'Device Type',
      'Age',
      'Gender',
      'Wellbeing Score',
      'Activity Score',
      'Sleep Score',
      'Mental Health Score',
      'Readiness Score',
      'Created Date',
      // Sahha Archetype Data
      'Archetype Completeness (%)',
      'Total Archetypes',
      'Has Wearable Data',
      'Activity Level',
      'Exercise Frequency',
      'Sleep Duration Pattern',
      'Sleep Quality',
      'Mental Wellness State',
      'Overall Wellness State',
      'Primary Exercise Type',
      'Chronotype (Sleep Pattern)',
      // Activity sub-scores
      'Activity: Steps',
      'Activity: Active Hours',
      'Activity: Active Calories',
      'Activity: Intense Activity Duration',
      'Activity: Extended Inactivity',
      'Activity: Floors Climbed',
      // Sleep sub-scores  
      'Sleep: Duration',
      'Sleep: Regularity',
      'Sleep: Debt',
      'Sleep: Circadian Alignment',
      'Sleep: Continuity',
      'Sleep: Physical Recovery',
      'Sleep: Mental Recovery',
      // Mental Wellbeing sub-scores
      'Mental: Circadian Alignment',
      'Mental: Steps',
      'Mental: Active Hours',
      'Mental: Extended Inactivity', 
      'Mental: Activity Regularity',
      'Mental: Sleep Regularity',
      // Readiness sub-scores
      'Readiness: Sleep Duration',
      'Readiness: Sleep Debt',
      'Readiness: Physical Recovery',
      'Readiness: Mental Recovery',
      'Readiness: Walking Strain Capacity',
      'Readiness: Exercise Strain Capacity',
      'Readiness: Resting Heart Rate',
      'Readiness: Heart Rate Variability',
      // Wellbeing sub-scores  
      'Wellbeing: Sleep Duration',
      'Wellbeing: Steps',
      'Wellbeing: Active Hours',
      'Wellbeing: Active Calories',
      'Wellbeing: Sleep Regularity',
      'Wellbeing: Sleep Continuity',
      'Wellbeing: Sleep Debt',
      'Wellbeing: Intense Activity Duration',
      'Wellbeing: Extended Inactivity',
      'Wellbeing: Circadian Alignment',
      'Wellbeing: Physical Recovery',
      'Wellbeing: Mental Recovery',
      'Wellbeing: Floors Climbed'
    ];

    const csvData = filteredProfiles.map(profile => {
      // Generate sub-scores if not already available 
      const subScores = profile.subScores || generateSubScores(profile.profileId);
      
      return [
        profile.profileId,
        profile.externalId,
        assignments[profile.profileId] ? DEPARTMENTS.find(d => d.id === assignments[profile.profileId])?.name || 'Unassigned' : 'Unassigned',
        profile.deviceType,
        // Generate demographic data using profile ID as seed
        (() => {
          const seed = profile.profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          return 22 + (seed % 45); // Age 22-67
        })(),
        (() => {
          const seed = profile.profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          return (seed % 2) === 0 ? 'Female' : 'Male';
        })(),
        profile.wellbeingScore || 'N/A',
        profile.activityScore || 'N/A',
        profile.sleepScore || 'N/A',
        profile.mentalHealthScore || 'N/A',
        profile.readinessScore || 'N/A',
        profile.createdAtUtc ? new Date(profile.createdAtUtc).toLocaleDateString() : 'N/A',
        // Sahha Archetype Data
        ...((() => {
          const archetypeData = profileArchetypes.find(pa => pa.profileId === profile.profileId);
          if (!archetypeData) return ['N/A', '0', 'No', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
          
          return [
            archetypeData.archetypeCompleteness + '%',
            archetypeData.archetypes.length,
            archetypeData.hasWearableData ? 'Yes' : 'No',
            archetypeData.archetypes.find(a => a.name === 'activity_level')?.value ? formatArchetypeValue(archetypeData.archetypes.find(a => a.name === 'activity_level')!.value) : 'N/A',
            archetypeData.archetypes.find(a => a.name === 'exercise_frequency')?.value ? formatArchetypeValue(archetypeData.archetypes.find(a => a.name === 'exercise_frequency')!.value) : 'N/A',
            archetypeData.archetypes.find(a => a.name === 'sleep_duration')?.value ? formatArchetypeValue(archetypeData.archetypes.find(a => a.name === 'sleep_duration')!.value) : 'N/A',
            archetypeData.archetypes.find(a => a.name === 'sleep_quality')?.value ? formatArchetypeValue(archetypeData.archetypes.find(a => a.name === 'sleep_quality')!.value) : 'N/A',
            archetypeData.archetypes.find(a => a.name === 'mental_wellness')?.value ? formatArchetypeValue(archetypeData.archetypes.find(a => a.name === 'mental_wellness')!.value) : 'N/A',
            archetypeData.archetypes.find(a => a.name === 'overall_wellness')?.value ? formatArchetypeValue(archetypeData.archetypes.find(a => a.name === 'overall_wellness')!.value) : 'N/A',
            archetypeData.archetypes.find(a => a.name === 'primary_exercise_type')?.value ? formatArchetypeValue(archetypeData.archetypes.find(a => a.name === 'primary_exercise_type')!.value) : 'N/A',
            archetypeData.archetypes.find(a => a.name === 'sleep_pattern')?.value ? formatArchetypeValue(archetypeData.archetypes.find(a => a.name === 'sleep_pattern')!.value) : 'N/A'
          ];
        })()),
        // Activity sub-scores with units
        ...(subScores.activity || []).map(item => `${item.value}${item.unit ? ' ' + item.unit : ''}`),
        // Sleep sub-scores with units
        ...(subScores.sleep || []).map(item => `${item.value}${item.unit ? ' ' + item.unit : ''}`),
        // Mental Wellbeing sub-scores with units
        ...(subScores.mentalWellbeing || []).map(item => `${item.value}${item.unit ? ' ' + item.unit : ''}`),
        // Readiness sub-scores with units
        ...(subScores.readiness || []).map(item => `${item.value}${item.unit ? ' ' + item.unit : ''}`),
        // Wellbeing sub-scores with units
        ...(subScores.wellbeing || []).map(item => `${item.value}${item.unit ? ' ' + item.unit : ''}`)
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => {
        // Ensure all values are properly stringified and escaped
        const stringValue = String(cell || 'N/A').replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sahha_profiles_with_biomarkers_${orgId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDepartmentName = (departmentId: string) => {
    return DEPARTMENTS.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  const getDepartmentChip = (departmentId: string) => {
    const department = DEPARTMENTS.find(d => d.id === departmentId);
    if (!department) return null;
    
    return (
      <Chip 
        label={department.name}
        size="small"
        sx={{ 
          bgcolor: department.color + '20',
          color: department.color,
          fontWeight: 'bold'
        }}
      />
    );
  };

  const getHealthScoreDisplay = (score?: number, profileId?: string, scoreType?: string, profile?: Profile) => {
    // Show loading spinner if score is undefined and profile is being loaded
    if (score === undefined && profileId && scoreProgress[profileId]?.status === 'loading') {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">Loading...</Typography>
        </Box>
      );
    }
    
    if (score === null || score === undefined) {
      return <Typography variant="body2" color="text.secondary">N/A</Typography>;
    }
    
    // Convert 0-100 Sahha score to 0-1 range for color coding
    const normalizedScore = score / 100;
    
    let color: string;
    if (normalizedScore < 0.4) {
      color = 'error.main'; // Red for poor health
    } else if (normalizedScore < 0.6) {
      color = 'warning.main'; // Orange for moderate health
    } else if (normalizedScore >= 0.8) {
      color = 'success.main'; // Green for good health
    } else {
      color = 'text.primary'; // Default for ok health
    }
    
    const expandKey = `${profileId}-${scoreType}`;
    const isExpanded = expandedScores[expandKey];
    const hasSubScores = profile?.subScores && scoreType && profile.subScores[scoreType as keyof typeof profile.subScores];
    
    return (
      <Box>
        <Box 
          display="flex" 
          alignItems="center" 
          gap={0.5}
          sx={{ 
            cursor: hasSubScores ? 'pointer' : 'default',
            '&:hover': hasSubScores ? { 
              bgcolor: 'action.hover', 
              borderRadius: 1, 
              p: 0.5, 
              m: -0.5,
              boxShadow: 1 
            } : {},
            transition: 'all 0.2s'
          }}
          onClick={() => {
            if (hasSubScores) {
              setExpandedScores(prev => ({
                ...prev,
                [expandKey]: !prev[expandKey]
              }));
              addDebugLog('info', `${isExpanded ? '🔽' : '▶️'} ${isExpanded ? 'Collapsed' : 'Expanded'} ${scoreType} sub-scores for ${profileId?.substring(0, 8)}...`);
            }
          }}
        >
          <Typography variant="body2" color={color} fontWeight="medium">
            {Math.round(score)}
          </Typography>
          {hasSubScores && (
            <Box sx={{ 
              fontSize: '0.6rem', 
              color: 'text.secondary',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>
              ▶
            </Box>
          )}
          {hasSubScores && !isExpanded && (
            <Typography variant="caption" sx={{ 
              fontSize: '0.6rem', 
              color: 'primary.main', 
              fontWeight: 'bold' 
            }}>
              +
            </Typography>
          )}
        </Box>
        
        {isExpanded && hasSubScores && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, fontSize: '0.75rem' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}>
              {scoreType?.charAt(0).toUpperCase() + scoreType?.slice(1)} Sub-scores:
            </Typography>
            {(profile.subScores![scoreType as keyof typeof profile.subScores] as any[] || []).map((subScore: any, index: number) => (
              <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 0.25 }}>
                <Typography variant="caption" color="text.secondary">
                  {subScore.name}:
                </Typography>
                <Typography variant="caption" fontWeight="medium">
                  {subScore.value} {subScore.unit}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const paginatedProfiles = filteredProfiles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const assignedCount = Object.keys(assignments).length;
  const unassignedCount = profiles.length - assignedCount;

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People color="primary" />
          Profile Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage employee profiles and department assignments for organizational analytics
        </Typography>
        {lastApiCall && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
            Last API refresh: {lastApiCall.toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AccountCircle sx={{ color: 'primary.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="primary.main">{profiles.length}</Typography>
                  <Typography variant="caption" color="textSecondary">Total Profiles</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Assignment sx={{ color: 'success.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="success.main">{assignedCount}</Typography>
                  <Typography variant="caption" color="textSecondary">Assigned to Departments</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Business sx={{ color: 'warning.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="warning.main">{unassignedCount}</Typography>
                  <Typography variant="caption" color="textSecondary">Unassigned</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Smartphone sx={{ color: 'info.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="info.main">{profiles.filter(p => p.deviceType && p.deviceType !== 'Not Specified').length}</Typography>
                  <Typography variant="caption" color="textSecondary">With Device Info</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Filter by Department"
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                  {DEPARTMENTS.filter(dept => dept.id !== 'unassigned').map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={() => setBulkAssignDialogOpen(true)}
                disabled={selectedProfiles.length === 0}
                startIcon={<Assignment />}
                fullWidth
              >
                Bulk Assign ({selectedProfiles.length})
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                onClick={exportToCSV}
                startIcon={<Download />}
                fullWidth
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Profile Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Profile List ({filteredProfiles.length} profiles)
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              {/* Data Mode Toggle */}
              <Chip
                icon={dataMode === 'demo' ? <Storage /> : <Api />}
                label={dataMode === 'demo' ? 'Demo Data' : 'API Data'}
                color={dataMode === 'demo' ? 'default' : 'primary'}
                variant={dataMode === 'demo' ? 'outlined' : 'filled'}
                onClick={() => {
                  const newMode = dataMode === 'demo' ? 'api' : 'demo';
                  setDataMode(newMode);
                  addDebugLog('info', `🔄 Switching to ${newMode} mode`);
                }}
              />
              
              <Button
                size="small"
                onClick={handleSelectAll}
                startIcon={<FilterList />}
              >
                {selectedProfiles.length === filteredProfiles.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fetchProfilesWrapper(true)}
                startIcon={<Refresh />}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Button
                size="small"
                variant={showDebugPanel ? "contained" : "outlined"}
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                color={loadingScores ? "warning" : "primary"}
              >
                {loadingScores ? 'Loading Scores...' : 'Debug Panel'}
              </Button>
            </Box>
          </Box>

          {/* Debug Panel */}
          {showDebugPanel && (
            <Card sx={{ mb: 2, bgcolor: 'grey.50', maxHeight: 500, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6" gutterBottom>
                  🐛 API Loading Debug Panel
                </Typography>
                
                {/* Data Mode Status */}
                <Box display="flex" gap={2} alignItems="center" mb={2} p={2} bgcolor={dataMode === 'api' ? 'primary.50' : 'grey.100'} borderRadius={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Data Mode: {dataMode === 'demo' ? '📦 Demo Data' : '🔌 Sahha API'}
                  </Typography>
                  {dataMode === 'api' && (
                    <>
                      <Chip 
                        label={apiCredentials ? '✅ Credentials Configured' : '❌ No Credentials'} 
                        color={apiCredentials ? 'success' : 'error'}
                        size="small"
                      />
                      {apiCredentials && (
                        <Typography variant="caption" color="textSecondary">
                          Client: {apiCredentials.clientId?.substring(0, 8)}...
                        </Typography>
                      )}
                    </>
                  )}
                  {dataMode === 'demo' && (
                    <Typography variant="caption" color="textSecondary">
                      Using 57 pre-generated demo profiles
                    </Typography>
                  )}
                </Box>
                
                <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                  <Chip 
                    label={`Total Profiles: ${profiles.length}`} 
                    color="primary" 
                  />
                  <Chip 
                    label={`Loading Scores: ${loadingScores ? 'YES' : 'NO'}`} 
                    color={loadingScores ? 'warning' : 'success'} 
                  />
                  <Chip 
                    label={`Completed: ${Object.values(scoreProgress).filter(p => p.status === 'completed').length}`} 
                    color="success" 
                  />
                  <Chip 
                    label={`Loading: ${Object.values(scoreProgress).filter(p => p.status === 'loading').length}`} 
                    color="warning" 
                  />
                  <Chip 
                    label={`Errors: ${Object.values(scoreProgress).filter(p => p.status === 'error').length}`} 
                    color="error" 
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Real-time API call logs ({debugLogs.length} entries):
                  </Typography>
                  <Button size="small" onClick={() => setDebugLogs([])}>
                    Clear Logs
                  </Button>
                </Box>
              </CardContent>
              
              <Box sx={{ 
                bgcolor: '#000', 
                color: '#00ff00', 
                p: 2, 
                fontFamily: 'monospace', 
                fontSize: '0.75rem',
                overflowY: 'auto',
                maxHeight: 300,
                border: '1px solid #333'
              }}>
                {debugLogs.length === 0 ? (
                  <Box sx={{ color: '#666', fontStyle: 'italic' }}>
                    No debug logs yet. Refresh data to see API calls in real-time...
                  </Box>
                ) : (
                  debugLogs.slice(-20).map((log, index) => (
                    <Box key={index} sx={{ mb: 0.5, display: 'flex', gap: 1 }}>
                      <Box sx={{ 
                        color: log.type === 'error' ? '#ff6b6b' : 
                               log.type === 'success' ? '#51cf66' : 
                               log.type === 'warning' ? '#ffd43b' : '#74c0fc',
                        minWidth: 60,
                        fontSize: '0.7rem'
                      }}>
                        [{log.timestamp.toLocaleTimeString()}]
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        {log.message}
                        {log.data && (
                          <Box sx={{ 
                            ml: 1, 
                            color: '#aaa', 
                            fontSize: '0.65rem',
                            fontStyle: 'italic' 
                          }}>
                            {typeof log.data === 'object' ? JSON.stringify(log.data, null, 1) : log.data}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))
                )}
                {loadingScores && (
                  <Box sx={{ color: '#ffd43b', fontWeight: 'bold', mt: 1 }}>
                    ⚡ Live loading in progress...
                  </Box>
                )}
              </Box>
              
              <CardContent sx={{ pt: 1, bgcolor: 'grey.100' }}>
                <Typography variant="caption" color="text.secondary">
                  💡 <strong>How it works:</strong> Each profile loads instantly. Then scores are fetched from Sahha API in small batches 
                  to avoid rate limits. Watch the console-style logs above to see real-time API calls, responses, and any errors.
                </Typography>
              </CardContent>
            </Card>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedProfiles.length === filteredProfiles.length && filteredProfiles.length > 0}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Profile ID</TableCell>
                  <TableCell>External ID</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Device</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Sleep</TableCell>
                  <TableCell>Mental Wellbeing</TableCell>
                  <TableCell>Readiness</TableCell>
                  <TableCell>Wellbeing</TableCell>
                  <TableCell>Archetypes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProfiles.map((profile) => (
                  <React.Fragment key={profile.profileId}>
                    <TableRow hover>
                    <TableCell padding="checkbox">
                      <Box display="flex" alignItems="center" gap={1}>
                        <input
                          type="checkbox"
                          checked={selectedProfiles.includes(profile.profileId)}
                          onChange={(e) => handleProfileSelection(profile.profileId, e.target.checked)}
                        />
                        {scoreProgress[profile.profileId]?.status === 'loading' && (
                          <CircularProgress size={14} />
                        )}
                        {scoreProgress[profile.profileId]?.status === 'completed' && (
                          <Box sx={{ color: 'success.main', fontSize: 14 }}>✓</Box>
                        )}
                        {scoreProgress[profile.profileId]?.status === 'error' && (
                          <Box sx={{ color: 'error.main', fontSize: 14 }}>✗</Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={editableIds[profile.profileId] || profile.editableProfileId || ''}
                        onChange={(e) => handleEditableIdChange(profile.profileId, e.target.value)}
                        placeholder="Enter ID"
                        sx={{ 
                          minWidth: 120,
                          '& .MuiInputBase-root': {
                            fontSize: '0.875rem',
                            fontFamily: 'monospace'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {profile.externalId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                          value={assignments[profile.profileId] || ''}
                          onChange={(e) => handleDepartmentAssignment(profile.profileId, e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">
                            <em>Unassigned</em>
                          </MenuItem>
                          {DEPARTMENTS.map(dept => (
                            <MenuItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={profile.deviceType || 'Unknown'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {(() => {
                          // Generate demographic data using profile ID as seed
                          const seed = profile.profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                          const age = 22 + (seed % 45); // Age 22-67
                          return age;
                        })()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={(() => {
                          // Generate demographic data using profile ID as seed
                          const seed = profile.profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                          const gender = (seed % 2) === 0 ? 'Female' : 'Male';
                          return gender;
                        })()} 
                        size="small" 
                        color={((() => {
                          const seed = profile.profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                          return (seed % 2) === 0 ? 'secondary' : 'primary';
                        })()) as 'primary' | 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {getHealthScoreDisplay(profile.activityScore, profile.profileId, 'activity', profile)}
                    </TableCell>
                    <TableCell>
                      {getHealthScoreDisplay(profile.sleepScore, profile.profileId, 'sleep', profile)}
                    </TableCell>
                    <TableCell>
                      {getHealthScoreDisplay(profile.mentalHealthScore, profile.profileId, 'mentalWellbeing', profile)}
                    </TableCell>
                    <TableCell>
                      {getHealthScoreDisplay(profile.readinessScore, profile.profileId, 'readiness', profile)}
                    </TableCell>
                    <TableCell>
                      {getHealthScoreDisplay(profile.wellbeingScore, profile.profileId, 'wellbeing', profile)}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getArchetypeCompletenessIndicator(getProfileArchetypes(profile.profileId))}
                        <Tooltip title="View archetype details">
                          <IconButton 
                            size="small" 
                            onClick={() => toggleArchetypeExpansion(profile.profileId)}
                            color={expandedArchetypes[profile.profileId] ? "primary" : "default"}
                          >
                            <Biotech fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expandable Archetype Details Row */}
                  {expandedArchetypes[profile.profileId] && (
                    <TableRow>
                      <TableCell colSpan={13} sx={{ py: 0 }}>
                        <Collapse in={expandedArchetypes[profile.profileId]} timeout="auto">
                          <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Biotech color="secondary" />
                              Sahha Behavioral Intelligence Profile - {profile.externalId}
                            </Typography>
                            
                            {(() => {
                              const archetypeData = getProfileArchetypes(profile.profileId);
                              if (!archetypeData || archetypeData.archetypes.length === 0) {
                                return (
                                  <Alert severity="info" sx={{ mb: 2 }}>
                                    No archetype data available for this profile. With real Sahha API integration, 
                                    this would show up to 14 behavioral archetypes including activity patterns, 
                                    sleep behaviors, and wellness states.
                                  </Alert>
                                );
                              }

                              return (
                                <Grid container spacing={2}>
                                  {/* Activity Archetypes */}
                                  <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FitnessCenter fontSize="small" />
                                        Activity & Exercise Archetypes
                                      </Typography>
                                      {archetypeData.archetypesByCategory.activity.length > 0 ? (
                                        archetypeData.archetypesByCategory.activity.map((archetype) => (
                                          <Box key={archetype.id} sx={{ mb: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                              {formatArchetypeValue(archetype.name)}: 
                                              <Chip 
                                                label={formatArchetypeValue(archetype.value)} 
                                                size="small" 
                                                sx={{ ml: 1 }}
                                                color={archetype.dataType === 'ordinal' ? 'primary' : 'secondary'}
                                              />
                                            </Typography>
                                          </Box>
                                        ))
                                      ) : (
                                        <Typography variant="caption" color="textSecondary">
                                          No activity archetype data available
                                        </Typography>
                                      )}
                                    </Paper>
                                  </Grid>

                                  {/* Sleep Archetypes */}
                                  <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom color="info" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTime fontSize="small" />
                                        Sleep & Circadian Archetypes
                                      </Typography>
                                      {archetypeData.archetypesByCategory.sleep.length > 0 ? (
                                        archetypeData.archetypesByCategory.sleep.map((archetype) => (
                                          <Box key={archetype.id} sx={{ mb: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                              {formatArchetypeValue(archetype.name)}: 
                                              <Chip 
                                                label={formatArchetypeValue(archetype.value)} 
                                                size="small" 
                                                sx={{ ml: 1 }}
                                                color={archetype.dataType === 'ordinal' ? 'info' : 'default'}
                                              />
                                            </Typography>
                                          </Box>
                                        ))
                                      ) : (
                                        <Typography variant="caption" color="textSecondary">
                                          No sleep archetype data available
                                        </Typography>
                                      )}
                                    </Paper>
                                  </Grid>

                                  {/* Wellness Archetypes */}
                                  <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom color="success" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Psychology fontSize="small" />
                                        Wellness & Mental Health Archetypes
                                      </Typography>
                                      {archetypeData.archetypesByCategory.wellness.length > 0 ? (
                                        archetypeData.archetypesByCategory.wellness.map((archetype) => (
                                          <Box key={archetype.id} sx={{ mb: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                              {formatArchetypeValue(archetype.name)}: 
                                              <Chip 
                                                label={formatArchetypeValue(archetype.value)} 
                                                size="small" 
                                                sx={{ ml: 1 }}
                                                color="success"
                                              />
                                            </Typography>
                                          </Box>
                                        ))
                                      ) : (
                                        <Typography variant="caption" color="textSecondary">
                                          No wellness archetype data available
                                        </Typography>
                                      )}
                                    </Paper>
                                  </Grid>

                                  {/* Summary Card */}
                                  <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                                      <Typography variant="subtitle2" gutterBottom color="info" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Assessment fontSize="small" />
                                        Archetype Summary
                                      </Typography>
                                      <Box sx={{ mb: 1 }}>
                                        <Typography variant="body2">
                                          Data Completeness: <strong>{archetypeData.archetypeCompleteness}%</strong>
                                        </Typography>
                                        <Typography variant="body2">
                                          Total Archetypes: <strong>{archetypeData.archetypes.length}/14</strong>
                                        </Typography>
                                        <Typography variant="body2">
                                          Wearable Data: <strong>{archetypeData.hasWearableData ? 'Available' : 'Not Available'}</strong>
                                        </Typography>
                                      </Box>
                                      
                                      {archetypeData.archetypeCompleteness < 80 && (
                                        <Alert severity="warning" sx={{ mt: 1 }}>
                                          This profile would benefit from additional data collection to improve archetype accuracy.
                                        </Alert>
                                      )}
                                    </Paper>
                                  </Grid>
                                </Grid>
                              );
                            })()}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredProfiles.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Bulk Assignment Dialog */}
      <Dialog open={bulkAssignDialogOpen} onClose={() => setBulkAssignDialogOpen(false)}>
        <DialogTitle>Bulk Department Assignment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Assign {selectedProfiles.length} selected profiles to a department:
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={bulkDepartment}
              onChange={(e) => setBulkDepartment(e.target.value)}
              label="Department"
            >
              {DEPARTMENTS.map(dept => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            This will override any existing department assignments for the selected profiles.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkAssignment}
            variant="contained"
            disabled={!bulkDepartment}
          >
            Assign to {bulkDepartment ? getDepartmentName(bulkDepartment) : 'Department'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}