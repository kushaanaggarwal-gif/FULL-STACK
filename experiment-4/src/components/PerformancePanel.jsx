import React from 'react';

const PerformancePanel = ({ totalRenders, onTriggerUpdate }) => {
  return (
    <div className="panel">
      <h3>Render Analysis & Optimization</h3>
      <div className="performance-stats">
        <div className="stat-row">
          <span className="stat-label">React.memo (EventCard)</span>
          <span className="stat-value enabled">Enabled</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">useMemo (Filtered Events)</span>
          <span className="stat-value enabled">Enabled</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">useCallback (Handlers)</span>
          <span className="stat-value enabled">Enabled</span>
        </div>
      </div>
      
      <h3 style={{ marginTop: '20px' }}>Render Counter</h3>
      <div className="render-stats">
        <div className="stat-row">
          <span className="stat-label">App Renders</span>
          <span className="stat-value">{totalRenders}</span>
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
          Notice how triggering a state update increments the main app render, but carefully optimized child components (like EventCard) avoid re-rendering unless their specific props change.
        </p>
        <button onClick={onTriggerUpdate} style={{ marginTop: '8px' }}>
          Trigger State Update
        </button>
      </div>

      <h3 style={{ marginTop: '20px' }}>Performance Profiling</h3>
      <div className="performance-stats">
        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          Use <strong>React DevTools Profiler</strong> to analyze component rendering times and commit phases.
        </p>
      </div>
    </div>
  );
};

export default PerformancePanel;
