import React, { useMemo, useRef } from 'react';
import type { CalendarEvent } from '../utils/mockData';
import CalendarDay from './CalendarDay';
import './Calendar.css';

interface CalendarProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventMove: (eventId: string, newDate: string) => void;
  onEventDelete: (eventId: string) => void;
  onEventUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void;
}

const Calendar: React.FC<CalendarProps> = ({ currentDate, events, onEventMove, onEventDelete, onEventUpdate }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  // useMemo to calculate the days of the month grid
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    const days = [];
    
    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNumber: i, dateStr });
    }
    
    return days;
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  // useMemo to group events by date string for O(1) lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(event => {
      const existing = map.get(event.date) || [];
      map.set(event.date, [...existing, event]);
    });
    return map;
  }, [events]);

  const todayStr = new Date().toISOString().split('T')[0];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-container">
      <div className="calendar-info">
        <span className="calendar-render-count">Calendar Renders: {renderCount.current}</span>
      </div>
      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="calendar-header-cell">{day}</div>
        ))}
        {daysInMonth.map((dayInfo, index) => {
          if (!dayInfo) {
            return <div key={`empty-${index}`} className="calendar-day empty"></div>;
          }
          const dayEvents = eventsByDate.get(dayInfo.dateStr) || [];
          return (
            <CalendarDay
              key={dayInfo.dateStr}
              date={dayInfo.dateStr}
              dayNumber={dayInfo.dayNumber}
              events={dayEvents}
              isToday={dayInfo.dateStr === todayStr}
              onEventMove={onEventMove}
              onEventDelete={onEventDelete}
              onEventUpdate={onEventUpdate}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
