// src/views/plans/modules/PlanCard.jsx
import React, { useState } from 'react';
import { Card, CardContent, Chip, Divider, Stack, Typography, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Confetti } from './Decor';

export default function PlanCard({ plan, billing, price, highlight, index }) {
  const theme = useTheme();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(x, { stiffness: 120, damping: 12 });
  const ry = useSpring(y, { stiffness: 120, damping: 12 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    x.set((py - 0.5) * -6);
    y.set((px - 0.5) * 8);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const [boom, setBoom] = useState(false);
  const priceLabel = price === 0 ? '—' : `₹${price.toLocaleString('en-IN')}`;
  const subLabel = price === 0 ? '' : '/month';

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ y: -8 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        transformStyle: 'preserve-3d',
        border: highlight ? `2px solid ${theme.palette[plan.color].main}` : '1px solid',
        borderColor: highlight ? theme.palette[plan.color].main : 'divider',
        boxShadow: highlight ? `0 18px 48px rgba(0,0,0,0.12)` : '0 8px 28px rgba(0,0,0,0.04)',
        background:
          theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.85))'
            : theme.palette.background.paper
      }}
      style={{ rotateX: rx, rotateY: ry }}
    >
      {/* subtle glow */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            theme.palette.mode === 'light'
              ? `radial-gradient(260px 120px at 60% -10%, ${theme.palette[plan.color].light}, transparent 60%)`
              : `radial-gradient(260px 120px at 60% -10%, ${theme.palette[plan.color][900]}, transparent 60%)`,
          opacity: highlight ? 0.35 : 0.18
        }}
      />

      {plan.badge && (
        <Chip label={plan.badge} color={plan.color} size="small" sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }} />
      )}

      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Stack spacing={1.2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {plan.title}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              {priceLabel}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {subLabel}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {plan.id === 'enterprise'
              ? 'Custom pricing for high-scale deployments.'
              : 'Everything you need to monitor, optimize and audit.'}
          </Typography>

          <ShimmerButton
            variant={plan.id === 'enterprise' ? 'outlined' : highlight ? 'contained' : 'outlined'}
            color={plan.color}
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => setBoom(true)}
            sx={{ mt: 0.5, borderRadius: 2 }}
          >
            {plan.cta}
          </ShimmerButton>

          <Divider sx={{ my: 1.5 }} />

          {[
            { ok: plan.includes.live, text: 'Live telemetry & widgets' },
            { ok: plan.includes.alerts, text: 'Smart alerts (PF, imbalance, THD)' },
            { ok: plan.includes.optimizer, text: 'Cost optimizer (ToD/PPA guardrails)' },
            { ok: true, text: `Reports: ${plan.includes.reports}` },
            { ok: true, text: `Retention: ${plan.includes.retention}` },
            { ok: true, text: `Support: ${plan.includes.support}` }
          ].map((row, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              {row.ok ? (
                <CheckRoundedIcon color="success" fontSize="small" />
              ) : (
                <CloseRoundedIcon sx={{ color: 'error.light' }} fontSize="small" />
              )}
              <Typography variant="body2">{row.text}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>

      {boom && <Confetti color={theme.palette[plan.color].main} onDone={() => setBoom(false)} />}
    </Card>
  );
}

function ShimmerButton(props) {
  return (
    <Button
      {...props}
      component={motion.button}
      whileHover={{ y: -2, boxShadow: '0 12px 26px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.985 }}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        ...props.sx,
        '&:after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent)',
          transform: 'translateX(-100%)',
          transition: 'transform .6s ease'
        },
        '&:hover:after': { transform: 'translateX(100%)' }
      }}
    />
  );
}
