// src/views/help/modules/Decor.jsx
import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

export function Glows() {
  const theme = useTheme();
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          top: -220,
          left: -140,
          borderRadius: '50%',
          filter: 'blur(70px)',
          background: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary[900],
          opacity: theme.palette.mode === 'light' ? 0.25 : 0.3
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 480,
          height: 480,
          bottom: -240,
          right: -160,
          borderRadius: '50%',
          filter: 'blur(70px)',
          background: theme.palette.mode === 'light' ? theme.palette.secondary.light : theme.palette.secondary[900],
          opacity: theme.palette.mode === 'light' ? 0.22 : 0.26
        }}
      />
    </>
  );
}

export function Particles({ count = 16 }) {
  const dots = Array.from({ length: count });
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {dots.map((_, i) => {
        const size = Math.random() * 2 + 2;
        const left = Math.random() * 100;
        const duration = 7 + Math.random() * 6;
        const delay = Math.random() * 4;
        return (
          <Box
            key={i}
            component={motion.span}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 0], y: [8, -8, 8] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
            sx={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${left}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
              boxShadow: '0 0 12px rgba(255,255,255,0.35), 0 0 18px rgba(255,255,255,0.2)'
            }}
          />
        );
      })}
    </Box>
  );
}
