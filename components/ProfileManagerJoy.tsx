'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Input,
  Table,
  Typography,
  Sheet,
  IconButton,
  Select,
  Option,
  LinearProgress,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Badge,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  Alert,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
} from '@mui/joy';
import {
  SearchRounded,
  PersonAddRounded,
  RefreshRounded,
  DownloadRounded,
  FilterAltRounded,
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
  StorageRounded,
  CloudRounded,
  EditRounded,
  AssignmentRounded,
} from '@mui/icons-material';

// Sample data for demonstration
const sampleProfiles = [
  {
    profileId: 'prof_001',
    name: 'John Smith',
    department: 'Technology',
    wellbeing: 78,
    activity: 82,
    sleep: 71,
    mental: 75,
    readiness: 80,
    archetype: 'Balanced',
    lastSync: '2 hours ago',
  },
  {
    profileId: 'prof_002',
    name: 'Sarah Johnson',
    department: 'Operations',
    wellbeing: 85,
    activity: 88,
    sleep: 82,
    mental: 84,
    readiness: 86,
    archetype: 'Achiever',
    lastSync: '5 hours ago',
  },
  {
    profileId: 'prof_003',
    name: 'Michael Chen',
    department: 'Sales',
    wellbeing: 72,
    activity: 70,
    sleep: 68,
    mental: 65,
    readiness: 71,
    archetype: 'Stressed',
    lastSync: '1 day ago',
  },
];

function getScoreColor(score: number) {
  if (score >= 80) return 'success';
  if (score >= 60) return 'neutral';
  return 'danger';
}

function getArchetypeColor(archetype: string) {
  switch (archetype) {
    case 'Achiever': return 'success';
    case 'Balanced': return 'primary';
    case 'Stressed': return 'warning';
    default: return 'neutral';
  }
}

