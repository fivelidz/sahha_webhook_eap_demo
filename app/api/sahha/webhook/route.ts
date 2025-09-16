// Webhook receiver for Sahha data push notifications
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  loadWebhookData, 
  saveWebhookData, 
  updateWebhookProfile, 
  logWebhookActivity 
} from '../../../../lib/webhook-storage';

// Sahha webhook secret for signature verification
const WEBHOOK_SECRET = process.env.SAHHA_WEBHOOK_SECRET || 'JjG7PCP2c8Y7yAuk+Yhz+mzMDkzcRUffwx/e+zBRdGE=';

// Store webhook history
async function storeWebhookHistory(data: any) {
  try {
    const fs = (await import('fs')).promises;
    const path = (await import('path')).default;
    const historyFile = path.join(process.cwd(), 'data', 'webhook-history.json');
    
    let history: any[] = [];
    try {
      const existing = await fs.readFile(historyFile, 'utf-8');
      history = JSON.parse(existing);
    } catch {
      // No history file yet
    }
    
    // Add new entry (keep last 1000 entries)
    history.unshift(data);
    if (history.length > 1000) {
      history = history.slice(0, 1000);
    }
    
    await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
    console.log(`📝 Stored webhook in history (${history.length} total entries)`);
  } catch (error) {
    console.error('Failed to store webhook history:', error);
  }
}

