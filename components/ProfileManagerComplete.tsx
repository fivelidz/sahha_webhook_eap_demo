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
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionGroup,
  Tooltip,
} from '@mui/joy';
import {
  SearchRounded,
  RefreshRounded,
  DownloadRounded,
  FilterAltRounded,
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
  StorageRounded,
  CloudRounded,
  EditRounded,
  AssignmentRounded,
  BugReportRounded,
  CheckBoxRounded,
  CheckBoxOutlineBlankRounded,
  IndeterminateCheckBoxRounded,
  ExpandMoreRounded,
} from '@mui/icons-material';
import { useSahhaProfiles } from '../contexts/SahhaDataContext';

// Interfaces matching Sahha API structure
interface SubScore {
  name: string;
  value: number | string;
  unit?: string;
}

interface Profile {
  profileId: string;
  externalId: string;
  editableProfileId?: string;
  deviceType: string;
  isSampleProfile: boolean;
  createdAtUtc?: string;
  demographics?: {
    age?: number;
    gender?: string;
  };
  wellbeingScore?: number;
  activityScore?: number;
  sleepScore?: number;
  mentalHealthScore?: number;
  readinessScore?: number;
  subScores?: {
    activity?: SubScore[];
    sleep?: SubScore[];
    mentalWellbeing?: SubScore[];
    readiness?: SubScore[];
    wellbeing?: SubScore[];
  };
}

function getScoreColor(score: number | undefined) {
  if (!score) return 'neutral';
  if (score >= 80) return 'success';
  if (score >= 60) return 'neutral';
  return 'danger';
}

function formatSubScoreValue(value: any, unit?: string): string {
  if (value === '--' || value === null || value === undefined) return '--';
  if (unit) return `${value} ${unit}`;
  return String(value);
}

