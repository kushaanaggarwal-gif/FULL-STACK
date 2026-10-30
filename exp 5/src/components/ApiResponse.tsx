import { ApiResponseData } from '../types';

interface ApiResponseProps {
  response: ApiResponseData | null;
}

export const ApiResponse: React.FC<ApiResponseProps> = ({ response }) => {
  return (
    <div className="panel">
      <h3>API Response Standardization</h3>
      
      {response ? (
        <>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <span className="badge">Method: {response.meta.method}</span>
            <span className="badge">Endpoint: {response.meta.endpoint}</span>
            <span className={`badge ${response.status === 'success' ? 'success' : 'error'}`}>Status: {response.meta.statusCode}</span>
            <span className="badge">Time: {response.meta.responseTime}ms</span>
            <span className="badge">Trace ID: {response.meta.correlationId.split('-')[0]}...</span>
          </div>
          
          <pre className="code-block">
{JSON.stringify({
  status: response.status,
  message: response.message,
  data: response.data
}, null, 2)}
          </pre>
        </>
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>No API request made yet. Perform an action to see the standardized response.</p>
      )}
    </div>
  );
};
