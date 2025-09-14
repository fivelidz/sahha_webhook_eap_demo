'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// [Keep all the existing interfaces - they're fine]
export interface DemographicData {
  profileId: string;
  externalId: string;
  age?: number;
  gender?: string;
  dateOfBirth?: string;
}

export interface Profile {
  profileId: string;
  externalId: string;
  editableProfileId?: string;
  deviceType: string;
  isSampleProfile: boolean;
  createdAtUtc?: string;
  wellbeingScore?: number;
  activityScore?: number;
  sleepScore?: number;
  mentalHealthScore?: number;
  readinessScore?: number;
  demographics?: DemographicData;
  subScores?: {
    activity: Array<{ name: string; value: any; unit: string }>;
    sleep: Array<{ name: string; value: any; unit: string }>;
    mentalWellbeing: Array<{ name: string; value: any; unit: string }>;
    readiness: Array<{ name: string; value: any; unit: string }>;
    wellbeing: Array<{ name: string; value: any; unit: string }>;
  };
}

export interface OrganizationMetrics {
  totalEmployees: number;
  averageScores: {
    wellbeing: number;
    activity: number;
    sleep: number;
    mentalWellbeing: number;
    readiness: number;
  };
  departmentBreakdown: Array<{
    department: string;
    employeeCount: number;
    averageScores: {
      wellbeing: number;
      activity: number;
      sleep: number;
      mentalWellbeing: number;
      readiness: number;
    };
  }>;
  riskIndicators: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedEmployees: number;
    description: string;
  }>;
  lastUpdated: string;
}

interface SahhaDataState {
  profiles: Profile[];
  organizationMetrics: OrganizationMetrics | null;
  assignments: { [profileId: string]: string };
  editableIds: { [profileId: string]: string };
  demographics: { [profileId: string]: DemographicData };
  isLoadingProfiles: boolean;
  isLoadingMetrics: boolean;
  isLoadingDemographics: boolean;
  lastApiCall: Date | null;
  orgId: string;
  error: string | null;
  dataMode: 'demo' | 'api'; // Add this to track mode
}

// Action types
type SahhaDataAction =
  | { type: 'SET_PROFILES'; payload: Profile[] }
  | { type: 'UPDATE_PROFILE'; payload: { profileId: string; updates: Partial<Profile> } }
  | { type: 'SET_ORGANIZATION_METRICS'; payload: OrganizationMetrics }
  | { type: 'SET_ASSIGNMENTS'; payload: { [profileId: string]: string } }
  | { type: 'UPDATE_ASSIGNMENT'; payload: { profileId: string; departmentId: string } }
  | { type: 'SET_EDITABLE_IDS'; payload: { [profileId: string]: string } }
  | { type: 'SET_DEMOGRAPHICS'; payload: { [profileId: string]: DemographicData } }
  | { type: 'SET_LOADING_DEMOGRAPHICS'; payload: boolean }
  | { type: 'UPDATE_EDITABLE_ID'; payload: { profileId: string; editableId: string } }
  | { type: 'SET_LOADING_PROFILES'; payload: boolean }
  | { type: 'SET_LOADING_METRICS'; payload: boolean }
  | { type: 'SET_LAST_API_CALL'; payload: Date }
  | { type: 'SET_ORG_ID'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA_MODE'; payload: 'demo' | 'api' }
  | { type: 'CLEAR_DATA' };

const initialState: SahhaDataState = {
  profiles: [],
  organizationMetrics: null,
  assignments: {},
  editableIds: {},
  demographics: {},
  isLoadingProfiles: false,
  isLoadingMetrics: false,
  isLoadingDemographics: false,
  lastApiCall: null,
  orgId: 'demo_techcorp_industries',
  error: null,
  dataMode: 'demo', // Start in demo mode by default
};

function sahhaDataReducer(state: SahhaDataState, action: SahhaDataAction): SahhaDataState {
  switch (action.type) {
    case 'SET_PROFILES':
      return { ...state, profiles: action.payload, isLoadingProfiles: false };
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.map(profile =>
          profile.profileId === action.payload.profileId
            ? { ...profile, ...action.payload.updates }
            : profile
        ),
      };
    
    case 'SET_ORGANIZATION_METRICS':
      return { ...state, organizationMetrics: action.payload, isLoadingMetrics: false };
    
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };
    
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: {
          ...state.assignments,
          [action.payload.profileId]: action.payload.departmentId,
        },
      };
    
    case 'SET_EDITABLE_IDS':
      return { ...state, editableIds: action.payload };
    
    case 'UPDATE_EDITABLE_ID':
      return {
        ...state,
        editableIds: {
          ...state.editableIds,
          [action.payload.profileId]: action.payload.editableId,
        },
      };
    
    case 'SET_LOADING_PROFILES':
      return { ...state, isLoadingProfiles: action.payload };
    
    case 'SET_LOADING_METRICS':
      return { ...state, isLoadingMetrics: action.payload };
    
    case 'SET_LAST_API_CALL':
      return { ...state, lastApiCall: action.payload };
    
    case 'SET_ORG_ID':
      return { ...state, orgId: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoadingProfiles: false, isLoadingMetrics: false };
    
    case 'SET_DATA_MODE':
      return { ...state, dataMode: action.payload };
    
    case 'CLEAR_DATA':
      return { ...initialState, orgId: state.orgId, dataMode: state.dataMode };
    
    default:
      return state;
  }
}

