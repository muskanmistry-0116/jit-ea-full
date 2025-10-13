// src/views/help/modules/StatusPill.jsx
import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { motion } from 'framer-motion';

export default function StatusPill() {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        component={motion.div}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        icon={<CircleIcon sx={{ color: 'success.main' }} />}
        label="All systems normal"
        variant="outlined"
        color="success"
        sx={{ px: 0.5 }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        SLA: 99.95% / 30d
      </Typography>
    </Stack>
  );
}
