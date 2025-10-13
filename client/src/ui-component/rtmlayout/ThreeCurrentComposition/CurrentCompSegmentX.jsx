// import React, { useState } from 'react';
// import { Maximize } from 'lucide-react';

// // --- Style Definitions (No Tailwind CSS) ---
// const styles = {
//   segmentCard: {
//     backgroundColor: '#FFFFFF',
//     // padding: '1rem',
//     borderRadius: '0.75rem',
//     // border: '1px solid #000',
//     // boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
//     display: 'flex',
//     flexDirection: 'column',
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
//     position: 'relative',
//     justifyContent: 'space-between'
//   },
//   header: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   title: {
//     fontSize: '0.875rem',
//     fontWeight: '600',
//     color: '#1E293B'
//   },
//   headerIcons: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem'
//   },
//   expandIcon: {
//     cursor: 'pointer',
//     color: '#64748B'
//   },
//   body: {
//     flexGrow: 1,
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'space-around'
//   },
//   divider: {
//     height: '1px',
//     backgroundColor: '#E2E8F0',
//     margin: '0.5rem 0'
//   },
//   loadingText: {
//     flexGrow: 1,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     color: '#64748B'
//   },
//   statBlock: {
//     textAlign: 'center'
//   },
//   statTitle: {
//     fontSize: '0.75rem',
//     fontWeight: '500',
//     color: '#64748B',
//     textTransform: 'uppercase',
//     letterSpacing: '0.05em'
//   },
//   statValue: {
//     fontSize: '1.5rem',
//     fontWeight: 'bold' // CHANGED: Removed margin
//   },
//   // ADDED: New style for the flex container
//   valueWrapper: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: '0.5rem',
//     margin: '0.1rem 0'
//   },
//   statusIndicatorContainer: {
//     position: 'relative',
//     display: 'flex',
//     alignItems: 'center'
//   },
//   tooltip: {
//     visibility: 'hidden',
//     width: '160px',
//     backgroundColor: '#334155',
//     color: '#fff',
//     textAlign: 'center',
//     borderRadius: '6px',
//     padding: '8px',
//     position: 'absolute',
//     zIndex: 1,
//     top: '140%',
//     left: '50%',
//     marginLeft: '-80px',
//     opacity: 0,
//     transition: 'opacity 0.2s',
//     whiteSpace: 'pre-line'
//   },
//   tooltipVisible: {
//     visibility: 'visible',
//     opacity: 1
//   },
//   // ADDED: Style for the trend indicator
//   trendIndicator: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: '4px',
//     fontSize: '0.75rem',
//     height: '16px'
//   }
// };

// // --- Configuration & Helpers for Line Current ---
// // CHANGED: Max Deviation thresholds are now in PERCENTAGE
// const THRESHOLDS_CURRENT = {
//   maxDeviation: { acceptable: { max: 5.0 }, warning: { max: 10.0 }, critical: { min: 10.0 } }, // e.g., 5%, 10%
//   averageCurrent: {
//     acceptable: { min: 0, max: 200 },
//     warning: { min: 200, max: 250 },
//     critical: { min: 250 }
//   }
// };
// const STATUS_COLORS = {
//   acceptable: '#22c55e',
//   warning: '#f59e0b',
//   critical: '#ef4444'
// };
// const getMaxDeviationStatus = (value) => {
//   if (value <= THRESHOLDS_CURRENT.maxDeviation.acceptable.max) return 'acceptable';
//   if (value <= THRESHOLDS_CURRENT.maxDeviation.warning.max) return 'warning';
//   return 'critical';
// };
// const getAvgCurrentStatus = (value) => {
//   if (value >= THRESHOLDS_CURRENT.averageCurrent.acceptable.min && value <= THRESHOLDS_CURRENT.averageCurrent.acceptable.max)
//     return 'acceptable';
//   if (value > THRESHOLDS_CURRENT.averageCurrent.warning.min && value <= THRESHOLDS_CURRENT.averageCurrent.warning.max) return 'warning';
//   if (value > THRESHOLDS_CURRENT.averageCurrent.critical.min) return 'critical';
//   return 'acceptable';
// };

// // --- Sub-components (Using Inline Styles) ---

// // ADDED: The TrendIndicator component
// const TrendIndicator = ({ current, previous }) => {
//   if (previous === null || previous === undefined || current === previous || previous === 0) {
//     return <div style={styles.trendIndicator}></div>;
//   }
//   const change = current - previous;
//   const percentageChange = (change / previous) * 100;
//   const isIncrease = change > 0;
//   const color = isIncrease ? '#ef4444' : '#22c55e';
//   const arrow = isIncrease ? '▲' : '▼';

//   return (
//     <div style={{ ...styles.trendIndicator, color: color }}>
//       <span>{arrow}</span>
//       <span>{Math.abs(percentageChange).toFixed(1)}%</span>
//     </div>
//   );
// };

