import { MockApiService } from '../utils/mockApi';

interface GlobalExceptionDemoProps {
  api: MockApiService;
}

export const GlobalExceptionDemo: React.FC<GlobalExceptionDemoProps> = ({ api }) => {
  const triggerValidationException = async () => {
    try {
      await api.createPost('');
    } catch (e) {}
  };

  const triggerGenericException = async () => {
    try {
      await api.triggerGenericException();
    } catch (e) {}
  };

  return (
    <div className="panel">
      <h3>Global Exception Handling</h3>
      <p style={{ marginBottom: '15px' }}>
        "Exceptions are handled centrally to provide consistent error responses."
      </p>
      
      <div className="grid-2">
        <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          <h4>Validation Exception</h4>
          <p className="code-block" style={{ padding: '5px', margin: '10px 0' }}>MethodArgumentNotValidException</p>
          <p>Response: <code>400 Bad Request</code></p>
          <p>Message: <code>Validation failed</code></p>
          <button onClick={triggerValidationException} style={{ marginTop: '10px' }}>Trigger Validation Error</button>
        </div>

        <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
          <h4>Generic Exception</h4>
          <p className="code-block" style={{ padding: '5px', margin: '10px 0' }}>Exception</p>
          <p>Response: <code>500 Internal Server Error</code></p>
          <p>Message: <code>Internal Server Error</code></p>
          <button onClick={triggerGenericException} style={{ marginTop: '10px' }}>Trigger Generic Error</button>
        </div>
      </div>
    </div>
  );
};
