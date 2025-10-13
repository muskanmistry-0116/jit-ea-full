// src/views/rtw/total-power-history/index.jsx
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import ReactECharts from 'echarts-for-react';

// ECharts modular imports
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer,
]);

// API client
import { fetchHistoricalData } from '../../../utils/historical_rtw5h';

// DatePackage + contexts
import { ShiftSettingsProvider } from '../../../menu-items/DatePackage2/ShiftSettingsContext';
import { ZoneSettingsProvider } from '../../../menu-items/DatePackage2/ZoneSettingsContext';
import DatePackage from '../../../menu-items/DatePackage2/DatePackage';

/* ========================= Styles ========================= */

const styles = {
  container: {
    width: '100%',
    height: '100%',
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
  },
  headerWrap: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 6,
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'start',
    gap: 16
  },
  title: { fontWeight: 900, fontSize: 22, color: '#0f172a', lineHeight: 1.1 },
  sub:   { marginTop: 4, fontSize: 12, color: '#6b7280' },
};

/* ========================= Shared No-records Overlay ========================= */
function NoRecordsOverlay({ show, label, hint = 'Try another date range or interval.' }) {
  if (!show) return null;
  return (
    <div
      style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:7, pointerEvents:'none'
      }}
    >
      <div style={{
        background:'rgba(255,255,255,0.96)',
        border:'1px solid #e5e7eb',
        borderRadius:12,
        padding:'12px 16px',
        fontSize:12,
        color:'#6b7280',
        boxShadow:'0 6px 20px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontWeight:700, color:'#111827', marginBottom:4 }}>No records found</div>
        {label ? <div>for {label}. {hint}</div> : <div>{hint}</div>}
      </div>
    </div>
  );
}

/* ========================= Helpers ========================= */

