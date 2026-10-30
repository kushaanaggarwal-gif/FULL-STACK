import React from 'react';

const TestingPanel = () => {
  return (
    <div className="panel">
      <h3>Testing & Reliability</h3>
      <div className="testing-cards">
        <div className="test-card">
          <h4>Component Testing (React Testing Library)</h4>
          <p>Tests calendar behavior from the user's perspective, verifying DOM nodes and event interactions.</p>
        </div>
        <div className="test-card">
          <h4>API Mocking (Mock Service Worker)</h4>
          <p>Isolates the frontend by intercepting network requests and returning mock data for reliable tests.</p>
        </div>
        <div className="test-card">
          <h4>Coverage (Jest/Vitest)</h4>
          <p>Measures the percentage of code executed during automated test suites.</p>
        </div>
      </div>
      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '16px' }}>
        Note: A basic App.test.jsx is included in the codebase to demonstrate these concepts using React Testing Library.
      </p>
    </div>
  );
};

export default TestingPanel;
