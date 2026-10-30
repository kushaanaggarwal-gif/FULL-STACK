export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  isCompleted?: boolean;
  isImportant?: boolean;
}

export const initialEvents: CalendarEvent[] = [
  { id: 'evt-1', title: 'Team Meeting', date: new Date().toISOString().split('T')[0] },
  { id: 'evt-2', title: 'Project Review', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
  { id: 'evt-3', title: 'Lecture', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { id: 'evt-4', title: 'Lab Session', date: new Date().toISOString().split('T')[0] },
  { id: 'evt-5', title: 'Assignment', date: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
  { id: 'evt-6', title: 'Presentation', date: new Date(Date.now() + 259200000).toISOString().split('T')[0] },
];
