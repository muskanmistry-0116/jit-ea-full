// src/views/help/modules/SupportGrid.jsx
import React from 'react';
import { Box, Card, CardContent, Stack, Typography, Chip, Button } from '@mui/material';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { motion } from 'framer-motion';

const ITEMS = [
  {
    icon: <ChatRoundedIcon />,
    title: 'Live Chat',
    desc: 'Get instant help from a human during business hours.',
    badge: 'Avg 12 min',
    topic: 'Live Chat'
  },
  {
    icon: <BugReportRoundedIcon />,
    title: 'Raise a ticket',
    desc: 'Report bugs or request features. Track every step.',
    badge: 'SLO backed',
    topic: 'New Ticket'
  },
  {
    icon: <LibraryBooksRoundedIcon />,
    title: 'Documentation',
    desc: 'Guides, reference, and implementation playbooks.',
    badge: '400+ articles',
    topic: 'Documentation'
  },
  {
    icon: <SchoolRoundedIcon />,
    title: 'Training',
    desc: 'Admin & operator onboarding, customized for your plant.',
    badge: 'Free sessions',
    topic: 'Training'
  },
  {
    icon: <VerifiedRoundedIcon />,
    title: 'Compliance',
    desc: 'BIS/IEC aligned KPIs, audit PDF templates & thresholds.',
    badge: 'BIS/IEC',
    topic: 'Compliance'
  }
];

export default function SupportGrid({ onRoute }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 24,
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        '@media (max-width:1200px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
        '@media (max-width:760px)': { gridTemplateColumns: '1fr' }
      }}
    >
      {ITEMS.map((it, i) => (
        <Card
          key={it.title}
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          whileHover={{ y: -6 }}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  {it.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {it.title}
                </Typography>
                <Chip size="small" variant="outlined" label={it.badge} />
              </Stack>

              <Typography variant="body2" sx={{ color: 'text.secondary', minHeight: 42 }}>
                {it.desc}
              </Typography>

              <Box>
                <Button variant="outlined" onClick={() => onRoute?.(it.topic)} sx={{ borderRadius: 2 }}>
                  {it.title === 'Documentation' ? 'Ask about Docs' : it.title}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
