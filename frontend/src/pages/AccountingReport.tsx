// frontend/src/pages/AccountingReport.tsx
import React, { useState, useMemo, useRef } from 'react';
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
  Tabs,
  Tab,
  useTheme,
  alpha,
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
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  AttachMoney as MoneyIcon,
  Assessment as ReportIcon,
  Book as JournalIcon,
  ArrowForward as ArrowForwardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  ReceiptLong as InvoicesIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion, useInView } from 'framer-motion';
import { useAPIData, API_URL, formatXeroDate } from '../utils';
import { Link, useLocation } from 'react-router-dom';
import Report from '../components/Report';
import { REPORT_TYPES } from '../utils';

// ============================================
// TYPES
// ============================================

interface Journal {
  JournalID: string;
  JournalDate: string;
  JournalNumber: number;
  CreatedDateUTC: string;
  Reference?: string;
  SourceType?: string;
  JournalLines?: Array<{
    AccountName: string;
    NetAmount: number;
    GrossAmount: number;
  }>;
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
          Reports
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

const formatCurrency = (amount: number, currency: string = 'ZMW') => {
  return `${currency} ${amount?.toLocaleString() || 0}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ============================================
// MAIN REPORTS PAGE
// ============================================

export default function AccountingReport() {
  const theme = useTheme();
  const [selectedReport, setSelectedReport] = useState<'BalanceSheet' | 'ProfitAndLoss' | 'trialBalance'>('BalanceSheet');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch journal entries
  const { data: journals, loading: journalsLoading, error: journalsError } = useAPIData(`${API_URL}/xero/journals`, 'Journals');

  // Fetch selected report data
  const { data: reportData, loading: reportLoading, error: reportError } = useAPIData(
    `${API_URL}/xero/reports/${selectedReport}`
  );

  // Recent journals (last 5)
  const recentJournals = useMemo(() => {
    if (!journals) return [];
    return [...journals]
      .sort((a: Journal, b: Journal) => new Date(b.JournalDate).getTime() - new Date(a.JournalDate).getTime())
      .slice(0, 5);
  }, [journals]);

  // Calculate YTD summary (mock calculation from journals)
  const ytdSummary = useMemo(() => {
    if (!journals) return { revenue: 0, expenses: 0, netProfit: 0 };
    
    let revenue = 0;
    let expenses = 0;
    
    journals.forEach((journal: Journal) => {
      journal.JournalLines?.forEach((line) => {
        const amount = line.NetAmount || 0;
        if (amount > 0) {
          revenue += amount;
        } else {
          expenses += Math.abs(amount);
        }
      });
    });
    
    return {
      revenue,
      expenses,
      netProfit: revenue - expenses,
    };
  }, [journals]);

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting ${selectedReport} as ${format}`);
    handleExportClose();
  };

  const isLoading = reportLoading;
  const hasError = reportError;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, overflowX: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 5 }}>
          
          {/* Header Section */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Financial Reports
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '70%' }}>
              Balance sheets, profit & loss statements, and journal activity. Track your financial health and audit trail.
            </Typography>
          </Box>

          {/* YTD Summary Cards - Flexbox Grid */}
          <AnimatedSection delay={0.1}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                mb: 4,
              }}
            >
              <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)', md: 'calc(33.333% - 16px)' } }}>
                <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`, borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                        <TrendingUpIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">YTD Revenue</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {formatCurrency(ytdSummary.revenue)}
                    </Typography>
                    <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 14 }} /> +12% from last year
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)', md: 'calc(33.333% - 16px)' } }}>
                <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                        <TrendingDownIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">YTD Expenses</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {formatCurrency(ytdSummary.expenses)}
                    </Typography>
                    <Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingDownIcon sx={{ fontSize: 14 }} /> +5% from last year
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(33.333% - 16px)', md: 'calc(33.333% - 16px)' } }}>
                <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                        <MoneyIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">Net Profit</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: ytdSummary.netProfit >= 0 ? '#10B981' : '#EF4444' }}>
                      {formatCurrency(ytdSummary.netProfit)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Year to date performance
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </AnimatedSection>

          {/* Report Selection and Actions */}
          <AnimatedSection delay={0.2}>
            <Paper sx={{ borderRadius: 3, mb: 4, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, flexWrap: 'wrap', gap: 2 }}>
                <Tabs
                  value={selectedReport}
                  onChange={(_, v) => setSelectedReport(v)}
                  sx={{
                    minHeight: 40,
                    '& .MuiTab-root': {
                      minHeight: 40,
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.9rem',
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
                  <Tab label="Balance Sheet" value="BalanceSheet" />
                  <Tab label="Profit & Loss" value="ProfitAndLoss" />
                  <Tab label="Trial Balance" value="trialBalance" />
                </Tabs>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    size="small"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Print
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    size="small"
                    onClick={handleExportClick}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Export
                  </Button>
                  <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleExportClose}>
                    <MenuItem onClick={() => handleExport('PDF')}>Export as PDF</MenuItem>
                    <MenuItem onClick={() => handleExport('Excel')}>Export as Excel</MenuItem>
                    <MenuItem onClick={() => handleExport('CSV')}>Export as CSV</MenuItem>
                  </Menu>
                  <Tooltip title="Email this report">
                    <IconButton size="small">
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Paper>
          </AnimatedSection>

          {/* Report Display */}
          <AnimatedSection delay={0.3}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', mb: 4, overflow: 'hidden' }}>
              <CardContent sx={{ p: 0 }}>
                {isLoading ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <LinearProgress sx={{ maxWidth: 300, mx: 'auto', mb: 2, borderRadius: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Loading report...
                    </Typography>
                  </Box>
                ) : hasError ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto' }}>
                      Error loading report: {reportError}
                    </Alert>
                  </Box>
                ) : reportData ? (
                  <Report reportType={selectedReport} reportData={reportData} />
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Recent Journal Entries */}
          <AnimatedSection delay={0.4}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`, borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                      <JournalIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Journal Entries
                    </Typography>
                  </Box>
                  <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none' }}>
                    View all journals
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                  Latest transactions affecting your accounts
                </Typography>
                
                {journalsLoading ? (
                  <LinearProgress sx={{ borderRadius: 2 }} />
                ) : journalsError ? (
                  <Alert severity="error">Error loading journals: {journalsError}</Alert>
                ) : recentJournals.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {recentJournals.map((journal: Journal) => (
                      <Paper
                        key={journal.JournalID}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            transform: 'translateX(4px)',
                          },
                          cursor: 'pointer',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                              label={`#${journal.JournalNumber}`}
                              size="small"
                              sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 500, fontSize: '0.7rem' }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(journal.JournalDate)}
                            </Typography>
                            {journal.SourceType && (
                              <Chip
                                label={journal.SourceType}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {journal.Reference || 'No reference'}
                          </Typography>
                        </Box>
                        {journal.JournalLines && journal.JournalLines.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {journal.JournalLines.slice(0, 2).map((line, idx) => (
                              <Typography key={idx} variant="caption" color="text.secondary">
                                {line.AccountName}: {formatCurrency(Math.abs(line.NetAmount))}
                              </Typography>
                            ))}
                            {journal.JournalLines.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{journal.JournalLines.length - 2} more
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No journal entries found
                  </Typography>
                )}
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
    </Box>
  );
}