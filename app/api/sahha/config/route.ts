import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'webhook-config.json');

async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { configured: false };
  }
}

async function saveConfig(config: any) {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// GET - Check current configuration
export async function GET() {
  try {
    const config = await loadConfig();
    
    // Count profiles
    let profileCount = 0;
    try {
      const dataFile = path.join(process.cwd(), 'data', 'sahha-webhook-data.json');
      const data = await fs.readFile(dataFile, 'utf-8');
      const profiles = JSON.parse(data);
      profileCount = Object.keys(profiles).length;
    } catch {
      // No data yet
    }
    
    return NextResponse.json({
      configured: config.configured || false,
      webhookUrl: config.webhookUrl,
      tunnelUrl: config.tunnelUrl,
      secret: config.webhookSecret ? '••••••••' : null,
      profileCount,
    });
  } catch (error) {
    return NextResponse.json({ configured: false }, { status: 500 });
  }
}

// POST - Save configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl, webhookSecret, tunnelUrl } = body;
    
    const config = {
      configured: true,
      webhookUrl,
      webhookSecret,
      tunnelUrl,
      createdAt: new Date().toISOString(),
    };
    
    await saveConfig(config);
    
    // Also save to environment
    if (webhookSecret) {
      process.env.SAHHA_WEBHOOK_SECRET = webhookSecret;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}