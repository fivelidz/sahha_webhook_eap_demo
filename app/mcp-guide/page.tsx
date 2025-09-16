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
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';

export default function MCPGuidePage() {
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
          onClick={() => router.push('/dashboard-guide')}
        >
          Dashboard Guide
        </Button>
      </Box>

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        🔧 Complete Technical Implementation: Sahha Webhook Integration
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Comprehensive guide for implementing Sahha webhook receivers, handling data, and building profile management dashboards
      </Typography>

      <Alert severity="error" sx={{ mb: 4 }}>
        <Typography variant="body1" fontWeight="bold">
          CRITICAL: Sahha uses NON-STANDARD webhook headers!
        </Typography>
        <Typography variant="body2">
          X-Signature, X-External-Id, X-Event-Type (NOT typical webhook format). This is the #1 integration failure point.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Essential Files Reference */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                📋 Quick Reference: Essential Files
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>File</strong></TableCell>
                      <TableCell><strong>Purpose</strong></TableCell>
                      <TableCell><strong>Key Functions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><code>/app/api/sahha/webhook/route.ts</code></TableCell>
                      <TableCell>Webhook receiver</TableCell>
                      <TableCell>POST: receives data, GET: returns profiles</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>/components/ProfileManagerWebhook.tsx</code></TableCell>
                      <TableCell>Main dashboard UI</TableCell>
                      <TableCell>Displays profiles, handles departments</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>/lib/webhook-data-service.ts</code></TableCell>
                      <TableCell>Data generation & formatting</TableCell>
                      <TableCell>generateDemoWebhookData(), formatWebhookProfile()</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>/contexts/SahhaDataContext.tsx</code></TableCell>
                      <TableCell>State management</TableCell>
                      <TableCell>Global profile state with departments</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>/data/*.json</code></TableCell>
                      <TableCell>File-based data storage</TableCell>
                      <TableCell>Webhook data, assignments, activity logs</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Complete Webhook Handler Implementation */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🔌 Complete Webhook Handler Implementation
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                Understanding Sahha\'s Webhook System:
              </Typography>
              <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                <Typography variant="body2">
                  Unlike standard webhooks that put event data in the request body, Sahha uses HTTP headers for critical information:
                  <br/><br/>
                  • <strong>X-Signature</strong>: HMAC-SHA256 hash of the body for verification<br/>
                  • <strong>X-External-Id</strong>: The user/profile identifier<br/>
                  • <strong>X-Event-Type</strong>: Type of event being sent<br/>
                  • <strong>Body</strong>: Contains the actual data (scores, biomarkers, etc.)
                </Typography>
              </Alert>

              <Typography variant="h6" sx={{ mt: 3 }}>
                Complete Webhook Handler Code:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white', mt: 1 }}>
                <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>{`// /app/api/sahha/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Mutex } from 'async-mutex';

// Mutex prevents concurrent file writes
const mutex = new Mutex();
const DATA_FILE = path.join(process.cwd(), 'data', 'sahha-webhook-data.json');
const ACTIVITY_LOG = path.join(process.cwd(), 'data', 'webhook-activity.log');

// Helper function to log webhook activity
async function logActivity(activity: string) {
  const timestamp = new Date().toISOString();
  const logEntry = \`\${timestamp}: \${activity}\\n\`;
  await fs.appendFile(ACTIVITY_LOG, logEntry).catch(() => {});
}

// POST endpoint - receives webhook data
export async function POST(request: NextRequest) {
  try {
    // Step 1: Extract Sahha-specific headers (NOT in body!)
    const signature = request.headers.get('X-Signature');
    const externalId = request.headers.get('X-External-Id');
    const eventType = request.headers.get('X-Event-Type');
    const bypassSignature = request.headers.get('X-Bypass-Signature');
    
    await logActivity(\`Webhook received - ExternalId: \${externalId}, Event: \${eventType}\`);
    
    // Step 2: Validate required headers
    if (!externalId) {
      await logActivity('ERROR: Missing X-External-Id header');
      return NextResponse.json(
        { error: 'X-External-Id header is required' },
        { status: 400 }
      );
    }
    
    if (!eventType) {
      await logActivity('ERROR: Missing X-Event-Type header');
      return NextResponse.json(
        { error: 'X-Event-Type header is required' },
        { status: 400 }
      );
    }
    
    // Step 3: Get raw body for signature verification
    const rawBody = await request.text();
    
    // Step 4: Verify signature (unless bypassed for testing)
    if (!bypassSignature) {
      if (!signature) {
        await logActivity('ERROR: Missing X-Signature header');
        return NextResponse.json(
          { error: 'X-Signature header is required' },
          { status: 400 }
        );
      }
      
      const webhookSecret = process.env.SAHHA_WEBHOOK_SECRET;
      if (!webhookSecret) {
        await logActivity('ERROR: SAHHA_WEBHOOK_SECRET not configured');
        return NextResponse.json(
          { error: 'Webhook secret not configured' },
          { status: 500 }
        );
      }
      
      // Compute HMAC-SHA256
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const computedSignature = hmac.update(rawBody).digest('hex');
      
      // Compare signatures (case-insensitive)
      if (signature.toLowerCase() !== computedSignature.toLowerCase()) {
        await logActivity(\`ERROR: Invalid signature for \${externalId}\`);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }
    
    // Step 5: Parse body data
    const payload = JSON.parse(rawBody);
    
    // Step 6: Process based on event type with mutex locking
    const result = await mutex.runExclusive(async () => {
      // Load existing data
      let data: Record<string, any> = {};
      try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
        data = JSON.parse(fileContent);
      } catch (error) {
        // File doesn't exist yet, create directory
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      }
      
      // Initialize profile if doesn't exist
      if (!data[externalId]) {
        data[externalId] = {
          externalId,
          profileId: \`sahha-\${externalId}\`,
          department: null, // Will be set by UI or demo data
          scores: {},
          factors: {},
          biomarkers: {},
          demographics: {},
          archetypes: {},
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
      }
      
      // Process based on event type
      switch (eventType) {
        case 'ScoreCreatedIntegrationEvent':
          // Handle wellness score update
          const { type, score, state, scoreDateTime } = payload;
          
          // Normalize score type (e.g., mental_wellbeing -> mentalWellbeing)
          const normalizedType = type.replace(/_([a-z])/g, (match: string, p1: string) => 
            p1.toUpperCase()
          );
          
          data[externalId].scores[normalizedType] = {
            value: score,
            state: state,
            updatedAt: scoreDateTime || new Date().toISOString()
          };
          
          await logActivity(\`Score updated - \${externalId}: \${type} = \${score} (\${state})\`);
          break;
          
        case 'FactorsCreatedIntegrationEvent':
          // Handle factors (sub-scores) update
          const { scoreType, factors } = payload;
          
          // Factors are detailed breakdowns of main scores
          data[externalId].factors[scoreType] = factors.map((factor: any) => ({
            name: factor.name,
            value: factor.value,
            unit: factor.unit || 'score'
          }));
          
          await logActivity(\`Factors updated - \${externalId}: \${scoreType} with \${factors.length} factors\`);
          break;
          
        case 'BiomarkerCreatedIntegrationEvent':
          // Handle biomarker update (heart rate, HRV, etc.)
          const { biomarker, value, unit, measurementDateTime } = payload;
          
          if (!data[externalId].biomarkers[biomarker]) {
            data[externalId].biomarkers[biomarker] = [];
          }
          
          // Keep last 100 measurements per biomarker
          data[externalId].biomarkers[biomarker].push({
            value,
            unit,
            timestamp: measurementDateTime || new Date().toISOString()
          });
          
          if (data[externalId].biomarkers[biomarker].length > 100) {
            data[externalId].biomarkers[biomarker].shift();
          }
          
          await logActivity(\`Biomarker updated - \${externalId}: \${biomarker} = \${value} \${unit}\`);
          break;
          
        case 'DataLogReceivedIntegrationEvent':
          // Acknowledgment that raw data was received
          await logActivity(\`Data log received acknowledgment for \${externalId}\`);
          break;
          
        case 'ProfileCreatedIntegrationEvent':
          // New profile created
          const { demographics } = payload;
          if (demographics) {
            data[externalId].demographics = demographics;
          }
          await logActivity(\`Profile created for \${externalId}\`);
          break;
          
        case 'ArchetypeIdentifiedIntegrationEvent':
          // Behavioral archetype identified
          const { archetypeType, archetypeValue } = payload;
          data[externalId].archetypes[archetypeType] = archetypeValue;
          await logActivity(\`Archetype identified - \${externalId}: \${archetypeType} = \${archetypeValue}\`);
          break;
          
        default:
          await logActivity(\`Unhandled event type: \${eventType} for \${externalId}\`);
          console.log('Unhandled event payload:', payload);
      }
      
      // Update timestamp
      data[externalId].lastUpdated = new Date().toISOString();
      
      // Save data to file
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
      
      return {
        profilesProcessed: 1,
        externalId,
        eventType
      };
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      ...result
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logActivity(\`ERROR: Webhook processing failed - \${errorMessage}\`);
    console.error('Webhook processing error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint - retrieves stored webhook data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');
  
  try {
    // Demo mode returns generated demo data
    if (mode === 'demo') {
      const { generateDemoWebhookData } = await import('@/lib/webhook-data-service');
      const demoProfiles = generateDemoWebhookData();
      
      return NextResponse.json({
        success: true,
        mode: 'demo',
        count: demoProfiles.length,
        profiles: demoProfiles
      });
    }
    
    // Status mode for health checks
    if (mode === 'status') {
      return NextResponse.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    }
    
    // Default: return real webhook data
    try {
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      const data = JSON.parse(fileContent);
      const profiles = Object.values(data);
      
      return NextResponse.json({
        success: true,
        count: profiles.length,
        profiles,
        lastUpdated: profiles.reduce((latest, profile: any) => 
          profile.lastUpdated > latest ? profile.lastUpdated : latest, 
          ''
        )
      });
    } catch (error) {
      // No data yet
      return NextResponse.json({
        success: true,
        count: 0,
        profiles: [],
        message: 'No webhook data received yet'
      });
    }
    
  } catch (error) {
    console.error('Error fetching webhook data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook data' },
      { status: 500 }
    );
  }
}`}</pre>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Structure & Schema */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🗂️ Data Structure & Schema
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                Complete Profile Schema:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white', mt: 1 }}>
                <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>{`interface Profile {
  // Identification
  profileId: string;           // Internal Sahha ID
  externalId: string;          // Your system\'s user ID
  department: string | null;   // Organizational department
  
  // Wellness Scores (0-1 or 0-100 normalized)
  scores: {
    sleep?: { value: number; state: string; updatedAt: string };
    activity?: { value: number; state: string; updatedAt: string };
    mentalWellbeing?: { value: number; state: string; updatedAt: string };
    readiness?: { value: number; state: string; updatedAt: string };
    wellbeing?: { value: number; state: string; updatedAt: string };
  };
  
  // Detailed Factors (sub-scores for each main score)
  factors: {
    sleep?: Array<{ name: string; value: number; unit: string }>;
    activity?: Array<{ name: string; value: number; unit: string }>;
    // Examples: sleep_duration, sleep_efficiency, rem_sleep, deep_sleep
  };
  
  // Biomarkers (time-series health data)
  biomarkers: {
    heart_rate?: Array<{ value: number; unit: string; timestamp: string }>;
    hrv?: Array<{ value: number; unit: string; timestamp: string }>;
    blood_pressure?: Array<{ value: number; unit: string; timestamp: string }>;
    respiratory_rate?: Array<{ value: number; unit: string; timestamp: string }>;
  };
  
  // Behavioral Archetypes
  archetypes: {
    sleep_pattern?: "night_owl" | "early_bird" | "irregular";
    activity_level?: "sedentary" | "moderately_active" | "highly_active";
    stress_pattern?: "low_stress" | "moderate_stress" | "high_stress";
    circadian_rhythm?: "aligned" | "misaligned";
  };
  
  // Demographics (optional)
  demographics?: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
  };
  
  // Metadata
  createdAt: string;
  lastUpdated: string;
  deviceType?: "iOS" | "Android";
}`}</pre>
              </Paper>

              <Typography variant="h6" sx={{ mt: 3 }}>
                Event Types & Payloads:
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Event Type</strong></TableCell>
                      <TableCell><strong>Payload Fields</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>ScoreCreatedIntegrationEvent</TableCell>
                      <TableCell>type, score, state, scoreDateTime</TableCell>
                      <TableCell>New wellness score calculated</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>FactorsCreatedIntegrationEvent</TableCell>
                      <TableCell>scoreType, factors[]</TableCell>
                      <TableCell>Detailed breakdown of a score</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>BiomarkerCreatedIntegrationEvent</TableCell>
                      <TableCell>biomarker, value, unit, measurementDateTime</TableCell>
                      <TableCell>Health metric measurement</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>ProfileCreatedIntegrationEvent</TableCell>
                      <TableCell>demographics</TableCell>
                      <TableCell>New user profile created</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>ArchetypeIdentifiedIntegrationEvent</TableCell>
                      <TableCell>archetypeType, archetypeValue</TableCell>
                      <TableCell>Behavioral pattern identified</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Assignment Logic */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🏢 Department Assignment Logic
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                Demo Data Generation with Departments:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white', mt: 1 }}>
                <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>{`// /lib/webhook-data-service.ts

export function generateDemoWebhookData(): Profile[] {
  const profiles: Profile[] = [];
  
  for (let i = 0; i < 57; i++) {
    // CRITICAL: Department assignment based on index
    let department: string;
    if (i < 20) {
      department = 'tech';        // Index 0-19 (20 profiles)
    } else if (i < 31) {
      department = 'sales';       // Index 20-30 (11 profiles)
    } else if (i < 42) {
      department = 'operations';  // Index 31-41 (11 profiles)
    } else if (i < 51) {
      department = 'admin';       // Index 42-50 (9 profiles)
    } else {
      department = 'unassigned';  // Index 51+ (6 profiles)
    }
    
    // Generate random scores
    const generateScore = () => ({
      value: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      state: Math.random() > 0.5 ? 'high' : 'medium',
      updatedAt: new Date().toISOString()
    });
    
    profiles.push({
      profileId: \`demo-\${String(i).padStart(4, '0')}\`,
      externalId: \`TestProfile-\${String(i + 1).padStart(3, '0')}\`,
      department, // <-- CRITICAL: Must be included
      
      scores: {
        sleep: generateScore(),
        activity: generateScore(),
        mentalWellbeing: generateScore(),
        readiness: generateScore(),
        wellbeing: generateScore()
      },
      
      demographics: {
        age: Math.floor(Math.random() * 30 + 25),
        gender: Math.random() > 0.5 ? 'Male' : 'Female'
      },
      
      archetypes: {
        sleep_pattern: ['night_owl', 'early_bird', 'irregular'][Math.floor(Math.random() * 3)],
        activity_level: ['sedentary', 'moderately_active', 'highly_active'][Math.floor(Math.random() * 3)]
      },
      
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  }
  
  return profiles;
}

// CRITICAL: Preserve department when formatting webhook data
export function formatWebhookProfile(webhookData: any): Profile {
  return {
    profileId: webhookData.profileId,
    externalId: webhookData.externalId,
    department: webhookData.department || null, // <-- MUST PRESERVE
    scores: webhookData.scores || {},
    factors: webhookData.factors || {},
    biomarkers: webhookData.biomarkers || {},
    archetypes: webhookData.archetypes || {},
    demographics: webhookData.demographics || {},
    createdAt: webhookData.createdAt,
    lastUpdated: webhookData.lastUpdated
  };
}`}</pre>
              </Paper>

              <Typography variant="h6" sx={{ mt: 3 }}>
                Department Distribution:
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Department</strong></TableCell>
                      <TableCell><strong>Index Range</strong></TableCell>
                      <TableCell><strong>Profile Count</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Tech</TableCell>
                      <TableCell>0-19</TableCell>
                      <TableCell>20 profiles</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sales</TableCell>
                      <TableCell>20-30</TableCell>
                      <TableCell>11 profiles</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Operations</TableCell>
                      <TableCell>31-41</TableCell>
                      <TableCell>11 profiles</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Admin</TableCell>
                      <TableCell>42-50</TableCell>
                      <TableCell>9 profiles</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Unassigned</TableCell>
                      <TableCell>51+</TableCell>
                      <TableCell>6 profiles</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Testing & Debugging */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🧪 Testing & Debugging
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                Test Webhook Commands:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white', mt: 1 }}>
                <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>{`# Test Score Creation
curl -X POST http://localhost:3000/api/sahha/webhook \\
  -H "X-Bypass-Signature: test" \\
  -H "X-External-Id: test-001" \\
  -H "X-Event-Type: ScoreCreatedIntegrationEvent" \\
  -H "Content-Type: application/json" \\
  -d \'{
    "type": "sleep",
    "score": 0.85,
    "state": "high",
    "scoreDateTime": "2025-09-16T00:00:00Z"
  }\'

# Test Factors Creation
curl -X POST http://localhost:3000/api/sahha/webhook \\
  -H "X-Bypass-Signature: test" \\
  -H "X-External-Id: test-001" \\
  -H "X-Event-Type: FactorsCreatedIntegrationEvent" \\
  -H "Content-Type: application/json" \\
  -d \'{
    "scoreType": "sleep",
    "factors": [
      {"name": "sleep_duration", "value": 7.5, "unit": "hours"},
      {"name": "sleep_efficiency", "value": 0.92, "unit": "ratio"},
      {"name": "rem_sleep", "value": 1.8, "unit": "hours"}
    ]
  }\'

# Test Biomarker Creation
curl -X POST http://localhost:3000/api/sahha/webhook \\
  -H "X-Bypass-Signature: test" \\
  -H "X-External-Id: test-001" \\
  -H "X-Event-Type: BiomarkerCreatedIntegrationEvent" \\
  -H "Content-Type: application/json" \\
  -d \'{
    "biomarker": "heart_rate",
    "value": 72,
    "unit": "bpm",
    "measurementDateTime": "2025-09-16T12:00:00Z"
  }\'

# Get Stored Data
curl http://localhost:3000/api/sahha/webhook

# Get Demo Data
curl http://localhost:3000/api/sahha/webhook?mode=demo

# Check Department Distribution
curl http://localhost:3000/api/sahha/webhook?mode=demo | \\
  jq \'.profiles | group_by(.department) | map({dept: .[0].department, count: length})\'`}</pre>
              </Paper>

              <Typography variant="h6" sx={{ mt: 3 }}>
                Debugging Checklist:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Check webhook activity log"
                    secondary="tail -f data/webhook-activity.log"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="View stored webhook data"
                    secondary="cat data/sahha-webhook-data.json | jq ."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Check department assignments"
                    secondary="cat data/department-assignments.json | jq ."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Verify headers in browser"
                    secondary="Open DevTools → Network → Check webhook request headers"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Common Issues & Solutions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🐛 Common Issues & Solutions
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Paper sx={{ p: 2, bgcolor: 'error.50' }}>
                  <Typography variant="h6">Issue: Departments show as "Unassigned"</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Cause:</strong> Department field not preserved in formatWebhookProfile()<br/>
                    <strong>Fix:</strong> Ensure <code>department: webhookData.department || null</code> is included<br/>
                    <strong>Verify:</strong> Check that generateDemoWebhookData() assigns departments based on index
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                  <Typography variant="h6">Issue: Wrong UI Component Used</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Cause:</strong> Using ProfileManagement instead of ProfileManagerWebhook<br/>
                    <strong>Fix:</strong> Import and use ProfileManagerWebhook component<br/>
                    <strong>Note:</strong> ProfileManagement has poor UI per user feedback
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                  <Typography variant="h6">Issue: Missing Webhook Headers</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Cause:</strong> Using standard webhook format instead of Sahha format<br/>
                    <strong>Fix:</strong> Use X-Signature, X-External-Id, X-Event-Type headers<br/>
                    <strong>Test:</strong> Use X-Bypass-Signature header for development testing
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                  <Typography variant="h6">Issue: Data Race Conditions</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Cause:</strong> Multiple webhooks writing to file simultaneously<br/>
                    <strong>Fix:</strong> Use async-mutex for file operations<br/>
                    <strong>Implementation:</strong> All file writes wrapped in mutex.runExclusive()
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'grey.200' }}>
                  <Typography variant="h6">Issue: Mental Wellbeing Score Not Showing</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Cause:</strong> Sahha sends "mental_wellbeing", UI expects "mentalWellbeing"<br/>
                    <strong>Fix:</strong> Normalize score types in webhook handler<br/>
                    <strong>Code:</strong> <code>type.replace(/_([a-z])/g, (m, p1) =&gt; p1.toUpperCase())</code>
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Production Setup */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🚀 Production Setup
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                1. Register Webhook in Sahha Dashboard:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', mt: 1 }}>
                <Typography variant="body2">
                  • Navigate to: Sahha Dashboard → Integrations → Webhooks<br/>
                  • Webhook URL: <code>https://your-domain.com/api/sahha/webhook</code><br/>
                  • Select Events: All event types or specific ones you need<br/>
                  • Copy the webhook secret for your environment variables<br/>
                  • Test with the "Send Test Webhook" button
                </Typography>
              </Paper>

              <Typography variant="h6" sx={{ mt: 2 }}>
                2. Environment Configuration:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white', mt: 1 }}>
                <pre style={{ fontSize: '0.75rem' }}>{`# .env.production
SAHHA_WEBHOOK_SECRET=your-webhook-secret-from-sahha
NEXT_PUBLIC_API_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/db

# Optional: Add monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info`}</pre>
              </Paper>

              <Typography variant="h6" sx={{ mt: 2 }}>
                3. Database Migration (from file storage):
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white', mt: 1 }}>
                <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>{`-- PostgreSQL Schema
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE NOT NULL,
  profile_id VARCHAR(255),
  department VARCHAR(50),
  demographics JSONB,
  archetypes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  type VARCHAR(50) NOT NULL,
  value DECIMAL(5,4),
  state VARCHAR(20),
  score_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  score_type VARCHAR(50),
  name VARCHAR(100),
  value DECIMAL(10,4),
  unit VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  biomarker VARCHAR(50),
  value DECIMAL(10,4),
  unit VARCHAR(20),
  measurement_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_external ON profiles(external_id);
CREATE INDEX idx_scores_profile_type ON scores(profile_id, type);
CREATE INDEX idx_factors_profile ON factors(profile_id);
CREATE INDEX idx_biomarkers_profile_type ON biomarkers(profile_id, biomarker);`}</pre>
              </Paper>

              <Typography variant="h6" sx={{ mt: 2 }}>
                4. Security Checklist:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="✓ Remove X-Bypass-Signature handling"
                    secondary="Never allow signature bypass in production"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="✓ Implement rate limiting"
                    secondary="Use middleware to limit webhook requests per minute"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="✓ Add request logging"
                    secondary="Log all webhook attempts for audit trail"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="✓ Set up monitoring alerts"
                    secondary="Alert on signature failures or processing errors"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="✓ Use database transactions"
                    secondary="Ensure data consistency with proper transactions"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Reference */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                📝 Quick Reference Checklist
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Essential Checks:</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <Typography variant="body2" fontFamily="monospace">
                      ✓ X-Headers (NOT standard webhook)<br/>
                      ✓ Department field preserved<br/>
                      ✓ ProfileManagerWebhook component<br/>
                      ✓ Mutex for file operations<br/>
                      ✓ SAHHA_WEBHOOK_SECRET in .env<br/>
                      ✓ Score type normalization<br/>
                      ✓ Activity logging enabled
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Common Mistakes:</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <Typography variant="body2" fontFamily="monospace">
                      ❌ Using request.body for event type<br/>
                      ❌ ProfileManagement component<br/>
                      ❌ Missing department in formatProfile<br/>
                      ❌ No mutex = data corruption<br/>
                      ❌ Hardcoded webhook secret<br/>
                      ❌ Not handling underscore_case<br/>
                      ❌ No error logging
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3 }}>Support:</Typography>
              <Typography variant="body1">
                🌐 Documentation: <a href="https://sahha.ai/start" style={{ color: 'white' }}>sahha.ai/start</a><br/>
                📧 Technical Support: support@sahha.ai
              </Typography>
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
              onClick={() => router.push('/dashboard-guide')}
            >
              View Dashboard Guide
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}