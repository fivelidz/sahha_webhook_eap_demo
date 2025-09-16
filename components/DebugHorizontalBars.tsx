'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DebugHorizontalBars() {
  // Simple test data
  const testData = [
    { archetype: 'Highly Active', Engineering: 10, Sales: 8, Marketing: 5, HR: 3 },
    { archetype: 'Moderately Active', Engineering: 15, Sales: 12, Marketing: 8, HR: 6 },
    { archetype: 'Lightly Active', Engineering: 8, Sales: 10, Marketing: 12, HR: 8 },
    { archetype: 'Sedentary', Engineering: 5, Sales: 6, Marketing: 8, HR: 10 }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Debug: Horizontal Stacked Bar Chart Test
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          This should show horizontal bars with archetypes on Y-axis and population on X-axis
        </Typography>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={testData} 
            layout="horizontal"
            margin={{ top: 20, right: 30, bottom: 20, left: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: 'Population', position: 'insideBottom', offset: -5 }} />
            <YAxis type="category" dataKey="archetype" width={90} />
            <Tooltip />
            <Legend />
            
            <Bar dataKey="Engineering" stackId="a" fill="#1976d2" />
            <Bar dataKey="Sales" stackId="a" fill="#388e3c" />
            <Bar dataKey="Marketing" stackId="a" fill="#f57c00" />
            <Bar dataKey="HR" stackId="a" fill="#d32f2f" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
      
      <Typography variant="body2">
        ✅ If you see horizontal bars above with departments stacked, the component is working correctly.
      </Typography>
    </Box>
  );
}