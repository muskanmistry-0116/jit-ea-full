// src/views/electricity/BillsOverview.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, ToggleButton, ToggleButtonGroup,
  TextField, Button, Divider, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Grid, Dialog,
  DialogTitle, DialogContent, ButtonBase, useMediaQuery, Slide, Tooltip,
  GlobalStyles
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { listBills } from '../electricity/e';

/* ===== EBW widgets (rendered in dialogs) ===== */
import ConsumptionTrendWidget from '../../../src/ui-component/ebw/widgets/ConsumptionTrendWidget';
import DemandWidget from '../../../src/ui-component/ebw/widgets/DemandWidget';
import BillingAnalysisWidget from '../../../src/ui-component/ebw/widgets/BillingAnalysisWidget';
import TodCostWidget from '../../../src/ui-component/ebw/widgets/TodCostWidget';
import WidgetContainer from '../../../src/ui-component/ebw/components/WidgetContainer';
import PowerFactorWidget from '../../ui-component/ebw/widgets/PowerFactorWidget';
import LoadFactorWidget from '../../ui-component/ebw/widgets/LoadFactorWidget';
import BillComponentWidget from '../../ui-component/ebw/widgets/BillComponentWidget';
import RebatesWidget from '../../ui-component/ebw/widgets/RebatesWidget';

