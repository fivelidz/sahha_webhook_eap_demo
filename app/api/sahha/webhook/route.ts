// Webhook receiver for Sahha data push notifications
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  loadWebhookData, 
  saveWebhookData, 
  updateWebhookProfile, 
  logWebhookActivity 
} from '../../../../lib/webhook-storage';

// Define webhook payload types
interface SahhaWebhookPayload {
  // Common fields
  id?: string;
  profileId?: string;
  accountId?: string;
  externalId?: string;
  createdAtUtc?: string;
  version?: number;
  
  // Integration Event fields (Sahha's actual webhook format)
  eventType?: 'ScoreCreatedIntegrationEvent' | 'BiomarkerCreatedIntegrationEvent' | 'DataLogReceivedIntegrationEvent' | 'ArchetypeCreatedIntegrationEvent' | string;
  
  // Score payload fields (direct format)
  type?: 'activity' | 'sleep' | 'wellbeing' | 'mental_wellbeing' | 'readiness' | string;
  state?: string;
  score?: number;
  factors?: Array<{
    id: string;
    name: string;
    value: number;
    goal?: number;
    score: number;
    state: string;
    unit: string;
  }>;
  dataSources?: string[];
  scoreDateTime?: string;
  
  // Biomarker payload fields
  category?: string;
  periodicity?: string;
  aggregation?: string;
  value?: string | number;
  unit?: string;
  valueType?: string;
  
  // Data log integration fields
  logType?: string;
  receivedAtUtc?: string;
  dataLogs?: Array<{
    id: string;
    parentId?: string | null;
    value: number;
    unit: string;
    source: string;
    recordingMethod: string;
    deviceType: string;
    startDateTime: string;
    endDateTime: string;
    additionalProperties?: any;
  }>;
  
  // Archetype payload fields
  name?: string;
  dataType?: string;
  ordinality?: number;
  startDateTime?: string;
  endDateTime?: string;
  
  // Event-based format (for future compatibility)
  event?: 'score.updated' | 'profile.created' | 'archetype.calculated' | 'batch.scores';
  timestamp?: string;
  data?: {
    profileId?: string;
    externalId?: string;
    profiles?: ProfileScoreData[];
    scores?: ScoreData;
    archetypes?: ArchetypeData[];
  };
}

interface ProfileScoreData {
  profileId: string;
  externalId: string;
  scores: {
    wellbeing?: number;
    activity?: number;
    sleep?: number;
    mentalWellbeing?: number;
    readiness?: number;
  };
  factors?: any[];
  archetypes?: string[];
  timestamp: string;
}

interface ScoreData {
  wellbeing?: { value: number; factors: any[] };
  activity?: { value: number; factors: any[] };
  sleep?: { value: number; factors: any[] };
  mentalWellbeing?: { value: number; factors: any[] };
  readiness?: { value: number; factors: any[] };
}

interface ArchetypeData {
  name: string;
  value: string;
  confidence: number;
}

// Storage handled by webhook-storage.ts with proper file locking

