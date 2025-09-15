'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  Grid,
  Divider,
  Chip,
  Stack,
  Alert
} from '@mui/material';

export default function MCPGuidePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        MCP Integration Guide
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Model Context Protocol (MCP) integration for Sahha Wellness Platform
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        This guide explains how to integrate the Sahha MCP server with your AI assistants like Claude Desktop.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Overview
              </Typography>
              <Typography paragraph>
                The Sahha MCP server provides direct access to wellness analytics data through Claude Desktop and other MCP-compatible AI assistants.
              </Typography>
              <Typography paragraph>
                Key features:
              </Typography>
              <Stack spacing={1} sx={{ ml: 2 }}>
                <Typography>• Fetch individual and aggregate wellness scores</Typography>
                <Typography>• Access detailed health analytics by category</Typography>
                <Typography>• Query historical data trends</Typography>
                <Typography>• Generate insights from wellness patterns</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Installation
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                1. Install Claude Desktop
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white' }}>
                <code>Download from: https://claude.ai/desktop</code>
              </Paper>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                2. Add Sahha MCP Server to Configuration
              </Typography>
              <Typography paragraph>
                Edit your Claude Desktop configuration file:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'common.white' }}>
                <pre>{`{
  "mcpServers": {
    "sahha": {
      "command": "node",
      "args": ["./mcp-server.js"],
      "env": {
        "SAHHA_CLIENT_ID": "your-client-id",
        "SAHHA_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}`}</pre>
              </Paper>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                3. Restart Claude Desktop
              </Typography>
              <Typography>
                After updating the configuration, restart Claude Desktop to load the MCP server.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Available Commands
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Chip label="getProfiles" color="primary" size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    Fetch all profiles with their wellness scores
                  </Typography>
                </Box>
                
                <Box>
                  <Chip label="getProfileScore" color="primary" size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    Get detailed scores for a specific profile
                  </Typography>
                </Box>
                
                <Box>
                  <Chip label="getDepartmentAnalytics" color="primary" size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    Analyze wellness metrics by department
                  </Typography>
                </Box>
                
                <Box>
                  <Chip label="getWellnessTrends" color="primary" size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    View historical wellness trends over time
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Example Usage
              </Typography>
              
              <Typography paragraph>
                Once configured, you can ask Claude:
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2" fontFamily="monospace">
                  "Show me the wellness scores for all employees in the tech department"
                </Typography>
              </Paper>
              
              <Typography sx={{ mt: 2 }}>
                Claude will use the MCP server to fetch real-time data and provide insights.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Security Notes
              </Typography>
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    • Store API credentials securely in environment variables
                  </Typography>
                  <Typography variant="body2">
                    • Never commit credentials to version control
                  </Typography>
                  <Typography variant="body2">
                    • Use read-only API keys when possible
                  </Typography>
                  <Typography variant="body2">
                    • Regularly rotate API credentials
                  </Typography>
                </Stack>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}