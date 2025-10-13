import React from 'react';
import { Box, Button, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

export default function BillingToggle({ value, onChange }) {
  const theme = useTheme();
  const isYearly = value === 'yearly';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center', // <- centers the toggle horizontally
        alignItems: 'center',
        my: 3 // add vertical spacing if needed
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 999,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 0.5,
          minWidth: 260
        }}
      >
        {/* sliding indicator */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <motion.div
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              width: 'calc(50% - 8px)',
              borderRadius: 999,
              background: theme.palette.mode === 'light' ? theme.palette.action.hover : theme.palette.grey[800],
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
            }}
            animate={{ left: isYearly ? 'calc(50% + 4px)' : '4px' }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          />
        </Box>

        <ToggleBtn active={value === 'monthly'} onClick={() => onChange('monthly')}>
          Monthly
        </ToggleBtn>
        <ToggleBtn active={value === 'yearly'} onClick={() => onChange('yearly')}>
          Yearly
        </ToggleBtn>

        {value === 'yearly' && <Chip size="small" color="success" variant="outlined" label="Save ~20%" sx={{ ml: 1, zIndex: 1 }} />}
      </Box>
    </Box>
  );
}

function ToggleBtn({ active, children, onClick }) {
  return (
    <Button
      onClick={onClick}
      size="small"
      variant="text"
      sx={{
        position: 'relative',
        zIndex: 1,
        minWidth: 120,
        px: 2.4,
        py: 0.9,
        borderRadius: 999,
        color: active ? 'text.primary' : 'text.secondary',
        '&:hover': { background: 'transparent' }
      }}
    >
      {children}
    </Button>
  );
}
