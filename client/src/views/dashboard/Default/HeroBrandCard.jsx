import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Stack, Typography, Button, Chip, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import LiveMachinesStrip from './LiveMachinesStrip';

const LINES = ['Realtime energy intelligence.', 'Cut cost. Kill downtime.', 'Audit-ready from day one.'];

export default function HeroBrandCard() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  // rotating subline
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % LINES.length), 2400);
    return () => clearInterval(id);
  }, []);

  // cursor light + tilt (now applied to INNER layer)
  const wrapRef = useRef(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 90, damping: 14 });
  const springY = useSpring(tiltY, { stiffness: 90, damping: 14 });

  const onMouseMove = (e) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    tiltX.set((py - 0.5) * -8);
    tiltY.set((px - 0.5) * 10);
    wrapRef.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    wrapRef.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  const onMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  // KPI counters on view
  const kpiRef = useRef(null);
  const inView = useInView(kpiRef, { once: true, margin: '-80px' });
  const ctr = useMotionValue(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now(),
      dur = 1100;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      ctr.set(eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, ctr]);
  const liveDevices = useTransform(ctr, (v) => Math.round(134 * v));
  const avgPF = useTransform(ctr, (v) => (0.91 + 0.054 * v).toFixed(3));
  const savedMWh = useTransform(ctr, (v) => (27.3 * v).toFixed(1));

  const gradientText = useMemo(
    () => ({
      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: theme.palette.text.primary, // fallback if bg-clip unsupported
      backgroundSize: '220% 100%',
      animation: 'sheen 7s ease-in-out infinite'
    }),
    [theme]
  );

  return (
    <Box
      ref={wrapRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        minHeight: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 130px)' },
        px: { xs: 2.5, md: 5 },
        py: { xs: 3, md: 4 },
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `radial-gradient(220px 120px at var(--mx,50%) var(--my,40%), rgba(255,255,255,${theme.palette.mode === 'light' ? 0.4 : 0.08}), transparent 60%)`,
        '&:before, &:after': {
          content: '""',
          position: 'absolute',
          borderRadius: '50%',
          filter: 'blur(70px)',
          zIndex: 0
        },
        '&:before': {
          width: 520,
          height: 520,
          left: -200,
          top: -260,
          background: theme.palette.mode === 'light' ? theme.palette.secondary.light : theme.palette.secondary[900],
          opacity: theme.palette.mode === 'light' ? 0.22 : 0.28,
          animation: 'floatA 10s ease-in-out infinite'
        },
        '&:after': {
          width: 520,
          height: 520,
          right: -180,
          bottom: -280,
          background: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary[900],
          opacity: theme.palette.mode === 'light' ? 0.22 : 0.28,
          animation: 'floatB 11s ease-in-out infinite'
        },
        '@keyframes sheen': { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        '@keyframes floatA': { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        '@keyframes floatB': { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(10px)' } }
      }}
    >
      {/* INNER content tilts — headline will never vanish */}
      <Box component={motion.div} style={{ rotateX: springX, rotateY: springY }} sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
        <Particles count={22} />
        <ParallaxBlob size={isMdUp ? 90 : 70} blur={24} color={theme.palette.secondary.main} sx={{ top: 36, right: 44 }} />
        <ParallaxBlob size={isMdUp ? 110 : 80} blur={28} color={theme.palette.primary.main} sx={{ bottom: 36, left: 52 }} delay={0.6} />

        <Stack spacing={2.4} alignItems="center" sx={{ textAlign: 'center', width: '100%' }}>
          {/* Brand */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
              show: { transition: { staggerChildren: 0.06 } }
            }}
          >
            <Typography
              component="span"
              variant="h1"
              sx={{
                ...gradientText,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: 0.88,
                fontSize: { xs: 'clamp(42px, 10vw, 92px)', md: 'clamp(72px, 8.5vw, 128px)' },
                display: 'inline-block',
                textShadow: theme.palette.mode === 'dark' ? '0 0 24px rgba(255,255,255,0.06)' : '0 0 10px rgba(0,0,0,0.06)'
              }}
            >
              {'CompanyName'.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { y: 26, opacity: 0, rotate: -6 },
                    show: { y: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } }
                  }}
                  style={{ display: 'inline-block' }}
                >
                  {ch}
                </motion.span>
              ))}
            </Typography>
          </motion.div>

          {/* Rotating line */}
          <Box sx={{ minHeight: 36 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {LINES[idx]}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* Underline */}
          <Box
            component={motion.div}
            animate={{ width: ['28%', '58%', '28%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            sx={{
              height: 6,
              borderRadius: 999,
              mx: 'auto',
              background:
                theme.palette.mode === 'light'
                  ? `linear-gradient(90deg, ${theme.palette.secondary.light}, ${theme.palette.primary.light})`
                  : `linear-gradient(90deg, ${theme.palette.secondary[700]}, ${theme.palette.primary[700]})`,
              boxShadow:
                theme.palette.mode === 'light'
                  ? `0 0 22px ${theme.palette.secondary.light}, 0 0 18px ${theme.palette.primary.light}`
                  : `0 0 28px ${theme.palette.secondary[700]}, 0 0 22px ${theme.palette.primary[700]}`
            }}
          />

          {/* CTAs */}
          <MagneticRow>
            <GlowButton variant="contained" color="secondary" label="Schedule a Demo" />
            <GlowButton variant="outlined" color="secondary" label="Download Deck" />
          </MagneticRow>

          {/* KPIs */}
          <Stack ref={kpiRef} direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip variant="outlined" color="success" label={<CountLabel label="Live Devices" value={liveDevices} />} />
            <Chip variant="outlined" color="info" label={<CountLabel label="Avg PF (plant)" value={avgPF} />} />
            <Chip variant="outlined" color="secondary" label={<CountLabel label="Energy Saved (MWh)" value={savedMWh} />} />
          </Stack>

          {/* Alive machine tiles */}
          <LiveMachinesStrip items={[]} speedSec={20} onOpen={(m) => console.log('open machine', m)} />

          <ScrollHint />
        </Stack>
      </Box>
    </Box>
  );
}

