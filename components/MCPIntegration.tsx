'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Extension,
  Code,
  CloudSync,
  Security,
  Speed,
  CheckCircle,
  ExpandMore,
  ContentCopy,
  GitHub,
  Terminal,
  Api,
  Psychology,
  AutoAwesome,
  DataObject,
  IntegrationInstructions
} from '@mui/icons-material';

export default function MCPIntegration() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const mcpConfigExample = `{
  "mcpServers": {
    "sahha-wellness": {
      "command": "node",
      "args": ["/path/to/sahha-mcp-server.js"],
      "env": {
        "SAHHA_APP_ID": "your-app-id",
        "SAHHA_APP_SECRET": "your-app-secret",
        "SAHHA_CLIENT_ID": "your-client-id",
        "SAHHA_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}`;

  const mcpServerCode = `// sahha-mcp-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';

class SahhaMCPServer {
  constructor() {
    this.server = new Server({
      name: 'sahha-wellness',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
        resources: {},
      },
    });
    
    this.setupTools();
  }

  setupTools() {
    // Tool: Get Wellness Scores
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'get_wellness_scores',
          description: 'Get wellness scores for a profile',
          inputSchema: {
            type: 'object',
            properties: {
              profileId: { type: 'string', description: 'Profile ID' },
              dimensions: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Dimensions to fetch (wellbeing, activity, sleep, etc.)'
              }
            },
            required: ['profileId']
          }
        },
        {
          name: 'analyze_team_wellness',
          description: 'Analyze wellness patterns for a team',
          inputSchema: {
            type: 'object',
            properties: {
              teamId: { type: 'string', description: 'Team or department ID' },
              period: { type: 'string', description: 'Analysis period (day, week, month)' }
            },
            required: ['teamId']
          }
        },
        {
          name: 'get_wellness_insights',
          description: 'Get AI-powered wellness insights and recommendations',
          inputSchema: {
            type: 'object',
            properties: {
              profileIds: { type: 'array', items: { type: 'string' } },
              focusArea: { type: 'string', description: 'Area to focus on (stress, sleep, activity)' }
            }
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'get_wellness_scores':
          return await this.getWellnessScores(args);
        case 'analyze_team_wellness':
          return await this.analyzeTeamWellness(args);
        case 'get_wellness_insights':
          return await this.getWellnessInsights(args);
        default:
          throw new Error(\`Unknown tool: \${name}\`);
      }
    });
  }

  async getWellnessScores(args) {
    // Implementation to fetch scores from Sahha API
    const { profileId, dimensions = ['wellbeing', 'activity', 'sleep'] } = args;
    // ... API calls to Sahha
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ profileId, scores: { /* ... */ } })
      }]
    };
  }

  async analyzeTeamWellness(args) {
    // Implementation for team analysis
    const { teamId, period } = args;
    // ... Analysis logic
    return {
      content: [{
        type: 'text',
        text: 'Team wellness analysis results...'
      }]
    };
  }

  async getWellnessInsights(args) {
    // Implementation for AI insights
    const { profileIds, focusArea } = args;
    // ... Generate insights
    return {
      content: [{
        type: 'text',
        text: 'Wellness insights and recommendations...'
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start the server
const server = new SahhaMCPServer();
server.run().catch(console.error);`;

  const claudeDesktopUsage = `// In your Claude Desktop conversation:

// 1. First, Claude will have access to wellness tools
"Can you analyze the wellness scores for our engineering team?"

// Claude can now:
// - Fetch real-time wellness data
// - Analyze patterns and trends
// - Generate personalized recommendations
// - Create wellness reports

// 2. Example conversation:
User: "What's the overall wellness status of our organization?"

Claude: I'll analyze your organization's wellness data using the Sahha integration.

[Uses get_wellness_scores tool]
[Uses analyze_team_wellness tool]

Based on the analysis:
- Overall wellness score: 72/100
- Top performing area: Sleep (78/100)
- Area needing attention: Activity (65/100)
- 23% of employees show signs of burnout risk
- Recommended interventions: ...

// 3. Advanced use cases:
"Generate a weekly wellness report for the leadership team"
"Identify employees who might benefit from wellness programs"
"Analyze the correlation between wellness and productivity"
"Create personalized wellness plans for each department"`;

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Extension color="primary" fontSize="large" />
          MCP Integration for Sahha Wellness
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Connect Sahha's wellness intelligence directly to Claude Desktop using the Model Context Protocol (MCP).
          Enable AI-powered wellness insights, automated reporting, and proactive employee support.
        </Typography>
      </Box>

      {/* Quick Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <CloudSync sx={{ color: 'white', fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="white">Real-time Data</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Direct access to live wellness metrics
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Psychology sx={{ color: 'white', fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="white">AI Insights</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Intelligent wellness analysis & recommendations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Speed sx={{ color: 'white', fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="white">Automated</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Generate reports and alerts automatically
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CardContent>
              <Security sx={{ color: 'white', fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="white">Secure</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                Enterprise-grade security & privacy
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* What is MCP? */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DataObject color="primary" />
            What is Model Context Protocol?
          </Typography>
          <Typography variant="body1" paragraph>
            MCP (Model Context Protocol) is an open protocol that enables seamless integration between AI assistants 
            like Claude and external data sources. It allows Claude to directly access and interact with your 
            Sahha wellness data in real-time.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <strong>Direct Integration</strong>
                </Typography>
                <Typography variant="body2">
                  Claude can directly query wellness scores, analyze trends, and generate insights without manual data entry.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="success.dark" gutterBottom>
                  <strong>Context-Aware</strong>
                </Typography>
                <Typography variant="body2">
                  The AI understands your organization's wellness context, patterns, and can provide personalized recommendations.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="info.dark" gutterBottom>
                  <strong>Secure & Private</strong>
                </Typography>
                <Typography variant="body2">
                  All data remains secure with credential-based access and follows Sahha's privacy standards.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Installation Steps */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IntegrationInstructions color="primary" />
            Installation Guide
          </Typography>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Step 1: Install Claude Desktop</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Download and install Claude Desktop from Anthropic if you haven't already.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<GitHub />}
                href="https://claude.ai/download"
                target="_blank"
              >
                Download Claude Desktop
              </Button>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Step 2: Configure MCP Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Add the Sahha MCP server to your Claude Desktop configuration file:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', position: 'relative' }}>
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                  onClick={() => handleCopyCode(mcpConfigExample, 'config')}
                >
                  {copiedCode === 'config' ? <CheckCircle color="success" /> : <ContentCopy />}
                </IconButton>
                <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
                  <code>{mcpConfigExample}</code>
                </pre>
              </Paper>
              <Typography variant="caption" display="block" mt={1}>
                Location: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Step 3: Install Sahha MCP Server</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Install the Sahha MCP server package:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'grey.50', mb: 2 }}>
                <Typography variant="body2" fontFamily="monospace">
                  npm install @sahha/mcp-server
                </Typography>
              </Paper>
              <Typography variant="body2" paragraph>
                Or create your own server with this code:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', position: 'relative', maxHeight: 400, overflow: 'auto' }}>
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'white' }}
                  onClick={() => handleCopyCode(mcpServerCode, 'server')}
                >
                  {copiedCode === 'server' ? <CheckCircle color="success" /> : <ContentCopy />}
                </IconButton>
                <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                  <code>{mcpServerCode}</code>
                </pre>
              </Paper>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Step 4: Add Sahha Credentials</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Add your Sahha API credentials to the MCP configuration. You can use environment variables or add them directly to the config:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="App ID"
                    defaultValue="NqrB0AYlviHruQVbF0Cp5Jch2utzQNwe"
                    variant="outlined"
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Client ID"
                    defaultValue="tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW"
                    variant="outlined"
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                These are sandbox credentials for testing. Replace with your production credentials when ready.
              </Alert>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Step 5: Restart Claude Desktop</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Restart Claude Desktop to load the new MCP configuration. You should see "sahha-wellness" in the available tools.
              </Typography>
              <Alert severity="success" icon={<CheckCircle />}>
                Once configured, Claude will have direct access to Sahha wellness data and can help with analysis, reporting, and insights!
              </Alert>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Terminal color="primary" />
            Usage Examples
          </Typography>
          <Typography variant="body2" paragraph>
            Once configured, you can ask Claude to perform wellness-related tasks directly:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', position: 'relative' }}>
            <IconButton
              size="small"
              sx={{ position: 'absolute', right: 8, top: 8 }}
              onClick={() => handleCopyCode(claudeDesktopUsage, 'usage')}
            >
              {copiedCode === 'usage' ? <CheckCircle color="success" /> : <ContentCopy />}
            </IconButton>
            <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
              <code>{claudeDesktopUsage}</code>
            </pre>
          </Paper>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Api color="primary" />
            Available MCP Tools
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  get_wellness_scores
                </Typography>
                <Typography variant="body2" paragraph>
                  Fetch real-time wellness scores for individuals or teams
                </Typography>
                <Chip label="Profile Analysis" size="small" sx={{ mr: 0.5 }} />
                <Chip label="Real-time" size="small" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  analyze_team_wellness
                </Typography>
                <Typography variant="body2" paragraph>
                  Analyze wellness patterns and trends for departments
                </Typography>
                <Chip label="Team Insights" size="small" sx={{ mr: 0.5 }} />
                <Chip label="Trends" size="small" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  get_wellness_insights
                </Typography>
                <Typography variant="body2" paragraph>
                  Generate AI-powered insights and recommendations
                </Typography>
                <Chip label="AI Analysis" size="small" sx={{ mr: 0.5 }} />
                <Chip label="Recommendations" size="small" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  generate_wellness_report
                </Typography>
                <Typography variant="body2" paragraph>
                  Create comprehensive wellness reports
                </Typography>
                <Chip label="Reporting" size="small" sx={{ mr: 0.5 }} />
                <Chip label="Automated" size="small" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  identify_at_risk
                </Typography>
                <Typography variant="body2" paragraph>
                  Identify employees who may need support
                </Typography>
                <Chip label="Proactive" size="small" sx={{ mr: 0.5 }} />
                <Chip label="Support" size="small" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  track_interventions
                </Typography>
                <Typography variant="body2" paragraph>
                  Monitor the effectiveness of wellness programs
                </Typography>
                <Chip label="Monitoring" size="small" sx={{ mr: 0.5 }} />
                <Chip label="ROI" size="small" />
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="primary" />
            Enterprise Use Cases
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Automated Wellness Reporting" 
                secondary="Generate daily, weekly, or monthly wellness reports for leadership automatically"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Proactive Employee Support" 
                secondary="Identify and reach out to employees showing signs of burnout or stress"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Department Comparisons" 
                secondary="Analyze wellness differences across departments and identify best practices"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Intervention Planning" 
                secondary="Get AI-powered recommendations for wellness programs based on real data"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Trend Analysis" 
                secondary="Understand long-term wellness trends and predict future patterns"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="ROI Measurement" 
                secondary="Track the impact of wellness initiatives on employee health metrics"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            Security & Privacy
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Data Security</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• All data transfers use TLS encryption" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Credentials stored securely in local config" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• No data is stored by the MCP server" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Follows Sahha's security standards" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Privacy Controls</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• Individual data is anonymized by default" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Aggregation thresholds enforced" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• Audit logs for all data access" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• GDPR and HIPAA compliant" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            The MCP integration respects all privacy settings configured in your Sahha account. 
            Individual wellness data is only accessible with proper authorization.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}