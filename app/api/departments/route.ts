// Department assignment API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const ASSIGNMENTS_FILE = path.join(process.cwd(), 'data', 'department-assignments.json');

// GET endpoint to retrieve department assignments
export async function GET(request: NextRequest) {
  try {
    const data = await fs.readFile(ASSIGNMENTS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    // Return empty object if file doesn't exist
    return NextResponse.json({});
  }
}

// POST endpoint to save department assignments
export async function POST(request: NextRequest) {
  try {
    const assignments = await request.json();
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (e) {
      // Directory already exists
    }
    
    // Save assignments to file
    await fs.writeFile(ASSIGNMENTS_FILE, JSON.stringify(assignments, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Department assignments saved',
      count: Object.keys(assignments).length 
    });
  } catch (error: any) {
    console.error('Error saving department assignments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}