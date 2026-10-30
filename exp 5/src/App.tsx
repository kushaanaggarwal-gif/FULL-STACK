import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Posts } from './components/Posts';
import { ApiResponse } from './components/ApiResponse';
import { Logs } from './components/Logs';
import { Architecture } from './components/Architecture';
import { CorsDemo } from './components/CorsDemo';
import { Scheduler } from './components/Scheduler';
import { Takeaways } from './components/Takeaways';

import { LogEntry, ApiResponseData } from './types';
import { MockApiService, resetData } from './utils/mockApi';

type Tab = 'posts' | 'architecture';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastResponse, setLastResponse] = useState<ApiResponseData | null>(null);

  const addLog = (log: LogEntry) => {
    setLogs(prev => [log, ...prev].slice(0, 50));
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const api = useMemo(() => new MockApiService(addLog, setLastResponse), []);

  const handleResetDemo = () => {
    resetData();
    window.location.reload();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts': return <><Posts api={api} /><Scheduler api={api} /></>;
      case 'architecture': return <><Architecture /><CorsDemo /></>;
      default: return <><Posts api={api} /><Scheduler api={api} /></>;
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Posts API & Scheduler</button>
        <button className={`tab-btn ${activeTab === 'architecture' ? 'active' : ''}`} onClick={() => setActiveTab('architecture')}>Architecture & CORS</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', alignItems: 'start', minHeight: '400px' }}>
        {renderTabContent()}
      </div>
      <div className="grid-2">
        <ApiResponse response={lastResponse} />
        <Logs logs={logs} clearLogs={clearLogs} api={api} />
      </div>
      <Takeaways />
      <footer style={{ textAlign: 'center', marginTop: '20px', padding: '20px', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>Unit 2 • Experiment 5 • Spring Boot REST API Design & Exception Handling</p>
        <button onClick={handleResetDemo} className="secondary" style={{ marginTop: '10px', fontSize: '0.8rem' }}>Reset Demo</button>
      </footer>
    </div>
  );
}

export default App;
