// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Checkbox,
  Stack,
  LinearProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Avatar,
  Divider,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Snackbar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
  Dashboard as DashboardIcon,
  ReceiptLong as InvoicesIcon,
  People as ContactsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAPIData, API_URL, formatXeroDate } from '../utils';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Link, useLocation } from 'react-router-dom';

// ============================================
// TYPES
// ============================================

interface Invoice {
  InvoiceID: string;
  InvoiceNumber: string;
  Type: string;
  Date: string;
  DueDate: string;
  Status: string;
  Total: number;
  CurrencyCode: string;
  Contact?: {
    Name: string;
  };
}

interface ZRAStatus {
  invoiceId: string;
  status: 'not_submitted' | 'pending' | 'submitted' | 'failed';
  submittedAt?: string;
  errorMessage?: string;
  receiptNo?: string;
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
    { path: '/accounting/operations', label: 'Invoices', icon: <InvoicesIcon /> },
    { path: '/accounting/records', label: 'Reports', icon: <ReceiptIcon /> },
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

  const handleDisconnect = () => {
    window.location.href = '/';
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
          Dashboard
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
            <MenuItem onClick={handleDisconnect}>Disconnect from Xero</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// ============================================
// KPI CARD COMPONENT
// ============================================

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color }) => {
  const theme = useTheme();
  const isPositive = change && change > 0;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha('#000000', 0.05)}`,
        },
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            {title}
          </Typography>
          <Box sx={{ color: color, opacity: 0.7 }}>{icon}</Box>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '2rem', md: '2.5rem' } }}>
          {value}
        </Typography>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            {isPositive ? (
              <TrendingUpIcon sx={{ fontSize: 14, color: '#10B981' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 14, color: '#EF4444' }} />
            )}
            <Typography variant="caption" sx={{ color: isPositive ? '#10B981' : '#EF4444', fontWeight: 500 }}>
              {Math.abs(change)}% from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export default function Dashboard() {
  const theme = useTheme();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [zraStatuses, setZraStatuses] = useState<ZRAStatus[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch real invoices from Xero
  const { data: invoices, loading, error } = useAPIData(`${API_URL}/xero/invoices`, 'Invoices');

  // Load saved ZRA statuses from localStorage (persist between sessions)
  useEffect(() => {
    const saved = localStorage.getItem('zra_statuses');
    if (saved) {
      try {
        setZraStatuses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved ZRA statuses', e);
      }
    }
  }, []);

  // Save ZRA statuses to localStorage
  useEffect(() => {
    if (zraStatuses.length > 0) {
      localStorage.setItem('zra_statuses', JSON.stringify(zraStatuses));
    }
  }, [zraStatuses]);

  // Initialize ZRA statuses when invoices load
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const existingStatuses = zraStatuses.map(s => s.invoiceId);
      const newStatuses = invoices
        .filter((inv: Invoice) => !existingStatuses.includes(inv.InvoiceID))
        .map((inv: Invoice) => ({
          invoiceId: inv.InvoiceID,
          status: 'not_submitted' as const,
        }));
      if (newStatuses.length > 0) {
        setZraStatuses(prev => [...prev, ...newStatuses]);
      }
    }
  }, [invoices]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return {
        totalInvoices: 0,
        totalValue: 0,
        avgValue: 0,
        pendingZRA: 0,
        submittedZRA: 0,
        failedZRA: 0,
      };
    }

    const totalValue = invoices.reduce((sum: number, inv: Invoice) => sum + (inv.Total || 0), 0);
    const pendingZRA = zraStatuses.filter(s => s.status === 'pending').length;
    const submittedZRA = zraStatuses.filter(s => s.status === 'submitted').length;
    const failedZRA = zraStatuses.filter(s => s.status === 'failed').length;

    return {
      totalInvoices: invoices.length,
      totalValue,
      avgValue: totalValue / invoices.length,
      pendingZRA,
      submittedZRA,
      failedZRA,
    };
  }, [invoices, zraStatuses]);

  // Prepare chart data - last 6 months
  const chartData = useMemo(() => {
    if (!invoices || invoices.length === 0) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { month: months[d.getMonth()], year: d.getFullYear(), key: `${d.getFullYear()}-${d.getMonth()}` };
    });

    const invoicesByMonth = invoices.reduce((acc: Record<string, number>, inv: Invoice) => {
      if (inv.Date) {
        const date = new Date(inv.Date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    return last6Months.map(({ month, key }) => ({
      month,
      invoices: invoicesByMonth[key] || 0,
    }));
  }, [invoices]);

  // ZRA status distribution
  const statusDistribution = useMemo(() => {
    const total = kpis.totalInvoices;
    const notSubmitted = total - kpis.pendingZRA - kpis.submittedZRA - kpis.failedZRA;
    return [
      { name: 'Submitted', value: kpis.submittedZRA, color: '#10B981' },
      { name: 'Pending', value: kpis.pendingZRA, color: '#FFD700' },
      { name: 'Failed', value: kpis.failedZRA, color: '#EF4444' },
      { name: 'Not Submitted', value: notSubmitted, color: '#9CA3AF' },
    ].filter(item => item.value > 0);
  }, [kpis]);

  // Recent invoices (last 5)
  const recentInvoices = useMemo(() => {
    if (!invoices) return [];
    return [...invoices]
      .sort((a: Invoice, b: Invoice) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
      .slice(0, 5);
  }, [invoices]);

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId) ? prev.filter(id => id !== invoiceId) : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === recentInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(recentInvoices.map((inv: Invoice) => inv.InvoiceID));
    }
  };

  // REAL ZRA SUBMISSION - calls backend API with proper error handling
  const handleSubmitToZRA = async () => {
    if (selectedInvoices.length === 0) return;

    setSubmitting(true);
    setSubmitMessage(null);

    // Mark selected as pending
    setZraStatuses(prev =>
      prev.map(status =>
        selectedInvoices.includes(status.invoiceId)
          ? { ...status, status: 'pending' as const }
          : status
      )
    );

    const results: { invoiceId: string; success: boolean; receiptNo?: string; error?: string }[] = [];

    // Submit each invoice to the backend
    for (const invoiceId of selectedInvoices) {
      try {
        const response = await fetch(`${API_URL}/submit/${invoiceId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Handle HTTP error responses (400, 500, etc.)
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.error || errorMessage;
          } catch {
            errorMessage = await response.text() || errorMessage;
          }
          results.push({
            invoiceId,
            success: false,
            error: errorMessage,
          });
        } else {
          const result = await response.json();
          if (result.success) {
            results.push({
              invoiceId,
              success: true,
              receiptNo: result.zra_receipt_no,
            });
          } else {
            results.push({
              invoiceId,
              success: false,
              error: result.error || 'Submission failed',
            });
          }
        }
      } catch (error) {
        results.push({
          invoiceId,
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
        });
      }
    }

    // Update statuses based on results
    setZraStatuses(prev =>
      prev.map(status => {
        const result = results.find(r => r.invoiceId === status.invoiceId);
        if (result) {
          return {
            ...status,
            status: result.success ? 'submitted' as const : 'failed' as const,
            submittedAt: result.success ? new Date().toISOString() : undefined,
            errorMessage: result.success ? undefined : result.error,
            receiptNo: result.receiptNo,
          };
        }
        return status;
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (failCount === 0) {
      setSnackbar({
        open: true,
        message: `${successCount} invoice${successCount !== 1 ? 's' : ''} submitted to ZRA successfully!`,
        severity: 'success',
      });
    } else if (successCount === 0) {
      setSnackbar({
        open: true,
        message: `Failed to submit ${failCount} invoice${failCount !== 1 ? 's' : ''}. ${results[0]?.error || 'Check item mappings.'}`,
        severity: 'error',
      });
    } else {
      setSnackbar({
        open: true,
        message: `${successCount} submitted, ${failCount} failed.`,
        severity: 'error',
      });
    }

    setSelectedInvoices([]);
    setSubmitting(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getZRAStatusForInvoice = (invoiceId: string) => {
    return zraStatuses.find(s => s.invoiceId === invoiceId)?.status || 'not_submitted';
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress sx={{ width: 200, mb: 2, borderRadius: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading your Xero data...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          Failed to load data from Xero: {error}
          <Button size="small" onClick={handleRefresh} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, overflowX: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Welcome Row */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Good morning
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here's what's happening with your Xero integration
            </Typography>
          </Box>

          {/* KPI Cards - 4 column grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
              gap: 3,
              mb: 4,
            }}
          >
            <KPICard
              title="Total Invoices"
              value={kpis.totalInvoices}
              change={12}
              icon={<ReceiptIcon sx={{ fontSize: 24 }} />}
              color={theme.palette.primary.main}
            />
            <KPICard
              title="Total Value"
              value={`ZMW ${kpis.totalValue.toLocaleString()}`}
              change={8}
              icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
              color={theme.palette.secondary.main}
            />
            <KPICard
              title="Avg. Invoice"
              value={`ZMW ${Math.round(kpis.avgValue).toLocaleString()}`}
              icon={<ReceiptIcon sx={{ fontSize: 24 }} />}
              color="#6B7280"
            />
            <KPICard
              title="Submitted to ZRA"
              value={kpis.submittedZRA}
              change={18}
              icon={<CloudUploadIcon sx={{ fontSize: 24 }} />}
              color="#10B981"
            />
          </Box>

          {/* Charts Row - 2 columns */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Invoice Trend Chart */}
            <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Invoice Activity
                  </Typography>
                  <Chip label="Last 6 months" size="small" variant="outlined" />
                </Box>
                <Box sx={{ height: 280 }}>
                  {chartData.some(d => d.invoices > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000000', 0.05)} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="invoices" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">
                        No invoice data available for the last 6 months
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* ZRA Status Chart */}
            <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  ZRA Submission Status
                </Typography>
                <Box sx={{ height: 240 }}>
                  {statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          dataKey="value"
                          label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                          labelLine={false}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">
                        No submissions yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Submit Message */}
          <AnimatePresence>
            {submitMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ marginBottom: 24 }}
              >
                <Alert severity={submitMessage.type} onClose={() => setSubmitMessage(null)}>
                  {submitMessage.text}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Invoices Section */}
          <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Invoices
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    size="small"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Export
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSubmitToZRA}
                    disabled={selectedInvoices.length === 0 || submitting}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      bgcolor: theme.palette.secondary.main,
                      color: theme.palette.primary.main,
                      '&:hover': { bgcolor: theme.palette.secondary.dark },
                      '&.Mui-disabled': { bgcolor: alpha(theme.palette.secondary.main, 0.5) },
                    }}
                  >
                    {submitting ? 'Submitting...' : `Submit to ZRA (${selectedInvoices.length})`}
                  </Button>
                  <IconButton size="small" onClick={handleRefresh}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>

              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedInvoices.length > 0 && selectedInvoices.length < recentInvoices.length}
                          checked={selectedInvoices.length === recentInvoices.length && recentInvoices.length > 0}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>ZRA Status</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentInvoices.length > 0 ? (
                      recentInvoices.map((invoice: Invoice) => {
                        const zraStatus = getZRAStatusForInvoice(invoice.InvoiceID);
                        return (
                          <TableRow key={invoice.InvoiceID} hover>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedInvoices.includes(invoice.InvoiceID)}
                                onChange={() => handleSelectInvoice(invoice.InvoiceID)}
                                disabled={zraStatus === 'submitted'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {invoice.InvoiceNumber || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>{invoice.Contact?.Name || 'N/A'}</TableCell>
                            <TableCell>{formatXeroDate(invoice.Date)}</TableCell>
                            <TableCell>{formatXeroDate(invoice.DueDate)}</TableCell>
                            <TableCell>
                              <Chip
                                label={invoice.Status}
                                size="small"
                                sx={{
                                  bgcolor: invoice.Status === 'PAID' ? '#10B981' : invoice.Status === 'AUTHORISED' ? '#FFD700' : '#6B7280',
                                  color: invoice.Status === 'AUTHORISED' ? '#0033A0' : 'white',
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {invoice.CurrencyCode} {invoice.Total?.toLocaleString() || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={zraStatus === 'submitted' ? 'Submitted' : zraStatus === 'pending' ? 'Pending' : zraStatus === 'failed' ? 'Failed' : 'Not Sent'}
                                size="small"
                                sx={{
                                  bgcolor: zraStatus === 'submitted' ? '#10B981' : zraStatus === 'pending' ? '#FFD700' : zraStatus === 'failed' ? '#EF4444' : '#E5E7EB',
                                  color: zraStatus === 'pending' ? '#0033A0' : 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="View Details">
                                <IconButton size="small">
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                          <Typography variant="body1" color="text.secondary">
                            No invoices found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Footer */}
          <Box sx={{ py: 3, mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Kabert Record Hub Limited © {new Date().getFullYear()} | Zambia Revenue Authority Smart Invoice Certified Partner
            </Typography>
          </Box>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}