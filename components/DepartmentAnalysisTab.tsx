'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  BarChart as ChartIcon,
  TableChart as TableIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import DepartmentArchetypeAnalysisInteractive from './DepartmentArchetypeAnalysisInteractive';
import DepartmentMatrix from './DepartmentMatrix';

export default function DepartmentAnalysisTab() {
  const [activeView, setActiveView] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  return (
    <Box>
      {/* View Selector */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeView} 
          onChange={(e, v) => setActiveView(v)}
          variant="fullWidth"
        >
          <Tab 
            label="Archetype Distribution" 
            icon={<ChartIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Performance Matrix" 
            icon={<TableIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Combined View" 
            icon={<AnalyticsIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeView === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Department Archetype Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Interactive horizontal stacked bar charts showing archetype distributions across departments.
            Click on any department segment to filter all views.
          </Typography>
          <DepartmentArchetypeAnalysisInteractive />
        </Box>
      )}

      {activeView === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Department Performance Matrix
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Comprehensive metrics table with expandable details for each department.
            Click on rows to select departments and arrows to expand detailed metrics.
          </Typography>
          <DepartmentMatrix 
            selectedDepartment={selectedDepartment}
            onDepartmentSelect={setSelectedDepartment}
          />
        </Box>
      )}

      {activeView === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Combined Department Analysis
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Complete view combining archetype distributions and performance metrics.
          </Typography>
          
          {/* Archetype Charts */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Archetype Distributions
            </Typography>
            <DepartmentArchetypeAnalysisInteractive />
          </Box>
          
          {/* Performance Matrix */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2 }}>
              Performance Metrics
            </Typography>
            <DepartmentMatrix 
              selectedDepartment={selectedDepartment}
              onDepartmentSelect={setSelectedDepartment}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}