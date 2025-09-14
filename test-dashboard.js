#!/usr/bin/env node

const http = require('http');

function testDashboard() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Dashboard is loading successfully!');
        
        // Check for key elements in the HTML
        if (data.includes('Sahha EAP Dashboard')) {
          console.log('✅ Dashboard title found');
        }
        
        if (data.includes('Profile Management')) {
          console.log('✅ Profile Management section found');
        }
        
        if (data.includes('Executive Overview')) {
          console.log('✅ Executive Overview section found');
        }
        
        // Check for error messages
        if (data.includes('Error') || data.includes('undefined')) {
          console.log('⚠️ Warning: Possible errors detected in the HTML');
        } else {
          console.log('✅ No obvious errors detected');
        }
      } else {
        console.log('❌ Dashboard failed to load');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error connecting to dashboard:', error);
  });

  req.end();
}

// Wait a moment for the server to be ready
setTimeout(testDashboard, 2000);