// POST endpoint to receive webhook data from Sahha
export async function POST(request: NextRequest) {
  try {
    // Get Sahha webhook headers
    const signature = request.headers.get('X-Signature');
    const externalId = request.headers.get('X-External-Id');
    const eventType = request.headers.get('X-Event-Type');
    
    // Enhanced logging for all webhook events
    const webhookCapture = {
      timestamp: new Date().toISOString(),
      headers: {
        'X-Signature': signature ? 'present' : 'missing',
        'X-External-Id': externalId,
        'X-Event-Type': eventType,
        'Content-Type': request.headers.get('Content-Type'),
        'Content-Length': request.headers.get('Content-Length')
      },
      eventType: eventType,
      externalId: externalId
    };
    
    // Log received headers for debugging
    console.log('📨 Webhook headers received:', webhookCapture);
    
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook signature
    const webhookSecret = process.env.SAHHA_WEBHOOK_SECRET;
    
    // In development, allow bypass for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    const bypassSignature = isDevelopment && request.headers.get('X-Bypass-Signature') === 'test';
    
    // Check required headers for Sahha webhooks
    if (!bypassSignature) {
      if (!signature) {
        console.error('❌ X-Signature header is missing');
        return NextResponse.json({ error: 'X-Signature header is missing' }, { status: 400 });
      }
      if (!externalId) {
        console.error('❌ X-External-Id header is missing');
        return NextResponse.json({ error: 'X-External-Id header is missing' }, { status: 400 });
      }
      if (!eventType) {
        console.error('❌ X-Event-Type header is missing');
        return NextResponse.json({ error: 'X-Event-Type header is missing' }, { status: 400 });
      }
    }
    
    // Log signature info for debugging
    if (signature && webhookSecret) {
      console.log('🔐 Signature verification attempt:', {
        hasSignature: !!signature,
        hasSecret: !!webhookSecret,
        signatureLength: signature.length,
        eventType,
        externalId
      });
    }
    
    // Verify signature if secret is configured
    if (webhookSecret && signature && !bypassSignature) {
      const isValid = verifyWebhookSignature(signature, rawBody, webhookSecret);
      if (!isValid) {
        console.error('❌ Invalid webhook signature for', eventType, externalId);
        // Log more details to help debug
        console.error('  Signature received:', signature.substring(0, 20) + '...');
        console.error('  Payload length:', rawBody.length);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Webhook signature verified for', eventType);
    } else if (!webhookSecret && !bypassSignature) {
      // No secret configured - accept the webhook but log warning
      console.warn('⚠️ No SAHHA_WEBHOOK_SECRET configured - accepting webhook without verification');
      console.warn('  Set SAHHA_WEBHOOK_SECRET in .env.local to enable signature verification');
    } else if (bypassSignature) {
      console.log('⚠️ Signature verification bypassed for testing');
    }

    // Parse webhook payload
    const payload: SahhaWebhookPayload = JSON.parse(rawBody);
    
    // Capture full event for analysis
    const eventCapture = {
      ...webhookCapture,
      payloadStructure: {
        hasData: !!payload.data,
        hasType: !!payload.type,
        hasScore: payload.score !== undefined,
        hasCategory: !!payload.category,
        hasDataLogs: !!payload.dataLogs,
        hasEvent: !!payload.event,
        keys: Object.keys(payload).slice(0, 20) // First 20 keys
      },
      rawPayloadSample: JSON.stringify(payload).substring(0, 500)
    };
    
    // Save to analysis file
    await saveEventAnalysis(eventCapture);
    
    // Use event type from header (Sahha always sends this)
    const actualEventType = eventType || payload.eventType;
    let actualPayload = payload;
    
    // Log exactly what we received
    console.log('📨 Sahha webhook received:', {
      headerEventType: eventType,
      headerExternalId: externalId,
      payloadKeys: Object.keys(payload),
      hasDataField: !!payload.data,
      timestamp: new Date().toISOString()
    });
    
    // Handle Integration Events based on X-Event-Type header
    if (eventType && eventType.includes('IntegrationEvent')) {
      console.log('🔄 Processing Integration Event:', eventType, 'for', externalId);
      
      // For Integration Events, the actual data might be in the payload directly
      // or nested in a data field depending on the event type
      if (payload.data && typeof payload.data === 'object') {
        actualPayload = payload.data;
        console.log('  → Extracted nested data from Integration Event');
      }
      
      // Log stats about Integration Events (based on 187K events from Sahha)
      // BiomarkerCreated: 108K, ScoreCreated: 61K, DataLogReceived: 12K, ArchetypeCreated: 4K
      if (eventType === 'BiomarkerCreatedIntegrationEvent') {
        console.log('  📊 Processing biomarker (most common event type)');
      } else if (eventType === 'ScoreCreatedIntegrationEvent') {
        console.log('  🎯 Processing score (multiple per profile)');
      } else if (eventType === 'DataLogReceivedIntegrationEvent') {
        console.log('  📈 Processing data log');
      } else if (eventType === 'ArchetypeCreatedIntegrationEvent') {
        console.log('  🎭 Processing archetype');
      }
      
      // Ensure we have the external ID
      if (!actualPayload.externalId && !actualPayload.profileId) {
        actualPayload.externalId = externalId || undefined;
        actualPayload.profileId = `sahha-${externalId}`;
      }
    } else if (payload.data) {
      // Non-Integration Event with data field
      actualPayload = payload.data;
    }
    
    // Always use external ID from header as it's authoritative
    if (externalId) {
      actualPayload.externalId = externalId;
      if (!actualPayload.profileId) {
        actualPayload.profileId = `sahha-${externalId}`;
      }
    }
    
    // Detect webhook type
    const isScore = actualPayload.type && actualPayload.score !== undefined;
    const isBiomarker = actualPayload.category && actualPayload.type && actualPayload.value !== undefined && !actualPayload.score;
    const isArchetype = actualPayload.name && actualPayload.dataType;
    const isDataLog = actualPayload.logType && actualPayload.dataLogs;
    const isEventBased = !!actualPayload.event;
    
    const eventInfo = {
      type: isScore ? 'score' : isBiomarker ? 'biomarker' : isArchetype ? 'archetype' : isDataLog ? 'datalog' : isEventBased ? 'event-based' : 'unknown',
      scoreType: actualPayload.type,
      category: actualPayload.category,
      logType: actualPayload.logType,
      archetypeName: actualPayload.name,
      event: actualPayload.event,
      externalId: actualPayload.externalId,
      timestamp: actualPayload.timestamp || actualPayload.createdAtUtc || actualPayload.receivedAtUtc,
      profileCount: (actualPayload.data && actualPayload.data.profiles) ? actualPayload.data.profiles.length : 1,
      // Additional details for analysis
      scoreValue: actualPayload.score,
      scoreState: actualPayload.state,
      biomarkerValue: actualPayload.value,
      dataLogCount: actualPayload.dataLogs ? actualPayload.dataLogs.length : 0
    };
    
    console.log('📊 Processing webhook data:', eventInfo);
    
    // Track event types
    await trackEventType(actualEventType || eventInfo.type, eventInfo);

    // Load existing data
    const existingData = await loadWebhookData();
    
    // Count events for statistics
    try {
      const fs = (await import('fs')).promises;
      const path = (await import('path')).default;
      const statsFile = path.join(process.cwd(), 'data', 'webhook-event-counts.json');
      
      let eventCounts: any = {};
      try {
        const existing = await fs.readFile(statsFile, 'utf-8');
        eventCounts = JSON.parse(existing);
      } catch (e) {
        // File doesn't exist yet
      }
      
      const eventKey = actualEventType || eventInfo.type || 'unknown';
      eventCounts[eventKey] = (eventCounts[eventKey] || 0) + 1;
      eventCounts.total = (eventCounts.total || 0) + 1;
      eventCounts.lastUpdated = new Date().toISOString();
      
      await fs.writeFile(statsFile, JSON.stringify(eventCounts, null, 2));
    } catch (e) {
      console.log('Could not update event counts:', e);
    }

    // Handle all 4 Integration Event types that Sahha sends
    // Based on 187K events: Biomarkers (108K), Scores (61K), DataLogs (12K), Archetypes (4K)
    if (!isEventBased && actualPayload.externalId) {
      const externalId = actualPayload.externalId;
      
      // Initialize profile if it doesn't exist
      if (!existingData[externalId]) {
        existingData[externalId] = {
          profileId: actualPayload.profileId,
          externalId: externalId,
          accountId: actualPayload.accountId,
          archetypes: {},
          scores: {},
          factors: {},
          device: {
            type: 'unknown',
            source: 'unknown',
            lastSeen: null
          },
          demographics: {
            age: null,
            gender: null,
            location: null
          },
          lastUpdated: actualPayload.createdAtUtc
        };
      }
      
      // Handle score payload (from ScoreCreatedIntegrationEvent)
      if ((isScore && actualPayload.type) || eventType === 'ScoreCreatedIntegrationEvent') {
        const scoreType = actualPayload.type || 'unknown';
        existingData[externalId].scores[scoreType] = {
          value: actualPayload.score,
          state: actualPayload.state,
          scoreDateTime: actualPayload.scoreDateTime,
          dataSources: actualPayload.dataSources,
          version: actualPayload.version,
          updatedAt: actualPayload.createdAtUtc
        };
        
        // Store factors
        if (actualPayload.factors) {
          existingData[externalId].factors[scoreType] = actualPayload.factors;
        }
        
        console.log(`✅ Updated ${scoreType} score for ${externalId}: ${actualPayload.score}`);
      }
      
      // Handle biomarker payload (from BiomarkerCreatedIntegrationEvent)
      if ((isBiomarker && actualPayload.category && actualPayload.type) || eventType === 'BiomarkerCreatedIntegrationEvent') {
        if (!existingData[externalId].biomarkers) {
          existingData[externalId].biomarkers = {};
        }
        
        const biomarkerKey = `${actualPayload.category}_${actualPayload.type}`;
        existingData[externalId].biomarkers[biomarkerKey] = {
          category: actualPayload.category,
          type: actualPayload.type,
          value: actualPayload.value,
          unit: actualPayload.unit,
          valueType: actualPayload.valueType,
          periodicity: actualPayload.periodicity,
          aggregation: actualPayload.aggregation,
          startDateTime: actualPayload.startDateTime,
          endDateTime: actualPayload.endDateTime,
          version: actualPayload.version,
          updatedAt: actualPayload.createdAtUtc
        };
        
        console.log(`✅ Updated biomarker ${biomarkerKey} for ${externalId}: ${actualPayload.value} ${actualPayload.unit}`);
      }
      
      // Handle archetype payload (from ArchetypeCreatedIntegrationEvent)
      if ((isArchetype && actualPayload.name) || eventType === 'ArchetypeCreatedIntegrationEvent') {
        const archetypeName = actualPayload.name || 'unknown';
        existingData[externalId].archetypes[archetypeName] = {
          value: actualPayload.value,
          dataType: actualPayload.dataType,
          ordinality: actualPayload.ordinality,
          periodicity: actualPayload.periodicity,
          startDateTime: actualPayload.startDateTime,
          endDateTime: actualPayload.endDateTime,
          version: actualPayload.version,
          updatedAt: actualPayload.createdAtUtc
        };
        
        console.log(`✅ Updated archetype '${archetypeName}' for ${externalId}: ${actualPayload.value}`);
      }
      
      // Handle data log payload (from DataLogReceivedIntegrationEvent)
      if ((isDataLog && actualPayload.dataLogs) || eventType === 'DataLogReceivedIntegrationEvent') {
        if (!existingData[externalId].dataLogs) {
          existingData[externalId].dataLogs = {};
        }
        
        const logKey = `${actualPayload.logType}_${actualPayload.dataType}`;
        if (!existingData[externalId].dataLogs[logKey]) {
          existingData[externalId].dataLogs[logKey] = [];
        }
        
        // Add new data logs
        existingData[externalId].dataLogs[logKey].push({
          receivedAt: actualPayload.receivedAtUtc,
          logs: actualPayload.dataLogs
        });
        
        // Extract device information from DataLog events
        if (actualPayload.dataLogs && actualPayload.dataLogs.length > 0) {
          const firstLog = actualPayload.dataLogs[0];
          if (firstLog.deviceType || firstLog.source) {
            if (!existingData[externalId].device) {
              existingData[externalId].device = {
                type: 'unknown',
                source: 'unknown',
                lastSeen: null
              };
            }
            
            // Update device info if present
            if (firstLog.deviceType) {
              existingData[externalId].device.type = firstLog.deviceType;
            }
            if (firstLog.source) {
              existingData[externalId].device.source = firstLog.source;
            }
            existingData[externalId].device.lastSeen = actualPayload.receivedAtUtc;
            
            console.log(`📱 Updated device info for ${externalId}: ${firstLog.deviceType || 'N/A'} (${firstLog.source || 'N/A'})`);
          }
        }
        
        console.log(`✅ Added ${actualPayload.dataLogs?.length || 0} data logs for ${logKey} on ${externalId}`);
      }
      
      existingData[externalId].lastUpdated = actualPayload.createdAtUtc || actualPayload.receivedAtUtc;
      
    } else {
      // Process event-based format (for future compatibility)
      switch (actualPayload.event) {
      case 'batch.scores':
        // Handle batch score updates (ideal scenario)
        if (actualPayload.data && actualPayload.data.profiles) {
          for (const profile of actualPayload.data.profiles) {
            existingData[profile.externalId] = {
              ...existingData[profile.externalId],
              ...profile,
              lastUpdated: actualPayload.timestamp
            };
            console.log(`✅ Updated profile ${profile.externalId} with scores`);
          }
        }
        break;

      case 'score.updated':
        // Handle individual score update
        if (actualPayload.data?.externalId && actualPayload.data?.scores) {
          const externalId = actualPayload.data.externalId;
          existingData[externalId] = {
            ...existingData[externalId],
            scores: actualPayload.data.scores,
            lastUpdated: actualPayload.timestamp
          };
          console.log(`✅ Updated scores for ${externalId}`);
        }
        break;

      case 'archetype.calculated':
        // Handle archetype updates
        if (actualPayload.data?.externalId && actualPayload.data?.archetypes) {
          const externalId = actualPayload.data.externalId;
          existingData[externalId] = {
            ...existingData[externalId],
            archetypes: actualPayload.data.archetypes,
            lastUpdated: actualPayload.timestamp
          };
          console.log(`✅ Updated archetypes for ${externalId}`);
        }
        break;

      case 'profile.created':
        // Handle new profile creation
        if (actualPayload.data?.externalId) {
          existingData[actualPayload.data.externalId] = {
            profileId: actualPayload.data?.profileId,
            externalId: actualPayload.data.externalId,
            createdAt: actualPayload.timestamp,
            lastUpdated: actualPayload.timestamp
          };
          console.log(`✅ Created new profile ${actualPayload.data.externalId}`);
        }
        break;

      default:
        console.warn('⚠️ Unknown webhook event:', actualPayload.event);
      }
    }

    // Save updated data
    await saveWebhookData(existingData);

    // Log webhook activity
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: actualPayload.event,
      profilesUpdated: (actualPayload.data && actualPayload.data.profiles) ? actualPayload.data.profiles.length : 1,
      success: true
    };
    
    await logWebhookActivity(logEntry);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      event: actualPayload.event,
      profilesProcessed: (actualPayload.data && actualPayload.data.profiles) ? actualPayload.data.profiles.length : 1
    });

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    
    // Log error
    await logWebhookActivity({
      timestamp: new Date().toISOString(),
      event: 'error',
      error: error.message,
      success: false
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to process webhook',
      details: error.message
    }, { status: 500 });
  }
}

