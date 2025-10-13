import React, { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * LiveMachinesStrip
 * Auto-scrolling row of lively machine tiles.
 *
 * Props:
 * - items: [{ id, name, pf, kw, status: 'good'|'warn'|'critical', spark:[...] }]
 * - speedSec: number (duration for half-strip to scroll)
 * - onOpen: (item) => void
 */

export default function LiveMachinesStrip({ items = [], speedSec = 20, onOpen }) {
  const [paused, setPaused] = useState(false);
  const data = useMemo(() => (items.length ? items : demoItems), [items]);

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{
        mt: 2,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)'
      }}
    >
      <Box
        component={motion.div}
        animate={{ x: paused ? 0 : ['0%', '-50%'] }}
        transition={{ duration: speedSec, repeat: Infinity, ease: 'linear' }}
        sx={{ display: 'flex', gap: 12, px: 2, py: 1 }}
      >
        {[...data, ...data].map((m, i) => (
          <Tile key={`${m.id}-${i}`} item={m} onOpen={onOpen} />
        ))}
      </Box>
    </Box>
  );
}

/* ---------------- Tile ---------------- */

function Tile({ item, onOpen }) {
  const theme = useTheme();
  const color = statusColor(item.status, theme);

  return (
    <Box
      component={motion.button}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen?.(item)}
      sx={{
        all: 'unset',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 12,
        p: '10px 14px',
        borderRadius: 12,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
        minWidth: 260,
        position: 'relative',
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: -2,
          borderRadius: 14,
          background: `radial-gradient(220px 80px at 50% 120%, ${color.shadow}, transparent 60%)`,
          opacity: 0,
          transition: 'opacity .2s',
          zIndex: -1
        },
        '&:hover:before': { opacity: 1 }
      }}
    >
      {/* status dot */}
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: color.base,
          boxShadow: `0 0 14px ${color.glow}`
        }}
      />

      {/* name + sparkline */}
      <Box sx={{ minWidth: 120 }}>
        <Typography variant="subtitle2" sx={{ lineHeight: 1.1 }}>
          {item.name}
        </Typography>
        <Sparkline points={item.spark} />
      </Box>

      {/* PF gauge ring as Chip */}
      <Tooltip title={`PF: ${item.pf.toFixed(3)} • ${item.kw.toFixed(1)} kW`}>
        <Chip
          size="small"
          label={item.pf.toFixed(3)}
          sx={{
            fontWeight: 700,
            color: color.text,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: color.ring,
            '& .MuiChip-label': { px: 1.25 },
            position: 'relative',
            isolation: 'isolate',
            '&:after': {
              content: '""',
              position: 'absolute',
              inset: -2,
              borderRadius: 999,
              background: `conic-gradient(${color.base} ${pfDeg(item.pf)}deg, transparent ${pfDeg(item.pf)}deg)`,
              zIndex: -1,
              filter: 'blur(0.6px)',
              mask: 'radial-gradient(14px at 50% 50%, transparent 69%, #000 70%)'
            }
          }}
        />
      </Tooltip>
    </Box>
  );
}

/* ---------------- helpers ---------------- */

function Sparkline({ points = [] }) {
  const theme = useTheme();
  const w = 120;
  const h = 28;
  const path = React.useMemo(() => {
    if (!points.length) return '';
    const max = Math.max(...points);
    const min = Math.min(...points);
    const sx = (i) => (i / (points.length - 1)) * w;
    const sy = (v) => h - ((v - min) / Math.max(1e-9, max - min)) * h;
    return points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${sx(i)} ${sy(v)}`).join(' ');
  }, [points]);

  return (
    <Box component="svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} sx={{ display: 'block', opacity: 0.9 }}>
      <motion.path
        d={path}
        fill="none"
        stroke={theme.palette.mode === 'light' ? '#7aa8ff' : '#9db8ff'}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1 }}
      />
    </Box>
  );
}

function pfDeg(pf) {
  const v = Math.max(0, Math.min(1, pf));
  return 360 * v;
}

function statusColor(status, theme) {
  switch ((status || '').toLowerCase()) {
    case 'good':
      return {
        base: theme.palette.success.main,
        glow: 'rgba(46, 204, 113, .55)',
        ring: theme.palette.success.light,
        text: theme.palette.success.dark,
        shadow: 'rgba(46, 204, 113, .22)'
      };
    case 'warn':
      return {
        base: theme.palette.warning.main,
        glow: 'rgba(241, 196, 15, .55)',
        ring: theme.palette.warning.light,
        text: theme.palette.warning.dark,
        shadow: 'rgba(241, 196, 15, .22)'
      };
    case 'critical':
    default:
      return {
        base: theme.palette.error.main,
        glow: 'rgba(231, 76, 60, .55)',
        ring: theme.palette.error.light,
        text: theme.palette.error.dark,
        shadow: 'rgba(231, 76, 60, .22)'
      };
  }
}

/* ---- demo (remove once you pass real items) ---- */
const demoItems = [
  { id: 'MCC-01', name: 'Zen Motors', pf: 0.967, kw: 38.2, status: 'good', spark: [4, 6, 8, 7, 9, 12, 10, 13, 11, 15, 16, 17] },
  { id: 'MCC-02', name: 'Polar Foods', pf: 0.942, kw: 22.7, status: 'warn', spark: [10, 9, 11, 12, 10, 9, 13, 12, 14, 13, 12, 14] },
  { id: 'MCC-03', name: 'Optima Glass', pf: 0.889, kw: 44.0, status: 'critical', spark: [7, 6, 8, 9, 12, 14, 13, 10, 8, 7, 6, 5] },
  { id: 'MCC-04', name: 'Acme Steel', pf: 0.971, kw: 51.3, status: 'good', spark: [6, 8, 6, 7, 9, 10, 13, 16, 15, 18, 17, 20] },
  { id: 'MCC-05', name: 'Nova Textiles', pf: 0.958, kw: 28.9, status: 'good', spark: [5, 7, 9, 11, 12, 12, 13, 15, 15, 16, 17, 18] },
  { id: 'MCC-06', name: 'Hydra Pumps', pf: 0.903, kw: 19.5, status: 'warn', spark: [8, 8, 9, 10, 9, 8, 11, 12, 11, 10, 12, 13] }
];
