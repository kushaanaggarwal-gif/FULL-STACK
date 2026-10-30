import React, { useState, useMemo, useCallback, useRef } from 'react';
import CalendarHeader from './components/CalendarHeader';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import AddEventForm from './components/AddEventForm';
import PerformancePanel from './components/PerformancePanel';
import TestingPanel from './components/TestingPanel';

const INITIAL_EVENTS = [
  { id: '1', title: 'Team Meeting', date: '2026-10-05', time: '10:00', description: 'Weekly sync', completed: true },
  { id: '2', title: 'Project Discussion', date: '2026-10-06', time: '14:00', description: 'Discuss requirements', important: true },
  { id: '3', title: 'React Lab', date: '2026-10-12', time: '09:00', description: 'Experiment 4', completed: true, important: true },
  { id: '4', title: 'Testing Session', date: '2026-10-15', time: '11:00', description: 'Writing unit tests' },
  { id: '5', title: 'Presentation', date: '2026-10-20', time: '15:00', description: 'Final review', important: true },
  { id: '6', title: 'Code Review', date: '2026-10-22', time: '13:00', description: 'Peer review' },
  { id: '7', title: 'Documentation', date: '2026-10-25', time: '16:00', description: 'Update README' },
  { id: '8', title: 'Assignment Submission', date: '2026-10-28', time: '23:59', description: 'Submit via portal', important: true },
];

function App() {
  const renderCount = useRef(0);
  renderCount.current++;

  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date('2026-10-01'));
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  const [statusMessage, setStatusMessage] = useState('');
  const [dummyState, setDummyState] = useState(0);

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Optimization: useMemo for filtering events
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    return events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [events, searchTerm]);

  // Optimization: useCallback for handlers
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleAddEvent = useCallback((newEvent) => {
    setEvents(prev => [...prev, { ...newEvent, id: Date.now().toString() }]);
    setIsAddingEvent(false);
    showStatus('Event added successfully');
  }, []);

  const handleUpdateEvent = useCallback((updatedEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setSelectedEvent(null);
    showStatus('Event updated successfully');
  }, []);

  const handleDeleteEvent = useCallback((id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
    showStatus('Event deleted');
  }, []);

  const handleDropEvent = useCallback((eventId, newDateStr) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return { ...e, date: newDateStr };
      }
      return e;
    }));
    showStatus('Event moved successfully');
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>Interactive Calendar</h1>
          <p>Experiment 4 — Optimization & Testing</p>
        </div>
        <div className="status-indicators">
          <span>Events: {events.length}</span>
          <span>Optimization: Enabled</span>
          <span>Tests: Ready</span>
        </div>
      </header>

      <div className="main-content">
        <section className="calendar-section">
          <CalendarHeader 
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClick={() => setIsAddingEvent(true)}
          />
          <Calendar 
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={setSelectedEvent}
            onDropEvent={handleDropEvent}
          />
        </section>

        <div className="panels-grid">
          <PerformancePanel 
            totalRenders={renderCount.current} 
            onTriggerUpdate={() => setDummyState(s => s + 1)} 
          />
          <TestingPanel />
        </div>
      </div>

      {isAddingEvent && (
        <AddEventForm 
          onAdd={handleAddEvent}
          onCancel={() => setIsAddingEvent(false)}
        />
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}
    </div>
  );
}

export default App;