/* -------------------------------------------------------------------------- */
/* 1) ChartFrame — set the exact chart area size per component                */
/* -------------------------------------------------------------------------- */
function asCssSize(val, fallback) {
  if (typeof val === 'number') return `${val}px`;
  if (typeof val === 'string') return val;
  return fallback;
}
function ChartFrame({ chartHeight, chartWidth, children }) {
  const h = asCssSize(chartHeight, '60vh');
  const w = asCssSize(chartWidth, '100%');
  return (
    <Box
      sx={{
        height: h,
        width: w,
        // Stretch common ECharts wrappers
        '& .echarts-for-react': { height: '100% !important', width: '100%' },
        '& .echarts-for-react > div': { height: '100% !important', width: '100%' },
        '& canvas': { height: '100% !important', width: '100% !important' },
        '& [class*="echart"], & [class*="ECharts"]': { height: '100%', width: '100%' },
        // Let tooltips escape (critical)
        overflow: 'visible',
        position: 'relative'
      }}
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* 2) Reusable Mini-Tile → Dialog                                             */
/* -------------------------------------------------------------------------- */
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function KpiTileWithDialog({
  title,
  tileTitle,
  tileValue = 'Tap to open',
  tileHint,
  tooltip,
  dialogWidth = '100%',
  dialogHeight = 560,
  maxWidth = 'xl',
  fullScreenBreakpoint = 'sm',
  renderContent
}) {
  const theme = useTheme();

  const validBpKeys = Object.keys(theme.breakpoints.values || {});
  const safeBp = validBpKeys.includes(fullScreenBreakpoint) ? fullScreenBreakpoint : 'sm';
  const fullScreen = useMediaQuery(theme.breakpoints.down(safeBp));

  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);

  const forceResize = useCallback(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  useEffect(() => {
    if (!open || !contentRef.current) return;
    const ro = new ResizeObserver(() => forceResize());
    ro.observe(contentRef.current);
    const t = setTimeout(forceResize, 120);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [open, forceResize]);

  const tile = (
    <ButtonBase onClick={() => setOpen(true)} style={{ width: '100%', textAlign: 'left', borderRadius: 12 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow .2s, transform .06s, border-color .2s',
          '&:hover': { boxShadow: '0 8px 26px rgba(2,17,37,.08)', borderColor: 'primary.light' },
          '&:active': { transform: 'scale(.996)' }
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {tileTitle}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {tileValue}
        </Typography>
        {tileHint && (
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
            {tileHint}
          </Typography>
        )}
      </Paper>
    </ButtonBase>
  );

  return (
    <>
      {tooltip?.title ? (
        <Tooltip
          title={tooltip.title}           // must be string/JSX; NO echarts formatter here
          placement={tooltip.placement ?? 'top'}
          enterDelay={tooltip.enterDelay ?? 400}
          leaveDelay={tooltip.leaveDelay ?? 0}
          arrow={tooltip.arrow ?? true}
        >
          <span style={{ width: '100%' }}>{tile}</span>
        </Tooltip>
      ) : (
        tile
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth={maxWidth}
        fullScreen={fullScreen}
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 2,
            width: typeof dialogWidth === 'number' ? `${dialogWidth}px` : dialogWidth,
          }
        }}
        onEntered={forceResize}
        onTransitionEnd={forceResize}
      >
        <DialogTitle sx={{ pr: 6 }}>
          {title}
          <IconButton aria-label="close" onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 12, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          ref={contentRef}
          dividers
          sx={{
            minHeight: typeof dialogHeight === 'number' ? `${dialogHeight}px` : dialogHeight,
            px: { xs: 1, sm: 2 },
            pt: 1,
            pb: 2,
            bgcolor: 'background.default',
            '& .MuiPaper-root': { boxShadow: 'none' },
            // critical for any inner charts that rely on overflow
            overflow: 'visible'
          }}
        >
          {typeof renderContent === 'function' ? renderContent() : renderContent}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ============================= BillsOverview (page) ============================= */

const clamp12Months = (start, end) => {
  const s = dayjs(start + '-01');
  let e = dayjs(end + '-01');
  if (e.diff(s, 'month') > 11) e = s.add(11, 'month');
  return [s.format('YYYY-MM'), e.format('YYYY-MM')];
};

const monthsBetween = (startYYYYMM, endYYYYMM) => {
  const s = dayjs(startYYYYMM + '-01');
  const e = dayjs(endYYYYMM + '-01');
  const out = [];
  let d = s.startOf('month');
  while (d.isBefore(e) || d.isSame(e, 'month')) {
    out.push(d.format('YYYY-MM'));
    d = d.add(1, 'month');
  }
  return out;
};

const StatusChip = ({ value }) => {
  const map = {
    paid: { label: 'PAID', color: 'success' },
    not_paid: { label: 'NOT PAID', color: 'warning' },
    pre_paid: { label: 'PRE-PAID', color: 'info' }
  };
  const cfg = map[value] || { label: value, color: 'default' };
  return <Chip size="small" color={cfg.color} label={cfg.label} />;
};

const shellSx = {
  p: 2.25,
  borderRadius: 3,
  boxShadow: '0 2px 14px rgba(2,17,37,0.06)',
  bgcolor: 'background.paper'
};
const blockTitle = { fontWeight: 600, mb: 1 };

// Reusable compact tooltip config for local ECharts we control on this page
const baseTooltip = {
  trigger: 'axis',
  axisPointer: { type: 'shadow' },
  confine: true,                   // keep inside chart box (prevents giant overflow)
  appendToBody: true,              // avoids dialog clipping (ECharts 5.4+)
  backgroundColor: 'rgba(38,42,55,0.96)',
  borderWidth: 0,
  textStyle: { color: '#fff', fontSize: 12, lineHeight: 18 },
  extraCssText:
    'max-width:320px;white-space:normal;word-break:break-word;border-radius:8px;padding:8px 10px;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:2147483647;'
};

export default function BillsOverview() {
  const navigate = useNavigate();
  const now = dayjs();
  const defaultStart = now.subtract(11, 'month').format('YYYY-MM');
  const defaultEnd = now.format('YYYY-MM');

  const [view, setView] = useState('overview'); // 'overview' | 'kpi'
  const [metric, setMetric] = useState('amount'); // 'amount' | 'units'
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [s, e] = clamp12Months(start, end);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    listBills({ startMonth: s, endMonth: e })
      .then((data) => { if (isMounted) setRows(data); })
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, [s, e]);

  const months = useMemo(() => monthsBetween(s, e), [s, e]);

  const seriesData = useMemo(() => {
    const map = Object.fromEntries(months.map((m) => [m, 0]));
    for (const b of rows) if (map[b.month] !== undefined) map[b.month] += (metric === 'amount' ? b.amount : b.units);
    return months.map((m) => map[m]);
  }, [months, rows, metric]);

  const option = useMemo(() => ({
    grid: { left: 110, right: 24, top: 30, bottom: 10 },
    tooltip: {
      ...baseTooltip,
      valueFormatter: (v) =>
        metric === 'amount'
          ? `₹ ${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : `${Number(v).toLocaleString()} kWh`
    },
    xAxis: { type: 'value', name: metric === 'amount' ? 'Amount (₹)' : 'Units (kWh)' },
    yAxis: { type: 'category', data: months.map((m) => dayjs(m + '-01').format('MMM YYYY')) },
    series: [{ type: 'bar', data: seriesData, barWidth: 16, itemStyle: { borderRadius: [0, 8, 8, 0] } }]
  }), [months, seriesData, metric]);

  const onPreset = (type) => {
    if (type === 'last12') {
      setStart(now.subtract(11, 'month').format('YYYY-MM'));
      setEnd(now.format('YYYY-MM'));
    } else if (type === 'thisYear') {
      const y = now.format('YYYY');
      setStart(`${y}-01`);
      setEnd(now.format('YYYY-MM'));
    }
  };

  return (
    <Paper sx={{ ...shellSx }}>
      {/* Global CSS – keeps ECharts tooltips tidy across all widgets */}
      <GlobalStyles
  styles={{
    /* Clamp ALL ECharts tooltip variants */
    '.echarts-tooltip, .echarts-tooltip-dark, .echarts-tooltip-light': {
      width: 'auto !important',             /* override width:100% coming from HTML formatter */
      maxWidth: '260px !important',         /* adjust as you like */
      maxHeight: '160px !important',
      display: 'inline-block !important',   /* prevents filling the row */
      overflow: 'auto !important',
      background: 'rgba(38,42,55,0.96) !important',
      color: '#fff !important',
      border: 'none !important',
      borderRadius: 8,
      padding: '8px 10px !important',
      boxShadow: '0 10px 30px rgba(0,0,0,.3)',
      whiteSpace: 'normal !important',
      wordBreak: 'break-word',
      pointerEvents: 'none',
      zIndex: 2147483647
    },

    /* If the formatter injects blocks with width:100%, neutralize them */
    '.echarts-tooltip *[style*="width: 100%"]': {
      width: 'auto !important',
    },

    /* Compact text everywhere inside the tooltip */
    '.echarts-tooltip, .echarts-tooltip *': {
      fontSize: 12,
      lineHeight: 1.35,
      color: 'inherit'
    },

    /* Don’t show empty shells */
    '.echarts-tooltip:empty': { display: 'none' }
  }}
/>



      {/* Header: Title + Tabs + Reset */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h5" sx={{ flex: 1, fontWeight: 700 }}>
          Electricity Bill — Overview
        </Typography>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={(_, v) => v && setView(v)}
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'transparent',
              color: 'text.primary'
            },
            '& .MuiToggleButton-root.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderColor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            },
            '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
              marginLeft: 0.5
            }
          }}
        >
          <ToggleButton value="overview">Overview</ToggleButton>
          <ToggleButton value="kpi">KPI View</ToggleButton>
        </ToggleButtonGroup>

        <IconButton onClick={() => onPreset('last12')} title="Reset to last 12 months">
          <RestartAltIcon />
        </IconButton>
      </Stack>

      {/* Controls */}
      <Box sx={{ mb: 2, p: 1.25, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={blockTitle}>Summary Controls</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <ToggleButtonGroup
  exclusive
  value={metric}
  onChange={(_, v) => v && setMetric(v)}
  size="small"
  sx={{
    '& .MuiToggleButton-root': {
      textTransform: 'none',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      color: 'text.primary',
      bgcolor: 'transparent',
      '&:hover': {
        bgcolor: 'action.hover'
      }
    },
    '& .MuiToggleButton-root.Mui-selected': {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      borderColor: 'primary.main',
      '&:hover': {
        bgcolor: 'primary.dark'
      }
    },
    // spacing between buttons
    gap: 1
  }}
>
  <ToggleButton value="amount">Total Bill Amount</ToggleButton>
  <ToggleButton value="units">Total Units Consumed</ToggleButton>
</ToggleButtonGroup>


          <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
            <TextField label="Start month" type="month" size="small" value={start} onChange={(e) => setStart(e.target.value)} inputProps={{ max: end }} />
            <TextField label="End month" type="month" size="small" value={end} onChange={(e) => setEnd(e.target.value)} inputProps={{ min: start }} />
            <Button variant="outlined" onClick={() => onPreset('thisYear')}>This Year</Button>
            <Button variant="outlined" onClick={() => onPreset('last12')}>Last 12M</Button>
            <Typography variant="caption" sx={{ ml: 'auto' }} color="text.secondary">Max 12 months window</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/electricity')} sx={{ ml: { xs: 0, md: 1 }, borderRadius: 2 }}>
              Add Bill
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* KPI VIEW */}
      {view === 'kpi' && (
        <Box>
          <Box sx={{ mb: 2, p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={blockTitle}>
              Monthly {metric === 'amount' ? 'Amount' : 'Units'} (Compact)
            </Typography>
            {/* resize here */}
            <ReactECharts notMerge lazyUpdate option={option} style={{ height: 280 }} />
          </Box>

          <Grid container spacing={2}>
            {/* PF */}
            <Grid item xs={12} sm={6} lg={4}>
              <KpiTileWithDialog
                title="Power Factor Analysis"
                tileTitle="Power Factor"
                tileValue="Tap to open"
                tileHint="Billed PF, trend, target"
                tooltip={{ title: 'View detailed PF chart', placement: 'bottom', enterDelay: 300 }}
                maxWidth={false}
                dialogWidth="92vw"
                dialogHeight={720}
                fullScreenBreakpoint="xs"
                renderContent={() => (
                  <ChartFrame chartWidth="100%" chartHeight={600}>
                    <WidgetContainer title="Power Factor Analysis">
                      <PowerFactorWidget />
                    </WidgetContainer>
                  </ChartFrame>
                )}
              />
            </Grid>

            {/* LF */}
            <Grid item xs={12} sm={6} lg={4}>
              <KpiTileWithDialog
                title="Load Factor"
                tileTitle="Load Factor"
                tileValue="Tap to open"
                tileHint="LF % vs target"
                tooltip={{ title: 'Open Load Factor insights' }}
                maxWidth="xl"
                dialogWidth="100%"
                dialogHeight={640}
                renderContent={() => (
                  <ChartFrame chartWidth="100%" chartHeight={600}>
                    <WidgetContainer title="Load Factor">
                      <LoadFactorWidget />
                    </WidgetContainer>
                  </ChartFrame>
                )}
              />
            </Grid>

            {/* Rebates */}
            <Grid item xs={12} sm={6} lg={4}>
              <KpiTileWithDialog
                title="Incentives & Rebates"
                tileTitle="Incentives & Rebates"
                tileValue="Tap to open"
                tileHint="CR / ICF / PPD breakdown"
                tooltip={{ title: 'See credit components', placement: 'top-start', arrow: false }}
                maxWidth="xl"
                dialogWidth="100%"
                dialogHeight={560}
                renderContent={() => (
                  <ChartFrame chartWidth="100%" chartHeight={520}>
                    <WidgetContainer title="Incentives & Rebates">
                      <RebatesWidget />
                    </WidgetContainer>
                  </ChartFrame>
                )}
              />
            </Grid>

            {/* Consumption */}
            <Grid item xs={12} sm={6} lg={4}>
              <KpiTileWithDialog
                title="Consumption Trend"
                tileTitle="Consumption Trend"
                tileValue="Tap to open"
                tileHint="Year-over-year KV(A)H"
                tooltip={{ title: <span>Compare 2024-25 vs 2023-24</span>, placement: 'top' }}
                maxWidth={false}
                dialogWidth="94vw"
                dialogHeight="76vh"
                renderContent={() => (
                  <ChartFrame chartWidth="100%" chartHeight="70vh">
                    <WidgetContainer title="Consumption Trend">
                      <ConsumptionTrendWidget />
                    </WidgetContainer>
                  </ChartFrame>
                )}
              />
            </Grid>

            {/* Demand */}
            <Grid item xs={12} sm={6} lg={4}>
              <KpiTileWithDialog
                title="Demand Details"
                tileTitle="Demand Details"
                tileValue="Tap to open"
                tileHint="Billed vs Recorded vs CD"
                maxWidth="xl"
                dialogWidth="100%"
                dialogHeight={660}
                renderContent={() => (
                  <ChartFrame chartWidth="100%" chartHeight={620}>
                    <WidgetContainer title="Demand Details">
                      <DemandWidget />
                    </WidgetContainer>
                  </ChartFrame>
                )}
              />
            </Grid>

            {/* Billing Analysis */}
            <Grid item xs={12} sm={6} lg={4}>
              <KpiTileWithDialog
                title="Billing Demand Analysis"
                tileTitle="Billing Demand Analysis"
                tileValue="Tap to open"
                tileHint="75% rules & max-of logic"
                maxWidth="xl"
                dialogWidth="100%"
                dialogHeight={660}
                renderContent={() => (
                  <ChartFrame chartWidth="100%" chartHeight={620}>
                    <WidgetContainer title="Billing Demand Analysis">
                      <BillingAnalysisWidget />
                    </WidgetContainer>
                  </ChartFrame>
                )}
              />
            </Grid>

            {/* Bill Components */}
            <Grid item xs={12} sm={6} lg={4}>
              <KpiTileWithDialog
                title="Bill Components"
                tileTitle="Bill Components"
                tileValue="Tap to open"
                tileHint="Energy, demand, wheeling…"
                maxWidth="xl"
                dialogWidth="100%"
                dialogHeight={660}
                renderContent={() => (
                  <ChartFrame chartWidth="100%" chartHeight={620}>
                    <WidgetContainer title="Bill Components">
                      <BillComponentWidget />
                    </WidgetContainer>
                  </ChartFrame>
                )}
              />
            </Grid>

            {/* TOD */}
            <Grid item xs={12} sm={6} lg={4}>
              <KpiTileWithDialog
                title="TOD Cost Analysis"
                tileTitle="TOD Cost Analysis"
                tileValue="Tap to open"
                tileHint="Zone split & charges"
                maxWidth="xl"
                dialogWidth="100%"
                dialogHeight={660}
                renderContent={() => (
                  <ChartFrame chartWidth="100%" chartHeight={620}>
                    <WidgetContainer title="TOD Cost Analysis">
                      <TodCostWidget />
                    </WidgetContainer>
                  </ChartFrame>
                )}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* OVERVIEW: table only */}
      {view === 'overview' && (
        <Box>
          <Typography variant="h6" sx={blockTitle}>Submitted Bills</Typography>

          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Bill No.</TableCell>
                  <TableCell align="right">Units (kWh)</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {months.map((m) => {
                  const bill = rows.find((b) => b.month === m);
                  return (
                    <TableRow key={m} hover selected={!!bill}>
                      <TableCell>{dayjs(m + '-01').format('MMM YYYY')}</TableCell>
                      <TableCell>{bill?.bill_no || '—'}</TableCell>
                      <TableCell align="right">{bill ? bill.units.toLocaleString() : '0'}</TableCell>
                      <TableCell align="right">
                        {bill ? `₹ ${bill.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '₹ 0'}
                      </TableCell>
                      <TableCell>{bill ? <StatusChip value={bill.status} /> : <Chip size="small" label="No bill" />}</TableCell>
                      <TableCell>{bill ? dayjs(bill.submitted_at).format('DD MMM YYYY, HH:mm') : '—'}</TableCell>
                      <TableCell align="center">
                        {bill ? (
                          <IconButton color="primary" onClick={() => navigate(`/electricity/${bill.id}`)} title="More details" size="small">
                            <OpenInNewIcon />
                          </IconButton>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Loading…' : `${rows.length} record(s)`}
            </Typography>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
