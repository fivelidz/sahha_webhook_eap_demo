'use client';

import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileManagerWebhook from '@/components/ProfileManagerWebhook';
import ExecutiveDashboardOriginal from '@/components/ExecutiveDashboardOriginal';
import BehavioralIntelligenceEAP from '@/components/BehavioralIntelligenceEAP';
import DepartmentAnalysisEAP from '@/components/DepartmentAnalysisEAP';
import { SahhaDataProvider } from '@/contexts/SahhaDataContext';
import { CrossFilterProvider } from '@/contexts/CrossFilterContext';
import { Box, Typography } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#8b5cf6',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#8b5cf6',
    },
    background: {
      default: '#0f1419',
      paper: '#1a1f2e',
    },
  },
});

export default function DashboardPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('profile-manager');

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'profile-manager':
        return <ProfileManagerWebhook darkMode={darkMode} />;
      case 'executive':
        return <ExecutiveDashboardOriginal orgId="default" />;
      case 'behavioral':
        return <BehavioralIntelligenceEAP orgId="default" />;
      case 'department':
        return <DepartmentAnalysisEAP />;
      case 'settings':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4">Settings</Typography>
            <Typography>Coming soon...</Typography>
          </Box>
        );
      default:
        return <ProfileManagerWebhook darkMode={darkMode} />;
    }
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <SahhaDataProvider>
        <CrossFilterProvider>
        <DashboardLayout
          darkMode={darkMode}
          onDarkModeToggle={handleDarkModeToggle}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        >
          {renderPage()}
        </DashboardLayout>
        </CrossFilterProvider>
      </SahhaDataProvider>
    </ThemeProvider>
  );
}