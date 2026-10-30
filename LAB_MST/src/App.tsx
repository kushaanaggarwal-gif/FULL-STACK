import React, { useState, useRef } from 'react';
import Calendar from './components/Calendar';
import { useEvents } from './hooks/useEvents';
import './App.css';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, handleEventMove, addEvent, deleteEvent, updateEvent } = useEvents();
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Add event form state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newImportant, setNewImportant] = useState(false);

  // Test Runner State
  const [testState, setTestState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [testData, setTestData] = useState<any>(null);

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addEvent(newTitle, newDate, newImportant);
    setNewTitle('');
    setNewImportant(false);
  };

  const handleRunTests = async () => {
    setTestState('running');
    try {
      const response = await fetch('/api/run-tests');
      if (!response.ok) throw new Error('Test execution failed');
      const data = await response.json();
      setTestData(data);
      setTestState('done');
    } catch (e) {
      setTestState('error');
    }
  };

  const monthYearStr = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title">
          <h1>LAB MST</h1>
          <p>Interactive Calendar Optimization & Testing</p>
        </div>
        <div className="header-controls">
          <button onClick={handlePrevMonth}>Previous</button>
          <button onClick={handleToday}>Today</button>
          <button onClick={handleNextMonth}>Next</button>
          <div className="current-month">{monthYearStr}</div>
        </div>
      </header>

      <div className="add-event-section">
        <form onSubmit={handleAddEvent} className="add-event-form">
          <input 
            type="text" 
            placeholder="Event Title..." 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required 
          />
          <input 
            type="date" 
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required 
          />
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={newImportant}
              onChange={(e) => setNewImportant(e.target.checked)}
            />
            Important
          </label>
          <button type="submit">Add Event</button>
        </form>
      </div>

      <main className="app-main">
        <Calendar 
          currentDate={currentDate} 
          events={events} 
          onEventMove={handleEventMove}
          onEventDelete={deleteEvent}
          onEventUpdate={updateEvent}
        />
      </main>

      <div className="lower-panels">
        <aside className="app-performance-panel">
          <div className="panel-section">
            <h3>Performance Demo</h3>
            <ul>
              <li>App Renders: {renderCount.current}</li>
              <li>Total Events: {events.length}</li>
            </ul>
          </div>
        </aside>

        <aside className="test-report-panel">
          <div className="panel-section">
            <div className="test-report-header">
              <h3>Test Report</h3>
              <button 
                className="run-tests-btn" 
                onClick={handleRunTests}
                disabled={testState === 'running'}
              >
                {testState === 'running' ? 'Running tests...' : testState === 'done' ? 'Run Tests Again' : 'Run Tests'}
              </button>
            </div>
            
            <div className="test-report-content">
              {testState === 'idle' && <p className="test-message">No test run yet. Run the tests to generate a report.</p>}
              {testState === 'running' && <p className="test-message">Running tests...</p>}
              {testState === 'error' && <p className="test-message error">Tests failed to execute correctly.</p>}
              
              {testState === 'done' && testData && (
                <div className="test-results">
                  <div className="test-summary">
                    {(() => {
                      const tr = testData.testResults;
                      if (!tr) return <p>Invalid test data.</p>;
                      const passed = tr.numPassedTests || 0;
                      const failed = tr.numFailedTests || 0;
                      const total = tr.numTotalTests || 0;
                      const skipped = tr.numPendingTests || 0;
                      const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
                      const duration = tr.testResults?.[0]?.endTime && tr.testResults?.[0]?.startTime 
                        ? ((tr.testResults[0].endTime - tr.testResults[0].startTime) / 1000).toFixed(2) 
                        : '0.00';

                      return (
                        <>
                          <div className="summary-grid">
                            <span>Total Tests</span> <span>{total}</span>
                            <span>Passed</span> <span className="passed-text">{passed}</span>
                            <span>Failed</span> <span className={failed > 0 ? "failed-text" : ""}>{failed}</span>
                            <span>Skipped</span> <span>{skipped}</span>
                          </div>
                          <div className="summary-grid mt-2">
                            <span>Pass Rate</span> <span>{passRate}%</span>
                            <span>Execution Time</span> <span>{duration}s</span>
                          </div>

                          <h4 className="mt-3">Test Cases</h4>
                          <div className="test-cases">
                            {tr.testResults?.map((suite: any) => 
                              suite.assertionResults?.map((assertion: any, i: number) => (
                                <div key={i} className="test-case">
                                  <span className={assertion.status === 'passed' ? 'passed-icon' : 'failed-icon'}>
                                    {assertion.status === 'passed' ? '✓' : '✕'}
                                  </span>
                                  <span>{assertion.title}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {testData.coverage && testData.coverage.total && (
                    <div className="coverage-section mt-3">
                      <h4>Coverage</h4>
                      <div className="summary-grid">
                        <span>Statements</span> <span>{testData.coverage.total.statements?.pct}%</span>
                        <span>Branches</span> <span>{testData.coverage.total.branches?.pct}%</span>
                        <span>Functions</span> <span>{testData.coverage.total.functions?.pct}%</span>
                        <span>Lines</span> <span>{testData.coverage.total.lines?.pct}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
