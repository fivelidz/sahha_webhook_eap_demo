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
  Alert,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

export default function MCPGuidePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Technical Implementation: Sahha Webhook Integration
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Complete technical reference for implementing Sahha webhook receivers and profile management dashboards
      </Typography>

      <Alert severity="error" sx={{ mb: 4 }}>
        <Typography variant="body1" fontWeight="bold">
          CRITICAL: Sahha uses NON-STANDARD webhook headers!
        </Typography>
        <Typography variant="body2">
          X-Signature, X-External-Id, X-Event-Type (NOT typical webhook format). This is the #1 integration failure point.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Quick Reference: Essential Files
              </Typography>
              
              <Typography paragraph>
                Key files for webhook integration and profile management.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}