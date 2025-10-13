// src/views/help/modules/FAQ.jsx
import React, { useMemo, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment, Stack, Typography, Box } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { motion, AnimatePresence } from 'framer-motion';

const DATA = [
  {
    q: 'How do I invite my team?',
    a: 'Go to Settings → Users → Invite. Add email and role. The user will receive a secure link to join.'
  },
  {
    q: 'Can I export reports?',
    a: 'Yes. Reports are available as PDF and CSV. Use Reports → pick a template → Export.'
  },
  {
    q: 'How do I configure smart alerts?',
    a: 'Navigate to Alerts → Create. Choose PF drop/imbalance/THD thresholds or BIS profiles and set recipients.'
  },
  {
    q: 'Where do I see device status?',
    a: 'Dashboard shows live devices and health. For details use Plant Layout → select feeder → Telemetry tab.'
  },
  {
    q: 'Do you support ToD/PPA cost guardrails?',
    a: 'Yes — Cost Optimizer lets you define ToD/PPA rates and generate guardrail what-if savings.'
  }
];

export default function FAQ() {
  const [term, setTerm] = useState('');
  const list = useMemo(
    () => DATA.filter((x) => x.q.toLowerCase().includes(term.toLowerCase()) || x.a.toLowerCase().includes(term.toLowerCase())),
    [term]
  );

  return (
    <Stack spacing={2}>
      <TextField
        placeholder="Search FAQs…"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon />
            </InputAdornment>
          )
        }}
      />

      <AnimatePresence initial={false} mode="popLayout">
        {list.map((item, idx) => (
          <Box
            key={item.q}
            component={motion.div}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Accordion elevation={0} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography sx={{ fontWeight: 700 }}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        ))}
      </AnimatePresence>

      {list.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
          No matches — try a different keyword.
        </Typography>
      )}
    </Stack>
  );
}