// Update webhook stats
async function updateWebhookStats(stats: any) {
  try {
    const fs = (await import('fs')).promises;
    const path = (await import('path')).default;
    const statsFile = path.join(process.cwd(), 'data', 'webhook-stats.json');
    
    let existingStats: any = {};
    try {
      const existing = await fs.readFile(statsFile, 'utf-8');
      existingStats = JSON.parse(existing);
    } catch {
      // No stats file yet
    }
    
    // Update stats
    existingStats = {
      ...existingStats,
      ...stats,
      totalWebhooksReceived: (existingStats.totalWebhooksReceived || 0) + 1,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(statsFile, JSON.stringify(existingStats, null, 2));
  } catch (error) {
    console.error('Failed to update webhook stats:', error);
  }
}

// Verify Sahha webhook signature
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature || !WEBHOOK_SECRET) {
    console.log('⚠️ Signature verification skipped (no signature or secret)');
    return true; // Allow for testing without signature
  }
  
  try {
    // Sahha uses HMAC-SHA256 for webhook signatures
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('base64');
    
    // Constant-time comparison to prevent timing attacks
    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    
    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// POST endpoint to receive webhook data from Sahha
export async function POST(request: NextRequest) {
  try {
    // Log incoming webhook
    const headers = request.headers;
    const signature = headers.get('X-Sahha-Signature') || headers.get('x-sahha-signature') || headers.get('X-Signature') || headers.get('x-signature');
    const externalId = headers.get('X-External-Id') || headers.get('x-external-id');
    const eventType = headers.get('X-Event-Type') || headers.get('x-event-type');
    
    console.log('📨 Webhook POST received:', {
      url: request.url,
      method: request.method,
      headers: {
        'event-type': eventType,
        'external-id': externalId,
        'signature': signature ? 'present' : 'missing',
        'content-type': headers.get('content-type')
      },
      timestamp: new Date().toISOString()
    });
    
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify signature if provided
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      console.warn('⚠️ Webhook signature verification failed');
      // For now, log but don't reject to allow testing
      // return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    
    // Store raw webhook data for history
    await storeWebhookHistory({
      timestamp: new Date().toISOString(),
      eventType: eventType || payload.eventType || 'unknown',
      externalId: externalId || payload.externalId,
      payload: payload,
      headers: {
        'event-type': eventType,
        'external-id': externalId,
        'signature': signature ? 'present' : 'missing'
      }
    });
    
    // Load existing data
    const existingData = await loadWebhookData();
    
    // Process based on event type
    const actualEventType = eventType || payload.eventType;
    
    // Handle Sahha Integration Events
    if (actualEventType && actualEventType.includes('IntegrationEvent')) {
      console.log('🔄 Processing Sahha Integration Event:', actualEventType);
      
      const profileId = externalId || payload.externalId || payload.profileId;
      
      if (!profileId) {
        console.warn('⚠️ No profile ID found in webhook');
        return NextResponse.json({ 
          success: false, 
          error: 'No profile ID provided' 
        }, { status: 400 });
      }
      
      // Initialize profile if doesn't exist
      if (!existingData[profileId]) {
        existingData[profileId] = {
          profileId: profileId,
          externalId: profileId,
          accountId: payload.accountId,
          archetypes: {},
          scores: {},
          factors: {},
          biomarkers: {},
          dataLogs: [],
          department: 'unassigned',
          createdAt: payload.createdAtUtc || new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
      }
      
      // Update based on event type
      switch (actualEventType) {
        case 'ScoreCreatedIntegrationEvent':
          if (payload.type && payload.score !== undefined) {
            existingData[profileId].scores[payload.type] = {
              value: payload.score,
              state: payload.state,
              factors: payload.factors,
              updatedAt: payload.scoreDateTime || new Date().toISOString()
            };
            console.log(`✅ Updated ${payload.type} score for ${profileId}: ${payload.score}`);
          }
          break;
          
        case 'ArchetypeCreatedIntegrationEvent':
          if (payload.name && payload.value) {
            existingData[profileId].archetypes[payload.name] = {
              value: payload.value,
              dataType: payload.dataType,
              ordinality: payload.ordinality,
              periodicity: payload.periodicity,
              startDateTime: payload.startDateTime,
              endDateTime: payload.endDateTime,
              version: payload.version,
              updatedAt: payload.updatedAt || new Date().toISOString()
            };
            console.log(`✅ Updated archetype ${payload.name} for ${profileId}: ${payload.value}`);
          }
          break;
          
        case 'BiomarkerCreatedIntegrationEvent':
          if (payload.type && payload.value !== undefined) {
            // Ensure biomarkers object exists
            if (!existingData[profileId].biomarkers) {
              existingData[profileId].biomarkers = {};
            }
            
            const biomarkerKey = `${payload.category}_${payload.type}`;
            existingData[profileId].biomarkers[biomarkerKey] = {
              category: payload.category,
              type: payload.type,
              value: payload.value,
              unit: payload.unit,
              periodicity: payload.periodicity,
              aggregation: payload.aggregation,
              updatedAt: new Date().toISOString()
            };
            console.log(`✅ Updated biomarker ${biomarkerKey} for ${profileId}`);
          }
          break;
          
        case 'DataLogReceivedIntegrationEvent':
          if (payload.dataLogs && Array.isArray(payload.dataLogs)) {
            existingData[profileId].dataLogs = existingData[profileId].dataLogs || [];
            existingData[profileId].dataLogs.push(...payload.dataLogs);
            console.log(`✅ Added ${payload.dataLogs.length} data logs for ${profileId}`);
          }
          break;
      }
      
      existingData[profileId].lastUpdated = new Date().toISOString();
    }
    // Handle batch updates
    else if (payload.profiles && Array.isArray(payload.profiles)) {
      console.log(`📦 Processing batch update with ${payload.profiles.length} profiles`);
      
      for (const profile of payload.profiles) {
        const profileId = profile.externalId || profile.profileId;
        
        if (!profileId) continue;
        
        // Merge profile data
        existingData[profileId] = {
          ...existingData[profileId],
          ...profile,
          lastUpdated: new Date().toISOString()
        };
      }
    }
    // Handle single profile update
    else if (payload.externalId || payload.profileId) {
      const profileId = payload.externalId || payload.profileId;
      
      existingData[profileId] = {
        ...existingData[profileId],
        ...payload,
        lastUpdated: new Date().toISOString()
      };
      
      console.log(`✅ Updated profile ${profileId}`);
    }
    
    // Save updated data
    await saveWebhookData(existingData);
    
    // Update stats
    await updateWebhookStats({
      totalProfiles: Object.keys(existingData).length,
      lastReceived: new Date().toISOString(),
      lastEventType: actualEventType || 'unknown',
      source: 'sahha_webhook'
    });
    
    // Log webhook activity
    await logWebhookActivity({
      timestamp: new Date().toISOString(),
      event: actualEventType || 'unknown',
      profilesUpdated: payload.profiles ? payload.profiles.length : 1,
      success: true
    });
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      event: actualEventType,
      profilesProcessed: payload.profiles ? payload.profiles.length : 1
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
    const mode = searchParams.get('mode');
    const history = searchParams.get('history');
    
    // If history is requested, return webhook history
    if (history === 'true') {
      try {
        const fs = (await import('fs')).promises;
        const path = (await import('path')).default;
        const historyFile = path.join(process.cwd(), 'data', 'webhook-history.json');
        
        const historyData = await fs.readFile(historyFile, 'utf-8');
        const historyArray = JSON.parse(historyData);
        
        return NextResponse.json({
          success: true,
          count: historyArray.length,
          history: historyArray.slice(0, 100), // Return last 100 entries
          stats: {
            totalEntries: historyArray.length,
            oldestEntry: historyArray[historyArray.length - 1]?.timestamp,
            newestEntry: historyArray[0]?.timestamp
          }
        });
      } catch (error) {
        return NextResponse.json({
          success: true,
          count: 0,
          history: [],
          message: 'No webhook history available'
        });
      }
    }
    
    // If demo mode is requested, return demo data
    if (mode === 'demo') {
      const demoData = await generateDemoWebhookData();
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
    
    // Load department assignments
    const fs = (await import('fs')).promises;
    const path = (await import('path')).default;
    const deptFile = path.join(process.cwd(), 'data', 'department-assignments.json');
    
    let deptAssignments: any = {};
    try {
      const deptData = await fs.readFile(deptFile, 'utf-8');
      deptAssignments = JSON.parse(deptData);
    } catch {
      // No assignments file yet
    }
    
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
    
    // Return all webhook data with department assignments
    const profiles = Object.values(data).map((profile: any) => {
      const profileId = profile.profileId || profile.externalId;
      
      // Apply department assignment or default to 'unassigned'
      if (deptAssignments[profileId]) {
        profile.department = deptAssignments[profileId];
      } else if (!profile.department) {
        profile.department = 'unassigned';
      }
      
      return profile;
    });
    
    // Load stats
    let stats: any = {};
    try {
      const statsFile = path.join(process.cwd(), 'data', 'webhook-stats.json');
      const statsData = await fs.readFile(statsFile, 'utf-8');
      stats = JSON.parse(statsData);
    } catch {
      // No stats yet
    }
    
    return NextResponse.json({
      success: true,
      count: profiles.length,
      profiles,
      lastUpdated: profiles.reduce((latest, p: any) => {
        return p.lastUpdated > latest ? p.lastUpdated : latest;
      }, ''),
      stats: {
        ...stats,
        profileCount: profiles.length,
        departmentBreakdown: profiles.reduce((acc: any, p: any) => {
          const dept = p.department || 'unassigned';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {})
      }
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

// Generate demo webhook data for testing
async function generateDemoWebhookData() {
  const profiles: any[] = [];
  const departments = ['tech', 'sales', 'operations', 'admin', 'unassigned'];
  
  // Complete archetype definitions
  const archetypeValues = {
    // Activity archetypes
    activity_level: ['sedentary', 'lightly_active', 'moderately_active', 'highly_active'],
    exercise_frequency: ['rare_exerciser', 'occasional_exerciser', 'regular_exerciser', 'frequent_exerciser'],
    primary_exercise: ['cardio', 'strength', 'flexibility', 'mixed', 'none'],
    primary_exercise_type: ['running', 'cycling', 'swimming', 'gym', 'yoga', 'walking', 'other'],
    secondary_exercise: ['cardio', 'strength', 'flexibility', 'mixed', 'none'],
    
    // Sleep archetypes
    sleep_pattern: ['poor_sleeper', 'fair_sleeper', 'good_sleeper', 'excellent_sleeper'],
    sleep_quality: ['poor', 'fair', 'good', 'excellent'],
    sleep_duration: ['very_short', 'short', 'optimal', 'long'],
    sleep_efficiency: ['poor', 'fair', 'good', 'excellent'],
    sleep_regularity: ['irregular', 'somewhat_regular', 'regular', 'very_regular'],
    bed_schedule: ['early_bird', 'normal', 'night_owl', 'variable'],
    wake_schedule: ['early_riser', 'normal', 'late_riser', 'variable'],
    
    // Wellness archetypes
    mental_wellness: ['poor_mental_wellness', 'fair_mental_wellness', 'good_mental_wellness', 'optimal_mental_wellness'],
    overall_wellness: ['poor', 'fair', 'good', 'optimal']
  };
  
  // Generate 50 demo profiles with better department distribution
  for (let i = 0; i < 50; i++) {
    const profileId = `demo-${String(i).padStart(4, '0')}`;
    // Better department distribution: 30% unassigned, rest evenly distributed
    const deptIndex = i < 15 ? 4 : Math.floor((i - 15) / 9); // 15 unassigned, ~9 each for others
    const dept = departments[Math.min(deptIndex, departments.length - 1)];
    
    // Generate correlated scores (50-90 range for more realistic data)
    const baseScore = 50 + Math.random() * 40;
    
    // Generate individual scores with realistic variance
    const wellbeingScore = Math.max(0, Math.min(100, baseScore + (Math.random() * 20 - 10)));
    const activityScore = Math.max(0, Math.min(100, baseScore + (Math.random() * 25 - 12.5)));
    const sleepScore = Math.max(0, Math.min(100, baseScore + (Math.random() * 15 - 7.5)));
    const mentalScore = Math.max(0, Math.min(100, baseScore + (Math.random() * 20 - 10)));
    const readinessScore = Math.max(0, Math.min(100, (wellbeingScore + sleepScore) / 2 + (Math.random() * 10 - 5)));
    
    // Determine archetype indices based on scores
    const activityIndex = Math.min(3, Math.floor(activityScore / 25));
    const sleepIndex = Math.min(3, Math.floor(sleepScore / 25));
    const mentalIndex = Math.min(3, Math.floor(mentalScore / 25));
    const wellbeingIndex = Math.min(3, Math.floor(wellbeingScore / 25));
    
    // Determine exercise type based on activity level
    const exerciseTypeIndex = activityIndex > 1 ? Math.floor(Math.random() * 6) : 6; // Active people have varied exercise, inactive default to 'other'
    const primaryExerciseType = activityIndex > 1 ? 
      Math.floor(Math.random() * 4) : 4; // Active: varied types, Inactive: none
    
    const profile = {
      profileId,
      externalId: `Demo-User-${i}`,
      department: dept,
      scores: {
        wellbeing: {
          value: wellbeingScore,
          state: wellbeingScore > 70 ? 'good' : wellbeingScore > 40 ? 'moderate' : 'poor',
          updatedAt: new Date().toISOString()
        },
        activity: {
          value: activityScore,
          state: activityScore > 60 ? 'active' : 'inactive',
          updatedAt: new Date().toISOString()
        },
        sleep: {
          value: sleepScore,
          state: sleepScore > 65 ? 'good' : 'poor',
          updatedAt: new Date().toISOString()
        },
        mentalWellbeing: {
          value: mentalScore,
          state: mentalScore > 70 ? 'good' : 'moderate',
          updatedAt: new Date().toISOString()
        },
        readiness: {
          value: readinessScore,
          state: readinessScore > 70 ? 'ready' : readinessScore > 40 ? 'moderate' : 'low',
          updatedAt: new Date().toISOString()
        }
      },
      archetypes: {
        // Activity archetypes
        activity_level: {
          value: archetypeValues.activity_level[activityIndex],
          dataType: 'ordinal',
          updatedAt: new Date().toISOString()
        },
        exercise_frequency: {
          value: archetypeValues.exercise_frequency[activityIndex],
          dataType: 'ordinal',
          updatedAt: new Date().toISOString()
        },
        primary_exercise: {
          value: archetypeValues.primary_exercise[primaryExerciseType],
          dataType: 'categorical',
          updatedAt: new Date().toISOString()
        },
        primary_exercise_type: {
          value: archetypeValues.primary_exercise_type[exerciseTypeIndex],
          dataType: 'categorical',
          updatedAt: new Date().toISOString()
        },
        secondary_exercise: {
          value: archetypeValues.secondary_exercise[Math.floor(Math.random() * 5)],
          dataType: 'categorical',
          updatedAt: new Date().toISOString()
        },
        
        // Sleep archetypes
        sleep_pattern: {
          value: archetypeValues.sleep_pattern[sleepIndex],
          dataType: 'ordinal',
          updatedAt: new Date().toISOString()
        },
        sleep_quality: {
          value: archetypeValues.sleep_quality[sleepIndex],
          dataType: 'ordinal',
          updatedAt: new Date().toISOString()
        },
        sleep_duration: {
          value: archetypeValues.sleep_duration[sleepIndex],
          dataType: 'ordinal',
          updatedAt: new Date().toISOString()
        },
        sleep_efficiency: {
          value: archetypeValues.sleep_efficiency[sleepIndex],
          dataType: 'ordinal',
          updatedAt: new Date().toISOString()
        },
        sleep_regularity: {
          value: archetypeValues.sleep_regularity[Math.min(3, Math.floor(Math.random() * 4))],
          dataType: 'ordinal',
          updatedAt: new Date().toISOString()
        },
        bed_schedule: {
          value: archetypeValues.bed_schedule[Math.floor(Math.random() * 4)],
          dataType: 'categorical',
          updatedAt: new Date().toISOString()
        },
        wake_schedule: {
          value: archetypeValues.wake_schedule[Math.floor(Math.random() * 4)],
          dataType: 'categorical',
          updatedAt: new Date().toISOString()
        },
        
        // Wellness archetypes
        mental_wellness: {
          value: archetypeValues.mental_wellness[mentalIndex],
          dataType: 'ordinal',
          updatedAt: new Date().toISOString()
        },
        overall_wellness: {
          value: archetypeValues.overall_wellness[wellbeingIndex],
          dataType: 'ordinal',
          updatedAt: new Date().toISOString()
        }
      },
      lastUpdated: new Date().toISOString()
    };
    
    profiles.push(profile);
  }
  
  return {
    profiles,
    stats: {
      totalProfiles: profiles.length,
      averageWellbeing: Math.round(profiles.reduce((sum, p) => sum + p.scores.wellbeing.value, 0) / profiles.length),
      averageActivity: Math.round(profiles.reduce((sum, p) => sum + p.scores.activity.value, 0) / profiles.length),
      averageSleep: Math.round(profiles.reduce((sum, p) => sum + p.scores.sleep.value, 0) / profiles.length),
      averageMental: Math.round(profiles.reduce((sum, p) => sum + p.scores.mentalWellbeing.value, 0) / profiles.length),
      averageReadiness: Math.round(profiles.reduce((sum, p) => sum + p.scores.readiness.value, 0) / profiles.length),
      departmentBreakdown: departments.reduce((acc, dept) => {
        acc[dept] = profiles.filter(p => p.department === dept).length;
        return acc;
      }, {} as Record<string, number>)
    }
  };
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
    
    // Clear all webhook data
    await saveWebhookData({});
    
    // Clear history
    const fs = (await import('fs')).promises;
    const path = (await import('path')).default;
    const historyFile = path.join(process.cwd(), 'data', 'webhook-history.json');
    
    try {
      await fs.writeFile(historyFile, '[]');
    } catch {
      // History file doesn't exist
    }
    
    return NextResponse.json({
      success: true,
      message: 'All webhook data cleared'
    });
    
  } catch (error: any) {
    console.error('❌ Error clearing webhook data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear webhook data',
      details: error.message
    }, { status: 500 });
  }
}