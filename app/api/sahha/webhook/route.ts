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
  eventType?: 'ScoreCreatedIntegrationEvent' | 'BiomarkerCreatedIntegrationEvent' | string;
  data?: any; // The actual payload data
  timestamp?: string;
  
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
  dataType?: string;
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
  value?: string;
  dataType?: string;
  ordinality?: number;
  periodicity?: string;
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
    
    // Log received headers for debugging
    console.log('📨 Webhook headers received:', {
      hasSignature: !!signature,
      externalId,
      eventType
    });
    
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
    
    // Verify signature if secret is configured
    if (webhookSecret && signature && !bypassSignature) {
      const isValid = verifyWebhookSignature(signature, rawBody, webhookSecret);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Webhook signature verified');
    } else if (bypassSignature) {
      console.log('⚠️ Signature verification bypassed for testing');
    }

    // Parse webhook payload
    const payload: SahhaWebhookPayload = JSON.parse(rawBody);
    
    // Use event type from header or payload
    const actualEventType = eventType || payload.eventType;
    let actualPayload = payload;
    
    // Log the event type we're processing
    console.log('📨 Sahha webhook event:', {
      eventType: actualEventType,
      externalId: externalId || payload.externalId,
      hasData: !!payload.data,
      timestamp: payload.timestamp || new Date().toISOString()
    });
    
    // If payload has a data field, extract it (for Integration Events)
    if (payload.data) {
      actualPayload = payload.data;
    }
    
    // Add external ID from header if not in payload
    if (externalId && !actualPayload.externalId) {
      actualPayload.externalId = externalId;
    }
    
    // Detect webhook type
    const isScore = actualPayload.type && actualPayload.score !== undefined;
    const isBiomarker = actualPayload.category && actualPayload.type && actualPayload.value !== undefined && !actualPayload.score;
    const isArchetype = actualPayload.name && actualPayload.dataType;
    const isDataLog = actualPayload.logType && actualPayload.dataLogs;
    const isEventBased = !!actualPayload.event;
    
    console.log('📊 Processing webhook data:', {
      type: isScore ? 'score' : isBiomarker ? 'biomarker' : isArchetype ? 'archetype' : isDataLog ? 'datalog' : isEventBased ? 'event-based' : 'unknown',
      scoreType: actualPayload.type,
      category: actualPayload.category,
      logType: actualPayload.logType,
      archetypeName: actualPayload.name,
      event: actualPayload.event,
      externalId: actualPayload.externalId,
      timestamp: actualPayload.timestamp || actualPayload.createdAtUtc || actualPayload.receivedAtUtc,
      profileCount: (actualPayload.data && actualPayload.data.profiles) ? actualPayload.data.profiles.length : 1
    });

    // Load existing data
    const existingData = await loadWebhookData();

    // Handle direct formats (what Sahha actually sends)
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
          lastUpdated: actualPayload.createdAtUtc
        };
      }
      
      // Handle score payload
      if (isScore && actualPayload.type) {
        existingData[externalId].scores[actualPayload.type] = {
          value: actualPayload.score,
          state: actualPayload.state,
          scoreDateTime: actualPayload.scoreDateTime,
          dataSources: actualPayload.dataSources,
          version: actualPayload.version,
          updatedAt: actualPayload.createdAtUtc
        };
        
        // Store factors
        if (actualPayload.factors) {
          existingData[externalId].factors[actualPayload.type] = actualPayload.factors;
        }
        
        console.log(`✅ Updated ${actualPayload.type} score for ${externalId}: ${actualPayload.score}`);
      }
      
      // Handle biomarker payload
      if (isBiomarker && actualPayload.category && actualPayload.type) {
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
      
      // Handle archetype payload
      if (isArchetype && actualPayload.name) {
        existingData[externalId].archetypes[actualPayload.name] = {
          value: actualPayload.value,
          dataType: actualPayload.dataType,
          ordinality: actualPayload.ordinality,
          periodicity: actualPayload.periodicity,
          startDateTime: actualPayload.startDateTime,
          endDateTime: actualPayload.endDateTime,
          version: actualPayload.version,
          updatedAt: actualPayload.createdAtUtc
        };
        
        console.log(`✅ Updated archetype '${actualPayload.name}' for ${externalId}: ${actualPayload.value}`);
      }
      
      // Handle data log payload
      if (isDataLog && actualPayload.dataLogs) {
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
        
        console.log(`✅ Added ${actualPayload.dataLogs.length} data logs for ${logKey} on ${externalId}`);
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

// GET endpoint to retrieve webhook data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const externalId = searchParams.get('externalId');
    
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

// Helper function to verify webhook signature
function verifyWebhookSignature(signature: string, payload: string, secret: string): boolean {
  try {
    // Sahha uses HMAC-SHA256 for webhook signatures
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64');
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}