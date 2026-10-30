
export const Architecture: React.FC = () => {
  return (
    <div className="panel">
      <h3>Layered Architecture & Filters</h3>
      
      <div style={{ marginBottom: '30px' }}>
        <h4>Request Pipeline (Filters & Interceptors)</h4>
        <div className="arch-diagram" style={{ marginTop: '15px' }}>
          <div className="arch-box" style={{ backgroundColor: '#fff' }}>
            <strong>Request</strong>
          </div>
          <div className="arch-arrow">↓</div>
          <div className="arch-box">
            <strong>Logging Filter</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '5px', color: 'var(--text-secondary)' }}>
              Intercepts & Logs
            </div>
          </div>
          <div className="arch-arrow">↓</div>
          <div className="arch-box">
            <strong>Correlation ID Interceptor</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '5px', color: 'var(--text-secondary)' }}>
              Adds Trace ID
            </div>
          </div>
          <div className="arch-arrow">↓</div>
          <div className="arch-box" style={{ backgroundColor: '#fff' }}>
            <strong>Controller</strong>
          </div>
        </div>
      </div>

      <div>
        <h4>Layered Architecture</h4>
        <p style={{ margin: '10px 0', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
          "Separating responsibilities improves modularity and maintainability."
        </p>
        <div className="arch-diagram">
          <div className="arch-box">
            <strong>Controller</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Handles HTTP requests.</div>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-box">
            <strong>Service</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Contains business logic.</div>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-box">
            <strong>Repository</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Handles data access.</div>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-box">
            <strong>Database</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>Stores application data.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