// Context creation
const SahhaDataContext = createContext<{
  state: SahhaDataState;
  dispatch: React.Dispatch<SahhaDataAction>;
} | null>(null);

// Provider component - FIXED VERSION
export function SahhaDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sahhaDataReducer, initialState);
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Only initialize demo data if we're in demo mode and haven't initialized yet
  React.useEffect(() => {
    // Check localStorage for saved mode preference
    const savedMode = localStorage.getItem('sahha_data_mode');
    
    if (savedMode === 'api') {
      // If user previously selected API mode, don't load demo data
      dispatch({ type: 'SET_DATA_MODE', payload: 'api' });
      console.log('📡 Starting in API mode (user preference)');
    } else if (!hasInitialized && state.dataMode === 'demo') {
      // Only initialize demo data once, and only if in demo mode
      console.log('🚀 SahhaDataProvider initializing with demo data...');
      
      const demoProfiles = createDemoProfiles();
      dispatch({ type: 'SET_PROFILES', payload: demoProfiles });
      
      const demoAssignments = createDemoAssignments(demoProfiles);
      dispatch({ type: 'SET_ASSIGNMENTS', payload: demoAssignments });
      
      const initialEditableIds = demoProfiles.reduce((acc, profile) => {
        acc[profile.profileId] = profile.editableProfileId || '';
        return acc;
      }, {} as { [profileId: string]: string });
      dispatch({ type: 'SET_EDITABLE_IDS', payload: initialEditableIds });
      
      dispatch({ type: 'SET_LAST_API_CALL', payload: new Date() });
      console.log(`📋 Demo data initialized: ${demoProfiles.length} profiles`);
      
      setHasInitialized(true);
    }
  }, [hasInitialized, state.dataMode]);

  return (
    <SahhaDataContext.Provider value={{ state, dispatch }}>
      {children}
    </SahhaDataContext.Provider>
  );
}

// Custom hook to use the context
export function useSahhaData() {
  const context = useContext(SahhaDataContext);
  if (!context) {
    throw new Error('useSahhaData must be used within a SahhaDataProvider');
  }
  return context;
}

// Demo data generation functions (keep these the same)
const createDemoProfiles = (): Profile[] => {
  return Array.from({ length: 57 }, (_, index) => {
    const profileId = `demo_profile_${index + 1}`;
    const seed = profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seed + min + max) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };
    
    return {
      profileId,
      externalId: `ext_${index + 1}`,
      editableProfileId: `EMP-${String(index + 1).padStart(3, '0')}`,
      deviceType: ['iOS', 'Android'][index % 2],
      isSampleProfile: true,
      createdAtUtc: new Date(Date.now() - random(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
      wellbeingScore: random(30, 95),
      activityScore: random(25, 90),
      sleepScore: random(35, 85),
      mentalHealthScore: random(40, 88),
      readinessScore: random(30, 92),
      subScores: {
        activity: [
          { name: 'steps', value: random(1000, 8000), unit: 'steps' },
          { name: 'active_hours', value: random(4, 12), unit: 'hrs' },
          { name: 'extended_inactivity', value: random(8, 16), unit: 'hrs' },
          { name: 'activity_regularity', value: random(15, 90), unit: '%' }
        ],
        sleep: [
          { name: 'sleep_duration', value: random(5.5, 9.5), unit: 'hrs' },
          { name: 'sleep_regularity', value: random(60, 95), unit: '%' },
          { name: 'sleep_debt', value: random(0, 120), unit: 'mins' },
          { name: 'circadian_alignment', value: random(1, 5), unit: 'hrs' }
        ],
        mentalWellbeing: [
          { name: 'circadian_alignment', value: random(1, 5), unit: 'hrs' },
          { name: 'steps', value: random(1000, 8000), unit: 'steps' },
          { name: 'active_hours', value: random(4, 12), unit: 'hrs' },
          { name: 'extended_inactivity', value: random(8, 16), unit: 'hrs' },
          { name: 'activity_regularity', value: random(15, 90), unit: '%' },
          { name: 'sleep_regularity', value: random(60, 95), unit: '%' }
        ],
        readiness: [
          { name: 'sleep_debt', value: random(0, 120), unit: 'mins' },
          { name: 'activity_balance', value: random(60, 95), unit: '%' },
          { name: 'recovery_index', value: random(50, 90), unit: 'score' }
        ],
        wellbeing: [
          { name: 'overall_wellness', value: random(30, 95), unit: 'score' },
          { name: 'life_satisfaction', value: random(40, 85), unit: 'score' }
        ]
      }
    };
  });
};

