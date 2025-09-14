// Sahha Type Definitions for EAP Dashboard

export interface SahhaCredentials {
  appId: string;
  appSecret: string;
  clientId: string;
  clientSecret: string;
}

export interface SahhaAuthResponse {
  accountToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface SahhaProfile {
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
}

export interface ScoreBundle {
  wellbeing?: any;
  activity?: any;
  sleep?: any;
  mentalWellbeing?: any;
  readiness?: any;
  timestamp?: string;
}

export interface PopulationMetrics {
  orgId?: string;
  totalEmployees: number;
  averageWellbeing?: number;
  wellbeingDistribution?: any;
  departmentBreakdown?: any[];
  averageScores?: ScoreBundle;
  scoreDistribution?: {
    wellbeing: number[];
    activity: number[];
    sleep: number[];
    mentalWellbeing: number[];
  };
  trends?: {
    weekly: ScoreBundle[];
    monthly: ScoreBundle[];
  };
  timestamp?: string;
}

export interface DepartmentMetrics {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  averageWellbeing?: number;
  averageActivity?: number;
  averageSleep?: number;
  averageMentalWellbeing?: number;
  averageReadiness?: number;
  archetypeDistribution?: any;
  riskFlags?: any[];
  averageScores?: ScoreBundle;
  comparisonToCompany?: {
    wellbeing: number;
    activity: number;
    sleep: number;
    mentalWellbeing: number;
  };
}

export interface EmployeeArchetype {
  profileId: string;
  archetype?: string;
  activityLevel?: string;
  exerciseFrequency?: string;
  sleepPattern?: string;
  stressResponse?: string;
  lastUpdated?: string;
  confidence?: number;
  characteristics?: string[];
  recommendations?: string[];
}

export interface RiskFlag {
  profileId: string;
  riskType: 'burnout' | 'stress' | 'insomnia' | 'sedentary' | 'mental_health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  indicators: string[];
  recommendedActions: string[];
}

export interface BurnoutPrediction {
  profileId: string;
  riskScore: number;
  timeline: 'immediate' | 'short_term' | 'medium_term' | 'low_risk';
  contributingFactors: {
    factor: string;
    impact: number;
  }[];
  preventiveActions: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface EAPDashboardConfig {
  demo: {
    enabled: boolean;
    organizationId: string;
    sampleSize: number;
    generateRealTimeUpdates: boolean;
  };
  privacy: {
    minAggregationSize: number;
    anonymizeIndividualData: boolean;
    retentionPolicyDays: number;
  };
  alerts: {
    enableRealTimeAlerts: boolean;
    riskThresholds: {
      burnout: number;
      turnover: number;
      mentalHealth: number;
    };
  };
  integrations: {
    webhooksEnabled: boolean;
    websocketsEnabled: boolean;
    apiRateLimit: number;
  };
}