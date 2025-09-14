'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Alert, 
  Tabs, 
  Tab, 
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import { 
  Settings, 
  Visibility, 
  VisibilityOff, 
  CheckCircle, 
  Error, 
  Info,
  ContentCopy,
  Refresh
} from '@mui/icons-material';
import { SahhaCredentials } from '../../types/sahha';

interface ApiKeyManagerProps {
  open: boolean;
  onClose: () => void;
  onCredentialsChange: (credentials: SahhaCredentials | null) => void;
  currentCredentials: SahhaCredentials | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ApiKeyManager({ 
  open, 
  onClose, 
  onCredentialsChange, 
  currentCredentials 
}: ApiKeyManagerProps) {
  const [tabValue, setTabValue] = useState(0);
  // Default sandbox credentials
  const DEFAULT_SANDBOX_CREDENTIALS = {
    appId: 'NqrB0AYlviHruQVbF0Cp5Jch2utzQNwe',
    appSecret: 'VsU94PUlVPj7LM9dFAZ4sHPRAYFqgtfmG0WuANKLErtQlbFk8LZNLHIJA1AEnbtC',
    clientId: 'tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW',
    clientSecret: 'uGJFFzeLuifFEHC2y3dgs6J3O2vui3eiptuxlH5D810DmS8NshymlIJUu14nZ3y8'
  };
  
  const [credentials, setCredentials] = useState<SahhaCredentials>(DEFAULT_SANDBOX_CREDENTIALS);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [useDemo, setUseDemo] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  // Check if this is a hosted environment with default credentials
  const isHostedDemo = typeof window !== 'undefined' && 
    (window.location.hostname.includes('vercel.app') || 
     window.location.hostname.includes('netlify.app') ||
     window.location.hostname.includes('sahha.ai'));

  useEffect(() => {
    if (currentCredentials) {
      setCredentials(currentCredentials);
    }
    
    // Load saved webhook configuration
    const savedWebhookUrl = localStorage.getItem('sahha_webhook_url');
    const savedWebhookSecret = localStorage.getItem('sahha_webhook_secret');
    const savedUseDemo = localStorage.getItem('sahha_use_demo') === 'true';
    
    if (savedWebhookUrl) setWebhookUrl(savedWebhookUrl);
    if (savedWebhookSecret) setWebhookSecret(savedWebhookSecret);
    setUseDemo(savedUseDemo);
  }, [currentCredentials]);

  const handleCredentialsChange = (field: keyof SahhaCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing connection to Sahha API...');
    
    try {
      // Test API connection
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (result.success) {
        setTestStatus('success');
        setTestMessage(`✅ Connection successful! Found ${result.data?.profileCount || 0} profiles.`);
      } else {
        setTestStatus('error');
        setTestMessage(`❌ Connection failed: ${result.error}`);
      }
    } catch (error: unknown) {
      setTestStatus('error');
      let errorMessage = 'Unknown error occurred';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as Error).message;
      } else {
        errorMessage = String(error);
      }
      setTestMessage(`❌ Connection error: ${errorMessage}`);
    }
  };

  const handleSave = () => {
    // Save credentials
    if (!useDemo && credentials.appId && credentials.clientId) {
      localStorage.setItem('sahha_credentials', JSON.stringify(credentials));
      onCredentialsChange(credentials);
    } else {
      localStorage.removeItem('sahha_credentials');
      onCredentialsChange(null); // Use demo mode
    }

    // Save demo mode preference
    localStorage.setItem('sahha_use_demo', useDemo.toString());

    // Save webhook configuration
    if (webhookUrl) {
      localStorage.setItem('sahha_webhook_url', webhookUrl);
    }
    if (webhookSecret) {
      localStorage.setItem('sahha_webhook_secret', webhookSecret);
    }

    onClose();
  };

  const handleUseDemoData = () => {
    setUseDemo(true);
    setCredentials({
      appId: '',
      appSecret: '',
      clientId: '',
      clientSecret: ''
    });
    onCredentialsChange(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin;
    const generatedUrl = `${baseUrl}/api/webhook/sahha`;
    setWebhookUrl(generatedUrl);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        API Configuration
        {isHostedDemo && (
          <Chip 
            label="Hosted Demo" 
            color="primary" 
            size="small" 
            sx={{ ml: 'auto' }}
          />
        )}
      </DialogTitle>

      <DialogContent>
        {isHostedDemo && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This is a hosted demo with working Sahha credentials pre-configured. 
              You can try it with demo data or enter your own API keys to use your real data.
            </Typography>
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} sx={{ mb: 2 }}>
          <Tab label="API Keys" />
          <Tab label="Webhooks" />
          <Tab label="Demo Mode" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" flexDirection="column" gap={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={!useDemo}
                  onChange={(e) => setUseDemo(!e.target.checked)}
                />
              }
              label="Use my own Sahha API credentials"
            />

            {!useDemo ? (
              <Alert severity="success">
                <Typography variant="body2">
                  Using demo data with realistic organizational health scenarios. 
                  Perfect for exploring the dashboard without API setup.
                </Typography>
              </Alert>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Sahha API Credentials
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Get your API credentials from the{' '}
                  <a href="https://dashboard.sahha.ai" target="_blank" rel="noopener noreferrer">
                    Sahha Dashboard
                  </a>
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="App ID"
                    value={credentials.appId}
                    onChange={(e) => handleCredentialsChange('appId', e.target.value)}
                    fullWidth
                    placeholder="Your Sahha App ID"
                  />
                  
                  <TextField
                    label="App Secret"
                    type={showSecrets ? 'text' : 'password'}
                    value={credentials.appSecret}
                    onChange={(e) => handleCredentialsChange('appSecret', e.target.value)}
                    fullWidth
                    placeholder="Your Sahha App Secret"
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowSecrets(!showSecrets)}>
                          {showSecrets ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                  
                  <TextField
                    label="Client ID"
                    value={credentials.clientId}
                    onChange={(e) => handleCredentialsChange('clientId', e.target.value)}
                    fullWidth
                    placeholder="Your Sahha Client ID"
                  />
                  
                  <TextField
                    label="Client Secret"
                    type={showSecrets ? 'text' : 'password'}
                    value={credentials.clientSecret}
                    onChange={(e) => handleCredentialsChange('clientSecret', e.target.value)}
                    fullWidth
                    placeholder="Your Sahha Client Secret"
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowSecrets(!showSecrets)}>
                          {showSecrets ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !credentials.appId || !credentials.clientId}
                    startIcon={testStatus === 'testing' ? <Refresh className="animate-spin" /> : undefined}
                  >
                    Test Connection
                  </Button>
                  
                  {testStatus === 'success' && <CheckCircle color="success" />}
                  {testStatus === 'error' && <Error color="error" />}
                </Box>

                {testMessage && (
                  <Alert 
                    severity={testStatus === 'success' ? 'success' : testStatus === 'error' ? 'error' : 'info'} 
                    sx={{ mt: 2 }}
                  >
                    {testMessage}
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Typography variant="h6">Webhook Configuration</Typography>
            <Typography variant="body2" color="text.secondary">
              Set up real-time updates for your dashboard. Configure these settings in your Sahha Dashboard.
            </Typography>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Webhook URL
                </Typography>
                <Box display="flex" gap={1} alignItems="center" sx={{ mb: 2 }}>
                  <TextField
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    fullWidth
                    placeholder="https://your-domain.com/api/webhook/sahha"
                    helperText="This URL will receive real-time health data updates"
                  />
                  <Tooltip title="Generate webhook URL">
                    <IconButton onClick={generateWebhookUrl}>
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy to clipboard">
                    <IconButton onClick={() => copyToClipboard(webhookUrl)}>
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>

                <TextField
                  label="Webhook Secret"
                  type={showSecrets ? 'text' : 'password'}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  fullWidth
                  placeholder="Your webhook secret for signature verification"
                  helperText="Used to verify webhook authenticity"
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setShowSecrets(!showSecrets)}>
                        {showSecrets ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </CardContent>
            </Card>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Sahha Dashboard Setup:</strong>
                <br />
                1. Go to your Sahha Dashboard → Webhooks
                <br />
                2. Add the webhook URL above
                <br />
                3. Select events: ScoreCreatedIntegrationEvent, BiomarkerCreatedIntegrationEvent
                <br />
                4. Copy the webhook secret to the field above
              </Typography>
            </Alert>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Typography variant="h6">Demo Mode</Typography>
            
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  TechCorp Industries Demo Dataset
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Realistic organizational health data for a 500-employee technology company
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2">• 5 Departments: Engineering, Sales, Marketing, Operations, Executive</Typography>
                  <Typography variant="body2">• Behavioral archetypes and patterns</Typography>
                  <Typography variant="body2">• Burnout scenarios and interventions</Typography>
                  <Typography variant="body2">• Seasonal wellbeing trends</Typography>
                  <Typography variant="body2">• Real-time simulated updates</Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleUseDemoData}
                  sx={{ mt: 2 }}
                  startIcon={<CheckCircle />}
                >
                  Use Demo Data
                </Button>
              </CardContent>
            </Card>

            <Alert severity="warning">
              <Typography variant="body2">
                Demo mode uses synthetic data for demonstration purposes only. 
                No real employee data is used or stored.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}