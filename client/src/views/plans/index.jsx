// src/views/plans/index.jsx
import React, { useMemo, useState } from 'react';
import { Box, Stack, Typography, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import BillingToggle from './modules/BillingToggle';
import FitRow from './modules/FitRow';
import PlanCard from './modules/PlanCard';
import FeatureComparison from './modules/FeatureComparison';
import { Glows, Particles } from './modules/Decor';

// ----- static plan data -----
const PLANS = [
  {
    id: 'starter',
    title: 'Starter',
    color: 'primary',
    badge: null,
    monthly: 49,
    yearly: 39,
    cta: 'Start Trial',
    includes: {
      live: true,
      alerts: true,
      optimizer: false,
      reports: 'Basic',
      retention: '3 months',
      support: 'Community'
    }
  },
  {
    id: 'pro',
    title: 'Pro',
    color: 'secondary',
    badge: 'Most Popular',
    monthly: 149,
    yearly: 119,
    cta: 'Choose Pro',
    includes: {
      live: true,
      alerts: true,
      optimizer: true,
      reports: 'Advanced',
      retention: '13 months',
      support: 'Business hours'
    }
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    color: 'success',
    badge: 'Custom',
    monthly: 0,
    yearly: 0,
    cta: 'Contact Sales',
    includes: {
      live: true,
      alerts: true,
      optimizer: true,
      reports: 'Custom & APIs',
      retention: '5 years',
      support: '24×7 + SLO'
    }
  }
];

export default function PlansPage() {
  const theme = useTheme();
  const [billing, setBilling] = useState('monthly');

  const headerGrad = useMemo(
    () => ({
      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }),
    [theme]
  );

  const price = (p) => (billing === 'monthly' ? p.monthly : p.yearly);

  return (
    <MainCard content={false} sx={{ overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ position: 'relative', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2.5, md: 4 }, textAlign: 'center', position: 'relative' }}>
          <Glows />
          <Particles count={18} />
          <Stack spacing={1}>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.01em', ...headerGrad }}>
              Plans & Subscription
            </Typography>
            <BillingToggle value={billing} onChange={setBilling} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Switch anytime. Yearly saves ~20%.
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Pricing row — always 3 across; auto-scales if needed */}
      <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2.5, md: 4 }, pt: { xs: 2, md: 3 } }}>
        <FitRow gap={24}>
          {PLANS.map((p, i) => (
            <PlanCard key={p.id} plan={p} billing={billing} price={price(p)} highlight={p.id === 'pro'} index={i} />
          ))}
        </FitRow>
      </Box>

      <Divider />

      {/* Comparison */}
      <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Compare features
        </Typography>
        <FeatureComparison plans={PLANS} billing={billing} />
      </Box>
    </MainCard>
  );
}
