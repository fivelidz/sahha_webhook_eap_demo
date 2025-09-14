#!/usr/bin/env node

// Raw webhook capture tool
// Captures exactly what Sahha sends without processing

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const captureFile = path.join(__dirname, 'data', 'raw-webhook-capture.json');

let captures = [];

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      const capture = {
        timestamp: new Date().toISOString(),
        headers: req.headers,
        body: body,
        parsedBody: null
      };
      
      try {
        capture.parsedBody = JSON.parse(body);
      } catch (e) {
        capture.parseError = e.message;
      }
      
      captures.push(capture);
      
      // Keep last 50 captures
      if (captures.length > 50) {
        captures = captures.slice(-50);
      }
      
      // Save to file
      fs.writeFileSync(captureFile, JSON.stringify(captures, null, 2));
      
      console.log(`📨 Captured webhook at ${capture.timestamp}`);
      console.log('Headers:', {
        'x-signature': req.headers['x-signature'] ? '✓' : '✗',
        'x-external-id': req.headers['x-external-id'] || 'missing',
        'x-event-type': req.headers['x-event-type'] || 'missing'
      });
      
      if (capture.parsedBody) {
        console.log('Body structure:', {
          hasData: !!capture.parsedBody.data,
          hasType: !!capture.parsedBody.type,
          hasScore: capture.parsedBody.score !== undefined,
          keys: Object.keys(capture.parsedBody).slice(0, 10)
        });
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, captured: true }));
    });
  } else if (req.method === 'GET' && req.url === '/captures') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ captures, count: captures.length }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🎯 Raw Webhook Capture Server`);
  console.log(`📡 Listening on http://localhost:${PORT}/webhook`);
  console.log(`📊 View captures at http://localhost:${PORT}/captures`);
  console.log(`💾 Saving to ${captureFile}`);
  console.log('\nConfigure Sahha webhook to point to this URL to capture raw payloads.');
  console.log('Press Ctrl+C to stop.\n');
});