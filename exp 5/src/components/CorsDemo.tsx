
export const CorsDemo: React.FC = () => {
  return (
    <div className="panel">
      <h3>CORS — Cross-Origin Resource Sharing</h3>
      <p style={{ marginBottom: '15px' }}>
        "Allows a frontend from a different origin to access the API while controlling unauthorized cross-origin requests."
      </p>
      
      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p><strong>Frontend Origin:</strong> <code>http://localhost:3000</code></p>
          <p style={{ marginTop: '5px' }}><strong>API Endpoint:</strong> <code>/api/posts</code></p>
        </div>
        <div>
          <span className="badge success" style={{ padding: '8px 12px', fontSize: '1rem' }}>CORS: Enabled</span>
        </div>
      </div>
    </div>
  );
};
