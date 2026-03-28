// frontend/src/pages/Accounting.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  LinearProgress,
  Alert,
  useTheme,
  alpha,
  Divider,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  Payments as PaymentsIcon,
  People as ContactsIcon,
  AccountBalance as BankIcon,
  ReceiptLong as CreditNoteIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon,
  Download as DownloadIcon,
  Dashboard as DashboardIcon,
  ReceiptLong as InvoicesIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { motion, useInView } from 'framer-motion';
import { useAPIData, API_URL, formatXeroDate } from '../utils';
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
  Contact?: { Name: string };
}

interface Payment {
  PaymentID: string;
  Date: string;
  Amount: number;
  PaymentType: string;
  Status: string;
  Invoice?: { InvoiceNumber: string; Contact?: { Name: string } };
}

interface Contact {
  ContactID: string;
  Name: string;
  ContactStatus: string;
  IsSupplier: boolean;
  IsCustomer: boolean;
}

interface BankTransaction {
  BankTransactionID: string;
  Type: string;
  Date: string;
  Status: string;
  Total: number;
  CurrencyCode: string;
  BankAccount?: { Name: string };
  Contact?: { Name: string };
}

interface CreditNote {
  CreditNoteID: string;
  CreditNoteNumber: string;
  Date: string;
  Status: string;
  Total: number;
  CurrencyCode: string;
  Contact?: { Name: string };
}