// // CHANGED: StatBlock now accepts previousValue and uses the new layout
// const StatBlock = ({ title, currentValue, unit, status, previousValue }) => {
//   const valueStyle = {
//     ...styles.statValue,
//     color: STATUS_COLORS[status] || '#1E293B'
//   };

//   return (
//     <div style={styles.statBlock}>
//       <h3 style={styles.statTitle}>{title}</h3>
//       <div style={styles.valueWrapper}>
//         <span style={valueStyle}>
//           {currentValue.toFixed(1)}
//           {unit}
//         </span>
//         <TrendIndicator current={currentValue} previous={previousValue} />
//       </div>
//     </div>
//   );
// };

// const StatusIndicator = ({ status, tooltipText }) => {
//   const [isTooltipVisible, setIsTooltipVisible] = useState(false);
//   const STATUS_CONFIG = {
//     acceptable: {
//       bgColor: '#22c55e',
//       icon: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="12"
//           height="12"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="3"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           {' '}
//           <path d="M20 6 9 17l-5-5" />{' '}
//         </svg>
//       )
//     },
//     warning: {
//       bgColor: '#f59e0b',
//       icon: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="12"
//           height="12"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           {' '}
//           <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /> <path d="M12 9v4" />{' '}
//           <path d="M12 17h.01" />{' '}
//         </svg>
//       )
//     },
//     critical: {
//       bgColor: '#ef4444',
//       icon: (
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="12"
//           height="12"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           {' '}
//           <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /> <path d="M12 9v4" />{' '}
//           <path d="M12 17h.01" />{' '}
//         </svg>
//       )
//     }
//   };
//   const currentStatus = STATUS_CONFIG[status] || STATUS_CONFIG.warning;
//   const indicatorStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '24px',
//     height: '24px',
//     borderRadius: '50%',
//     backgroundColor: currentStatus.bgColor,
//     color: 'white',
//     cursor: 'pointer'
//   };
//   const combinedTooltipStyle = isTooltipVisible ? { ...styles.tooltip, ...styles.tooltipVisible } : styles.tooltip;
//   return (
//     <div
//       style={styles.statusIndicatorContainer}
//       onMouseEnter={() => setIsTooltipVisible(true)}
//       onMouseLeave={() => setIsTooltipVisible(false)}
//     >
//       <div style={indicatorStyle}>{currentStatus.icon}</div>
//       <span style={combinedTooltipStyle}>{tooltipText}</span>
//     </div>
//   );
// };

// // --- The Main Integrated Component ---
// export default function CurrentCompSegment({ data, onExpandClick }) {
//   if (!data || data.avg_i === undefined || data.max_dev === undefined) {
//     return (
//       <div style={styles.segmentCard}>
//         <div style={styles.title}>3PH Line Current</div>
//         <div style={styles.loadingText}>Loading...</div>
//       </div>
//     );
//   }

//   // CHANGED: Calculate Max Deviation as a percentage
//   const maxDevPercentage = data.avg_i > 0 ? (data.max_dev / data.avg_i) * 100 : 0;

//   // ADDED: Calculate previous percentage for trend indicator
//   let previousMaxDevPercentage = null;
//   if (data.avg_i_previous > 0 && data.max_dev_previous !== undefined) {
//     previousMaxDevPercentage = (data.max_dev_previous / data.avg_i_previous) * 100;
//   }

//   const maxDeviationStatus = getMaxDeviationStatus(maxDevPercentage);
//   const avgCurrentStatus = getAvgCurrentStatus(data.avg_i);

//   const statusLevels = { acceptable: 0, warning: 1, critical: 2 };
//   const overallStatus = statusLevels[maxDeviationStatus] > statusLevels[avgCurrentStatus] ? maxDeviationStatus : avgCurrentStatus;

//   const tooltipText = `IR: ${data.ir.toFixed(1)}A | IY: ${data.iy.toFixed(1)}A | IB: ${data.ib.toFixed(1)}A`;
//   const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
//   const statusTooltipText = `Average Current: ${capitalize(avgCurrentStatus)}\nMax Deviation: ${capitalize(maxDeviationStatus)}`;

//   return (
//     <div style={styles.segmentCard} title={tooltipText}>
//       {/* Header */}
//       <div style={styles.header}>
//         <h2 style={styles.title}>3PH Line Current</h2>
//         <div style={styles.headerIcons}>
//           <StatusIndicator status={overallStatus} tooltipText={statusTooltipText} />
//           <Maximize size={16} style={styles.expandIcon} onClick={onExpandClick} />
//         </div>
//       </div>

