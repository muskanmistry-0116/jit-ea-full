import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Grid, Box, Typography, Stack, Avatar } from '@mui/material';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MainCard from 'ui-component/cards/MainCard';

const FEATURES = [
  {
    icon: <InsightsOutlinedIcon />,
    title: 'Realtime Telemetry',
    desc: 'RS485 → MQTT → AWS/QuestDB. Clean widgets for LL/LN V, I, PF, kW/kVA/kVAR, THD.'
  },
  {
    icon: <NotificationsActiveOutlinedIcon />,
    title: 'Smart Alerts',
    desc: 'PF drop, phase loss, overload, voltage imbalance. No noise—actionable only.'
  },
  {
    icon: <SavingsOutlinedIcon />,
    title: 'Cost Optimizer',
    desc: 'ToD/PPA aware insights with demand-charge guardrails and what-if savings.'
  },
  {
    icon: <DescriptionOutlinedIcon />,
    title: 'Compliance & Reports',
    desc: 'Auto PDFs for audits; BIS/IEC aligned thresholds and reset logic.'
  }
];

export default function FeatureGrid() {
  const theme = useTheme();
  return (
    <MainCard>
      <Grid container spacing={2}>
        {FEATURES.map((f) => (
          <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                height: '100%',
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'
              }}
            >
              <Stack spacing={1.25}>
                <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', width: 40, height: 40 }}>{f.icon}</Avatar>
                <Typography variant="h6">{f.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {f.desc}
                </Typography>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </MainCard>
  );
}
