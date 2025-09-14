// Robust webhook data storage with file locking
import fs from 'fs/promises';
import path from 'path';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();
const WEBHOOK_DATA_FILE = path.join(process.cwd(), 'data', 'sahha-webhook-data.json');
const WEBHOOK_BACKUP_FILE = path.join(process.cwd(), 'data', 'sahha-webhook-backup.json');

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function loadWebhookData(): Promise<Record<string, any>> {
  const release = await mutex.acquire();
  try {
    await ensureDataDirectory();
    
    // Try main file first
    try {
      const data = await fs.readFile(WEBHOOK_DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Try backup file
      try {
        const data = await fs.readFile(WEBHOOK_BACKUP_FILE, 'utf-8');
        console.log('📂 Loaded from backup file');
        return JSON.parse(data);
      } catch {
        return {};
      }
    }
  } finally {
    release();
  }
}

export async function saveWebhookData(data: Record<string, any>) {
  const release = await mutex.acquire();
  try {
    await ensureDataDirectory();
    
    // Create backup of existing data
    try {
      await fs.copyFile(WEBHOOK_DATA_FILE, WEBHOOK_BACKUP_FILE);
    } catch {
      // No existing file to backup
    }
    
    // Write new data
    await fs.writeFile(WEBHOOK_DATA_FILE, JSON.stringify(data, null, 2));
    
    console.log(`💾 Saved ${Object.keys(data).length} profiles to webhook storage`);
  } finally {
    release();
  }
}

export async function updateWebhookProfile(externalId: string, profileData: any) {
  const release = await mutex.acquire();
  try {
    const existingData = await loadWebhookDataInternal();
    
    // Initialize profile if doesn't exist
    if (!existingData[externalId]) {
      existingData[externalId] = {
        profileId: profileData.profileId,
        externalId: externalId,
        accountId: profileData.accountId,
        archetypes: {},
        scores: {},
        factors: {},
        biomarkers: {},
        dataLogs: {},
        lastUpdated: profileData.createdAtUtc || new Date().toISOString()
      };
    }
    
    // Merge new data
    existingData[externalId] = {
      ...existingData[externalId],
      ...profileData,
      lastUpdated: new Date().toISOString()
    };
    
    await saveWebhookDataInternal(existingData);
    return existingData[externalId];
  } finally {
    release();
  }
}

// Internal functions without mutex (called within mutex-protected functions)
async function loadWebhookDataInternal(): Promise<Record<string, any>> {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(WEBHOOK_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    try {
      const data = await fs.readFile(WEBHOOK_BACKUP_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
}

async function saveWebhookDataInternal(data: Record<string, any>) {
  await ensureDataDirectory();
  try {
    await fs.copyFile(WEBHOOK_DATA_FILE, WEBHOOK_BACKUP_FILE);
  } catch {
    // No existing file to backup
  }
  await fs.writeFile(WEBHOOK_DATA_FILE, JSON.stringify(data, null, 2));
}

export async function logWebhookActivity(logEntry: any) {
  const logFile = path.join(process.cwd(), 'data', 'webhook-activity.log');
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp} | ${JSON.stringify(logEntry)}\n`;
  
  try {
    await fs.appendFile(logFile, logLine);
  } catch {
    // Create file if doesn't exist
    await ensureDataDirectory();
    await fs.writeFile(logFile, logLine);
  }
}