interface Activity {
  id: string;
  type: 'invoice' | 'payment' | 'contact' | 'bank' | 'creditnote';
  title: string;
  amount?: number;
  name: string;
  timestamp: string;
  status?: string;
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
          Accounting
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

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatCurrency = (amount: number, currency: string = 'ZMW') => {
  return `${currency} ${amount?.toLocaleString() || 0}`;
};

const getActivityIcon = (type: string, theme: any) => {
  const icons: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
    invoice: { 
      icon: <ReceiptIcon sx={{ fontSize: 20 }} />, 
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`
    },
    payment: { 
      icon: <PaymentsIcon sx={{ fontSize: 20 }} />, 
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981, #059669)'
    },
    contact: { 
      icon: <ContactsIcon sx={{ fontSize: 20 }} />, 
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700, #F59E0B)'
    },
    bank: { 
      icon: <BankIcon sx={{ fontSize: 20 }} />, 
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)'
    },
    creditnote: { 
      icon: <CreditNoteIcon sx={{ fontSize: 20 }} />, 
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)'
    },
  };
  return icons[type] || icons.invoice;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function Accounting() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch all data
  const { data: invoices, loading: invoicesLoading, error: invoicesError } = useAPIData(`${API_URL}/xero/invoices`, 'Invoices');
  const { data: payments, loading: paymentsLoading, error: paymentsError } = useAPIData(`${API_URL}/xero/payments`, 'Payments');
  const { data: contacts, loading: contactsLoading, error: contactsError } = useAPIData(`${API_URL}/xero/contacts`, 'Contacts');
  const { data: bankTransactions, loading: bankLoading, error: bankError } = useAPIData(`${API_URL}/xero/banktransactions`, 'BankTransactions');
  const { data: creditNotes, loading: creditLoading, error: creditError } = useAPIData(`${API_URL}/xero/creditnotes`, 'CreditNotes');

  const isLoading = invoicesLoading || paymentsLoading || contactsLoading || bankLoading || creditLoading;
  const hasError = invoicesError || paymentsError || contactsError || bankError || creditError;

  // Calculate totals per contact
  const contactTotals = useMemo(() => {
    if (!invoices || !contacts) return new Map();
    
    const totals = new Map<string, { count: number; total: number }>();
    invoices.forEach((inv: Invoice) => {
      const contactName = inv.Contact?.Name;
      if (contactName) {
        const existing = totals.get(contactName) || { count: 0, total: 0 };
        totals.set(contactName, {
          count: existing.count + 1,
          total: existing.total + (inv.Total || 0),
        });
      }
    });
    return totals;
  }, [invoices, contacts]);

  // Unpaid invoices (who owes us money)
  const unpaidInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices
      .filter((inv: Invoice) => inv.Status !== 'PAID' && inv.Status !== 'VOIDED')
      .sort((a: Invoice, b: Invoice) => new Date(b.DueDate).getTime() - new Date(a.DueDate).getTime())
      .slice(0, 4);
  }, [invoices]);

  // Overdue invoices
  const overdueInvoices = useMemo(() => {
    if (!invoices) return [];
    const today = new Date();
    return invoices
      .filter((inv: Invoice) => {
        if (!inv.DueDate) return false;
        const dueDate = new Date(inv.DueDate);
        return inv.Status !== 'PAID' && dueDate < today;
      })
      .sort((a: Invoice, b: Invoice) => new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime())
      .slice(0, 3);
  }, [invoices]);

  // Recent payments
  const recentPayments = useMemo(() => {
    if (!payments) return [];
    return [...payments]
      .sort((a: Payment, b: Payment) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
      .slice(0, 4);
  }, [payments]);

  // Recent invoices
  const recentInvoices = useMemo(() => {
    if (!invoices) return [];
    return [...invoices]
      .sort((a: Invoice, b: Invoice) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
      .slice(0, 5);
  }, [invoices]);

  // Recent contacts (with invoice counts)
  const recentContacts = useMemo(() => {
    if (!contacts) return [];
    return [...contacts]
      .filter((c: Contact) => c.IsCustomer)
      .sort((a: Contact, b: Contact) => {
        const aCount = contactTotals.get(a.Name)?.count || 0;
        const bCount = contactTotals.get(b.Name)?.count || 0;
        return bCount - aCount;
      })
      .slice(0, 4);
  }, [contacts, contactTotals]);

  // Recent credit notes
  const recentCreditNotes = useMemo(() => {
    if (!creditNotes) return [];
    return [...creditNotes]
      .sort((a: CreditNote, b: CreditNote) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
      .slice(0, 4);
  }, [creditNotes]);

  // Recent bank transactions (cash flow)
  const recentBankTransactions = useMemo(() => {
    if (!bankTransactions) return [];
    return [...bankTransactions]
      .sort((a: BankTransaction, b: BankTransaction) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
      .slice(0, 4);
  }, [bankTransactions]);

  // Combined activity timeline
  const activities = useMemo((): Activity[] => {
    const allActivities: Activity[] = [];

    invoices?.forEach((inv: Invoice) => {
      allActivities.push({
        id: inv.InvoiceID,
        type: 'invoice',
        title: `Invoice ${inv.InvoiceNumber}`,
        amount: inv.Total,
        name: inv.Contact?.Name || 'Unknown',
        timestamp: inv.Date,
        status: inv.Status,
      });
    });

    payments?.forEach((pay: Payment) => {
      allActivities.push({
        id: pay.PaymentID,
        type: 'payment',
        title: `Payment received`,
        amount: pay.Amount,
        name: pay.Invoice?.Contact?.Name || 'Unknown',
        timestamp: pay.Date,
        status: pay.Status,
      });
    });

    contacts?.forEach((contact: Contact) => {
      allActivities.push({
        id: contact.ContactID,
        type: 'contact',
        title: `New contact`,
        name: contact.Name,
        timestamp: new Date().toISOString(),
      });
    });

    bankTransactions?.forEach((txn: BankTransaction) => {
      allActivities.push({
        id: txn.BankTransactionID,
        type: 'bank',
        title: txn.Type === 'RECEIVE' ? 'Deposit' : 'Withdrawal',
        amount: txn.Total,
        name: txn.Contact?.Name || txn.BankAccount?.Name || 'Bank',
        timestamp: txn.Date,
      });
    });

    creditNotes?.forEach((note: CreditNote) => {
      allActivities.push({
        id: note.CreditNoteID,
        type: 'creditnote',
        title: `Credit note ${note.CreditNoteNumber}`,
        amount: note.Total,
        name: note.Contact?.Name || 'Unknown',
        timestamp: note.Date,
        status: note.Status,
      });
    });

    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [invoices, payments, contacts, bankTransactions, creditNotes]);

  // Calculate net cash flow
  const netCashFlow = useMemo(() => {
    const totalIn = recentBankTransactions
      .filter((txn: BankTransaction) => txn.Type === 'RECEIVE')
      .reduce((sum, txn) => sum + (txn.Total || 0), 0);
    const totalOut = recentBankTransactions
      .filter((txn: BankTransaction) => txn.Type !== 'RECEIVE')
      .reduce((sum, txn) => sum + (txn.Total || 0), 0);
    return { in: totalIn, out: totalOut, net: totalIn - totalOut };
  }, [recentBankTransactions]);

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    invoices?.forEach((inv: Invoice) => {
      if (inv.InvoiceNumber?.toLowerCase().includes(query) || 
          inv.Contact?.Name?.toLowerCase().includes(query)) {
        results.push({ type: 'invoice', data: inv });
      }
    });

    contacts?.forEach((contact: Contact) => {
      if (contact.Name?.toLowerCase().includes(query)) {
        results.push({ type: 'contact', data: contact });
      }
    });

    setSearchResults(results.slice(0, 10));
  };

  const maxTotal = Math.max(...Array.from(contactTotals.values()).map(t => t.total), 1);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1 }}>
          <Header />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Box sx={{ textAlign: 'center' }}>
              <LinearProgress sx={{ width: 200, mb: 2, borderRadius: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading accounting data...
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, overflowX: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 5 }}>
          
          {/* Header Section with Description */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Accounting
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '70%' }}>
              Monitor all financial activity, track unpaid invoices, and stay on top of your cash flow.
            </Typography>
          </Box>

          {/* Today's Activity Timeline */}
          <AnimatedSection delay={0.1}>
            <Card sx={{ 
              borderRadius: 4, 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, 
              boxShadow: 'none',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, #FFFFFF 100%)`,
              mb: 4,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: `0 8px 24px ${alpha('#000000', 0.05)}` }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Today's Activity
                  </Typography>
                  <Chip label="Live" size="small" sx={{ bgcolor: '#10B981', color: 'white', fontSize: '0.7rem' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                  What happened in the last 24 hours
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activities.length > 0 ? (
                    activities.map((activity, idx) => {
                      const iconData = getActivityIcon(activity.type, theme);
                      return (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                          <Box sx={{ 
                            background: iconData.gradient, 
                            borderRadius: '50%', 
                            p: 1, 
                            width: 36, 
                            height: 36, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Box sx={{ color: 'white' }}>{iconData.icon}</Box>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2">
                              <strong>{formatTime(activity.timestamp)}</strong> • {activity.title}
                              {activity.amount && ` - ${formatCurrency(activity.amount)}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.name}
                            </Typography>
                          </Box>
                          {activity.status === 'PAID' && <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />}
                          {activity.status === 'AUTHORISED' && <ScheduleIcon sx={{ fontSize: 18, color: '#FFD700' }} />}
                        </Box>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      No recent activity
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Two Column Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, mb: 4 }}>
            {/* Who Owes Us Money */}
            <AnimatedSection delay={0.2}>
              <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 24px ${alpha('#000000', 0.08)}` } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.7)})`, borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                      <PaymentsIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Who Owes Us Money
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                    Unpaid invoices that need attention
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {unpaidInvoices.length > 0 ? (
                      unpaidInvoices.map((inv: Invoice) => {
                        const percentage = (inv.Total / maxTotal) * 100;
                        return (
                          <Box key={inv.InvoiceID}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {inv.Contact?.Name || 'Unknown'}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                                {formatCurrency(inv.Total, inv.CurrencyCode)}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(percentage, 100)} 
                              sx={{ height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                            />
                          </Box>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        No unpaid invoices
                      </Typography>
                    )}
                  </Box>
                  <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 3, textTransform: 'none' }}>
                    View all unpaid
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Recent Payments */}
            <AnimatedSection delay={0.25}>
              <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 24px ${alpha('#000000', 0.08)}` } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                      <PaymentsIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Payments
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                    Latest cash received
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {recentPayments.length > 0 ? (
                      recentPayments.map((pay: Payment) => (
                        <Box key={pay.PaymentID} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">{formatDate(pay.Date)}</Typography>
                            <Typography variant="body2">INV-{pay.Invoice?.InvoiceNumber}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>
                            +{formatCurrency(pay.Amount)}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        No recent payments
                      </Typography>
                    )}
                  </Box>
                  <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 3, textTransform: 'none' }}>
                    View all payments
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          </Box>

          {/* Cash Flow Section */}
          <AnimatedSection delay={0.3}>
            <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', mb: 4, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, #FFFFFF 100%)`, transition: 'all 0.3s ease', '&:hover': { boxShadow: `0 8px 24px ${alpha('#000000', 0.05)}` } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                    <BankIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Cash Flow
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                  Money in vs money out this month
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentBankTransactions.length > 0 ? (
                    recentBankTransactions.map((txn: BankTransaction) => (
                      <Box key={txn.BankTransactionID} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {txn.Type === 'RECEIVE' ? (
                            <TrendingUpIcon sx={{ fontSize: 20, color: '#10B981' }} />
                          ) : (
                            <TrendingDownIcon sx={{ fontSize: 20, color: '#EF4444' }} />
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {txn.Type === 'RECEIVE' ? 'Deposit' : 'Withdrawal'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(txn.Date)} • {txn.Contact?.Name || txn.BankAccount?.Name || 'Bank'}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: txn.Type === 'RECEIVE' ? '#10B981' : '#EF4444' }}>
                          {txn.Type === 'RECEIVE' ? '+' : '-'} {formatCurrency(txn.Total, txn.CurrencyCode)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No recent bank transactions
                    </Typography>
                  )}
                </Box>
                {(netCashFlow.in > 0 || netCashFlow.out > 0) && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha('#000000', 0.08)}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Net Cash Flow</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: netCashFlow.net >= 0 ? '#10B981' : '#EF4444' }}>
                        {netCashFlow.net >= 0 ? '+' : ''}{formatCurrency(netCashFlow.net)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(netCashFlow.in / (netCashFlow.in + netCashFlow.out)) * 100} 
                      sx={{ height: 6, borderRadius: 3, bgcolor: alpha('#EF4444', 0.2) }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">In: {formatCurrency(netCashFlow.in)}</Typography>
                      <Typography variant="caption" color="text.secondary">Out: {formatCurrency(netCashFlow.out)}</Typography>
                    </Box>
                  </Box>
                )}
                <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 3, textTransform: 'none' }}>
                  View all transactions
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Two Column Row - Credit Notes + Search */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, mb: 4 }}>
            {/* Credit Notes */}
            <AnimatedSection delay={0.35}>
              <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 24px ${alpha('#000000', 0.08)}` } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                      <CreditNoteIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Credit Notes
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                    Active refunds and credits
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {recentCreditNotes.length > 0 ? (
                      recentCreditNotes.map((note: CreditNote) => (
                        <Box key={note.CreditNoteID} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {note.CreditNoteNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {note.Contact?.Name} • {formatDate(note.Date)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#F59E0B' }}>
                            -{formatCurrency(note.Total, note.CurrencyCode)}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        No credit notes
                      </Typography>
                    )}
                  </Box>
                  <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 3, textTransform: 'none' }}>
                    View all credit notes
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Quick Search */}
            <AnimatedSection delay={0.4}>
              <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', height: '100%', transition: 'all 0.3s ease', '&:hover': { boxShadow: `0 8px 24px ${alpha('#000000', 0.05)}` } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`, borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                      <SearchIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Quick Search
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                    Find invoices or contacts instantly
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Search by invoice number or contact name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <Button size="small" onClick={handleSearch}>Search</Button>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  {searchResults.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {searchResults.slice(0, 5).map((result, idx) => (
                        <Box key={idx} sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, transition: 'all 0.2s ease', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {result.type === 'invoice' ? `📄 Invoice ${result.data.InvoiceNumber}` : `👤 ${result.data.Name}`}
                          </Typography>
                          {result.type === 'invoice' && result.data.Total && (
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(result.data.Total)} • {result.data.Contact?.Name}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </Box>

          {/* Recent Invoices */}
          <AnimatedSection delay={0.45}>
            <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', mb: 4, transition: 'all 0.3s ease', '&:hover': { boxShadow: `0 8px 24px ${alpha('#000000', 0.05)}` } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`, borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                    <ReceiptIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Invoices
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                  Latest transactions from your Xero account
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map((inv: Invoice) => (
                      <Box key={inv.InvoiceID} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: `1px solid ${alpha('#000000', 0.05)}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <ReceiptIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {inv.InvoiceNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {inv.Contact?.Name} • Due {formatDate(inv.DueDate)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(inv.Total, inv.CurrencyCode)}
                          </Typography>
                          <Chip
                            label={inv.Status}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: inv.Status === 'PAID' ? '#10B981' : inv.Status === 'AUTHORISED' ? '#FFD700' : '#6B7280',
                              color: inv.Status === 'AUTHORISED' ? '#0033A0' : 'white',
                            }}
                          />
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      No recent invoices
                    </Typography>
                  )}
                </Box>
                <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 3, textTransform: 'none' }}>
                  View all invoices
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Recent Contacts (Card Grid) */}
          <AnimatedSection delay={0.5}>
            <Card sx={{ borderRadius: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`, boxShadow: 'none', mb: 4, transition: 'all 0.3s ease', '&:hover': { boxShadow: `0 8px 24px ${alpha('#000000', 0.05)}` } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ background: 'linear-gradient(135deg, #FFD700, #F59E0B)', borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                    <ContactsIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Contacts
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                  Active clients and their invoice activity
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2.5 }}>
                  {recentContacts.length > 0 ? (
                    recentContacts.map((contact: Contact) => {
                      const totals = contactTotals.get(contact.Name) || { count: 0, total: 0 };
                      const percentage = (totals.total / maxTotal) * 100;
                      return (
                        <Paper
                          key={contact.ContactID}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-4px)', 
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              boxShadow: `0 8px 20px ${alpha('#000000', 0.08)}`
                            },
                          }}
                        >
                          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48, mb: 1.5 }}>
                            {contact.Name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {contact.Name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {totals.count} invoices • {formatCurrency(totals.total)}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(percentage, 100)} 
                            sx={{ height: 3, borderRadius: 2, mt: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                          />
                        </Paper>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', gridColumn: '1/-1' }}>
                      No contacts
                    </Typography>
                  )}
                </Box>
                <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 3, textTransform: 'none' }}>
                  View all contacts
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Overdue Invoices Alert */}
          {overdueInvoices.length > 0 && (
            <AnimatedSection delay={0.55}>
              <Alert
                severity="warning"
                icon={<WarningIcon />}
                sx={{ 
                  borderRadius: 3, 
                  mb: 4,
                  border: '1px solid #FEF3C7',
                  bgcolor: '#FFFBEB',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${alpha('#F59E0B', 0.15)}` }
                }}
                action={
                  <Button color="inherit" size="small" sx={{ textTransform: 'none' }}>
                    View all
                  </Button>
                }
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  ⚠️ {overdueInvoices.length} invoice{overdueInvoices.length > 1 ? 's' : ''} overdue - total {formatCurrency(overdueInvoices.reduce((sum, inv) => sum + inv.Total, 0))}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                  {overdueInvoices.map((inv: Invoice) => {
                    const daysOverdue = Math.floor((new Date().getTime() - new Date(inv.DueDate).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <Chip
                        key={inv.InvoiceID}
                        label={`${inv.InvoiceNumber} - ${inv.Contact?.Name} - ${formatCurrency(inv.Total)} (${daysOverdue}d overdue)`}
                        size="small"
                        sx={{ bgcolor: '#FEF3C7', color: '#92400E' }}
                      />
                    );
                  })}
                </Box>
              </Alert>
            </AnimatedSection>
          )}

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