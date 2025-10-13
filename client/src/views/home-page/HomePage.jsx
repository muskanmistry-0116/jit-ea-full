// src/views/home-page/HomePage.jsx
import React, { useEffect } from 'react';

/**
 * HomePage (Dark Modern Industrial)
 * -------------------------------------------------------------
 * - Zero extra deps, one file, fully styled via embedded <style>.
 * - Sections: Top Nav (inline), Hero + KPIs, Analytics Models, Market Spotlight, Footer.
 * - Uses IntersectionObserver for tasteful reveal animations.
 * - Safe to drop inside Berry-MUI main content area.
 *
 * Hook real data by replacing the placeholder arrays at the top.
 */

const KPI_DATA = [
  { label: 'Total Earning', value: '₹500.00', note: '+3.2% this month', tone: 'success' },
  { label: 'Total Growth', value: '₹2,324.00', note: 'steady momentum', tone: 'indigo' },
  { label: 'Total Order', value: '₹961', note: 'settled orders 100%', tone: 'success', wide: true }
];

const MODEL_DATA = [
  {
    chip: 'Powered by Y901',
    name: 'Y901 Momentum Matrix',
    desc: 'Predictive momentum + drawdown guardrails for volatile regimes.',
    metrics: [
      { k: 'Hit Rate (MoM)', v: '67%' },
      { k: 'Total Income', v: '₹203k' }
    ]
  },
  {
    chip: 'Powered by T203k',
    name: 'T203k Long-Horizon',
    desc: 'Quality, profitability & multi-cycle factors for durable compounding.',
    metrics: [
      { k: 'Sharpe (12m)', v: '1.42' },
      { k: 'Total Orders', v: '₹961' }
    ]
  },
  {
    chip: 'Research',
    name: 'AlphaGrid LLM',
    desc: 'Narrative-to-numbers: filings/news → tradable vectors with regime flags.',
    metrics: [
      { k: 'Coverage', v: '3,200+ tickers' },
      { k: 'Latency', v: '< 500ms' }
    ]
  }
];

const STOCKS = [
  { name: 'Bajaj Finery', meta: 'Large Cap • Industrial', pill: '+10% Profit', tone: 'gain' },
  { name: 'TTML', meta: 'Telecom • Mid Cap', pill: '10% bias', tone: 'warn' },
  { name: 'Reliance', meta: 'Conglomerate • Large Cap', pill: '+1%', tone: 'gain' },
  { name: 'BAG', meta: 'Media • Small Cap', pill: '-3.4%', tone: 'loss' }
];

