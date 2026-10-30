import { useState } from 'react';
import { MockApiService } from '../utils/mockApi';
import { ApiResponseData } from '../types';

interface SchedulerProps {
  api: MockApiService;
}

export const Scheduler: React.FC<SchedulerProps> = ({ api }) => {
  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [result, setResult] = useState<{ success: boolean; message: string; status?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    try {
      await api.scheduleTask(taskName, date, time);
      setResult({ success: true, message: 'Task scheduled successfully' });
      setTaskName('');
      setDate('');
      setTime('');
    } catch (e: any) {
      if (e && e.status === 'error') {
         const res = e as ApiResponseData;
         const msg = res.message.replace('Validation failed: ', '');
         setResult({ success: false, message: msg, status: res.meta.statusCode });
      }
    }
  };

  return (
    <div className="panel">
      <h3>Scheduling Endpoint <span className="badge" style={{marginLeft: 10, fontWeight: 'normal'}}><code>/api/schedule</code></span></h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', maxWidth: '400px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Task Name</label>
          <input 
            type="text" 
            value={taskName} 
            onChange={(e) => setTaskName(e.target.value)} 
            placeholder="e.g. Database backup"
          />
        </div>
        
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Time</label>
            <input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
            />
          </div>
        </div>
        
        <button type="submit" style={{ marginTop: '5px', width: 'fit-content' }}>Schedule Task</button>

        {result && (
          <div style={{ marginTop: '5px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
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
      </form>
    </div>
  );
};