export default function ProfileManagerJoy() {
  const [dataMode, setDataMode] = useState<'demo' | 'api'>('demo');
  const [profiles, setProfiles] = useState(sampleProfiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || profile.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="h1" fontSize="xl3">
            Profile Management
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              variant={dataMode === 'demo' ? 'solid' : 'outlined'}
              color="neutral"
              startDecorator={<StorageRounded />}
              onClick={() => setDataMode('demo')}
            >
              Demo
            </Chip>
            <Chip
              variant={dataMode === 'api' ? 'solid' : 'outlined'}
              color="primary"
              startDecorator={<CloudRounded />}
              onClick={() => setDataMode('api')}
            >
              API
            </Chip>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Stack direction="row" spacing={2}>
          <Card variant="soft" sx={{ flex: 1 }}>
            <Typography level="body-sm">Total Profiles</Typography>
            <Typography level="h2">57</Typography>
            <Typography level="body-xs" sx={{ color: 'success.600' }}>+12% from last month</Typography>
          </Card>
          <Card variant="soft" sx={{ flex: 1 }}>
            <Typography level="body-sm">Average Wellbeing</Typography>
            <Typography level="h2">78.5</Typography>
            <Typography level="body-xs" sx={{ color: 'success.600' }}>Good</Typography>
          </Card>
          <Card variant="soft" sx={{ flex: 1 }}>
            <Typography level="body-sm">At Risk</Typography>
            <Typography level="h2">8</Typography>
            <Typography level="body-xs" sx={{ color: 'warning.600' }}>Needs attention</Typography>
          </Card>
          <Card variant="soft" sx={{ flex: 1 }}>
            <Typography level="body-sm">Last Sync</Typography>
            <Typography level="h2">2h</Typography>
            <Typography level="body-xs">ago</Typography>
          </Card>
        </Stack>

        {/* Controls */}
        <Card>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Input
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startDecorator={<SearchRounded />}
              sx={{ flex: 1 }}
            />
            <Select
              value={selectedDepartment}
              onChange={(_, value) => setSelectedDepartment(value as string)}
              startDecorator={<FilterAltRounded />}
            >
              <Option value="all">All Departments</Option>
              <Option value="Technology">Technology</Option>
              <Option value="Operations">Operations</Option>
              <Option value="Sales">Sales</Option>
              <Option value="Admin">Admin</Option>
            </Select>
            <Button
              variant="outlined"
              startDecorator={<RefreshRounded />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="solid"
              startDecorator={<DownloadRounded />}
            >
              Export
            </Button>
          </Stack>

          {loading && <LinearProgress size="sm" />}

          {/* Table */}
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: 'sm',
              overflow: 'auto',
              minHeight: 400,
            }}
          >
            <Table
              stickyHeader
              hoverRow
              sx={{
                '& thead th': { 
                  bgcolor: 'background.level1',
                  fontWeight: 'lg',
                },
                '& tr:hover': {
                  bgcolor: 'background.level1',
                },
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Profile</th>
                  <th>Department</th>
                  <th>Wellbeing</th>
                  <th>Activity</th>
                  <th>Sleep</th>
                  <th>Mental</th>
                  <th>Readiness</th>
                  <th>Archetype</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => (
                  <React.Fragment key={profile.profileId}>
                    <tr>
                      <td>
                        <IconButton
                          size="sm"
                          variant="plain"
                          onClick={() => setExpandedRow(expandedRow === profile.profileId ? null : profile.profileId)}
                        >
                          {expandedRow === profile.profileId ? <KeyboardArrowUpRounded /> : <KeyboardArrowDownRounded />}
                        </IconButton>
                      </td>
                      <td>
                        <Stack spacing={0.5}>
                          <Typography level="body-sm" fontWeight="lg">{profile.name}</Typography>
                          <Typography level="body-xs">ID: {profile.profileId}</Typography>
                        </Stack>
                      </td>
                      <td>
                        <Chip size="sm" variant="soft">{profile.department}</Chip>
                      </td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.wellbeing)}>
                          {profile.wellbeing}
                        </Chip>
                      </td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.activity)}>
                          {profile.activity}
                        </Chip>
                      </td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.sleep)}>
                          {profile.sleep}
                        </Chip>
                      </td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.mental)}>
                          {profile.mental}
                        </Chip>
                      </td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.readiness)}>
                          {profile.readiness}
                        </Chip>
                      </td>
                      <td>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={getArchetypeColor(profile.archetype)}
                        >
                          {profile.archetype}
                        </Chip>
                      </td>
                      <td>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="sm" variant="plain">
                            <EditRounded fontSize="small" />
                          </IconButton>
                          <IconButton size="sm" variant="plain">
                            <AssignmentRounded fontSize="small" />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>
                    {expandedRow === profile.profileId && (
                      <tr>
                        <td colSpan={10} style={{ padding: 0 }}>
                          <Sheet
                            variant="soft"
                            sx={{
                              p: 2,
                              m: 1,
                              borderRadius: 'sm',
                            }}
                          >
                            <Stack spacing={2}>
                              <Typography level="body-sm" fontWeight="lg">Profile Details</Typography>
                              <Stack direction="row" spacing={3}>
                                <Box>
                                  <Typography level="body-xs">Last Sync</Typography>
                                  <Typography level="body-sm">{profile.lastSync}</Typography>
                                </Box>
                                <Box>
                                  <Typography level="body-xs">Device Type</Typography>
                                  <Typography level="body-sm">iOS</Typography>
                                </Box>
                                <Box>
                                  <Typography level="body-xs">Data Points</Typography>
                                  <Typography level="body-sm">1,234</Typography>
                                </Box>
                              </Stack>
                              <Typography level="body-xs">
                                Sub-scores: Steps: 7,234 • Active Hours: 8.5 • Sleep Duration: 7.2h • Sleep Debt: 45min
                              </Typography>
                            </Stack>
                          </Sheet>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </Sheet>
        </Card>
      </Stack>
    </Box>
  );
}