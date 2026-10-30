import React, { useState } from 'react';
import EventCard from './EventCard';

const CalendarDay = React.memo(({ dayData, onEventClick, onDropEvent }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  if (dayData.empty) {
    return <div className="calendar-day empty"></div>;
  }

  const handleDragOver = (e) => {
    e.preventDefault(); // allow drop
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const eventId = e.dataTransfer.getData("text/plain");
    if (eventId) {
      onDropEvent(eventId, dayData.date);
    }
  };

  return (
    <div 
      className={`calendar-day ${dayData.isToday ? 'today' : ''} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-date={dayData.date}
    >
      <span className="day-number">{dayData.dayNumber}</span>
      <div className="events-container">
        {dayData.events.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            onClick={() => onEventClick(event)}
          />
        ))}
      </div>
    </div>
  );
});

export default CalendarDay;
