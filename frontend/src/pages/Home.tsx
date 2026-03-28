// frontend/src/pages/Home.tsx
import React, { useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  Avatar,
  Paper,
  Divider,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Login as LoginIcon,
  ArrowForward as ArrowForwardIcon,
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckIcon,
  Link as LinkIcon,
  Description as InvoiceIcon,
  CloudUpload as UploadIcon,
  Bolt as BoltIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

const GlowCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 24,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.getContrastText(theme.palette.secondary.main),
  padding: '12px 32px',
  borderRadius: 40,
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 10px 20px ${alpha(theme.palette.secondary.main, 0.3)}`,
  },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  border: `2px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
  padding: '12px 32px',
  borderRadius: 40,
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.05),
    borderWidth: 2,
  },
}));

const SectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 0),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(8, 0),
  },
}));

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: '#FFD700',
        transformOrigin: '0%',
        zIndex: 1100,
      }}
    />
  );
};

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleConnect = () => {
    window.location.href = `${API_URL}/login`;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'white',
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                textDecoration: 'none',
                letterSpacing: '-0.5px',
              }}
            >
              Kabert
            </Typography>
            <Chip
              label="Smart Invoice Ready"
              size="small"
              sx={{
                background: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 4 }}>
              {['Products', 'Solutions', 'Resources'].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    cursor: 'pointer',
                    '&:hover': { color: theme.palette.primary.main },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<LoginIcon />}
              sx={{
                borderRadius: 40,
                textTransform: 'none',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
              }}
              onClick={handleConnect}
            >
              Login
            </Button>
            <GradientButton variant="contained" onClick={handleConnect}>
              Get Started
            </GradientButton>
            {isMobile && (
              <IconButton>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

const HeroSection = () => {
  const theme = useTheme();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  const handleConnect = () => {
    window.location.href = `${API_URL}/login`;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(
          theme.palette.secondary.main,
          0.03
        )} 100%)`,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 24px)' } }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Chip
                label="Xero + ZRA Smart Invoice"
                sx={{
                  background: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  fontWeight: 600,
                  mb: 3,
                  px: 2,
                  py: 1,
                  fontSize: '0.8rem',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                Automate Your Tax Compliance
                <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                  {' '}
                  Across Any Platform
                </Box>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.125rem',
                  color: theme.palette.text.secondary,
                  mb: 4,
                  maxWidth: '90%',
                  lineHeight: 1.6,
                }}
              >
                Connect your accounting software directly to ZRA Smart Invoice. Submit
                invoices, track compliance in real-time, and save hours of manual work.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <GradientButton
                  variant="contained"
                  size="large"
                  onClick={handleConnect}
                  endIcon={<ArrowForwardIcon />}
                >
                  Connect Xero Now
                </GradientButton>
                <OutlineButton variant="outlined" size="large" startIcon={<PlayIcon />}>
                  Watch Demo
                </OutlineButton>
              </Stack>
              <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                  <Typography variant="caption" color="text.secondary">
                    ZRA Certified
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                  <Typography variant="caption" color="text.secondary">
                    Xero Partner
                  </Typography>
                </Box>
              </Stack>
            </motion.div>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 24px)' } }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ y }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Box
                  component="img"
                  src="/images/image_2.png"
                  alt="Kabert Dashboard Preview"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/0033A0/FFFFFF?text=Dashboard+Preview';
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: alpha(theme.palette.success.main, 0.9),
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                    Live Demo
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const IntegrationsSection = () => {
  const theme = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  const platforms = [
    { name: 'Xero', logo: '/images/xero-logo.svg', status: 'Live', badge: '✓ Native OAuth', highlighted: true },
    { name: 'QuickBooks', logo: '/images/quickbooks-logo.svg', status: 'Coming Soon', badge: 'Early Access' },
    { name: 'Sage', logo: '/images/sage-logo.svg', status: 'Coming Soon', badge: 'Early Access' },
    { name: 'ZRA Smart Invoice', logo: '/images/zra-logo.svg', status: 'Certified', badge: '✓ Certified', official: true },
  ];

  return (
    <SectionContainer ref={ref}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="overline"
            sx={{ color: theme.palette.secondary.main, fontWeight: 600, letterSpacing: 1 }}
          >
            INTEGRATIONS
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 2 }}>
            One Integration, All Your Tools
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: '70%' }}>
            Already using Xero? QuickBooks? Sage? We connect with the platforms you already trust.
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
          }}
        >
          {platforms.map((platform, index) => (
            <Box
              key={platform.name}
              sx={{
                width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GlowCard
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    border: platform.highlighted ? `2px solid ${theme.palette.secondary.main}` : 'none',
                    position: 'relative',
                  }}
                >
                  {platform.highlighted && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: theme.palette.secondary.main,
                        px: 2,
                        py: 0.5,
                        borderRadius: 20,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        Live
                      </Typography>
                    </Box>
                  )}
                  <Avatar
                    src={platform.logo}
                    alt={platform.name}
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      background: alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    {platform.name[0]}
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {platform.name}
                  </Typography>
                  <Chip
                    label={platform.badge}
                    size="small"
                    sx={{
                      background: platform.official
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.secondary.main, 0.1),
                      color: platform.official ? theme.palette.success.main : theme.palette.secondary.main,
                    }}
                  />
                </GlowCard>
              </motion.div>
            </Box>
          ))}
        </Box>
      </Container>
    </SectionContainer>
  );
};

const HowItWorksSection = () => {
  const theme = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  const steps = [
    { icon: <LinkIcon sx={{ fontSize: 48 }} />, title: 'Connect', description: 'Connect your accounting platform with one click. OAuth-secured, no passwords shared.' },
    { icon: <InvoiceIcon sx={{ fontSize: 48 }} />, title: 'Select', description: 'Choose which invoices to submit. Filter by date, amount, or customer.' },
    { icon: <UploadIcon sx={{ fontSize: 48 }} />, title: 'Submit', description: 'Send to ZRA Smart Invoice automatically. Track submission status in real-time.' },
  ];

  return (
    <SectionContainer ref={ref} sx={{ background: alpha(theme.palette.primary.main, 0.02) }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <Typography variant="overline" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
            SIMPLE PROCESS
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 2 }}>
            Three Simple Steps to Tax Compliance
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: '70%', mx: 'auto' }}>
            No spreadsheets. No manual entry. No compliance headaches.
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={step.title}
              sx={{
                width: { xs: '100%', md: 'calc(33.333% - 27px)' },
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.2 }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(
                        theme.palette.secondary.main,
                        0.05
                      )} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: theme.palette.secondary.main,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Box
            component="img"
            src="/images/image_4.png"
            alt="How it works icons"
            sx={{ maxWidth: '100%', height: 'auto' }}
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/800x200/FFD700/0033A0?text=Connect+Select+Submit';
            }}
          />
        </Box>
      </Container>
    </SectionContainer>
  );
};

const BenefitsSection = () => {
  const theme = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  const benefits = [
    { icon: <BoltIcon />, title: 'Real-time Sync', description: 'Invoices sent instantly. No delays, no batch processing.' },
    { icon: <SecurityIcon />, title: 'Secure OAuth', description: 'Xero-approved security. Your credentials never leave your device.' },
    { icon: <DashboardIcon />, title: 'Compliance Dashboard', description: 'See all submitted invoices, approval status, and errors at a glance.' },
    { icon: <AutoAwesomeIcon />, title: 'Smart Mapping', description: 'Automatically maps Xero fields to ZRA format.' },
    { icon: <TrendingUpIcon />, title: 'Bulk Submission', description: 'Submit hundreds of invoices at once.' },
    { icon: <BusinessIcon />, title: 'Multi-Company', description: 'Manage multiple Xero organizations from one dashboard.' },
  ];

  return (
    <SectionContainer ref={ref}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <Typography variant="overline" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
            WHY CHOOSE US
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 2 }}>
            Why Zambia Businesses Choose Kabert
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: '70%', mx: 'auto' }}>
            Built for Zambian businesses, trusted by accountants across the country.
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
          }}
        >
          {benefits.map((benefit, index) => (
            <Box
              key={benefit.title}
              sx={{
                width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                  }}
                >
                  <Box sx={{ color: theme.palette.secondary.main, mb: 2 }}>{benefit.icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Box>
          ))}
        </Box>
      </Container>
    </SectionContainer>
  );
};

const SocialProofSection = () => {
  const theme = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <SectionContainer ref={ref} sx={{ background: alpha(theme.palette.primary.main, 0.02) }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 24px)' } }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="overline" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                TESTIMONIALS
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 3 }}>
                Trusted by Accountants and Finance Teams Across Zambia
              </Typography>
              <Box
                sx={{
                  background: theme.palette.background.paper,
                  borderRadius: 4,
                  p: 4,
                  boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <StarIcon sx={{ color: theme.palette.secondary.main, mb: 2, fontSize: 32 }} />
                <Typography variant="body1" sx={{ fontSize: '1.125rem', fontStyle: 'italic', mb: 3 }}>
                  "Saved us 15 hours a month on tax reporting. Finally, Xero talks to ZRA. Game changer for our
                  finance team."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 48, height: 48 }}>M</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Mulenga Chanda
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Finance Manager, Lusaka
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Box>
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 24px)' } }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Box
                  component="img"
                  src="/images/image_5.png"
                  alt="Zambian Finance Manager with tablet"
                  sx={{ width: '100%', height: 'auto', display: 'block' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/500x400/0033A0/FFFFFF?text=Happy+Customer';
                  }}
                />
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </SectionContainer>
  );
};

const FAQSection = () => {
  const theme = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [expanded, setExpanded] = React.useState<number | false>(false);

  const faqs = [
    { question: 'Do I need ZRA approval to use this?', answer: 'We handle the technical integration. You\'ll need your ZRA TPIN and approved VSDC access to connect to production. Our system works with both sandbox and production environments.' },
    { question: 'Is my data secure?', answer: 'Yes. We use Xero OAuth which means we never see your password. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are GDPR compliant and follow industry best practices.' },
    { question: 'What accounting platforms do you support?', answer: 'Xero is fully supported now. QuickBooks and Sage integrations are coming in Q2 2025. We also have plans for Zoho Books and Odoo.' },
    { question: 'Do I need to install anything?', answer: 'No. It\'s a cloud-based integration. Connect once, use anywhere. No software to install or maintain.' },
    { question: 'What if an invoice fails to submit?', answer: 'You\'ll see the exact error message and can retry with one click. We\'ll show you exactly what needs fixing in the invoice data.' },
  ];

  return (
    <SectionContainer ref={ref}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <Typography variant="overline" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
            FAQ
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 2 }}>
            Got Questions? We've Got Answers.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
            Everything you need to know about Kabert and the integration.
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { background: alpha(theme.palette.primary.main, 0.02) },
                  }}
                  onClick={() => setExpanded(expanded === index ? false : index)}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {faq.question}
                  </Typography>
                  <ChevronRightIcon
                    sx={{
                      transform: expanded === index ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </Box>
                {expanded === index && (
                  <Box sx={{ p: 3, pt: 0, borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </motion.div>
          ))}
        </Box>
      </Container>
    </SectionContainer>
  );
};

const FinalCTASection = () => {
  const theme = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  const handleConnect = () => {
    window.location.href = `${API_URL}/login`;
  };

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/image_9.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: alpha(theme.palette.primary.main, 0.7),
          },
        }}
        onError={(e: any) => {
          e.target.style.background = `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`;
        }}
      />
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              color: 'white',
              mb: 2,
            }}
          >
            Ready to Simplify Your Tax Compliance?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.125rem',
              color: alpha('#FFFFFF', 0.9),
              mb: 5,
              maxWidth: '80%',
              mx: 'auto',
            }}
          >
            Join hundreds of businesses already using Kabert to bridge Xero and ZRA effortlessly.
          </Typography>
          <GradientButton
            variant="contained"
            size="large"
            onClick={handleConnect}
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.125rem',
            }}
          >
            Get Started for Free
          </GradientButton>
          <Typography variant="caption" sx={{ display: 'block', mt: 3, color: alpha('#FFFFFF', 0.7) }}>
            No credit card required. 14-day free trial.
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

const FooterSection = () => {
  const theme = useTheme();

  return (
    <Box sx={{ background: theme.palette.primary.main, color: 'white', py: 6 }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
          }}
        >
          <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 27px)' } }}>
            <Typography variant="h6" sx={{ color: theme.palette.secondary.main, mb: 2 }}>
              Kabert
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              Bridging Xero and ZRA Smart Invoice for seamless tax compliance.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              © 2025 Kabert Record Hub Limited
            </Typography>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 16px)', md: 'calc(16.666% - 16px)' } }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, mb: 2 }}>
              Product
            </Typography>
            <Stack spacing={1}>
              {['Features', 'Integrations', 'Changelog'].map((item) => (
                <Typography key={item} variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 16px)', md: 'calc(16.666% - 16px)' } }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, mb: 2 }}>
              Resources
            </Typography>
            <Stack spacing={1}>
              {['Help Center', 'API Docs', 'Status', 'Contact'].map((item) => (
                <Typography key={item} variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 16px)', md: 'calc(16.666% - 16px)' } }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, mb: 2 }}>
              Company
            </Typography>
            <Stack spacing={1}>
              {['About', 'Blog', 'Careers', 'Press'].map((item) => (
                <Typography key={item} variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
          <Box sx={{ width: { xs: 'calc(50% - 16px)', md: 'calc(16.666% - 16px)' } }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, mb: 2 }}>
              Legal
            </Typography>
            <Stack spacing={1}>
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <Typography key={item} variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Box>
        <Divider sx={{ my: 4, background: alpha('#FFFFFF', 0.2) }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            Zambia Revenue Authority Smart Invoice Certified Partner
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.6, cursor: 'pointer' }}>
              🇿🇲 Zambia
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <ScrollProgress />
      <Header />
      <main>
        <HeroSection />
        <IntegrationsSection />
        <HowItWorksSection />
        <BenefitsSection />
        <SocialProofSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <FooterSection />
    </Box>
  );
}