// Generate demo webhook data for testing
function generateDemoWebhookData() {
  const profiles: any[] = [];
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations', 'Finance'];
  const archetypeTypes = {
    activity: ['sedentary', 'lightly_active', 'moderately_active', 'highly_active'],
    exercise: ['rare_exerciser', 'occasional_exerciser', 'regular_exerciser', 'frequent_exerciser'],
    sleep: ['poor_sleeper', 'fair_sleeper', 'good_sleeper', 'excellent_sleeper'],
    mental: ['poor_mental_wellness', 'fair_mental_wellness', 'good_mental_wellness', 'optimal_mental_wellness']
  };
  
  // Generate 100 demo profiles
  for (let i = 0; i < 100; i++) {
    const profileId = `demo-${String(i).padStart(4, '0')}`;
    const dept = departments[i % departments.length];
    
    // Generate scores with some variance
    const baseScore = 0.5 + (Math.random() * 0.3);
    
    const profile = {
      profileId,
      externalId: `Demo-User-${i}`,
      accountId: `demo-account-${Math.floor(i / 10)}`,
      scores: {
        wellbeing: {
          value: Math.min(0.95, baseScore + (Math.random() * 0.2 - 0.1)),
          state: 'good',
          updatedAt: new Date().toISOString()
        },
        activity: {
          value: Math.min(0.95, baseScore + (Math.random() * 0.25 - 0.125)),
          state: 'moderate',
          updatedAt: new Date().toISOString()
        },
        sleep: {
          value: Math.min(0.95, baseScore + (Math.random() * 0.15 - 0.075)),
          state: 'good',
          updatedAt: new Date().toISOString()
        },
        mental_wellbeing: {
          value: Math.min(0.95, baseScore + (Math.random() * 0.2 - 0.1)),
          state: 'good',
          updatedAt: new Date().toISOString()
        },
        readiness: {
          value: Math.min(0.95, baseScore + (Math.random() * 0.18 - 0.09)),
          state: 'ready',
          updatedAt: new Date().toISOString()
        }
      },
      archetypes: {
        activity_level: {
          value: archetypeTypes.activity[Math.floor(baseScore * 4)],
          dataType: 'categorical',
          updatedAt: new Date().toISOString()
        },
        exercise_frequency: {
          value: archetypeTypes.exercise[Math.floor(baseScore * 4)],
          dataType: 'categorical',
          updatedAt: new Date().toISOString()
        },
        sleep_pattern: {
          value: archetypeTypes.sleep[Math.floor(baseScore * 4)],
          dataType: 'categorical',
          updatedAt: new Date().toISOString()
        },
        mental_wellness: {
          value: archetypeTypes.mental[Math.floor(baseScore * 4)],
          dataType: 'categorical',
          updatedAt: new Date().toISOString()
        }
      },
      factors: {
        sleep: [
          { name: 'sleep_duration', value: 6.5 + Math.random() * 2, unit: 'hours', score: 75 },
          { name: 'sleep_efficiency', value: 80 + Math.random() * 15, unit: '%', score: 82 },
          { name: 'sleep_regularity', value: 65 + Math.random() * 20, unit: '%', score: 68 }
        ],
        activity: [
          { name: 'steps', value: 5000 + Math.random() * 5000, unit: 'steps', score: 65 },
          { name: 'active_hours', value: 2 + Math.random() * 2, unit: 'hours', score: 58 }
        ]
      },
      device: {
        type: 'mobile',
        source: 'iOS',
        lastSeen: new Date().toISOString()
      },
      demographics: {
        age: 25 + Math.floor(Math.random() * 30),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        location: 'Demo City'
      },
      lastUpdated: new Date().toISOString(),
      department: dept
    };
    
    profiles.push(profile);
  }
  
  return {
    profiles,
    stats: {
      totalProfiles: profiles.length,
      withScores: profiles.length,
      averageWellbeing: 0.68,
      scoreCoverage: {
        wellbeing: 100,
        activity: 100,
        sleep: 100,
        mental_wellbeing: 100,
        readiness: 100
      }
    }
  };
}

