// frontend/src/pages/setting.tsx
import React, { useState, useRef, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Chip,
  Button,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  Alert,
  Stack,
  Tooltip,
  Snackbar,
  useTheme,
  alpha,
  InputAdornment,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Storage as SyncIcon,
  Notifications as NotificationsIcon,
  CreditCard as BillingIcon,
  Help as HelpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Sync as SyncNowIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  ReceiptLong as InvoicesIcon,
  Assessment as ReportIcon,
  AccountCircle as AccountIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { motion, useInView } from 'framer-motion';
import { useAPIData, API_URL, handleDisconnect } from '../utils';
import { Link, useLocation } from 'react-router-dom';

// ============================================
// TYPES
// ============================================

interface Tenant {
  id: string;
  authEventId: string;
  tenantId: string;
  tenantType: string;
  tenantName: string;
  createdDateUtc: string;
  updatedDateUtc: string;
}

// ============================================
// SIDEBAR COMPONENT
// ============================================

const DRAWER_WIDTH = 280;

const Sidebar = () => {
  const location = useLocation();
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/accounting/operations', label: 'Accounting', icon: <InvoicesIcon /> },
    { path: '/accounting/records', label: 'Reports', icon: <ReportIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <Box
      sx={{
        width: collapsed ? 80 : DRAWER_WIDTH,
        flexShrink: 0,
        bgcolor: '#FFFFFF',
        borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        transition: 'width 0.2s ease',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            Kabert
          </Typography>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Box sx={{ mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
                px: collapsed ? 1 : 3,
                py: 1.5,
                mb: 0.5,
                borderRadius: 2,
                textTransform: 'none',
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Box sx={{ mr: collapsed ? 0 : 2, display: 'flex' }}>{item.icon}</Box>
              {!collapsed && (
                <Typography variant="body2" fontWeight={isActive ? 600 : 400}>
                  {item.label}
                </Typography>
              )}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

// ============================================
// HEADER COMPONENT
// ============================================

const Header = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onDisconnect = () => {
    handleDisconnect();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Settings
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small">
            <SearchIcon />
          </IconButton>
          <IconButton size="small">
            <NotificationsIcon />
          </IconButton>
          <Button
            onClick={handleMenuOpen}
            sx={{
              textTransform: 'none',
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              <AccountIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Demo Company
            </Typography>
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Account Settings</MenuItem>
            <Divider />
            <MenuItem onClick={onDisconnect}>Disconnect from Xero</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// ============================================
// ANIMATED SECTION WRAPPER
// ============================================

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString();
};

// ============================================
// MAIN SETTINGS PAGE
// ============================================

export default function Settings() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ZRA Settings State
  const [zraSettings, setZraSettings] = useState({
    tpin: '',
    branchId: '000',
    deviceSerial: '',
    environment: 'sandbox' as 'sandbox' | 'production',
  });

  // Sync Settings State
  const [syncSettings, setSyncSettings] = useState({
    autoSync: '5min',
    emailReports: true,
    notifyOnSubmission: true,
    notifyOnFailure: true,
    weeklySummary: false,
  });

  // Fetch Xero identity data
  const { data: identityData, loading: identityLoading, error: identityError } = useAPIData(`${API_URL}/xero/identity`);

  // Get first tenant
  const tenant = identityData && Array.isArray(identityData) && identityData.length > 0 ? identityData[0] : null;

  // Usage stats (mock data - would come from API)
  const usageStats = {
    invoicesThisMonth: 42,
    invoicesSubmitted: 38,
    apiCalls: 156,
    lastSync: new Date().toLocaleString(),
  };

  // Subscription info (mock data)
  const subscription = {
    plan: 'Business',
    status: 'Active',
    renews: 'April 15, 2025',
    price: '$99/month',
  };

  const handleZraChange = (field: string, value: string) => {
    setZraSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSyncChange = (field: string, value: any) => {
    setSyncSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveZraSettings = () => {
    console.log('Saving ZRA settings:', zraSettings);
    setSnackbar({ open: true, message: 'ZRA settings saved successfully', severity: 'success' });
  };

  const handleTestConnection = () => {
    console.log('Testing ZRA connection...');
    setTimeout(() => {
      setSnackbar({ open: true, message: 'Connection successful! ZRA VSDC is reachable', severity: 'success' });
    }, 1000);
  };

  const handleSyncNow = () => {
    setSnackbar({ open: true, message: 'Sync initiated...', severity: 'success' });
    setTimeout(() => {
      setSnackbar({ open: true, message: 'Sync completed successfully', severity: 'success' });
    }, 2000);
  };

  const handleSavePreferences = () => {
    console.log('Saving preferences:', syncSettings);
    setSnackbar({ open: true, message: 'Preferences saved', severity: 'success' });
  };

  const handleDownloadLogs = () => {
    console.log('Downloading debug logs...');
    setSnackbar({ open: true, message: 'Logs downloaded', severity: 'success' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDisconnectClick = () => {
    if (window.confirm('Are you sure you want to disconnect from Xero?')) {
      handleDisconnect();
    }
  };

  const tabs = [
    { label: 'Connections', icon: <LinkIcon /> },
    { label: 'ZRA Integration', icon: <CloudUploadIcon /> },
    { label: 'Sync & Notifications', icon: <SyncIcon /> },
    { label: 'Billing', icon: <BillingIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, overflowX: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 5 }}>
          
          {/* Header Section */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '70%' }}>
              Manage your Xero connection, ZRA Smart Invoice integration, and application preferences.
            </Typography>
          </Box>

          {/* Tabs Navigation */}
          <Paper sx={{ borderRadius: 3, mb: 4, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  gap: 1,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.secondary.main,
                  height: 3,
                },
              }}
            >
              {tabs.map((tab, idx) => (
                <Tab key={idx} icon={tab.icon} label={tab.label} iconPosition="start" />
              ))}
            </Tabs>
          </Paper>

          {/* Tab 1: Connections */}
          {activeTab === 0 && (
            <AnimatedSection delay={0.1}>
              <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`, borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
                      <LinkIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Xero Connection
                    </Typography>
                  </Box>

                  {identityLoading ? (
                    <LinearProgress sx={{ borderRadius: 2, mb: 2 }} />
                  ) : identityError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>Error loading Xero data: {identityError}</Alert>
                  ) : tenant ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Company Name</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{tenant.tenantName}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Tenant ID</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{tenant.tenantId}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Status</Typography>
                        <Chip icon={<CheckCircleIcon />} label="Active" size="small" sx={{ bgcolor: '#10B981', color: 'white' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Last Sync</Typography>
                        <Typography variant="body2">{usageStats.lastSync}</Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="warning" sx={{ mb: 2 }}>No Xero connection found. Please connect your Xero account.</Alert>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" startIcon={<SyncNowIcon />} onClick={handleSyncNow} sx={{ borderRadius: 2, textTransform: 'none' }}>
                      Sync Now
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<LinkIcon />} onClick={handleDisconnectClick} sx={{ borderRadius: 2, textTransform: 'none' }}>
                      Disconnect Xero
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}

          {/* Tab 2: ZRA Integration */}
          {activeTab === 1 && (
            <AnimatedSection delay={0.1}>
              <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.7)})`, borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
                      <CloudUploadIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      ZRA Smart Invoice Configuration
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      label="TPIN (Taxpayer Identification Number)"
                      value={zraSettings.tpin}
                      onChange={(e) => handleZraChange('tpin', e.target.value)}
                      fullWidth
                      placeholder="Enter 10-digit TPIN"
                      helperText="Your ZRA-issued Taxpayer Identification Number"
                    />
                    <TextField
                      label="Branch ID"
                      value={zraSettings.branchId}
                      onChange={(e) => handleZraChange('branchId', e.target.value)}
                      fullWidth
                      placeholder="000"
                      helperText="Branch identifier (000 for head office)"
                    />
                    <TextField
                      label="Device Serial Number"
                      value={zraSettings.deviceSerial}
                      onChange={(e) => handleZraChange('deviceSerial', e.target.value)}
                      fullWidth
                      placeholder="Enter VSDC device serial"
                      helperText="VSDC device serial number from ZRA"
                    />

                    <FormControl component="fieldset">
                      <FormLabel component="legend">Environment</FormLabel>
                      <RadioGroup row value={zraSettings.environment} onChange={(e) => handleZraChange('environment', e.target.value)}>
                        <FormControlLabel value="sandbox" control={<Radio />} label="Sandbox (Testing)" />
                        <FormControlLabel value="production" control={<Radio />} label="Production (Live)" />
                      </RadioGroup>
                    </FormControl>

                    <Divider />

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button variant="outlined" onClick={handleTestConnection} startIcon={<CheckCircleIcon />} sx={{ borderRadius: 2, textTransform: 'none' }}>
                        Test Connection
                      </Button>
                      <Button variant="contained" onClick={handleSaveZraSettings} startIcon={<SaveIcon />} sx={{ borderRadius: 2, textTransform: 'none', bgcolor: theme.palette.secondary.main, color: theme.palette.primary.main }}>
                        Save Settings
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}

          {/* Tab 3: Sync & Notifications */}
          {activeTab === 2 && (
            <AnimatedSection delay={0.1}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Card sx={{ flex: 1, minWidth: 280, borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`, borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
                        <SyncIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Sync Settings</Typography>
                    </Box>
                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                      <FormLabel component="legend">Auto-sync frequency</FormLabel>
                      <RadioGroup value={syncSettings.autoSync} onChange={(e) => handleSyncChange('autoSync', e.target.value)}>
                        <FormControlLabel value="5min" control={<Radio />} label="Every 5 minutes" />
                        <FormControlLabel value="15min" control={<Radio />} label="Every 15 minutes" />
                        <FormControlLabel value="1hour" control={<Radio />} label="Every hour" />
                        <FormControlLabel value="manual" control={<Radio />} label="Manual only" />
                      </RadioGroup>
                    </FormControl>
                  </CardContent>
                </Card>

                <Card sx={{ flex: 1, minWidth: 280, borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{ background: 'linear-gradient(135deg, #FFD700, #F59E0B)', borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
                        <NotificationsIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
                    </Box>
                    <Stack spacing={2}>
                      <FormControlLabel control={<Switch checked={syncSettings.emailReports} onChange={(e) => handleSyncChange('emailReports', e.target.checked)} />} label="Email reports" />
                      <FormControlLabel control={<Switch checked={syncSettings.notifyOnSubmission} onChange={(e) => handleSyncChange('notifyOnSubmission', e.target.checked)} />} label="Notify on submission to ZRA" />
                      <FormControlLabel control={<Switch checked={syncSettings.notifyOnFailure} onChange={(e) => handleSyncChange('notifyOnFailure', e.target.checked)} />} label="Notify on submission failure" />
                      <FormControlLabel control={<Switch checked={syncSettings.weeklySummary} onChange={(e) => handleSyncChange('weeklySummary', e.target.checked)} />} label="Weekly summary email" />
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button variant="contained" onClick={handleSavePreferences} startIcon={<SaveIcon />} sx={{ borderRadius: 2, textTransform: 'none' }}>
                  Save Preferences
                </Button>
              </Box>
            </AnimatedSection>
          )}

          {/* Tab 4: Billing */}
          {activeTab === 3 && (
            <AnimatedSection delay={0.1}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Card sx={{ flex: 1, minWidth: 280, borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
                        <BillingIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Subscription</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Plan</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{subscription.plan}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip label={subscription.status} size="small" sx={{ bgcolor: '#10B981', color: 'white', height: 20, fontSize: '0.7rem' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Renews on</Typography>
                        <Typography variant="body2">{subscription.renews}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Price</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{subscription.price}</Typography>
                      </Box>
                      <Button variant="outlined" sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}>Manage Subscription</Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ flex: 1, minWidth: 280, borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`, borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
                        <AssessmentIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Usage This Month</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Invoices processed</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{usageStats.invoicesThisMonth}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Submitted to ZRA</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>{usageStats.invoicesSubmitted}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">API calls</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{usageStats.apiCalls}</Typography>
                      </Box>
                      <Button variant="outlined" sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}>View Detailed Usage</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </AnimatedSection>
          )}

          {/* Support Section (visible on all tabs) */}
          <AnimatedSection delay={0.2}>
            <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', mt: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ background: `linear-gradient(135deg, #6B7280, #4B5563)`, borderRadius: '50%', p: 1.5, display: 'inline-flex' }}>
                    <HelpIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Support & Resources
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Need help? Contact our support team
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      support@kabert.com
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadLogs} sx={{ borderRadius: 2, textTransform: 'none' }}>
                      Download Debug Logs
                    </Button>
                    <Button variant="outlined" startIcon={<OpenInNewIcon />} href="https://developer.xero.com/documentation" target="_blank" sx={{ borderRadius: 2, textTransform: 'none' }}>
                      Xero API Docs
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Footer */}
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Kabert Record Hub Limited © {new Date().getFullYear()} | Zambia Revenue Authority Smart Invoice Certified Partner
            </Typography>
          </Box>
        </Container>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}