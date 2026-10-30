import { LogEntry } from '../types';
import { MockApiService } from '../utils/mockApi';

interface LogsProps {
  logs: LogEntry[];
  clearLogs: () => void;
  api: MockApiService;
}

export const Logs: React.FC<LogsProps> = ({ logs, clearLogs, api }) => {
  const triggerTestRequest = async () => {
    try {
      await api.getPosts();
    } catch (e) {}
  };

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <h3 style={{ borderBottom: 'none', margin: 0, padding: 0 }}>Logging & Correlation ID Tracing</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={triggerTestRequest} className="secondary">Generate Test Request</button>
          <button onClick={clearLogs} className="danger">Clear Logs</button>
        </div>
      </div>
      
      <p style={{ marginBottom: '15px' }}>
        "Each request receives a unique ID so that related logs can be traced across the system."
      </p>

      <div style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px' }}>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '20px 0' }}>No logs yet.</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="log-entry">
              <span style={{ color: '#6c757d' }}>[{log.timestamp}]</span>{' '}
              <strong style={{ color: log.status >= 400 ? 'var(--error-color)' : 'var(--accent-color)' }}>{log.method}</strong>{' '}
              {log.uri} —{' '}
              <span style={{ color: log.status >= 400 ? 'var(--error-color)' : 'var(--success-color)' }}>{log.status}</span> —{' '}
              {log.timeMs}ms —{' '}
              <span style={{ color: '#888', fontSize: '0.8rem' }}>{log.correlationId}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
