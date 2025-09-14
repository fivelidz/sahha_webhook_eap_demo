'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Stack,
  Collapse,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Webhook as WebhookIcon,
  Storage as StorageIcon,
  CloudOff as CloudOffIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

import { 
  loadWebhookProfiles, 
  formatWebhookProfile,
  generateDemoWebhookData 
} from '../lib/webhook-data-service';
import { formatScore, formatTimeValue, getScoreStateColor, getScoreStateBackground } from '../lib/webhook-integration';

interface ProfileManagerWebhookProps {
  darkMode?: boolean;
}

export default function ProfileManagerWebhook({ darkMode = false }: ProfileManagerWebhookProps) {
  // State management
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataMode, setDataMode] = useState<'webhook' | 'demo'>('webhook');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<{ [key: string]: string }>({});
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<'connected' | 'disconnected' | 'demo'>('disconnected');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [bulkDepartment, setBulkDepartment] = useState('unassigned');

  const departments = ['unassigned', 'tech', 'operations', 'sales', 'admin', 'hr', 'finance'];

  // Load profiles from webhook or demo
  const loadProfiles = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const webhookProfiles = await loadWebhookProfiles(dataMode);
      const formattedProfiles = webhookProfiles.map((p, idx) => formatWebhookProfile(p, idx));
      
      setProfiles(formattedProfiles);
      setLastRefresh(new Date());
      
      // Set webhook status
      if (dataMode === 'demo') {
        setWebhookStatus('demo');
      } else if (webhookProfiles.length > 0 && !webhookProfiles[0].isDemo) {
        setWebhookStatus('connected');
      } else {
        setWebhookStatus('disconnected');
      }
      
      // Update debug info
      setDebugInfo({
        mode: dataMode,
        profileCount: formattedProfiles.length,
        loadTime: Date.now() - startTime,
        hasWebhookData: webhookProfiles.some(p => !p.isDemo),
        scoresCoverage: calculateScoreCoverage(formattedProfiles),
        archetypesCoverage: calculateArchetypeCoverage(formattedProfiles),
        factorsCoverage: calculateFactorsCoverage(formattedProfiles),
        lastUpdated: new Date().toISOString()
      });
      
      // Initialize assignments
      const newAssignments: any = {};
      formattedProfiles.forEach(p => {
        newAssignments[p.profileId] = assignments[p.profileId] || 'unassigned';
      });
      setAssignments(newAssignments);
      
    } catch (error) {
      console.error('Error loading profiles:', error);
      setDebugInfo({
        error: error.message,
        mode: dataMode,
        profileCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate data coverage statistics
  const calculateScoreCoverage = (profiles: any[]) => {
    if (profiles.length === 0) return 0;
    const withScores = profiles.filter(p => 
      p.wellbeingScore || p.activityScore || p.sleepScore || 
      p.mentalWellbeingScore || p.readinessScore
    ).length;
    return Math.round((withScores / profiles.length) * 100);
  };

  const calculateArchetypeCoverage = (profiles: any[]) => {
    if (profiles.length === 0) return 0;
    const withArchetypes = profiles.filter(p => p.archetypes && p.archetypes.length > 0).length;
    return Math.round((withArchetypes / profiles.length) * 100);
  };

  const calculateFactorsCoverage = (profiles: any[]) => {
    if (profiles.length === 0) return 0;
    const withFactors = profiles.filter(p => {
      const scores = p.subScores || {};
      return Object.values(scores).some((factors: any) => factors && factors.length > 0);
    }).length;
    return Math.round((withFactors / profiles.length) * 100);
  };

  // Load profiles on mount and mode change
  useEffect(() => {
    loadProfiles();
  }, [dataMode]);

  // Filter and sort profiles
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.externalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.editableProfileId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      assignments[profile.profileId] === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  }).sort((a, b) => {
    if (!sortBy) return 0;
    
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (aVal === null || aVal === undefined) aVal = -1;
    if (bVal === null || bVal === undefined) bVal = -1;
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Paginate profiles
  const paginatedProfiles = filteredProfiles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Check if all visible profiles are selected
  const isAllPageSelected = paginatedProfiles.length > 0 && 
    paginatedProfiles.every(p => selectedProfiles.includes(p.profileId));

  // Handle select all on current page
  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      // Deselect all on current page
      setSelectedProfiles(selectedProfiles.filter(
        id => !paginatedProfiles.find(p => p.profileId === id)
      ));
    } else {
      // Select all on current page
      const pageIds = paginatedProfiles.map(p => p.profileId);
      setSelectedProfiles([...new Set([...selectedProfiles, ...pageIds])]);
    }
  };

  // Handle bulk assignment
  const handleBulkAssign = () => {
    const newAssignments = { ...assignments };
    selectedProfiles.forEach(profileId => {
      newAssignments[profileId] = bulkDepartment;
    });
    setAssignments(newAssignments);
    setSelectedProfiles([]);
  };

  // Get score color
  const getScoreColor = (score: number | null): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (score === null) return 'default';
    const value = score <= 1 ? score * 100 : score;
    if (value >= 80) return 'success';
    if (value >= 60) return 'primary';
    if (value >= 40) return 'warning';
    return 'error';
  };

  // Export data
  const handleExport = () => {
    const exportData = profiles.map(p => ({
      profileId: p.profileId,
      externalId: p.externalId,
      department: assignments[p.profileId] || 'unassigned',
      wellbeing: p.wellbeingScore,
      activity: p.activityScore,
      sleep: p.sleepScore,
      mentalWellbeing: p.mentalWellbeingScore,
      readiness: p.readinessScore,
      archetypes: p.archetypes?.join(', '),
      lastSync: p.lastDataSync
    }));
    
    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profiles_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight="bold">
              Profile Manager
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                icon={webhookStatus === 'connected' ? <WebhookIcon /> : 
                      webhookStatus === 'demo' ? <StorageIcon /> : <CloudOffIcon />}
                label={webhookStatus === 'connected' ? 'Webhook Connected' :
                       webhookStatus === 'demo' ? 'Demo Mode' : 'No Webhook Data'}
                color={webhookStatus === 'connected' ? 'success' : 
                       webhookStatus === 'demo' ? 'info' : 'default'}
                variant="filled"
              />
              <Typography variant="body2" color="text.secondary">
                {profiles.length} profiles • Last updated: {lastRefresh?.toLocaleTimeString() || 'Never'}
                {webhookStatus === 'connected' && debugInfo.scoresCoverage < 30 && (
                  <> • Note: Sahha currently only provides sleep data</>
                )}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={dataMode}
                onChange={(e) => setDataMode(e.target.value as 'webhook' | 'demo')}
                startAdornment={
                  dataMode === 'webhook' ? 
                    <WebhookIcon sx={{ mr: 1, fontSize: 20 }} /> : 
                    <StorageIcon sx={{ mr: 1, fontSize: 20 }} />
                }
              >
                <MenuItem value="webhook">Webhook Data</MenuItem>
                <MenuItem value="demo">Demo Data</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadProfiles}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<BugReportIcon />}
              onClick={() => setShowDebug(!showDebug)}
              color={showDebug ? 'primary' : 'inherit'}
            >
              Debug
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Bulk Actions Bar */}
      {selectedProfiles.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="body1">
                {selectedProfiles.length} profile{selectedProfiles.length !== 1 ? 's' : ''} selected
              </Typography>
            </Grid>
            <Grid item xs>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: 'inherit' }}>Bulk Assign</InputLabel>
                  <Select
                    value={bulkDepartment}
                    onChange={(e) => setBulkDepartment(e.target.value)}
                    label="Bulk Assign"
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleBulkAssign}
                  sx={{ bgcolor: 'primary.dark' }}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedProfiles([])}
                  sx={{ borderColor: 'primary.contrastText', color: 'primary.contrastText' }}
                >
                  Clear Selection
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Debug Panel */}
      <Collapse in={showDebug}>
        <Card sx={{ mb: 3, bgcolor: darkMode ? 'grey.900' : 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Debug Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Data Source</Typography>
                  <Typography variant="h6">{debugInfo.mode?.toUpperCase()}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Profiles Loaded</Typography>
                  <Typography variant="h6">{debugInfo.profileCount || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Load Time</Typography>
                  <Typography variant="h6">{debugInfo.loadTime || 0}ms</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Webhook Status</Typography>
                  <Typography variant="h6" color={webhookStatus === 'connected' ? 'success.main' : 'text.secondary'}>
                    {webhookStatus.toUpperCase()}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Data Coverage</Typography>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body2" sx={{ minWidth: 100 }}>Scores:</Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={debugInfo.scoresCoverage || 0} 
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2">{debugInfo.scoresCoverage || 0}%</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body2" sx={{ minWidth: 100 }}>Archetypes:</Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={debugInfo.archetypesCoverage || 0} 
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2">{debugInfo.archetypesCoverage || 0}%</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body2" sx={{ minWidth: 100 }}>Factors:</Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={debugInfo.factorsCoverage || 0} 
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2">{debugInfo.factorsCoverage || 0}%</Typography>
                </Stack>
              </Stack>
            </Box>
            
            {debugInfo.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {debugInfo.error}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Collapse>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="wellbeingScore">Wellbeing Score</MenuItem>
                <MenuItem value="activityScore">Activity Score</MenuItem>
                <MenuItem value="sleepScore">Sleep Score</MenuItem>
                <MenuItem value="mentalWellbeingScore">Mental Wellbeing</MenuItem>
                <MenuItem value="readinessScore">Readiness Score</MenuItem>
              </Select>
            </FormControl>
            {sortBy && (
              <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'desc' ? <ExpandMoreIcon /> : <KeyboardArrowUpIcon />}
              </IconButton>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Data Table */}
      {loading ? (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedProfiles.length > 0 && !isAllPageSelected}
                    checked={isAllPageSelected}
                    onChange={handleSelectAllPage}
                  />
                </TableCell>
                <TableCell />
                <TableCell>Profile ID</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Age/Gender</TableCell>
                <TableCell align="center">Wellbeing</TableCell>
                <TableCell align="center">Activity</TableCell>
                <TableCell align="center">Sleep</TableCell>
                <TableCell align="center">Mental Wellbeing</TableCell>
                <TableCell align="center">Readiness</TableCell>
                <TableCell align="center">Biomarkers</TableCell>
                <TableCell>Archetypes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProfiles.map((profile) => (
                <React.Fragment key={profile.profileId}>
                  <TableRow hover selected={selectedProfiles.includes(profile.profileId)}>
                    <TableCell padding="checkbox">
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
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (expandedRows.includes(profile.profileId)) {
                            setExpandedRows(expandedRows.filter(id => id !== profile.profileId));
                          } else {
                            setExpandedRows([...expandedRows, profile.profileId]);
                          }
                        }}
                      >
                        {expandedRows.includes(profile.profileId) ? 
                          <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <TextField
                          size="small"
                          value={profile.editableProfileId}
                          onChange={(e) => {
                            const updated = [...profiles];
                            const idx = updated.findIndex(p => p.profileId === profile.profileId);
                            if (idx >= 0) {
                              updated[idx].editableProfileId = e.target.value;
                              setProfiles(updated);
                            }
                          }}
                          sx={{ maxWidth: 120 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Sahha: {profile.originalExternalId || profile.externalId}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={assignments[profile.profileId] || 'unassigned'}
                        onChange={(e) => setAssignments({
                          ...assignments,
                          [profile.profileId]: e.target.value
                        })}
                      >
                        {departments.map(dept => (
                          <MenuItem key={dept} value={dept}>
                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={profile.deviceType || 'Unknown'} 
                        size="small" 
                        variant="outlined" 
                        color={profile.deviceType === 'Unknown' ? 'default' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {profile.demographics?.age && (
                          <Chip label={`${profile.demographics.age}y`} size="small" />
                        )}
                        {profile.demographics?.gender && (
                          <Chip 
                            label={profile.demographics.gender} 
                            size="small" 
                            color={profile.demographics.gender === 'Male' ? 'info' : 'secondary'}
                          />
                        )}
                        {!profile.demographics?.age && !profile.demographics?.gender && (
                          <Typography variant="caption" color="text.secondary">N/A</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatScore(profile.wellbeingScore)}
                        size="small"
                        color={getScoreColor(profile.wellbeingScore)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatScore(profile.activityScore)}
                        size="small"
                        color={getScoreColor(profile.activityScore)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatScore(profile.sleepScore)}
                        size="small"
                        color={getScoreColor(profile.sleepScore)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatScore(profile.mentalWellbeingScore)}
                        size="small"
                        color={getScoreColor(profile.mentalWellbeingScore)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatScore(profile.readinessScore)}
                        size="small"
                        color={getScoreColor(profile.readinessScore)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {profile.biomarkerCount > 0 ? (
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Chip
                            label={`${profile.biomarkerCount}`}
                            size="small"
                            variant="outlined"
                            color="info"
                            title={`${profile.biomarkerCount} biomarker types`}
                          />
                          {profile.dataLogCount > 0 && (
                            <Chip
                              label={`${profile.dataLogCount}`}
                              size="small"
                              variant="outlined"
                              color="success"
                              title={`${profile.dataLogCount} data logs`}
                            />
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {profile.archetypes?.slice(0, 2).map((arch: string, idx: number) => (
                          <Chip key={idx} label={arch} size="small" variant="outlined" />
                        ))}
                        {profile.archetypes?.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{profile.archetypes.length - 2}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Row with Factors */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                      <Collapse in={expandedRows.includes(profile.profileId)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Detailed Factors
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(profile.subScores || {}).map(([category, factors]) => (
                              factors && factors.length > 0 && (
                                <Grid item xs={12} md={6} key={category}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                      </Typography>
                                      <Stack spacing={1}>
                                        {(factors as any[]).map((factor, idx) => (
                                          <Stack key={idx} direction="row" justifyContent="space-between">
                                            <Typography variant="caption" color="text.secondary">
                                              {factor.name}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <Typography variant="body2">
                                                {factor.value}
                                              </Typography>
                                              {factor.goal && (
                                                <Typography variant="caption" color="text.secondary">
                                                  / {factor.goal}
                                                </Typography>
                                              )}
                                            </Stack>
                                          </Stack>
                                        ))}
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              )
                            ))}
                          </Grid>
                          
                          {/* All Archetypes */}
                          {profile.archetypes && profile.archetypes.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                All Archetypes
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {profile.archetypes.map((arch: string, idx: number) => (
                                  <Chip key={idx} label={arch} color="primary" variant="outlined" />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          
          <TablePagination
            component="div"
            count={filteredProfiles.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}
    </Box>
  );
}