const createDemoAssignments = (profiles: Profile[]): { [profileId: string]: string } => {
  return profiles.reduce((acc, profile, index) => {
    const deptIndex = index % 4;
    const departments = ['tech', 'operations', 'sales', 'admin'];
    acc[profile.profileId] = departments[deptIndex];
    return acc;
  }, {} as { [profileId: string]: string });
};

// Helper hooks - UPDATED VERSION
export function useSahhaProfiles() {
  const { state, dispatch } = useSahhaData();

  const setProfiles = (profiles: Profile[]) => {
    console.log('🔄 Setting profiles in context:', profiles.length);
    dispatch({ type: 'SET_PROFILES', payload: profiles });
    dispatch({ type: 'SET_LAST_API_CALL', payload: new Date() });
    
    // If we're setting API profiles, update the mode
    if (profiles.length > 0 && profiles[0].externalId?.includes('SampleProfile')) {
      dispatch({ type: 'SET_DATA_MODE', payload: 'api' });
      localStorage.setItem('sahha_data_mode', 'api');
    }
  };

  const fetchProfiles = async (forceRefresh = false) => {
    // Don't auto-fetch in API mode - let ProfileManagement handle it
    if (state.dataMode === 'api') {
      console.log('📡 In API mode - profiles should be fetched by ProfileManagement');
      return state.profiles;
    }

    // Only load demo data if in demo mode
    if (state.dataMode === 'demo' && (forceRefresh || state.profiles.length === 0)) {
      console.log('🎭 Loading demo profiles');
      const demoProfiles = createDemoProfiles();
      dispatch({ type: 'SET_PROFILES', payload: demoProfiles });
      
      const demoAssignments = createDemoAssignments(demoProfiles);
      dispatch({ type: 'SET_ASSIGNMENTS', payload: demoAssignments });
      
      return demoProfiles;
    }

    return state.profiles;
  };

  const updateProfileScores = (profileId: string, scores: Partial<Profile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { profileId, updates: scores } });
  };

  const updateAssignment = (profileId: string, departmentId: string) => {
    dispatch({ type: 'UPDATE_ASSIGNMENT', payload: { profileId, departmentId } });
    const updatedAssignments = { ...state.assignments, [profileId]: departmentId };
    localStorage.setItem(`assignments_${state.orgId}`, JSON.stringify(updatedAssignments));
  };

  const updateEditableId = (profileId: string, editableId: string) => {
    dispatch({ type: 'UPDATE_EDITABLE_ID', payload: { profileId, editableId } });
    const updatedEditableIds = { ...state.editableIds, [profileId]: editableId };
    localStorage.setItem(`editableIds_${state.orgId}`, JSON.stringify(updatedEditableIds));
  };

  return {
    profiles: state.profiles,
    assignments: state.assignments,
    editableIds: state.editableIds,
    isLoading: state.isLoadingProfiles,
    error: state.error,
    lastApiCall: state.lastApiCall,
    dataMode: state.dataMode,
    fetchProfiles,
    updateProfileScores,
    updateAssignment,
    updateEditableId,
    setProfiles,
  };
}

export function useSahhaOrganizationMetrics() {
  const { state, dispatch } = useSahhaData();

  const fetchOrganizationMetrics = async (dimension = 'general', forceRefresh = false) => {
    if (!forceRefresh && state.organizationMetrics && Date.now() - new Date(state.organizationMetrics.lastUpdated).getTime() < 5 * 60 * 1000) {
      console.log('📊 Using cached organization metrics');
      return state.organizationMetrics;
    }

    dispatch({ type: 'SET_LOADING_METRICS', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`/api/sahha/organization-metrics?orgId=${state.orgId}&dimension=${dimension}`);
      const result = await response.json();

      if (result.success) {
        const metrics: OrganizationMetrics = result.data;
        dispatch({ type: 'SET_ORGANIZATION_METRICS', payload: metrics });
        console.log('📊 Organization metrics loaded');
        return metrics;
      } else {
        throw new Error(result.error || 'Failed to fetch organization metrics');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  return {
    organizationMetrics: state.organizationMetrics,
    isLoading: state.isLoadingMetrics,
    error: state.error,
    fetchOrganizationMetrics,
  };
}