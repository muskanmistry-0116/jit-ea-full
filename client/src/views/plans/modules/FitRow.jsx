// src/views/plans/modules/FitRow.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

/**
 * FitRow
 * - Renders children horizontally with a fixed gap.
 * - Measures natural width; if wider than container, scales the whole row down.
 * - Keeps 3 cards on one line, centered, never wraps, never chops.
 */
export default function FitRow({ children, gap = 24 }) {
  const wrapRef = useRef(null);
  const rowRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [rowHeight, setRowHeight] = useState('auto');

  const measure = () => {
    const wrap = wrapRef.current;
    const row = rowRef.current;
    if (!wrap || !row) return;

    // natural width of row (no wrap)
    const childWidths = Array.from(row.children).map((el) => el.getBoundingClientRect().width);
    const natural = childWidths.reduce((a, b) => a + b, 0) + gap * (childWidths.length - 1);

    const avail = wrap.clientWidth;
    const s = Math.min(1, avail / natural);

    setScale(s);
    // maintain layout height so scaling doesn't collapse surrounding content
    const h = row.getBoundingClientRect().height * s;
    setRowHeight(h);
  };

  useLayoutEffect(measure, []);
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <Box ref={wrapRef} sx={{ width: '100%', position: 'relative', height: rowHeight }}>
      <Box
        ref={rowRef}
        sx={{
          display: 'flex',
          gap: `${gap}px`,
          justifyContent: 'center',
          alignItems: 'stretch',
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          willChange: 'transform'
        }}
      >
        {React.Children.map(children, (child) => (
          <Box sx={{ width: 'clamp(300px, 32vw, 380px)' }}>{child}</Box>
        ))}
      </Box>
    </Box>
  );
}
