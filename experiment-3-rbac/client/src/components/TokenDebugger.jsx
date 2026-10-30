import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToAuthEvents } from '../api/api';
import api from '../api/api';
import { RefreshCw, Zap, ShieldAlert, CheckCircle2, Clock, Trash2 } from 'lucide-react';

const TokenDebugger = () => {
  const { simulateExpireToken, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [isSimulatedExpired, setIsSimulatedExpired] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  // Subscribe to central Axios Interceptor events
  useEffect(() => {
    const unsubscribe = subscribeToAuthEvents((eventData) => {
      setLogs((prev) => [eventData, ...prev.slice(0, 19)]);
      if (eventData.event === 'TOKEN_REFRESH_SUCCESS') {
        setSecondsRemaining(15);
        setIsSimulatedExpired(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 15-second countdown timer to visualize short-lived access token
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSimulateExpiration = () => {
    simulateExpireToken();
    setIsSimulatedExpired(true);
    setSecondsRemaining(0);
    setLogs((prev) => [
      {
        event: 'MANUAL_CORRUPT',
        data: { message: 'Access Token intentionally corrupted/expired to test interceptor!' },
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  const handleTestApiCall = async () => {
    setTestStatus('Executing API request...');
    try {
      const res = await api.get('/content');
      setTestStatus(`Success (200 OK): Loaded ${res.data.data?.length || 0} articles.`);
    } catch (err) {
      setTestStatus(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="token-debugger-card">
      <div className="debugger-header">
        <div className="debugger-title">
          <Zap size={18} className="text-accent" />
          <h3>Token Rotation & Interceptor Live Monitor</h3>
        </div>
        <div className="token-status-pill">
          <Clock size={14} />
          <span>
            {isSimulatedExpired ? (
              <strong className="text-danger">EXPIRED (Simulated)</strong>
            ) : secondsRemaining > 0 ? (
              <>Access Token Lifespan: <strong className="text-accent">{secondsRemaining}s</strong></>
            ) : (
              <span className="text-warning">Token Expired (Auto-refreshes on next call)</span>
            )}
          </span>
        </div>
      </div>

      <div className="debugger-body">
        <p className="debugger-desc">
          Demonstrates short-lived Access Tokens (15s) paired with silent Refresh Tokens. 
          When an access token expires or is corrupted, the Axios <strong>Response Interceptor</strong> captures the 401 error, automatically requests a fresh token, and retries the request seamlessly.
        </p>

        <div className="debugger-actions">
          <button 
            onClick={handleSimulateExpiration} 
            className="btn btn-warning btn-sm"
            title="Corrupt/Expire token now"
          >
            <ShieldAlert size={15} />
            <span>Simulate Token Expiration</span>
          </button>

          <button 
            onClick={handleTestApiCall} 
            className="btn btn-primary btn-sm"
          >
            <RefreshCw size={15} />
            <span>Trigger API Call (Test Interceptor)</span>
          </button>

          {logs.length > 0 && (
            <button 
              onClick={clearLogs} 
              className="btn btn-ghost btn-sm"
              title="Clear event logs"
            >
              <Trash2 size={14} />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {testStatus && (
          <div className="test-status-box">
            <CheckCircle2 size={15} className="text-success" />
            <span>{testStatus}</span>
          </div>
        )}

        {/* Live Interceptor Console */}
        <div className="log-console">
          <div className="log-console-header">
            <span>Interceptor Event Stream</span>
            <span className="log-count">{logs.length} events</span>
          </div>
          <div className="log-console-body">
            {logs.length === 0 ? (
              <div className="log-empty">Waiting for network requests or token actions...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className={`log-entry log-${log.event?.toLowerCase()}`}>
                  <span className="log-time">{log.timestamp}</span>
                  <span className="log-badge">{log.event}</span>
                  <span className="log-msg">
                    {log.data?.message || log.data?.url || log.data?.reason || JSON.stringify(log.data)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDebugger;
