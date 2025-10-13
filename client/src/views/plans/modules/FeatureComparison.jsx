// src/views/plans/modules/FeatureComparison.jsx
import React from 'react';
import { Box, Grid, Stack, Typography, Chip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const FEATURES = [
  { key: 'live', label: 'Live telemetry & widgets' },
  { key: 'alerts', label: 'Smart alerts (PF, imbalance, THD)' },
  { key: 'optimizer', label: 'Cost optimizer (ToD/PPA guardrails)' },
  { key: 'reports', label: 'Audit-ready reports (BIS/IEC thresholds)' },
  { key: 'retention', label: 'Data retention' },
  { key: 'support', label: 'Support SLA' }
];

export default function FeatureComparison({ plans, billing }) {
  const headerCell = { py: 1, px: 1.5, fontWeight: 800, borderBottom: '1px solid', borderColor: 'divider' };
  const bodyCell = { py: 1, px: 1.5, borderBottom: '1px dashed', borderColor: 'divider' };

  const money = (p) => (p.monthly === 0 ? 'Custom' : `₹${(billing === 'monthly' ? p.monthly : p.yearly).toLocaleString('en-IN')}/mo`);

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Grid container>
        <Grid size={{ xs: 12, md: 4 }} sx={headerCell}>
          <Typography variant="subtitle2">Feature</Typography>
        </Grid>
        {plans.map((p) => (
          <Grid key={p.id} size={{ xs: 4, md: 8 / 3 }} sx={headerCell}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">{p.title}</Typography>
              <Chip size="small" variant="outlined" label={money(p)} />
            </Stack>
          </Grid>
        ))}
      </Grid>

      {FEATURES.map((f, r) => (
        <Grid container key={f.key} sx={{ bgcolor: r % 2 ? 'background.paper' : 'transparent' }}>
          <Grid size={{ xs: 12, md: 4 }} sx={bodyCell}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {f.label}
            </Typography>
          </Grid>
          {plans.map((p) => (
            <Grid key={p.id} size={{ xs: 4, md: 8 / 3 }} sx={bodyCell}>
              <Cell plan={p} f={f.key} />
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  );
}

function Cell({ plan, f }) {
  const v = plan.includes[f];
  if (v === true) return <CheckRoundedIcon color="success" fontSize="small" />;
  if (v === false) return <CloseRoundedIcon color="disabled" fontSize="small" />;
  return <Typography variant="body2">{String(v)}</Typography>;
}