//       {/* Body */}
//       {/* CHANGED: Pass correct values and units */}
//       <div style={styles.body}>
//         <StatBlock
//           title="Average Current"
//           currentValue={data.avg_i}
//           unit=" A"
//           status={avgCurrentStatus}
//           previousValue={data.avg_i_previous}
//         />
//         <div style={styles.divider} />
//         <StatBlock
//           title="Max Deviation"
//           currentValue={maxDevPercentage}
//           unit="%"
//           status={maxDeviationStatus}
//           previousValue={previousMaxDevPercentage}
//         />
//       </div>
//     </div>
//   );
// }
import React from 'react';
import { Maximize, AlertTriangle, Siren, CheckCircle2 } from 'lucide-react';
import { segmentCardStyle, segmentHeaderStyle, segmentTitleStyle, expandIconStyle } from '../../../styles/commonStyles';

// --- STYLES for a compact and clean 2-column layout ---
const styles = {
  body: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: '8px'
  },
  statColumn: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 8px'
  },
  divider: {
    width: '1px',
    alignSelf: 'stretch',
    backgroundColor: '#E2E8F0' // The vertical line
  },
  statTitle: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    lineHeight: '1.1'
  },
  statUnit: {
    fontSize: '1rem',
    lineHeight: '1',
    fontWeight: '500'
  },
  trendIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.875rem'
  },
  headerIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
};

// --- Helper TrendIndicator sub-component ---
const TrendIndicator = ({ current, previous, style, color }) => {
  if (previous === null || current === previous || previous === 0) {
    return <div style={{ ...style, height: '20px' }}></div>;
  }
  const change = current - previous;
  const percentageChange = (change / previous) * 100;
  const isIncrease = change > 0;
  const arrow = isIncrease ? '▲' : '▼';
  // Use the passed color for the trend
  return (
    <div style={{ ...style, color: color }}>
      <span>{arrow}</span>
      <span>{Math.abs(percentageChange).toFixed(1)}%</span>
    </div>
  );
};

// --- Main Component ---
export default function CurrentCompSegment({ data, onExpandClick }) {
  if (!data || data.avg_i === undefined || data.max_dev === undefined) {
    return <div style={segmentCardStyle}>{/* Basic header for loading state */}</div>;
  }

  // --- All of your calculation logic is preserved ---
  const maxDevPercentage = data.avg_i > 0 ? (data.max_dev / data.avg_i) * 100 : 0;
  let previousMaxDevPercentage = null;
  if (data.avg_i_previous > 0 && data.max_dev_previous !== undefined) {
    previousMaxDevPercentage = (data.max_dev_previous / data.avg_i_previous) * 100;
  }

  // --- Status and Color Logic ---
  const getStatus = (value, type) => {
    // Example thresholds, adjust as needed
    if (type === 'current' && (value > 2500 || value < 2000)) return 'critical';
    if (type === 'deviation' && value > 10) return 'critical';
    if (type === 'current' && (value > 2450 || value < 2100)) return 'warning';
    if (type === 'deviation' && value > 5) return 'warning';
    return 'acceptable';
  };

  const getStatusColor = (status) => {
    if (status === 'critical') return '#ef4444'; // Red
    if (status === 'warning') return '#f59e0b'; // Orange
    return '#22c55e'; // Dark text for acceptable
  };

  const avgCurrentStatus = getStatus(data.avg_i, 'current');
  const maxDeviationStatus = getStatus(maxDevPercentage, 'deviation');

  return (
    <div style={segmentCardStyle}>
      <div style={segmentHeaderStyle}>
        <div style={segmentTitleStyle}>3PH Line Current</div>
        <div style={styles.headerIcons}>
          <Maximize size={16} style={expandIconStyle} onClick={onExpandClick} />
        </div>
      </div>

      <div style={styles.body}>
        {/* Left Column */}
        <div style={styles.statColumn}>
          <div style={styles.statTitle}>Average Current</div>
          <div style={{ ...styles.statValue, color: getStatusColor(avgCurrentStatus) }}>
            {data.avg_i.toFixed(1)}
            <span style={styles.statUnit}> A</span>
          </div>
          <TrendIndicator
            current={data.avg_i}
            previous={data.avg_i_previous}
            style={styles.trendIndicator}
            color={getStatusColor(avgCurrentStatus)}
          />
        </div>

        {/* The vertical divider line is back */}
        <div style={styles.divider} />

        {/* Right Column */}
        <div style={styles.statColumn}>
          <div style={styles.statTitle}>Max Deviation</div>
          <div style={{ ...styles.statValue, color: getStatusColor(maxDeviationStatus) }}>
            {maxDevPercentage.toFixed(1)}
            <span style={styles.statUnit}>%</span>
          </div>
          <TrendIndicator
            current={maxDevPercentage}
            previous={previousMaxDevPercentage}
            style={styles.trendIndicator}
            color={getStatusColor(maxDeviationStatus)}
          />
        </div>
      </div>
    </div>
  );
}