export default function ProfileManagerComplete() {
  const {
    profiles,
    assignments,
    editableIds,
    isLoading,
    error,
    lastApiCall,
    fetchProfiles,
    updateAssignment,
    updateEditableId,
    setProfiles,
    loadDemoData,
  } = useSahhaProfiles();

  const [dataMode, setDataMode] = useState<'demo' | 'api'>('api');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkDepartment, setBulkDepartment] = useState('');
  const [debugLogs, setDebugLogs] = useState<any[]>([]);

  const departments = ['tech', 'operations', 'sales', 'admin'];

  // Initialize and fetch profiles
  useEffect(() => {
    if (dataMode === 'api') {
      fetchApiProfiles();
    } else {
      loadDemoData();
    }
  }, [dataMode]);

  const fetchApiProfiles = async () => {
    try {
      addDebugLog('info', 'Fetching profiles from Sahha API...');
      const response = await fetch('/api/sahha/profiles', {
        headers: {
          'X-App-Id': process.env.NEXT_PUBLIC_SAHHA_APP_ID || '',
          'X-Client-Id': process.env.NEXT_PUBLIC_SAHHA_CLIENT_ID || '',
        },
      });
      const data = await response.json();
      
      if (data.success && data.profiles) {
        setProfiles(data.profiles);
        addDebugLog('success', `Loaded ${data.profiles.length} profiles from API`);
      } else {
        throw new Error(data.error || 'Failed to fetch profiles');
      }
    } catch (err) {
      addDebugLog('error', `API Error: ${err}`);
      // Fall back to demo data
      loadDemoData();
    }
  };

  const addDebugLog = (type: string, message: string) => {
    setDebugLogs(prev => [...prev.slice(-50), {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    }]);
  };

  const handleRefresh = () => {
    if (dataMode === 'api') {
      fetchApiProfiles();
    } else {
      loadDemoData();
    }
  };

  const handleSelectAll = () => {
    if (selectedProfiles.length === filteredProfiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(filteredProfiles.map(p => p.profileId));
    }
  };

  const handleBulkAssign = () => {
    selectedProfiles.forEach(profileId => {
      updateAssignment(profileId, bulkDepartment);
    });
    setBulkAssignOpen(false);
    setSelectedProfiles([]);
    addDebugLog('info', `Assigned ${selectedProfiles.length} profiles to ${bulkDepartment}`);
  };

  const toggleRowExpansion = (profileId: string) => {
    setExpandedRows(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  // Filter profiles
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.editableProfileId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.externalId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = 
      selectedDepartment === 'all' || 
      assignments[profile.profileId] === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Calculate stats
  const stats = {
    total: profiles.length,
    assigned: Object.keys(assignments).length,
    unassigned: profiles.length - Object.keys(assignments).length,
    withDevice: profiles.filter(p => p.deviceType).length,
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
      <Stack spacing={3}>
        <Box>
          <Typography level="h2" fontSize="xl3" sx={{ mb: 0.5 }}>
            Profile Management
          </Typography>
          <Typography level="body-sm" color="neutral">
            Manage employee profiles and department assignments for organizational analytics
          </Typography>
        </Box>

        {/* Stats and Mode Toggle */}
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Stack direction="row" spacing={2}>
            <Card variant="soft" size="sm">
              <Stack spacing={0.5}>
                <Typography level="body-xs">Total Profiles</Typography>
                <Typography level="h3">{stats.total}</Typography>
              </Stack>
            </Card>
            <Card variant="soft" size="sm">
              <Stack spacing={0.5}>
                <Typography level="body-xs">Assigned</Typography>
                <Typography level="h3">{stats.assigned}</Typography>
              </Stack>
            </Card>
            <Card variant="soft" size="sm">
              <Stack spacing={0.5}>
                <Typography level="body-xs">Unassigned</Typography>
                <Typography level="h3">{stats.unassigned}</Typography>
              </Stack>
            </Card>
            <Card variant="soft" size="sm">
              <Stack spacing={0.5}>
                <Typography level="body-xs">With Device</Typography>
                <Typography level="h3">{stats.withDevice}</Typography>
              </Stack>
            </Card>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography level="body-sm">
              Last API refresh: {lastApiCall ? new Date(lastApiCall).toLocaleTimeString() : 'Never'}
            </Typography>
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
            <Tooltip title="Toggle Debug Panel">
              <IconButton
                variant={showDebugPanel ? 'solid' : 'outlined'}
                onClick={() => setShowDebugPanel(!showDebugPanel)}
              >
                <BugReportRounded />
              </IconButton>
            </Tooltip>
          </Stack>
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
              {departments.map(dept => (
                <Option key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </Option>
              ))}
            </Select>
            <Button
              variant="outlined"
              onClick={handleSelectAll}
            >
              {selectedProfiles.length === filteredProfiles.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedProfiles.length > 0 && (
              <Button
                variant="solid"
                color="primary"
                onClick={() => setBulkAssignOpen(true)}
              >
                Bulk Assign ({selectedProfiles.length})
              </Button>
            )}
            <Button
              variant="outlined"
              startDecorator={<RefreshRounded />}
              onClick={handleRefresh}
              loading={isLoading}
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

          {isLoading && <LinearProgress size="sm" />}

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
                  fontSize: 'xs',
                },
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: 40 }}>✓</th>
                  <th style={{ width: 40 }}></th>
                  <th>Profile ID</th>
                  <th>External ID</th>
                  <th>Department</th>
                  <th>Device</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Activity</th>
                  <th>Sleep</th>
                  <th>Mental</th>
                  <th>Readiness</th>
                  <th>Wellbeing</th>
                  <th>Archetype</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => (
                  <React.Fragment key={profile.profileId}>
                    <tr>
                      <td>
                        <Checkbox
                          checked={selectedProfiles.includes(profile.profileId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProfiles([...selectedProfiles, profile.profileId]);
                            } else {
                              setSelectedProfiles(selectedProfiles.filter(id => id !== profile.profileId));
                            }
                          }}
                        />
                      </td>
                      <td>
                        <IconButton
                          size="sm"
                          variant="plain"
                          onClick={() => toggleRowExpansion(profile.profileId)}
                        >
                          {expandedRows.includes(profile.profileId) ? 
                            <KeyboardArrowUpRounded /> : 
                            <KeyboardArrowDownRounded />}
                        </IconButton>
                      </td>
                      <td>
                        <Input
                          size="sm"
                          variant="plain"
                          value={editableIds[profile.profileId] || `EMP-${profile.profileId.slice(-3)}`}
                          onChange={(e) => updateEditableId(profile.profileId, e.target.value)}
                          sx={{ width: 100 }}
                        />
                      </td>
                      <td>{profile.externalId}</td>
                      <td>
                        <Select
                          size="sm"
                          variant="soft"
                          value={assignments[profile.profileId] || 'unassigned'}
                          onChange={(_, value) => updateAssignment(profile.profileId, value as string)}
                        >
                          <Option value="unassigned">Unassigned</Option>
                          {departments.map(dept => (
                            <Option key={dept} value={dept}>
                              {dept.charAt(0).toUpperCase() + dept.slice(1)}
                            </Option>
                          ))}
                        </Select>
                      </td>
                      <td>
                        <Chip size="sm" variant="soft">
                          {profile.deviceType || 'Unknown'}
                        </Chip>
                      </td>
                      <td>{profile.demographics?.age || 'N/A'}</td>
                      <td>{profile.demographics?.gender || 'N/A'}</td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.activityScore)}>
                          {profile.activityScore || 'N/A'}
                        </Chip>
                      </td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.sleepScore)}>
                          {profile.sleepScore || 'N/A'}
                        </Chip>
                      </td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.mentalHealthScore)}>
                          {profile.mentalHealthScore || 'N/A'}
                        </Chip>
                      </td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.readinessScore)}>
                          {profile.readinessScore || 'N/A'}
                        </Chip>
                      </td>
                      <td>
                        <Chip size="sm" color={getScoreColor(profile.wellbeingScore)}>
                          {profile.wellbeingScore || 'N/A'}
                        </Chip>
                      </td>
                      <td>87%</td>
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
                    {expandedRows.includes(profile.profileId) && (
                      <tr>
                        <td colSpan={15} style={{ padding: 0 }}>
                          <Sheet
                            variant="soft"
                            sx={{
                              p: 2,
                              m: 1,
                              borderRadius: 'sm',
                            }}
                          >
                            <AccordionGroup size="sm">
                              {profile.subScores?.activity && (
                                <Accordion>
                                  <AccordionSummary>
                                    <Typography level="body-sm" fontWeight="lg">
                                      Activity Sub-scores:
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Stack spacing={1}>
                                      {profile.subScores.activity.map((score, idx) => (
                                        <Typography key={idx} level="body-xs">
                                          {score.name}: {formatSubScoreValue(score.value, score.unit)}
                                        </Typography>
                                      ))}
                                    </Stack>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                              {profile.subScores?.sleep && (
                                <Accordion>
                                  <AccordionSummary>
                                    <Typography level="body-sm" fontWeight="lg">
                                      Sleep Sub-scores:
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Stack spacing={1}>
                                      {profile.subScores.sleep.map((score, idx) => (
                                        <Typography key={idx} level="body-xs">
                                          {score.name}: {formatSubScoreValue(score.value, score.unit)}
                                        </Typography>
                                      ))}
                                    </Stack>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                              {profile.subScores?.mentalWellbeing && (
                                <Accordion>
                                  <AccordionSummary>
                                    <Typography level="body-sm" fontWeight="lg">
                                      Mental Wellbeing Sub-scores:
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Stack spacing={1}>
                                      {profile.subScores.mentalWellbeing.map((score, idx) => (
                                        <Typography key={idx} level="body-xs">
                                          {score.name}: {formatSubScoreValue(score.value, score.unit)}
                                        </Typography>
                                      ))}
                                    </Stack>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                              {profile.subScores?.readiness && (
                                <Accordion>
                                  <AccordionSummary>
                                    <Typography level="body-sm" fontWeight="lg">
                                      Readiness Sub-scores:
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Stack spacing={1}>
                                      {profile.subScores.readiness.map((score, idx) => (
                                        <Typography key={idx} level="body-xs">
                                          {score.name}: {formatSubScoreValue(score.value, score.unit)}
                                        </Typography>
                                      ))}
                                    </Stack>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                              {profile.subScores?.wellbeing && (
                                <Accordion>
                                  <AccordionSummary>
                                    <Typography level="body-sm" fontWeight="lg">
                                      Wellbeing Sub-scores:
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Stack spacing={1}>
                                      {profile.subScores.wellbeing.map((score, idx) => (
                                        <Typography key={idx} level="body-xs">
                                          {score.name}: {formatSubScoreValue(score.value, score.unit)}
                                        </Typography>
                                      ))}
                                    </Stack>
                                  </AccordionDetails>
                                </Accordion>
                              )}
                            </AccordionGroup>
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

        {/* Debug Panel */}
        {showDebugPanel && (
          <Card>
            <Typography level="title-sm" sx={{ mb: 1 }}>Debug Panel</Typography>
            <Sheet
              variant="outlined"
              sx={{
                p: 1,
                borderRadius: 'sm',
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: 'background.level1',
              }}
            >
              <Stack spacing={0.5}>
                {debugLogs.map((log, idx) => (
                  <Typography key={idx} level="body-xs" fontFamily="monospace">
                    <Chip size="sm" color={log.type === 'error' ? 'danger' : log.type === 'success' ? 'success' : 'neutral'}>
                      {log.timestamp}
                    </Chip>
                    {' '}{log.message}
                  </Typography>
                ))}
              </Stack>
            </Sheet>
          </Card>
        )}
      </Stack>

      {/* Bulk Assign Modal */}
      <Modal open={bulkAssignOpen} onClose={() => setBulkAssignOpen(false)}>
        <ModalDialog>
          <DialogTitle>Bulk Assign Department</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Typography level="body-sm">
                Assign {selectedProfiles.length} selected profiles to:
              </Typography>
              <Select
                value={bulkDepartment}
                onChange={(_, value) => setBulkDepartment(value as string)}
                placeholder="Select department"
              >
                {departments.map(dept => (
                  <Option key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </Option>
                ))}
              </Select>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="plain" onClick={() => setBulkAssignOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkAssign} disabled={!bulkDepartment}>
                  Assign
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Box>
  );
}