const createStandardTooltipFormatter = (params, fullData, options = {}) => {
  const { contractDemand, seventyFivePercentDemand } = options;

  const timeLabel = params?.[0]?.axisValueLabel ?? '';
  const p0 = fullData.find((d) => d.time === timeLabel);
  if (!p0) return '';

  const fmtFull = (d) => {
    if (!(d instanceof Date) || Number.isNaN(+d)) return timeLabel;
    const day = d.getDate();
    const month = d.toLocaleString(undefined, { month: 'long' });
    const year = d.getFullYear();
    const h24 = d.getHours();
    const ap  = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : (h24 % 12);
    const mm  = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${h12}:${mm} ${ap}`;
  };
  const header = fmtFull(p0.fullDate);

  const COLOR = {
    'Apparent Power': '#C0C0C0',
    'Real Power'    : '#5470C6',
    'Reactive Power': '#91CC75',
  };

  let html = `<div style="min-width:260px"><div style="font-weight:800;margin-bottom:8px">${header}</div>`;
  const row = (label, val, col, unit) => `
    <div style="display:flex;justify-content:space-between;gap:16px;margin:4px 0">
      <span style="display:flex;align-items:center;color:#6b7280">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${col};margin-right:8px"></span>
        ${label}
      </span>
      <span style="font-weight:700;color:${col}">${val == null ? '-' : Number(val).toFixed(2)} ${unit}</span>
    </div>`;

  params.forEach((p) => {
    const name = p.seriesName;
    const col  = COLOR[name] || '#6b7280';
    const raw  = typeof p.value === 'object' ? p.value.value : p.value;
    const unit = name === 'Real Power' ? 'kW' : name === 'Reactive Power' ? 'kVAr' : 'kVA';
    html += row(name, raw, col, unit);
  });

  if (contractDemand != null && seventyFivePercentDemand != null) {
    const bar = (c) => `<span style="display:inline-block;vertical-align:middle;width:12px;height:3px;margin-right:8px;background:${c}"></span>`;
    html += `
      <div style="margin-top:6px;padding-top:6px;border-top:1px solid #eee"></div>
      ${row(`${bar('#ff5252')}Contract Demand`, contractDemand, '#ff5252', 'kVA')}
      ${row(`${bar('#ffce56')}75% Demand`,     seventyFivePercentDemand, '#ffce56', 'kVA')}
    `;
  }
  html += `</div>`;
  return html;
};

const formatRangeLabel = (startISO, endISO) => {
  try {
    if (!startISO && !endISO) return '';
    const fmt = (iso) => new Date(iso).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
    if (startISO && endISO) return `${fmt(startISO)} — ${fmt(endISO)}`;
    if (startISO) return `From ${fmt(startISO)}`;
    if (endISO)   return `Until ${fmt(endISO)}`;
    return '';
  } catch {
    return '';
  }
};

/* ========================= Main Component ========================= */

export default function IndexTotalPowerHistory() {
  const wrapperRef = useRef(null);
  const chartInstRef = useRef(null);

  // fullscreen state
  const [isFS, setIsFS] = useState(false);

  // responsive dims
  const [dims, setDims] = useState({ width: 800, height: 560, font: 12 });

  // thresholds
  const [contractDemand, setContractDemand] = useState(160);
  const seventyFivePercentDemand = useMemo(
    () => +(contractDemand * 0.75).toFixed(2),
    [contractDemand]
  );

  // date range & interval (minutes) driven by DatePackage
  const [range, setRange] = useState(() => {
    const now = new Date();
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(now);   end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString(), intervalMin: 60 };
  });

  // meta from API (with safe defaults)
  const [metaInfo, setMetaInfo] = useState({
    panelName: 'Default',
    did: 'E_AA_Z_B_Y_P0003_D1',
  });

  // raw points: { time: 'HH:mm', fullDate: Date, kw, kvar, kva }
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [emptyForRange, setEmptyForRange] = useState(false);

  // Sizing logic
  const getVVH = () =>
    (window.visualViewport && typeof window.visualViewport.height === 'number')
      ? window.visualViewport.height : window.innerHeight;

  const recalc = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = getVVH();
    const availableH = Math.max(440, Math.floor(vh - rect.top - 8));
    const w = Math.max(320, Math.floor(vw));
    const font = w < 480 ? 10 : w < 768 ? 11 : 12;
    setDims({ width: w, height: availableH, font });

    requestAnimationFrame(() => chartInstRef.current?.resize?.());
  };

  useLayoutEffect(() => {
    recalc();
    const schedule = () => requestAnimationFrame(recalc);
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    const ro = new ResizeObserver(schedule);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => { window.removeEventListener('resize', schedule); window.removeEventListener('orientationchange', schedule); ro.disconnect(); };
  }, []);

  /* ---------------- API integration ---------------- */
  const normalizeRows = (rows) => {
    const tsKeys   = ['timestamp','ts','TS','time','TIME','Time'];
    const kwKeys   = ['kW','KW','kw','REAL_POWER','real_power'];
    const kvaKeys  = ['kVA','KVA','kva','APPARENT_POWER','apparent_power'];
    const kvarKeys = ['kVAr','KVAR','kvar','kVArh','REACTIVE_POWER','reactive_power'];

    const toMs = (v) => {
      if (v == null) return null;
      if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
      const d = new Date(v);
      return Number.isNaN(+d) ? null : +d;
    };
    const getNum = (o, keys) => {
      for (const k of keys) if (o?.[k] != null && isFinite(Number(o[k]))) return Number(o[k]);
      return null;
    };
    const pickTs = (o) => {
      for (const k of tsKeys) if (o && o[k] != null) return toMs(o[k]);
      return null;
    };

    const bucket = new Map(); // HH:mm → {ms, kw, kvar, kva}
    rows.forEach((r, i) => {
      let ms = pickTs(r);
      if (ms == null) {
        const base = new Date(); base.setHours(0,0,0,0);
        ms = +base + i * 60 * 1000;
      }
      const d = new Date(ms);
      const H = String(d.getHours()).padStart(2,'0');
      const M = String(d.getMinutes()).padStart(2,'0');
      const key = `${H}:${M}`;
      bucket.set(key, {
        ms,
        kw:   getNum(r, kwKeys),
        kvar: getNum(r, kvarKeys),
        kva:  getNum(r, kvaKeys),
      });
    });

    return Array.from(bucket.entries())
      .map(([t, v]) => ({ time: t, fullDate: new Date(v.ms), kw: v.kw, kvar: v.kvar, kva: v.kva }))
      .sort((a, b) => +a.fullDate - +b.fullDate);
  };

  useEffect(() => {
    let ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setEmptyForRange(false);

        const resp = await fetchHistoricalData(
          {
            segment: 'power',
            from: range.start,
            to: range.end,
          },
          { signal: ac.signal }
        );

        const rows = Array.isArray(resp) ? resp : (resp?.data ?? []);
        const normalized = normalizeRows(rows || []);
        setData(normalized);
        setEmptyForRange(normalized.length === 0);

        // Try to read DID / panel name from response meta or rows
        const didFromResp =
          resp?.meta?.did ?? resp?.did ?? rows?.[0]?.did ?? rows?.[0]?.DID ?? rows?.[0]?.device_id;
        const panelFromResp =
          resp?.meta?.panelName ?? resp?.panelName ?? rows?.[0]?.panelName;

        setMetaInfo((prev) => ({
          did: didFromResp || prev.did,
          panelName: panelFromResp || prev.panelName,
        }));
      } catch (e) {
        setErr(e?.message || 'Failed to load');
        setData([]);
        setEmptyForRange(true);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [range.start, range.end, range.intervalMin]);

  // x-axis labels & data arrays
  const timeData = useMemo(() => data.map((d) => d.time), [data]);
  const kvaData  = useMemo(() => data.map((d) => d.kva),  [data]);
  const kwData   = useMemo(() => data.map((d) => d.kw),   [data]);
  const kvarData = useMemo(() => data.map((d) => d.kvar), [data]);

  /* -------- Fullscreen helpers -------- */
  const enterFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      // Safari
      // @ts-ignore
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      if (screen.orientation?.lock) {
        try { await screen.orientation.lock('landscape'); } catch {}
      }
    } catch {}
  };
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
      // Safari
      // @ts-ignore
      else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
    } catch {}
  };
  useEffect(() => {
    const onFS = () => {
      const fs = !!(document.fullscreenElement || /* safari */ document.webkitFullscreenElement);
      setIsFS(fs);
      setTimeout(() => chartInstRef.current?.resize?.(), 80);
    };
    const onOrient = () => setTimeout(() => chartInstRef.current?.resize?.(), 120);
    document.addEventListener('fullscreenchange', onFS);
    // @ts-ignore
    document.addEventListener('webkitfullscreenchange', onFS);
    window.addEventListener('orientationchange', onOrient);
    return () => {
      document.removeEventListener('fullscreenchange', onFS);
      // @ts-ignore
      document.removeEventListener('webkitfullscreenchange', onFS);
      window.removeEventListener('orientationchange', onOrient);
    };
  }, []);

  // Chart option (no chart background; wrapper is white)
  const option = useMemo(() => ({
    useDirtyRect: true,

    grid: { left: 70, right: 36, bottom: 132, top: 120, containLabel: true },

    legend: {
      type: 'plain',
      bottom: 8, right: 12,
      itemWidth: 12, itemHeight: 10, itemGap: 12, icon: 'roundRect',
      textStyle: { color: '#1f2937', fontSize: 15, fontWeight: 600 },
      data: ['Apparent Power', 'Real Power', 'Reactive Power'],
    },

    dataZoom: [{
      type: 'inside', xAxisIndex: 0, filterMode: 'none',
      zoomOnMouseWheel: true, moveOnMouseMove: true, pinch: true, throttle: 16,
      start: 0, end: 100
    }],

    xAxis: {
      type: 'category',
      name: 'TIME',
      nameLocation: 'middle',
      nameGap: 34,
      nameTextStyle: { color: '#1f2937', fontWeight: 800, fontSize: 16 },
      data: timeData,
      axisLabel: { show: true, color: '#6b7280', fontSize: dims.font, hideOverlap: true },
      axisTick: { show: true, alignWithLabel: true, length: 4 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },

    yAxis: {
      type: 'value',
      name: 'Power',
      nameLocation: 'middle',
      nameGap: 48,
      nameTextStyle: { color: '#1f2937', fontWeight: 700, fontSize: 20 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eef2f7' } },
      axisLabel: { color: '#6b7280', fontSize: dims.font },
    },

    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148,163,184,0.14)' }, snap: true },
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderColor: 'rgba(229,231,235,0.8)',
      borderWidth: 1,
      textStyle: { color: '#111827', fontSize: dims.font },
      extraCssText: 'box-shadow:0 10px 30px rgba(0,0,0,0.12);padding:12px 14px;border-radius:12px;',
      formatter: (params) =>
        createStandardTooltipFormatter(params, data, { contractDemand, seventyFivePercentDemand }),
    },

    series: [
      {
        name: 'Apparent Power',
        type: 'bar',
        itemStyle: { color: '#C0C0C0', borderRadius: [6,6,0,0] },
        barWidth: '30%',
        data: kvaData,
        markLine: {
          silent: false,
          symbol: 'none',
          lineStyle: { type: 'dashed' },
          tooltip: { formatter: (p) => `${p.name}: ${p.value}` },
          data: [
            { yAxis: contractDemand, name: 'Contract Demand', lineStyle: { color: '#ff5252', width: 2 } },
            { yAxis: seventyFivePercentDemand, name: '75% Demand', lineStyle: { color: '#ffce56', width: 2 } },
          ],
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 50,
          data: [{ type: 'max', name: 'Max Demand' }],
          label: { formatter: '{b}', color: '#111827', fontSize: 12 },
        },
        z: 3
      },
      {
        name: 'Real Power',
        type: 'bar',
        stack: 'powerComponents',
        itemStyle: { color: '#5470C6', borderRadius: [6,6,0,0] },
        barWidth: '30%',
        data: kwData,
        z: 2
      },
      {
        name: 'Reactive Power',
        type: 'bar',
        stack: 'powerComponents',
        itemStyle: { color: '#91CC75', borderRadius: [6,6,0,0] },
        barWidth: '30%',
        data: kvarData,
        z: 1
      },
    ],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [timeData, kvaData, kwData, kvarData, dims.font, data, contractDemand, seventyFivePercentDemand]);

  const showEmpty = !loading && emptyForRange;

  /* -------- Fullscreen listeners -------- */
  useEffect(() => {
    const onFS = () => {
      const fs = !!(document.fullscreenElement || /* safari */ document.webkitFullscreenElement);
      setIsFS(fs);
      setTimeout(() => chartInstRef.current?.resize?.(), 80);
    };
    const onOrient = () => setTimeout(() => chartInstRef.current?.resize?.(), 120);
    document.addEventListener('fullscreenchange', onFS);
    // @ts-ignore
    document.addEventListener('webkitfullscreenchange', onFS);
    window.addEventListener('orientationchange', onOrient);
    return () => {
      document.removeEventListener('fullscreenchange', onFS);
      // @ts-ignore
      document.removeEventListener('webkitfullscreenchange', onFS);
      window.removeEventListener('orientationchange', onOrient);
    };
  }, []);

  // Render
  return (
    <ShiftSettingsProvider>
      <ZoneSettingsProvider>
        <div ref={wrapperRef} style={{ ...styles.container, height: `${dims.height}px` }}>
          {/* Header + DatePackage */}
          <div style={styles.headerWrap}>
            <div style={{ textAlign: 'left', width: '100%' }}>
              <div style={styles.title}>{metaInfo.title || 'Total Power Consumption'}</div>
              <div style={styles.sub}>Panel Name: {metaInfo.panelName || 'Default'}</div>
              <div style={{ ...styles.sub, marginTop: 2 }}>Device ID: {metaInfo.did || '-'}</div>

              {/* Contract Demand inline control */}
              <div style={{ ...styles.sub, marginTop: 8 }}>
                Contract Demand:&nbsp;
                <input
                  type="number"
                  value={contractDemand}
                  onChange={(e) => setContractDemand(Math.max(1, Number(e.target.value || 0)))}
                  style={{
                    width: 90,
                    padding: '2px 6px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 12,
                    marginRight: 6,
                    outline: 'none'
                  }}
                />
                <span style={{ color: '#6b7280' }}>(75% = {seventyFivePercentDemand} kVA)</span>
              </div>
            </div>

            <DatePackage
              start={range.start}
              end={range.end}
              onChange={(payload) => {
                if (!payload?.start || !payload?.end) {
                  const now = new Date();
                  const s = new Date(now); s.setHours(0, 0, 0, 0);
                  const e = new Date(now); e.setHours(23, 59, 59, 999);
                  setRange({ start: s.toISOString(), end: e.toISOString(), intervalMin: 60 });
                  return;
                }
                const nextInterval =
                  typeof payload.group_interval_min === 'number' ? payload.group_interval_min : 60;
                setRange({ start: payload.start, end: payload.end, intervalMin: nextInterval });
              }}
            />
          </div>

          {/* Fullscreen toggle (white) */}
          <button
            onClick={() => (isFS ? (document.exitFullscreen?.()) : (wrapperRef.current?.requestFullscreen?.()))}
            title={isFS ? 'Exit fullscreen' : 'Fullscreen (rotate)'}
            aria-label={isFS ? 'Exit fullscreen' : 'Enter fullscreen'}
            style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              zIndex: 8,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid rgba(0,0,0,0.08)',
              background: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              opacity: 0.96
            }}
          >
            {!isFS ? (
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 3H3v4M3 3l6 6M17 3h4v4M21 3l-6 6M7 21H3v-4M3 21l6-6M17 21h4v-4M21 21l-6-6"
                      stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 3H3v6M3 3l8 8M15 3h6v6M21 3l-8 8M9 21H3v-6M3 21l8-8M15 21h6v-6M21 21l-8-8"
                      stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          <ReactECharts
            echarts={echarts}
            option={option}
            notMerge
            lazyUpdate
            onChartReady={(inst) => {
              chartInstRef.current = inst;
              requestAnimationFrame(() => { inst.resize?.(); });
            }}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'canvas' }}
          />

          {/* Unified No-records overlay */}
          <NoRecordsOverlay
            show={showEmpty && !err}
            label={formatRangeLabel(range.start, range.end)}
            hint="Try another date range or interval."
          />

          {/* Loading / Error */}
          {loading && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
              <div style={{ fontSize:13, color:'#6b7280' }}>Loading…</div>
            </div>
          )}
          {err && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
              <div style={{
                background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:18, maxWidth:520, textAlign:'center',
                boxShadow:'0 10px 30px rgba(0,0,0,0.08)'
              }}>
                <div style={{ fontWeight:800, marginBottom:8, color:'#111827' }}>Error</div>
                <div style={{ color: '#6b7280' }}>{String(err)}</div>
              </div>
            </div>
          )}
        </div>
      </ZoneSettingsProvider>
    </ShiftSettingsProvider>
  );
}
