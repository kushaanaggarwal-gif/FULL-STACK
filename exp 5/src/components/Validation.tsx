import { useState } from 'react';
import { MockApiService } from '../utils/mockApi';
import { ApiResponseData } from '../types';

interface ValidationProps {
  api: MockApiService;
}

export const Validation: React.FC<ValidationProps> = ({ api }) => {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string; status?: number } | null>(null);

  const handleSubmit = async (testContent: string) => {
    try {
      await api.createPost(testContent);
      setResult({ success: true, message: 'Validation passed' });
    } catch (e: any) {
      if (e && e.status === 'error') {
         const res = e as ApiResponseData;
         // Strip the prefix to match exactly what is requested, if needed
         const msg = res.message.replace('Validation failed: ', '');
         setResult({ success: false, message: msg, status: res.meta.statusCode });
      }
    }
  };

  const handleTestEmpty = () => {
    setContent('');
    handleSubmit('');
  };

  const handleTestTooLong = () => {
    const tooLongText = 'a'.repeat(281);
    setContent(tooLongText);
    handleSubmit(tooLongText);
  };

  const handleNormalSubmit = () => {
    handleSubmit(content);
  };

  return (
    <div className="panel">
      <h3>Bean Validation</h3>
      <p style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>
        Ensures input correctness before processing and prevents invalid data propagation.
      </p>
      
      <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Post Content</label>
        
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter post content..."
          style={{ width: '100%', minHeight: '80px', marginBottom: '5px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'inherit' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          <span>Required • Maximum 280 characters</span>
          <span>{content.length} / 280</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <button onClick={handleNormalSubmit}>Submit</button>
          <button onClick={handleTestEmpty} className="secondary">Test Empty Input</button>
          <button onClick={handleTestTooLong} className="secondary">Test &gt;280 Characters</button>
        </div>

        {result && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            {result.success ? (
              <div style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>✓</span> {result.message}
              </div>
            ) : (
              <div>
                <div style={{ color: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>✕</span> {result.message}
                </div>
                {result.status && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {result.status} Bad Request
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
