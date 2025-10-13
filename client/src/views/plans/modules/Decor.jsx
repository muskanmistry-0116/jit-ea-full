import React, { useEffect } from 'react';
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

export function Confetti({ onDone, color }) {
  const pieces = Array.from({ length: 18 });
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((_, i) => {
        const x = (i / pieces.length) * 100;
        const d = 0.5 + Math.random() * 0.6;
        const rot = Math.random() * 180 - 90;
        return (
          <Box
            key={i}
            component={motion.span}
            initial={{ x: '50%', y: '60%', opacity: 0 }}
            animate={{ x: `${x}%`, y: ['60%', '10%', '120%'], opacity: [0, 1, 0], rotate: rot }}
            transition={{ duration: 0.9 * d, ease: 'easeOut' }} // <- fixed (was 'ease-out')
            sx={{
              position: 'absolute',
              width: 6,
              height: 10,
              borderRadius: 0.5,
              background: i % 3 === 0 ? color : i % 3 === 1 ? 'rgba(99, 102, 241, 0.9)' : 'rgba(16, 185, 129, 0.9)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
            }}
          />
        );
      })}
    </Box>
  );
}