/* ===== helpers (unchanged) ===== */

function CountLabel({ label, value }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
      <Typography variant="subtitle2">{label}:</Typography>
      <motion.span style={{ fontWeight: 700 }}>{value}</motion.span>
    </Box>
  );
}

function GlowButton({ variant, color, label }) {
  return (
    <Button
      component={motion.button}
      whileHover={{ y: -2, boxShadow: '0 10px 28px rgba(0,0,0,0.14)' }}
      whileTap={{ scale: 0.985 }}
      variant={variant}
      color={color}
      size="large"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 999,
        px: 2.8,
        backdropFilter: 'saturate(1.1)',
        '&:after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(120px 60px at var(--mx,50%) 120%, rgba(255,255,255,0.28), transparent 60%)',
          opacity: variant === 'contained' ? 0.5 : 0.28,
          transition: 'opacity .2s'
        },
        '&:hover:after': { opacity: 0.65 }
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
      }}
    >
      {label}
    </Button>
  );
}

function MagneticRow({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 10 });
  const sy = useSpring(y, { stiffness: 120, damping: 10 });

  return (
    <Box
      component={motion.div}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        x.set((px - 0.5) * 10);
        y.set((py - 0.5) * 8);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      sx={{ display: 'flex', gap: 1.2, justifyContent: 'center', flexWrap: 'wrap', pt: 0.5 }}
    >
      {children}
    </Box>
  );
}

function ParallaxBlob({ sx, size, blur, color, delay = 0 }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0.0 }}
      animate={{ opacity: 0.25, y: [0, -6, 0], x: [0, 6, 0] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut' }}
      sx={{ position: 'absolute', width: size, height: size, borderRadius: '50%', background: color, filter: `blur(${blur}px)`, ...sx }}
    />
  );
}

function Particles({ count = 18 }) {
  const dots = Array.from({ length: count });
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
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
              background: 'rgba(255,255,255,0.35)',
              boxShadow: '0 0 10px rgba(255,255,255,0.35), 0 0 16px rgba(255,255,255,0.2)'
            }}
          />
        );
      })}
    </Box>
  );
}

function ScrollHint() {
  return (
    <Box sx={{ pt: 1 }}>
      <Box
        component={motion.div}
        animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        sx={{ width: 10, height: 18, borderRadius: 8, mx: 'auto', border: '2px solid', borderColor: 'divider', position: 'relative' }}
      >
        <Box
          component={motion.span}
          animate={{ y: [2, 10, 2] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 2,
            width: 2,
            height: 4,
            borderRadius: 2,
            bgcolor: 'text.secondary'
          }}
        />
      </Box>
    </Box>
  );
}
