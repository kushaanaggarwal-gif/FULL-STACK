import React, { useRef } from 'react';
import type { CalendarEvent } from '../utils/mockData';
import EventCard from './EventCard';
import './CalendarDay.css';

interface CalendarDayProps {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  events: CalendarEvent[];
  isToday: boolean;
  onEventMove: (eventId: string, newDate: string) => void;
  onEventDelete: (eventId: string) => void;
  onEventUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ date, dayNumber, events, isToday, onEventMove, onEventDelete, onEventUpdate }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('drag-over');
    }
    const eventId = e.dataTransfer.getData('eventId');
    if (eventId) {
      onEventMove(eventId, date);
    }
  };

  return (
    <div 
      className={`calendar-day ${isToday ? 'today' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="day-header">
        <span className="day-number">{dayNumber}</span>
        <span className="day-render-count" title="Day Component Renders">R:{renderCount.current}</span>
      </div>
      <div className="day-events">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onDelete={onEventDelete}
            onUpdate={onEventUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarDay;
