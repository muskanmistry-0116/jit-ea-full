import React, { useState, useEffect } from 'react';
import PerformanceGaugeChart from './PerformanceGaugeChart'; // Import the chart
import { Maximize } from 'lucide-react';
import { segmentTitleStyle, segmentCardStyle, expandIconStyle } from '../../../styles/commonStyles';

// ---- Styles ----
const styles = {
  extraSegmentCardStyle: { ...segmentCardStyle, maxHeight: '250px' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },

  chartWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 10
  },
  chart: {
    width: '300px',
    height: '300px' // Adjusted for the semi-circle
  }
};

// ID: DB-PS-EC-01
export default function PerformanceSegment(props) {
  const { onExpand = () => {} } = props;

  const [score, setScore] = useState(83);

  useEffect(() => {
    const id = setInterval(() => {
      setScore(Math.round(70 + Math.random() * 25));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={styles.extraSegmentCardStyle}>
      <div style={styles.header}>
        <div style={segmentTitleStyle}>Real Time Performance Score</div>
      </div>
      <div style={styles.chartWrapper}>
        <div style={styles.chart}>
          <PerformanceGaugeChart value={score} />
        </div>
      </div>
    </div>
  );
}
