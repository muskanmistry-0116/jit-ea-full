// src/views/not-found/Error404.jsx
import React, { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  Paper,
  Divider,
  Tooltip,
  IconButton,
  Link,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

export default function Error404() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [copied, setCopied] = useState(false);

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary?.main || theme.palette.primary.light;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 10 },
        px: 2,
        // Subtle background that respects theme
        background: `radial-gradient(1200px 600px at 20% 0%, ${alpha(primary, 0.08)}, transparent 60%),
                     radial-gradient(800px 500px at 90% 20%, ${alpha(secondary, 0.10)}, transparent 60%)`
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(2px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
          }}
        >
          {/* Decorative glow */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(primary, 0.25)}, ${alpha(secondary, 0.25)})`,
              filter: 'blur(40px)'
            }}
          />

          <Stack spacing={3} alignItems="center" textAlign="center">
            {/* Big gradient 404 */}
            <Typography
              component="div"
              sx={{
                fontSize: { xs: '72px', sm: '108px', md: '132px' },
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow:
                  theme.palette.mode === 'light'
                    ? `0 2px 24px ${alpha(primary, 0.2)}`
                    : `0 2px 24px ${alpha(primary, 0.35)}`
              }}
            >
              404
            </Typography>

            <Stack spacing={1.2}>
              <Typography variant="h4" fontWeight={700}>
                Page not found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We couldn’t find anything at{' '}
                <Typography
                  component="span"
                  sx={{
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.25)}`
                  }}
                >
                  {pathname}
                </Typography>
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={copied ? 'Copied!' : 'Copy URL for support'}>
                <IconButton onClick={handleCopy} size="small">
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="caption" color="text.secondary">
                Share this link with the support team if you think this is a mistake.
              </Typography>
            </Stack>

            <Divider sx={{ width: '100%', my: 1.5 }} />

            {/* Actions */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="center"
              sx={{ width: '100%' }}
            >
              <Button
                startIcon={<ArrowBackRoundedIcon />}
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ minWidth: 180 }}
              >
                Go Back
              </Button>

              <Button
                component={RouterLink}
                to="/dashboard"
                startIcon={<HomeRoundedIcon />}
                variant="contained"
                sx={{ minWidth: 200 }}
              >
                Back to Dashboard
              </Button>

              <Button
                component={RouterLink}
                to="/help"
                startIcon={<HelpOutlineRoundedIcon />}
                sx={{ minWidth: 160 }}
              >
                Get Help
              </Button>
            </Stack>

          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
