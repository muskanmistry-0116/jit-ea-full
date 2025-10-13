// src/views/help/modules/ContactPanel.jsx
import React, { useImperativeHandle, forwardRef, useRef, useState } from 'react';
import { Box, Stack, TextField, Button, Typography, Alert, FormControlLabel, Switch, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const ContactPanel = forwardRef(function ContactPanel(_, ref) {
  const [form, setForm] = useState({ name: '', email: '', topic: '', urgent: false, message: '' });
  const [sent, setSent] = useState(false);
  const rootRef = useRef(null);
  const nameRef = useRef(null);

  const onChange = (k) => (e) =>
    setForm((s) => ({
      ...s,
      [k]: typeof e.target.checked === 'boolean' ? e.target.checked : e.target.value
    }));

  const clear = () => setForm({ name: '', email: '', topic: '', urgent: false, message: '' });

  const onSubmit = async () => {
    // This is a placeholder. Later wire to your nodemailer endpoint.
    // await fetch('/api/support', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setSent(true);
    setTimeout(() => setSent(false), 2600);
  };

  useImperativeHandle(ref, () => ({
    setTopic: (t) => setForm((s) => ({ ...s, topic: t })),
    focus: () => nameRef.current?.focus(),
    getElement: () => rootRef.current
  }));

  return (
    <Paper
      ref={rootRef}
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4 }}
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
    >
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Can’t find what you need?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Send us a message — include screenshots/logs if possible. We’ll reply to your email.
        </Typography>

        {sent && <Alert severity="success">Thanks! Your message has been queued for support.</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth inputRef={nameRef} label="Your name" value={form.name} onChange={onChange('name')} />
          <TextField fullWidth label="Email" value={form.email} onChange={onChange('email')} />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Topic"
            placeholder="Alerts / Billing / Integrations…"
            value={form.topic}
            onChange={onChange('topic')}
          />
          <FormControlLabel
            control={<Switch checked={form.urgent} onChange={onChange('urgent')} />}
            label="Urgent"
            sx={{ ml: { xs: 0, md: 1 } }}
          />
        </Stack>

        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Message"
          placeholder="Describe the issue. What did you expect and what happened instead?"
          value={form.message}
          onChange={onChange('message')}
        />

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={onSubmit} sx={{ borderRadius: 2 }}>
            Send
          </Button>
          <Button variant="text" onClick={clear}>
            Clear
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
});

export default ContactPanel;
