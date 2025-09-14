'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  Chip,
  Paper,
  Divider,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

interface WebhookData {
  success: boolean;
  count?: number;
  profiles?: any[];
  lastUpdated?: string;
  error?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function WebhookTestPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testPayload, setTestPayload] = useState('');
  const [webhookData, setWebhookData] = useState<WebhookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);

  // Get the current domain
  const currentDomain = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:3000';

  // Default test payload
  const defaultPayload = {
    event: 'batch.scores',
    timestamp: new Date().toISOString(),
    data: {
      profiles: [
        {
          externalId: 'test-profile-001',
          profileId: 'test-001',
          scores: {
            wellbeing: 0.75,
            activity: 0.62,
            sleep: 0.83,
            mentalWellbeing: 0.71,
            readiness: 0.68
          },
          factors: [
            { name: 'steps', value: 8500, unit: 'count', score: 0.85 },
            { name: 'active_hours', value: 2.5, unit: 'hours', score: 0.62 },
            { name: 'sleep_duration', value: 7.5, unit: 'hours', score: 0.83 },
            { name: 'sleep_regularity', value: 0.91, unit: 'index', score: 0.91 }
          ],
          archetypes: ['moderately_active', 'good_sleeper', 'balanced_wellness'],
          timestamp: new Date().toISOString()
        }
      ]
    }
  };

  useEffect(() => {
    setWebhookUrl(`${currentDomain}/api/sahha/webhook`);
    setTestPayload(JSON.stringify(defaultPayload, null, 2));
    fetchWebhookData();
  }, []);

  const fetchWebhookData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sahha/webhook');
      const data = await response.json();
      setWebhookData(data);
    } catch (error) {
      console.error('Error fetching webhook data:', error);
      setMessage('Error fetching webhook data');
    }
    setLoading(false);
  };

  const sendTestWebhook = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/sahha/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: testPayload
      });
      const data = await response.json();
      setMessage(`✅ Webhook sent successfully: ${data.message}`);
      // Refresh data after sending
      setTimeout(fetchWebhookData, 500);
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  const clearWebhookData = async () => {
    if (!confirm('Are you sure you want to clear all webhook data?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/sahha/webhook?confirm=true', {
        method: 'DELETE'
      });
      const data = await response.json();
      setMessage(`✅ ${data.message}`);
      fetchWebhookData();
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined) return 'N/A';
    // Convert to percentage and show 3 significant figures
    const percentage = score * 100;
    return percentage.toPrecision(3);
  };

  const formatTime = (value: number, unit: string): string => {
    if (unit === 'hour' || unit === 'hours') {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    if (unit === 'minute' || unit === 'minutes') {
      if (value >= 60) {
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      return `${value}m`;
    }
    return `${value} ${unit}`;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Webhook Testing & Setup
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Test the Sahha webhook integration and view received data
      </Typography>

      {/* Setup Instructions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Quick Setup Guide
          </Typography>
          
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                For Local Testing with ngrok:
              </Typography>
              <Typography variant="body2" component="div">
                1. Install ngrok: <code>npm install -g ngrok</code><br/>
                2. Run: <code>ngrok http 3000</code><br/>
                3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)<br/>
                4. Use webhook URL: <code>https://abc123.ngrok.io/api/sahha/webhook</code>
              </Typography>
            </Alert>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  <strong>Your Webhook URL:</strong><br/>
                  <code>{webhookUrl}</code>
                </Typography>
                <IconButton 
                  onClick={() => copyToClipboard(webhookUrl)}
                  color={copied ? 'success' : 'default'}
                >
                  {copied ? <CheckCircleIcon /> : <CopyIcon />}
                </IconButton>
              </Stack>
            </Paper>

            <Alert severity="warning">
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Configure in Sahha Dashboard:
              </Typography>
              <Typography variant="body2" component="div">
                1. Go to: <a href="https://app.sahha.ai/dashboard/webhooks" target="_blank" rel="noopener">
                  https://app.sahha.ai/dashboard/webhooks
                </a><br/>
                2. Add your webhook URL<br/>
                3. Select events: score.updated, profile.created, archetype.calculated<br/>
                4. Save and test the connection
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs for Testing and Viewing Data */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Send Test Webhook" />
            <Tab label="View Stored Data" />
            <Tab label="Activity Log" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                multiline
                rows={15}
                variant="outlined"
                label="Test Payload (JSON)"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                sx={{ fontFamily: 'monospace' }}
              />
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={sendTestWebhook}
                  disabled={loading}
                >
                  Send Test Webhook
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setTestPayload(JSON.stringify(defaultPayload, null, 2))}
                >
                  Reset to Default
                </Button>
              </Stack>

              {message && (
                <Alert severity={message.startsWith('✅') ? 'success' : 'error'}>
                  {message}
                </Alert>
              )}
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Stored Webhook Data
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={fetchWebhookData}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={clearWebhookData}
                    disabled={loading}
                    color="error"
                  >
                    Clear All
                  </Button>
                </Stack>
              </Stack>

              {loading && <LinearProgress />}

              {webhookData && (
                <Stack spacing={2}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Chip 
                        label={`${webhookData.count || 0} Profiles`}
                        color="primary"
                      />
                      {webhookData.lastUpdated && (
                        <Chip 
                          label={`Last Updated: ${new Date(webhookData.lastUpdated).toLocaleString()}`}
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Paper>

                  {webhookData.profiles && webhookData.profiles.length > 0 && (
                    <Stack spacing={2}>
                      {webhookData.profiles.map((profile: any, index: number) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {profile.externalId}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                {profile.scores?.wellbeing && (
                                  <Chip 
                                    size="small" 
                                    label={`W: ${formatScore(profile.scores.wellbeing)}`}
                                    color="success"
                                  />
                                )}
                                {profile.scores?.activity && (
                                  <Chip 
                                    size="small" 
                                    label={`A: ${formatScore(profile.scores.activity)}`}
                                    color="primary"
                                  />
                                )}
                                {profile.scores?.sleep && (
                                  <Chip 
                                    size="small" 
                                    label={`S: ${formatScore(profile.scores.sleep)}`}
                                    color="secondary"
                                  />
                                )}
                              </Stack>
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Stack spacing={2}>
                              {/* Scores */}
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  Scores:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  {Object.entries(profile.scores || {}).map(([key, value]) => (
                                    <Chip
                                      key={key}
                                      label={`${key}: ${formatScore(value as number)}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Stack>
                              </Box>

                              {/* Factors */}
                              {profile.factors && profile.factors.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Factors:
                                  </Typography>
                                  <Stack spacing={1}>
                                    {profile.factors.map((factor: any, idx: number) => (
                                      <Stack key={idx} direction="row" justifyContent="space-between">
                                        <Typography variant="body2">
                                          {factor.name.replace(/_/g, ' ')}:
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                          {formatTime(factor.value, factor.unit)}
                                          {factor.score && ` (${formatScore(factor.score)})`}
                                        </Typography>
                                      </Stack>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {/* Archetypes */}
                              {profile.archetypes && profile.archetypes.length > 0 && (
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Archetypes:
                                  </Typography>
                                  <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {profile.archetypes.map((archetype: string, idx: number) => (
                                      <Chip
                                        key={idx}
                                        label={archetype.replace(/_/g, ' ')}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {/* Raw Data */}
                              <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography variant="body2">View Raw JSON</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <pre style={{ margin: 0, fontSize: '0.8rem', overflow: 'auto' }}>
                                      {JSON.stringify(profile, null, 2)}
                                    </pre>
                                  </Paper>
                                </AccordionDetails>
                              </Accordion>
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  )}

                  {(!webhookData.profiles || webhookData.profiles.length === 0) && (
                    <Alert severity="info">
                      No webhook data received yet. Send a test webhook or configure Sahha to send real data.
                    </Alert>
                  )}
                </Stack>
              )}
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Alert severity="info">
              Activity logs are stored at: <code>/data/webhook-activity.log</code>
            </Alert>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Coming soon: Real-time activity log viewer
            </Typography>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}