// GET endpoint to retrieve webhook data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const externalId = searchParams.get('externalId');
    const mode = searchParams.get('mode');
    
    // If demo mode is requested, return demo data
    if (mode === 'demo') {
      const demoData = generateDemoWebhookData();
      return NextResponse.json({
        success: true,
        count: demoData.profiles.length,
        profiles: demoData.profiles,
        lastUpdated: new Date().toISOString(),
        stats: demoData.stats,
        demoMode: true
      });
    }
    
    // Otherwise return real webhook data
    const data = await loadWebhookData();
    
    if (externalId) {
      // Return specific profile data
      const profileData = data[externalId];
      if (!profileData) {
        return NextResponse.json({
          success: false,
          error: 'Profile not found'
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: profileData
      });
    }
    
    // Return all webhook data
    const profiles = Object.values(data);
    
    return NextResponse.json({
      success: true,
      count: profiles.length,
      profiles,
      lastUpdated: profiles.reduce((latest, p: any) => {
        return p.lastUpdated > latest ? p.lastUpdated : latest;
      }, '')
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching webhook data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch webhook data',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE endpoint to clear webhook data (for testing)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirmDelete = searchParams.get('confirm') === 'true';
    
    if (!confirmDelete) {
      return NextResponse.json({
        success: false,
        error: 'Must confirm deletion with ?confirm=true'
      }, { status: 400 });
    }
    
    await saveWebhookData({});
    
    return NextResponse.json({
      success: true,
      message: 'Webhook data cleared'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to clear webhook data',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to log webhook activity

// Helper function to save event analysis
async function saveEventAnalysis(eventData: any) {
  try {
    const fs = (await import('fs')).promises;
    const path = (await import('path')).default;
    const analysisFile = path.join(process.cwd(), 'data', 'webhook-event-analysis.json');
    
    let existingData = [];
    try {
      const fileContent = await fs.readFile(analysisFile, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (e) {
      // File doesn't exist, start fresh
    }
    
    // Keep last 200 events for analysis
    existingData.push(eventData);
    if (existingData.length > 200) {
      existingData = existingData.slice(-200);
    }
    
    await fs.writeFile(analysisFile, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error('Failed to save event analysis:', error);
  }
}

// Track event types for statistics
async function trackEventType(eventType: string, eventInfo: any) {
  try {
    const fs = (await import('fs')).promises;
    const path = (await import('path')).default;
    const statsFile = path.join(process.cwd(), 'data', 'webhook-event-stats.json');
    
    let stats: any = {};
    try {
      const fileContent = await fs.readFile(statsFile, 'utf-8');
      stats = JSON.parse(fileContent);
    } catch (e) {
      // File doesn't exist, start fresh
      stats = {
        totalEvents: 0,
        eventTypes: {},
        scoreTypes: {},
        biomarkerCategories: {},
        lastUpdated: null
      };
    }
    
    // Update statistics
    stats.totalEvents++;
    stats.eventTypes[eventType] = (stats.eventTypes[eventType] || 0) + 1;
    
    if (eventInfo.scoreType) {
      stats.scoreTypes[eventInfo.scoreType] = (stats.scoreTypes[eventInfo.scoreType] || 0) + 1;
    }
    
    if (eventInfo.category) {
      stats.biomarkerCategories[eventInfo.category] = (stats.biomarkerCategories[eventInfo.category] || 0) + 1;
    }
    
    stats.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
    
    // Log summary every 10 events
    if (stats.totalEvents % 10 === 0) {
      console.log('📡 Event Statistics Summary:', {
        total: stats.totalEvents,
        types: Object.keys(stats.eventTypes).length,
        scores: Object.keys(stats.scoreTypes).length,
        topEventType: Object.entries(stats.eventTypes)
          .sort((a: any, b: any) => b[1] - a[1])[0]
      });
    }
  } catch (error) {
    console.error('Failed to track event type:', error);
  }
}

// Helper function to verify webhook signature
function verifyWebhookSignature(signature: string, payload: string, secret: string): boolean {
  try {
    // Sahha uses HMAC-SHA256 for webhook signatures
    // Try both hex and base64 formats as different webhook providers use different formats
    
    // Try hex format first (most common)
    const expectedSignatureHex = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Also compute base64 format
    const expectedSignatureBase64 = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64');
    
    // Check if signature matches either format
    if (signature.toLowerCase() === expectedSignatureHex.toLowerCase()) {
      console.log('✅ Signature verified (hex format)');
      return true;
    }
    
    if (signature === expectedSignatureBase64) {
      console.log('✅ Signature verified (base64 format)');
      return true;
    }
    
    // Log for debugging
    console.error('Signature mismatch:');
    console.error('  Received:', signature.substring(0, 20) + '...');
    console.error('  Expected (hex):', expectedSignatureHex.substring(0, 20) + '...');
    console.error('  Expected (base64):', expectedSignatureBase64.substring(0, 20) + '...');
    
    return false;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}