export default function HomePage() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('hp-reveal-in')), {
      threshold: 0.12
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{`
        /* ===== Theme ===== */
        :root {
          --hp-bg: #0a0a0f;                /* page background */
          --hp-text: #e9eef8;              /* primary text */
          --hp-muted: #a4b0c4;             /* secondary text */
          --hp-card: rgba(255,255,255,0.05);
          --hp-card-2: rgba(255,255,255,0.07);
          --hp-stroke: rgba(255,255,255,0.14);
          --hp-shadow: 0 10px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05);
          --hp-blur: 14px;
          --hp-r-lg: 18px;
          --hp-r-md: 14px;

          --hp-brand: #15b8ff;             /* electric blue */
          --hp-brand-2: #7c5cff;           /* electric indigo */
          --hp-success: #27d17f;
          --hp-warn: #ffcc66;
          --hp-danger: #ff5f5f;
        }

        /* page scope */
        .hp { color: var(--hp-text); background: var(--hp-bg); }
        .hp a { color: inherit; text-decoration: none; }
        .hp .hp-container { width: min(1200px, 92vw); margin: 0 auto; }
        .hp * { box-sizing: border-box; }

        /* top bar (inline to match your app but dark) */
        .hp-top {
          position: sticky; top: 0; z-index: 2;
          backdrop-filter: blur(10px) saturate(140%);
          background: linear-gradient(180deg, rgba(10,10,15,.86), rgba(10,10,15,.55));
          border-bottom: 1px solid var(--hp-stroke);
        }
        .hp-nav {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 0;
        }
        .hp-brand {
          display: flex; align-items: center; gap: 12px;
          padding: 6px 10px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(21,184,255,.12), rgba(124,92,255,.12));
          border: 1px solid rgba(255,255,255,.08);
        }
        .hp-logo {
          width: 28px; height: 28px; border-radius: 8px;
          background: radial-gradient(120% 120% at 0% 0%, var(--hp-brand), var(--hp-brand-2));
          box-shadow: 0 6px 16px rgba(21,184,255,.35);
        }
        .hp-brand-name { font-weight: 800; letter-spacing: .2px; }
        .hp-links { margin-left: auto; display: flex; gap: 8px; }
        .hp-btn {
          padding: 10px 14px; border-radius: 12px; font-weight: 600;
          background: linear-gradient(135deg, var(--hp-brand), var(--hp-brand-2));
          border: 1px solid rgba(255,255,255,.1); color: #06070a;
          box-shadow: 0 10px 22px rgba(21,184,255,.22);
        }
        .hp-link {
          padding: 8px 12px; border-radius: 10px; color: var(--hp-muted);
          transition: all .25s ease; border: 1px solid transparent;
        }
        .hp-link:hover { color: var(--hp-text); background: rgba(255,255,255,.05); border-color: var(--hp-stroke); }

        /* hero */
        .hp-hero {
          position: relative; overflow: hidden;
          padding: clamp(48px, 6vw, 84px) 0;
        }
        .hp-hero:before {
          content: "";
          position: absolute; inset: -20% -10% auto -10%; height: 520px;
          background:
            radial-gradient(420px 220px at 18% 12%, rgba(21,184,255,.18), transparent 60%),
            radial-gradient(420px 220px at 82% 10%, rgba(124,92,255,.16), transparent 60%);
          filter: blur(6px); pointer-events: none;
        }
        .hp-hero-grid {
          display: grid; gap: clamp(18px, 3vw, 28px);
          grid-template-columns: 1.15fr .85fr;
          align-items: center;
        }
        .hp-headline {
          font-size: clamp(38px, 5.6vw, 58px);
          font-weight: 900; line-height: 1.05; letter-spacing: -0.02em;
          background: linear-gradient(180deg, #ffffff, #cfe9ff);
          -webkit-background-clip: text; color: transparent;
        }
        .hp-tagline { margin-top: 12px; color: var(--hp-muted); max-width: 56ch; }
        .hp-cta-row { display: flex; gap: 12px; margin-top: 20px; }

        /* KPI */
        .hp-kpis { display: grid; gap: 18px; }
        @media (min-width: 860px) {
          .hp-kpis { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .hp-kpi.wide { grid-column: 1 / -1; }
        }
        .hp-kpi {
          position: relative; padding: 18px 18px 20px;
          background: var(--hp-card); border: 1px solid var(--hp-stroke);
          border-radius: var(--hp-r-lg); backdrop-filter: blur(var(--hp-blur));
          box-shadow: var(--hp-shadow); overflow: hidden;
        }
        .hp-kpi:after { /* glow halo */
          content: ""; position: absolute; inset: -40% -20% auto auto;
          width: 360px; height: 360px;
          background: radial-gradient(closest-side, rgba(21,184,255,.18), transparent 70%);
          transform: translate(30px,-120px); pointer-events: none;
        }
        .hp-kpi .t { color: var(--hp-muted); font-size: 12px; letter-spacing: .35px; text-transform: uppercase; }
        .hp-kpi .v { margin-top: 6px; font-size: clamp(26px, 4vw, 40px); font-weight: 800; }
        .hp-kpi .spark {
          margin-top: 12px; height: 44px; border-radius: 10px;
          background:
            linear-gradient(180deg, rgba(255,255,255,.06), transparent),
            repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, transparent 1px 6px);
          border: 1px dashed rgba(255,255,255,.16);
        }
        .hp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 10px; padding: 6px 10px; border-radius: 999px; font-size: 12px;
          border: 1px solid; background: rgba(255,255,255,.05);
        }
        .hp-badge.success { color: var(--hp-success); border-color: rgba(39,209,127,.3); background: rgba(39,209,127,.12); }
        .hp-badge.indigo  { color: var(--hp-brand-2); border-color: rgba(124,92,255,.3); background: rgba(124,92,255,.12); }

        /* sections */
        .hp-section { padding: clamp(36px, 5vw, 64px) 0; }
        .hp-title { font-size: clamp(22px,3.2vw,28px); font-weight: 800; margin-bottom: 10px; }
        .hp-sub { color: var(--hp-muted); margin-bottom: 22px; }

        /* model cards */
        .hp-models {
          display: grid; gap: clamp(16px, 2vw, 24px);
          grid-template-columns: repeat( auto-fit, minmax(260px, 1fr) );
        }
        .hp-card {
          position: relative; padding: 20px; border-radius: var(--hp-r-md);
          background: var(--hp-card-2); border: 1px solid var(--hp-stroke);
          backdrop-filter: blur(var(--hp-blur)); box-shadow: var(--hp-shadow);
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        .hp-card:hover { transform: translateY(-4px); border-color: rgba(21,184,255,.35); box-shadow: 0 12px 30px rgba(21,184,255,.14); }
        .hp-chip {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; letter-spacing: .3px; padding: 6px 10px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14); color: var(--hp-muted); background: rgba(255,255,255,.04);
        }
        .hp-m-name { margin-top: 10px; font-weight: 900; font-size: 20px; letter-spacing: .2px; }
        .hp-m-desc { margin-top: 8px; color: var(--hp-muted); line-height: 1.6; }
        .hp-m-metrics { margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap; }
        .hp-metric {
          min-width: 120px; padding: 10px 12px; border-radius: 12px;
          background: rgba(255,255,255,.04); border: 1px solid var(--hp-stroke);
        }
        .hp-metric .x { color: var(--hp-muted); font-size: 12px; }
        .hp-metric .y { font-weight: 800; margin-top: 4px; }

        /* stocks */
        .hp-stocks {
          display: grid; gap: clamp(16px, 2vw, 22px);
          grid-template-columns: repeat( auto-fit, minmax(260px, 1fr) );
        }
        .hp-stock {
          display: flex; align-items: center; gap: 14px; padding: 14px;
          border-radius: 14px; border: 1px solid var(--hp-stroke);
          background: var(--hp-card); backdrop-filter: blur(var(--hp-blur)); box-shadow: var(--hp-shadow);
          transition: transform .2s ease, border-color .2s ease;
        }
        .hp-stock:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.22); }
        .hp-stock-logo {
          width: 42px; height: 42px; border-radius: 10px;
          background: conic-gradient(from 120deg, var(--hp-brand), var(--hp-brand-2), var(--hp-brand));
          box-shadow: inset 0 0 0 2px rgba(0,0,0,.35);
        }
        .hp-pill { margin-left: auto; font-size: 12px; font-weight: 800; padding: 6px 10px; border-radius: 999px; border: 1px solid; }
        .hp-pill.gain { color: var(--hp-success); border-color: rgba(39,209,127,.28); background: rgba(39,209,127,.14); }
        .hp-pill.warn { color: var(--hp-warn); border-color: rgba(255,204,102,.28); background: rgba(255,204,102,.14); }
        .hp-pill.loss { color: var(--hp-danger); border-color: rgba(255,95,95,.28); background: rgba(255,95,95,.14); }

        /* footer */
        .hp-footer { margin-top: 20px; padding: 22px 0; border-top: 1px solid var(--hp-stroke); color: var(--hp-muted); font-size: 14px; }
        .hp-f-links { display: flex; gap: 12px; flex-wrap: wrap; }

        /* reveal */
        [data-reveal] { opacity: 0; transform: translateY(10px) scale(.98); transition: opacity .6s ease, transform .6s ease; }
        .hp-reveal-in { opacity: 1; transform: translateY(0) scale(1); }
      `}</style>

      <main className="hp">
        {/* Inline top nav (keeps your left sidebar intact) */}
        <div className="hp-top">
          <div className="hp-container hp-nav">
            <div className="hp-brand">
              <div className="hp-logo" />
              <div className="hp-brand-name">Apex Analytics</div>
            </div>
            <div className="hp-links">
              <a className="hp-link" href="/dashboard">
                Dashboard
              </a>
              <a className="hp-link" href="/alerts">
                Alerts
              </a>
              <a className="hp-link" href="/reports">
                Reports
              </a>
              <a className="hp-link" href="/help">
                Help &amp; Support
              </a>
              <a className="hp-btn" href="/auth/login">
                Get Started
              </a>
            </div>
          </div>
        </div>

        {/* HERO */}
        <section className="hp-hero">
          <div className="hp-container hp-hero-grid">
            <div data-reveal>
              <h1 className="hp-headline">
                Clarity in Complexity.
                <br />
                Power in Performance.
              </h1>
              <p className="hp-tagline">
                Institutional-grade analytics with real-time intelligence. Build conviction, compress time, and move with precision.
              </p>
              <div className="hp-cta-row">
                <a className="hp-btn" href="/plans">
                  View Plans
                </a>
                <a className="hp-link" href="/pages">
                  Explore Platform
                </a>
              </div>
            </div>

            <div className="hp-kpis" data-reveal>
              {KPI_DATA.map((k, i) => (
                <article className={`hp-kpi ${k.wide ? 'wide' : ''}`} key={i}>
                  <div className="t">{k.label}</div>
                  <div className="v">{k.value}</div>
                  <div className="spark" aria-hidden="true" />
                  <div className={`hp-badge ${k.tone}`}>
                    <span>●</span> {k.note}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MODELS */}
        <section className="hp-section">
          <div className="hp-container">
            <h2 className="hp-title" data-reveal>
              Our Analytics Models
            </h2>
            <p className="hp-sub" data-reveal>
              Signal engines tuned for asymmetric outcomes — supervised, unsupervised and reinforcement blends.
            </p>

            <div className="hp-models">
              {MODEL_DATA.map((m, i) => (
                <article className="hp-card" data-reveal key={i}>
                  <span className="hp-chip">{m.chip}</span>
                  <div className="hp-m-name">{m.name}</div>
                  <p className="hp-m-desc">{m.desc}</p>
                  <div className="hp-m-metrics">
                    {m.metrics.map((mm, j) => (
                      <div className="hp-metric" key={j}>
                        <div className="x">{mm.k}</div>
                        <div className="y">{mm.v}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MARKET SPOTLIGHT */}
        <section className="hp-section">
          <div className="hp-container">
            <h2 className="hp-title" data-reveal>
              Market Spotlight
            </h2>
            <p className="hp-sub" data-reveal>
              Heat across trending assets. Badges show current bias / P&amp;L.
            </p>

            <div className="hp-stocks">
              {STOCKS.map((s, i) => (
                <div className="hp-stock" data-reveal key={i}>
                  <div className="hp-stock-logo" aria-hidden="true" />
                  <div>
                    <div style={{ fontWeight: 800 }}>{s.name}</div>
                    <div style={{ color: 'var(--hp-muted)', fontSize: 13 }}>{s.meta}</div>
                  </div>
                  <div className={`hp-pill ${s.tone}`}>{s.pill}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="hp-footer">
          <div className="hp-container" data-reveal>
            <div style={{ marginBottom: 8, fontWeight: 800 }}>Quick Links</div>
            <div className="hp-f-links">
              <a className="hp-link" href="/time-table">
                Time Table – Google
              </a>
              <a className="hp-link" href="/calendar">
                Academic Calendar
              </a>
              <a className="hp-link" href="/support">
                Support
              </a>
              <a className="hp-link" href="/privacy">
                Privacy
              </a>
            </div>
            <div style={{ marginTop: 12, color: 'var(--hp-muted)', fontSize: 12 }}>
              © {new Date().getFullYear()} Apex Analytics. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
