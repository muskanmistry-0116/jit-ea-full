// src/views/help/modules/HeaderHero.jsx
import React, { useMemo } from 'react';
import { Box, Stack, Typography, Chip, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import StatusPill from './StatusPill';
import { Glows, Particles } from './Decor';

export default function HeaderHero({ onContactClick, onDocsClick }) {
  const theme = useTheme();
  const grad = useMemo(
    () => ({
      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }),
    [theme]
  );

  return (
    <Box sx={{ position: 'relative', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2.5, md: 4 }, position: 'relative' }}>
        <Glows />
        <Particles count={18} />
        <Stack
          component={motion.div}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          spacing={2}
          alignItems="center"
          textAlign="center"
        >
          <Typography variant="h3" sx={{ fontWeight: 900, ...grad }}>
            Help & Support
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 760 }}>
            Stuck? We’ve got you. Browse docs, chat with an expert, or raise a ticket — average first response{' '}
            <Chip size="small" color="success" label="&lt; 12 mins" />.
          </Typography>

          <StatusPill />

          <Stack direction="row" spacing={1} justifyContent="center" sx={{ pt: 0.5, flexWrap: 'wrap' }}>
            <Button
              size="large"
              variant="contained"
              color="secondary"
              startIcon={<SupportAgentRoundedIcon />}
              sx={{ borderRadius: 2 }}
              onClick={onContactClick}
            >
              Contact Support
            </Button>
            <Button size="large" variant="outlined" startIcon={<ArticleRoundedIcon />} sx={{ borderRadius: 2 }} onClick={onDocsClick}>
              Ask about Docs
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
