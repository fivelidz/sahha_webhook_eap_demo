// API endpoint to test Sahha connection with provided credentials
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, clientSecret, apiBaseUrl } = body;

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Client ID and Client Secret are required'
      }, { status: 400 });
    }

    const baseUrl = apiBaseUrl || 'https://sandbox-api.sahha.ai';
    
    console.log('🔍 Testing Sahha connection...');
    
    // Test authentication with provided credentials
    const authResponse = await axios.post(
      `${baseUrl}/api/v1/oauth/account/token`,
      {
        clientId: clientId,
        clientSecret: clientSecret,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 second timeout
      }
    );

    if (authResponse.data && authResponse.data.accountToken) {
      const accountToken = authResponse.data.accountToken;
      console.log('✅ Authentication successful');

      // Test profile access
      try {
        const profileResponse = await axios.get(
          `${baseUrl}/api/v1/account/profile/search`,
          {
            headers: {
              'Authorization': `Bearer ${accountToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              pageSize: 5,
              currentPage: 1
            },
            timeout: 10000
          }
        );

        const profiles = profileResponse.data.items || [];
        console.log(`✅ Profile access successful - found ${profiles.length} profiles`);

        return NextResponse.json({
          success: true,
          message: `✅ Connection successful! Found ${profiles.length} profiles`,
          tokenLength: accountToken.length,
          profileCount: profiles.length,
          apiUrl: baseUrl
        });

      } catch (profileError: any) {
        console.log('⚠️ Auth successful but profile access limited');
        return NextResponse.json({
          success: true,
          message: '✅ Authentication successful, but profile access may be limited',
          tokenLength: accountToken.length,
          warning: 'Could not access profiles - check permissions',
          apiUrl: baseUrl
        });
      }

    } else {
      return NextResponse.json({
        success: false,
        error: 'Authentication succeeded but no token received'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message);
    
    let errorMessage = 'Connection failed';
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      
      switch (error.response.status) {
        case 401:
          errorMessage = 'Invalid credentials - check your Client ID and Client Secret';
          break;
        case 403:
          errorMessage = 'Access forbidden - check your account permissions';
          break;
        case 404:
          errorMessage = 'API endpoint not found - check your API base URL';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded - try again later';
          break;
        default:
          errorMessage = `API error: ${error.response.status} ${error.response.statusText}`;
      }
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to Sahha API - check your network and API URL';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'API hostname not found - check your API base URL';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timeout - Sahha API is not responding';
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  }
}