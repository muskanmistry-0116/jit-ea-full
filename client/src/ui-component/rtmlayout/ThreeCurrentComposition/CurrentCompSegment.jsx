import React from 'react';
import { Maximize } from 'lucide-react';
import { segmentCardStyle, segmentTitleStyle, expandIconStyle } from '../../../styles/commonStyles';
import CurrentRingChart from './CurrentRingChart';

// ---- Styles ----
const styles = {
  titleWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  chartWrap: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  chart: {
    width: '200px',
    height: '200px'
  },
  details: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
    fontSize: '11px'
  }
};

// --- CHANGE: Component now accepts `data` and `onExpandClick` ---
export default function CurrentCompSegment({ data, onExpandClick }) {
  // --- REMOVED: All useState and useEffect logic for data simulation ---

  // --- Calculate derived values from the incoming `data` prop ---
  const currents = data.currents;
  const currentValues = Object.values(currents);
  const iAvg = (currentValues.reduce((a, b) => a + b, 0) / currentValues.length).toFixed(2);
  const maxDev = (Math.max(...currentValues) - Math.min(...currentValues)).toFixed(2);

  return (
    <div style={segmentCardStyle}>
      <div style={styles.titleWrap}>
        <div style={segmentTitleStyle}>3 Φ Current Consumption</div>
        {/* --- CHANGE: Connected the onExpandClick prop --- */}
        <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
      </div>
      <div style={styles.chartWrap}>
        <div style={styles.chart}>
          {/* --- CHANGE: Pass `currents` from the data prop to the chart --- */}
          <CurrentRingChart currents={currents} showTooltip={true} />
        </div>
        <div style={styles.details}>
          {/* --- CHANGE: Display values from the `currents` object --- */}
          <span>IR - {currents.ir}A</span>
          <span>IY - {currents.iy}A</span>
          <span>IB - {currents.ib}A</span>
          <span>IAvg - {iAvg}A</span>
          <span>Max Dev - {maxDev}A</span>
        </div>
      </div>
    </div>
  );
}
