import { useState, useEffect } from 'react';
import { Assignment } from '../types';

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Assignment 1 — REST API Implementation',
    tasks: [
      { id: '1-1', description: 'Create CRUD APIs for posts', completed: false },
      { id: '1-2', description: 'Implement scheduling endpoint', completed: false }
    ]
  },
  {
    id: '2',
    title: 'Assignment 2 — Validation',
    tasks: [
      { id: '2-1', description: 'Add Bean Validation', completed: false },
      { id: '2-2', description: 'Test invalid inputs', completed: false }
    ]
  },
  {
    id: '3',
    title: 'Assignment 3 — Logging Filter',
    tasks: [
      { id: '3-1', description: 'Log request URI', completed: false },
      { id: '3-2', description: 'Log execution time', completed: false }
    ]
  },
  {
    id: '4',
    title: 'Assignment 4 — Exception Handling',
    tasks: [
      { id: '4-1', description: 'Implement global exception handler', completed: false },
      { id: '4-2', description: 'Handle validation and generic exceptions', completed: false }
    ]
  },
  {
    id: '5',
    title: 'Assignment 5 — Advanced: Correlation ID',
    tasks: [
      { id: '5-1', description: 'Add correlation ID using MDC concept', completed: false },
      { id: '5-2', description: 'Verify logs contain request trace', completed: false }
    ]
  }
];

export const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('exp5_assignments');
    if (stored) {
      setAssignments(JSON.parse(stored));
    } else {
      setAssignments(INITIAL_ASSIGNMENTS);
    }
  }, []);

  const toggleTask = (assignmentId: string, taskId: string) => {
    const updated = assignments.map(a => {
      if (a.id === assignmentId) {
        return {
          ...a,
          tasks: a.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return a;
    });
    setAssignments(updated);
    localStorage.setItem('exp5_assignments', JSON.stringify(updated));
  };

  return (
    <div className="panel">
      <h3>Assignments</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {assignments.map(assignment => (
          <div key={assignment.id}>
            <h4 style={{ marginBottom: '10px' }}>{assignment.title}</h4>
            <ul style={{ listStyle: 'none' }}>
              {assignment.tasks.map(task => (
                <li key={task.id} style={{ marginBottom: '8px' }}>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => toggleTask(assignment.id, task.id)}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {task.description}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
