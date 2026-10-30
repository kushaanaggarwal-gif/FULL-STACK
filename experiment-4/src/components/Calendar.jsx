import React, { useMemo, useRef } from 'react';
import CalendarDay from './CalendarDay';

const Calendar = React.memo(({ currentDate, events, onEventClick, onDropEvent }) => {
  const renderCount = useRef(0);
  renderCount.current++;

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    // 0 = Sunday, 1 = Monday. We want Monday to be first (0).
    const startDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    
    const days = [];
    
    // Empty prefix days
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ empty: true, key: `empty-start-${i}` });
    }
    
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
      
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      
      days.push({
        empty: false,
        key: dateStr,
        date: dateStr,
        dayNumber: i,
        events: dayEvents,
        isToday
      });
    }
    
    // Empty suffix days to fill grid (multiple of 7)
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let i = 0; i < remaining; i++) {
      days.push({ empty: true, key: `empty-end-${i}` });
    }
    
    return days;
  }, [currentDate, events]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
        Calendar Renders: <span className="render-counter-badge">{renderCount.current}</span>
      </div>
      <div className="calendar-grid-wrapper">
        <div className="calendar-grid">
          {daysOfWeek.map(day => (
            <div key={day} className="calendar-header-day">{day}</div>
          ))}
          {calendarDays.map((dayData) => (
            <CalendarDay 
              key={dayData.key} 
              dayData={dayData} 
              onEventClick={onEventClick}
              onDropEvent={onDropEvent}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default Calendar;
