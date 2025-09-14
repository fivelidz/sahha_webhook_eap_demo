'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Link,
  CircularProgress,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  OpenInNew as OpenIcon,
  Webhook as WebhookIcon,
  Key as KeyIcon,
  CloudQueue as CloudIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

export default function WebhookSetupPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [profileCount, setProfileCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check current configuration
    checkConfiguration();
    // Get current tunnel URL if available
    detectTunnelUrl();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/sahha/config');
      const data = await response.json();
      if (data.configured) {
        setIsConfigured(true);
        setWebhookSecret(data.secret || '');
        setProfileCount(data.profileCount || 0);
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
    }
  };

  const detectTunnelUrl = async () => {
    try {
      // Try to detect if we're running through a tunnel
      const host = window.location.hostname;
      if (host.includes('ngrok') || host.includes('loca.lt') || host.includes('localhost.run')) {
        setTunnelUrl(`https://${host}`);
      } else if (host === 'localhost') {
        // Running locally, suggest tunnel setup
        setTunnelUrl('');
      } else {
        // Running on a public domain
        setTunnelUrl(`https://${host}`);
      }
    } catch (error) {
      console.error('Error detecting tunnel:', error);
    }
  };

  const generateWebhookUrl = () => {
    if (!tunnelUrl) {
      setErrorMessage('Please set up a tunnel first (ngrok, localtunnel, etc.)');
      return;
    }
    const url = `${tunnelUrl}/api/sahha/webhook`;
    setWebhookUrl(url);
    return url;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSecret = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const secret = btoa(String.fromCharCode.apply(null, Array.from(array)));
    setWebhookSecret(secret);
    return secret;
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sahha/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          webhookSecret,
          tunnelUrl,
        }),
      });
      
      if (response.ok) {
        setIsConfigured(true);
        setActiveStep(3);
      } else {
        setErrorMessage('Failed to save configuration');
      }
    } catch (error) {
      setErrorMessage('Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch('/api/sahha/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          webhookSecret,
        }),
      });
      
      if (response.ok) {
        setTestStatus('success');
        await checkConfiguration();
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      setTestStatus('error');
    }
  };

  const clearData = async () => {
    if (confirm('Are you sure you want to clear all webhook data?')) {
      try {
        await fetch('/api/sahha/clear', { method: 'POST' });
        setProfileCount(0);
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    }
  };

  const steps = [
    {
      label: 'Set up Tunnel',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To receive webhooks locally, you need a public URL. Choose one option:
          </Typography>
          
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CloudIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Option 1: ngrok (Recommended)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                1. Install: <code>npm install -g ngrok</code>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                2. Run: <code>ngrok http 3000</code>
              </Typography>
              <Typography variant="body2">
                3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CloudIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Option 2: localtunnel
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                1. Run: <code>npx localtunnel --port 3000</code>
              </Typography>
              <Typography variant="body2">
                2. Copy the URL (e.g., https://xyz.loca.lt)
              </Typography>
            </CardContent>
          </Card>
          
          <TextField
            fullWidth
            label="Tunnel URL"
            value={tunnelUrl}
            onChange={(e) => setTunnelUrl(e.target.value)}
            placeholder="https://your-tunnel.ngrok.io"
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CloudIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="contained"
            onClick={() => {
              if (tunnelUrl) {
                generateWebhookUrl();
                setActiveStep(1);
              } else {
                setErrorMessage('Please enter your tunnel URL');
              }
            }}
            sx={{ mt: 2 }}
            disabled={!tunnelUrl}
          >
            Continue
          </Button>
        </Box>
      ),
    },
    {
      label: 'Configure Webhook',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Configure your Sahha webhook with these settings:
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Webhook URL
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.100', display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
                {webhookUrl || 'Not generated yet'}
              </Typography>
              <IconButton onClick={() => copyToClipboard(webhookUrl)} disabled={!webhookUrl}>
                <CopyIcon />
              </IconButton>
            </Paper>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Webhook Secret (Optional but recommended)
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.100', display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace', 
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {showSecret ? (webhookSecret || 'Click Generate to create') : '••••••••••••••••'}
              </Typography>
              <IconButton onClick={() => setShowSecret(!showSecret)}>
                {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
              <IconButton onClick={() => copyToClipboard(webhookSecret)} disabled={!webhookSecret}>
                <CopyIcon />
              </IconButton>
            </Paper>
            <Button
              variant="outlined"
              onClick={generateSecret}
              sx={{ mt: 1 }}
              startIcon={<KeyIcon />}
            >
              Generate Secret
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>In Sahha Dashboard:</strong>
              <br />1. Go to Settings → Webhooks
              <br />2. Add new webhook
              <br />3. Paste the URL and Secret
              <br />4. Select events: Score Created, Biomarker Created
              <br />5. Save webhook
            </Typography>
          </Alert>
          
          <Button
            variant="contained"
            onClick={() => {
              saveConfiguration();
            }}
            sx={{ mt: 2 }}
            disabled={!webhookUrl || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Configuration'}
          </Button>
        </Box>
      ),
    },
    {
      label: 'Test Connection',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Test your webhook connection:
          </Typography>
          
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WebhookIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Send Test Webhook
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                Click the button below to send a test webhook to your endpoint.
              </Typography>
              
              <Button
                variant="contained"
                onClick={testWebhook}
                disabled={testStatus === 'testing'}
                startIcon={testStatus === 'testing' ? <CircularProgress size={20} /> : <PlayIcon />}
              >
                {testStatus === 'testing' ? 'Testing...' : 'Send Test'}
              </Button>
              
              {testStatus === 'success' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    ✅ Webhook received successfully!
                  </Typography>
                </Alert>
              )}
              
              {testStatus === 'error' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    ❌ Webhook test failed. Check your configuration.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Or test from Sahha:</strong>
          </Typography>
          <Typography variant="body2">
            In the Sahha dashboard, click "Test Webhook" to send a real test event.
          </Typography>
          
          <Button
            variant="contained"
            onClick={() => setActiveStep(3)}
            sx={{ mt: 2 }}
            disabled={testStatus !== 'success' && !isConfigured}
          >
            Continue to Dashboard
          </Button>
        </Box>
      ),
    },
    {
      label: 'Ready!',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>🎉 Your webhook is configured and ready!</strong>
            </Typography>
          </Alert>
          
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${profileCount} Profiles`} 
                  color="primary" 
                  icon={<CheckIcon />} 
                />
                <Chip 
                  label="Webhook Active" 
                  color="success" 
                  icon={<WebhookIcon />} 
                />
              </Box>
            </CardContent>
          </Card>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              href="/dashboard"
              startIcon={<OpenIcon />}
            >
              Go to Dashboard
            </Button>
            
            <Button
              variant="outlined"
              onClick={checkConfiguration}
              startIcon={<RefreshIcon />}
            >
              Refresh Status
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={clearData}
            >
              Clear Data
            </Button>
          </Box>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 2 }} />
            Sahha Webhook Setup
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Configure your Sahha webhook to receive real-time behavioral data
          </Typography>
          
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>{step.content}</StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
        
        <Snackbar
          open={copied}
          autoHideDuration={2000}
          onClose={() => setCopied(false)}
          message="Copied to clipboard!"
        />
        
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={4000}
          onClose={() => setErrorMessage('')}
          message={errorMessage}
        />
      </Box>
    </Box>
  );
}