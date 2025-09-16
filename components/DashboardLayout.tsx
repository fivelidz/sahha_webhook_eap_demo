'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  Stack,
  Avatar,
  Button,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
  AccountTree as AccountTreeIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

interface DashboardLayoutProps {
  children: React.ReactNode;
  darkMode?: boolean;
  onDarkModeToggle?: () => void;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const menuItems = [
  { id: 'profile-manager', label: 'Profile Manager', icon: <PeopleIcon /> },
  { id: 'executive', label: 'Executive Dashboard', icon: <DashboardIcon /> },
  { id: 'behavioral', label: 'Behavioral Intelligence', icon: <PsychologyIcon /> },
  { id: 'department', label: 'Department Analysis', icon: <AccountTreeIcon /> },
];

const bottomMenuItems = [
  { id: 'mcp-guide', label: 'MCP Guide', icon: <CodeIcon />, external: true },
  { id: 'dashboard-guide', label: 'Dashboard Guide', icon: <DescriptionIcon />, external: true },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

export default function DashboardLayout({
  children,
  darkMode = false,
  onDarkModeToggle,
  currentPage = 'profile-manager',
  onPageChange,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (pageId: string, external?: boolean) => {
    if (external) {
      if (pageId === 'mcp-guide') {
        window.open('/mcp-guide', '_blank');
      } else if (pageId === 'dashboard-guide') {
        window.open('/dashboard-guide', '_blank');
      }
    } else if (onPageChange) {
      onPageChange(pageId);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 72,
            boxSizing: 'border-box',
            background: darkMode 
              ? 'linear-gradient(145deg, #1a1f2e 0%, #151821 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
            borderRight: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {/* Logo/Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'space-between' : 'center',
            p: 2,
            minHeight: 64,
          }}
        >
          {open && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight="bold" color="primary">
                🧬 Sahha
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wellness Platform
              </Typography>
            </Stack>
          )}
          <IconButton onClick={handleDrawerToggle} size="small">
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        <Divider />

        {/* Main Navigation */}
        <List sx={{ flex: 1, py: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                selected={currentPage === item.id}
                onClick={() => handleMenuClick(item.id)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: open ? '0 24px 24px 0' : '12px',
                  mx: open ? 0 : 1,
                  my: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: darkMode 
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(59, 130, 246, 0.08)',
                    borderLeft: open ? `3px solid ${theme.palette.primary.main}` : 'none',
                    '&:hover': {
                      backgroundColor: darkMode 
                        ? 'rgba(59, 130, 246, 0.25)'
                        : 'rgba(59, 130, 246, 0.12)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: darkMode 
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: currentPage === item.id ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: currentPage === item.id ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Bottom Actions */}
        <List sx={{ py: 1 }}>
          {bottomMenuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleMenuClick(item.id, item.external)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Dark Mode Toggle */}
        {open && onDarkModeToggle && (
          <Box sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={onDarkModeToggle}
                  icon={<LightModeIcon />}
                  checkedIcon={<DarkModeIcon />}
                />
              }
              label="Dark Mode"
              sx={{ 
                '& .MuiFormControlLabel-label': { 
                  fontSize: '0.875rem' 
                } 
              }}
            />
          </Box>
        )}

        {/* User Profile */}
        {open && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                A
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  Admin User
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  admin@sahha.ai
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: darkMode ? '#0f1419' : '#f5f7fa',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}