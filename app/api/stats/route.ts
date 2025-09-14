import { NextRequest, NextResponse } from 'next/server';
import { generateWebhookStats, saveWebhookStats } from '../../../lib/webhook-stats';

export async function GET(request: NextRequest) {
  try {
    const stats = await generateWebhookStats();
    await saveWebhookStats(stats);
    
    return NextResponse.json({
      success: true,
      stats,
      generated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error generating stats:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}