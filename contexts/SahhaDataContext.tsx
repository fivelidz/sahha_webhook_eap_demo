'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types for our data store
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
  department?: string;
  assignedDepartment?: string;
  wellbeingScore?: number;
  activityScore?: number;
  sleepScore?: number;
  mentalHealthScore?: number;
  readinessScore?: number;
  demographics?: DemographicData;
  subScores?: {
    activity?: Array<{ name: string; value: any; unit: string }>;
    sleep?: Array<{ name: string; value: any; unit: string }>;
    mentalWellbeing?: Array<{ name: string; value: any; unit: string }>;
    readiness?: Array<{ name: string; value: any; unit: string }>;
    wellbeing?: Array<{ name: string; value: any; unit: string }>;
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
  | { type: 'CLEAR_DATA' };

// Demo data generation function
const createDemoProfiles = (): Profile[] => {
  return Array.from({ length: 57 }, (_, index) => {
    const profileId = `demo_profile_${index + 1}`;
    const seed = profileId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seed + min + max) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };
    
    // Assign department based on realistic distribution - FIXED DEPARTMENTS
    let department: string;
    if (index < 20) {
      department = 'tech';
    } else if (index < 31) {
      department = 'sales';
    } else if (index < 42) {
      department = 'operations';
    } else if (index < 51) {
      department = 'admin';
    } else {
      department = 'unassigned';
    }
    
    // Debug log for first few profiles to ensure departments are set
    if (index < 3) {
      console.log(`🏢 Creating demo profile ${index + 1} with department: ${department}`);
    }
    
    // Department-specific score adjustments for realism
    let scoreAdjust = { wellbeing: 0, activity: 0, sleep: 0, mental: 0, readiness: 0 };
    switch(department) {
      case 'tech':
        scoreAdjust = { wellbeing: -5, activity: -10, sleep: -5, mental: 0, readiness: -3 };
        break;
      case 'sales':
        scoreAdjust = { wellbeing: -3, activity: 0, sleep: -10, mental: -8, readiness: -5 };
        break;
      case 'operations':
        scoreAdjust = { wellbeing: 5, activity: 10, sleep: 0, mental: 3, readiness: 5 };
        break;
      case 'admin':
        scoreAdjust = { wellbeing: 3, activity: 0, sleep: 0, mental: 0, readiness: 2 };
        break;
      case 'unassigned':
        scoreAdjust = { wellbeing: -5, activity: -5, sleep: -5, mental: -5, readiness: -5 };
        break;
    }
    
    return {
      profileId,
      externalId: `ext_${index + 1}`,
      editableProfileId: `EMP-${String(index + 1).padStart(3, '0')}`,
      deviceType: ['iOS', 'Android'][index % 2],
      isSampleProfile: true,
      department, // Set department directly
      assignedDepartment: department, // Also set assignedDepartment
      createdAtUtc: new Date(Date.now() - random(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
      wellbeingScore: Math.max(20, Math.min(100, random(30, 95) + scoreAdjust.wellbeing)),
      activityScore: Math.max(20, Math.min(100, random(25, 90) + scoreAdjust.activity)),
      sleepScore: Math.max(20, Math.min(100, random(35, 85) + scoreAdjust.sleep)),
      mentalHealthScore: Math.max(20, Math.min(100, random(40, 88) + scoreAdjust.mental)),
      readinessScore: Math.max(20, Math.min(100, random(30, 92) + scoreAdjust.readiness)),
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

// Create initial demo profiles
const initialDemoProfiles = createDemoProfiles();

// Create initial assignments based on departments
const initialAssignments = initialDemoProfiles.reduce((acc, profile) => {
  acc[profile.profileId] = profile.department || 'unassigned';
  return acc;
}, {} as { [profileId: string]: string });

// Create initial editable IDs
const initialEditableIds = initialDemoProfiles.reduce((acc, profile) => {
  acc[profile.profileId] = profile.editableProfileId || '';
  return acc;
}, {} as { [profileId: string]: string });

const initialState: SahhaDataState = {
  profiles: initialDemoProfiles,
  organizationMetrics: null,
  assignments: initialAssignments,
  editableIds: initialEditableIds,
  demographics: {},
  isLoadingProfiles: false,
  isLoadingMetrics: false,
  isLoadingDemographics: false,
  lastApiCall: null,
  orgId: 'demo_techcorp_industries',
  error: null,
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
    
    case 'CLEAR_DATA':
      return { ...initialState, orgId: state.orgId };
    
    default:
      return state;
  }
}

// Context creation
const SahhaDataContext = createContext<{
  state: SahhaDataState;
  dispatch: React.Dispatch<SahhaDataAction>;
} | null>(null);

// Provider component
export function SahhaDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sahhaDataReducer, initialState);

  // Log initialization on mount
  React.useEffect(() => {
    console.log('🚀 SahhaDataProvider initialized with demo data');
    console.log('📋 Profiles count:', state.profiles.length);
    console.log('🎯 First 5 profiles:', state.profiles.slice(0, 5).map(p => ({
      id: p.profileId,
      dept: p.department
    })));
    console.log('📦 Assignments count:', Object.keys(state.assignments).length);
    console.log('✅ Ready to use!');
  }, []); // Only log once on mount

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

// (Function moved above to be available for initial state)

// No longer needed - assignments come from profile.department field directly

// Helper hooks for common operations
export function useSahhaProfiles() {
  const { state, dispatch } = useSahhaData();

  const fetchProfiles = async (forceRefresh = false) => {
    // Don't refetch if we already have profiles and it's not a forced refresh
    if (!forceRefresh && state.profiles.length > 0) {
      console.log('📋 Using cached profile data');
      return state.profiles;
    }

    // This function is now mainly used for loading demo data as fallback
    console.log('🔄 fetchProfiles called - returning current profiles');
    return state.profiles;
  };

  const loadDemoData = () => {
    console.log('🎭 Loading demo data as fallback...');
    
    const demoProfiles = createDemoProfiles();
    
    // FORCE departments to be set correctly
    demoProfiles.forEach((profile, index) => {
      if (index < 20) {
        profile.department = 'tech';
        profile.assignedDepartment = 'tech';
      } else if (index < 31) {
        profile.department = 'sales';
        profile.assignedDepartment = 'sales';
      } else if (index < 42) {
        profile.department = 'operations';
        profile.assignedDepartment = 'operations';
      } else if (index < 51) {
        profile.department = 'admin';
        profile.assignedDepartment = 'admin';
      } else {
        profile.department = 'unassigned';
        profile.assignedDepartment = 'unassigned';
      }
    });
    
    // Log first few profiles to verify departments are set
    console.log('🔍 First 5 demo profiles with departments:', demoProfiles.slice(0, 5).map(p => ({
      profileId: p.profileId,
      department: p.department,
      assignedDepartment: p.assignedDepartment
    })));
    
    dispatch({ type: 'SET_PROFILES', payload: demoProfiles });
    
    // Create assignments that match the profile.department values
    const demoAssignments = demoProfiles.reduce((acc, profile) => {
      // Use the department already set in the profile
      acc[profile.profileId] = profile.department || 'unassigned';
      return acc;
    }, {} as { [profileId: string]: string });
    
    console.log('📝 Demo assignments:', Object.entries(demoAssignments).slice(0, 5));
    
    dispatch({ type: 'SET_ASSIGNMENTS', payload: demoAssignments });
    localStorage.setItem(`assignments_${state.orgId}`, JSON.stringify(demoAssignments));

    const initialEditableIds = demoProfiles.reduce((acc, profile) => {
      acc[profile.profileId] = profile.editableProfileId || '';
      return acc;
    }, {} as { [profileId: string]: string });
    dispatch({ type: 'SET_EDITABLE_IDS', payload: initialEditableIds });
    localStorage.setItem(`editableIds_${state.orgId}`, JSON.stringify(initialEditableIds));

    dispatch({ type: 'SET_LAST_API_CALL', payload: new Date() });
    console.log(`📋 Demo data loaded: ${demoProfiles.length} profiles with departments assigned`);
    return demoProfiles;
  };

  const updateProfileScores = (profileId: string, scores: Partial<Profile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { profileId, updates: scores } });
  };

  const updateAssignment = (profileId: string, departmentId: string) => {
    dispatch({ type: 'UPDATE_ASSIGNMENT', payload: { profileId, departmentId } });
    // Save to localStorage
    const updatedAssignments = { ...state.assignments, [profileId]: departmentId };
    localStorage.setItem(`assignments_${state.orgId}`, JSON.stringify(updatedAssignments));
  };

  const updateEditableId = (profileId: string, editableId: string) => {
    dispatch({ type: 'UPDATE_EDITABLE_ID', payload: { profileId, editableId } });
    // Save to localStorage
    const updatedEditableIds = { ...state.editableIds, [profileId]: editableId };
    localStorage.setItem(`editableIds_${state.orgId}`, JSON.stringify(updatedEditableIds));
  };

  const setProfiles = (profiles: Profile[]) => {
    console.log(`🔄 Setting ${profiles.length} profiles in context`);
    dispatch({ type: 'SET_PROFILES', payload: profiles });
    dispatch({ type: 'SET_LAST_API_CALL', payload: new Date() });
  };

  return {
    profiles: state.profiles,
    assignments: state.assignments,
    editableIds: state.editableIds,
    isLoading: state.isLoadingProfiles,
    error: state.error,
    lastApiCall: state.lastApiCall,
    fetchProfiles,
    updateProfileScores,
    updateAssignment,
    updateEditableId,
    setProfiles,
    loadDemoData,
  };
}

export function useSahhaOrganizationMetrics() {
  const { state, dispatch } = useSahhaData();

  // Calculate metrics from profiles instead of fetching
  const calculateOrganizationMetricsFromProfiles = (): OrganizationMetrics => {
    const profiles = state.profiles;
    
    // Group profiles by department
    const departmentGroups: { [dept: string]: Profile[] } = {};
    profiles.forEach(profile => {
      const dept = profile.department || 'unassigned';
      if (!departmentGroups[dept]) departmentGroups[dept] = [];
      departmentGroups[dept].push(profile);
    });

    // Calculate department metrics
    const departmentBreakdown = Object.entries(departmentGroups).map(([dept, deptProfiles]) => ({
      department: dept,
      employeeCount: deptProfiles.length,
      averageScores: {
        wellbeing: Math.round(deptProfiles.reduce((sum, p) => sum + (p.wellbeingScore || 0), 0) / deptProfiles.length),
        activity: Math.round(deptProfiles.reduce((sum, p) => sum + (p.activityScore || 0), 0) / deptProfiles.length),
        sleep: Math.round(deptProfiles.reduce((sum, p) => sum + (p.sleepScore || 0), 0) / deptProfiles.length),
        mentalWellbeing: Math.round(deptProfiles.reduce((sum, p) => sum + (p.mentalHealthScore || 0), 0) / deptProfiles.length),
        readiness: Math.round(deptProfiles.reduce((sum, p) => sum + (p.readinessScore || 0), 0) / deptProfiles.length)
      }
    }));

    // Calculate overall averages
    const totalEmployees = profiles.length;
    const averageScores = {
      wellbeing: Math.round(profiles.reduce((sum, p) => sum + (p.wellbeingScore || 0), 0) / totalEmployees),
      activity: Math.round(profiles.reduce((sum, p) => sum + (p.activityScore || 0), 0) / totalEmployees),
      sleep: Math.round(profiles.reduce((sum, p) => sum + (p.sleepScore || 0), 0) / totalEmployees),
      mentalWellbeing: Math.round(profiles.reduce((sum, p) => sum + (p.mentalHealthScore || 0), 0) / totalEmployees),
      readiness: Math.round(profiles.reduce((sum, p) => sum + (p.readinessScore || 0), 0) / totalEmployees)
    };

    // Calculate risk indicators
    const riskIndicators = [];
    const lowWellbeingCount = profiles.filter(p => (p.wellbeingScore || 0) < 40).length;
    if (lowWellbeingCount > 5) {
      riskIndicators.push({
        type: 'wellbeing',
        severity: lowWellbeingCount > 10 ? 'high' : 'medium' as 'high' | 'medium',
        affectedEmployees: lowWellbeingCount,
        description: `${lowWellbeingCount} employees with critically low wellbeing scores`
      });
    }

    return {
      totalEmployees,
      averageScores,
      departmentBreakdown,
      riskIndicators,
      lastUpdated: new Date().toISOString()
    };
  };

  const fetchOrganizationMetrics = async (dimension = 'general', forceRefresh = false) => {
    // Calculate from profiles instead of API
    const metrics = calculateOrganizationMetricsFromProfiles();
    dispatch({ type: 'SET_ORGANIZATION_METRICS', payload: metrics });
    console.log('📊 Organization metrics calculated from Profile Manager data');
    return metrics;
  };

  return {
    organizationMetrics: state.organizationMetrics || calculateOrganizationMetricsFromProfiles(),
    isLoading: state.isLoadingMetrics,
    error: state.error,
    fetchOrganizationMetrics,
  };
}// Trigger recompile Tue 16 Sep 2025 15:51:28 AEST
