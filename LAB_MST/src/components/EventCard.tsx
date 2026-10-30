import React, { useRef } from 'react';
import type { CalendarEvent } from '../utils/mockData';
import './EventCard.css';

interface EventCardProps {
  event: CalendarEvent;
  onDelete: (eventId: string) => void;
  onUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void;
}

const EventCard: React.FC<EventCardProps> = React.memo(({ event, onDelete, onUpdate }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('eventId', event.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('dragging');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('dragging');
    }
  };

  const handleEdit = () => {
    const newTitle = window.prompt('Edit Event Title:', event.title);
    if (newTitle && newTitle.trim() !== '') {
      onUpdate(event.id, { title: newTitle.trim() });
    }
  };

  return (
    <div
      className={`event-card ${event.isCompleted ? 'completed' : ''} ${event.isImportant ? 'important' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={`Rendered ${renderCount.current} times`}
    >
      <div className="event-content">
        {event.isImportant && <span className="event-icon" title="Important">★</span>}
        <div className="event-title">{event.title}</div>
      </div>
      
      <div className="event-actions">
        <button 
          className="action-btn" 
          onClick={(e) => { e.stopPropagation(); onUpdate(event.id, { isCompleted: !event.isCompleted }); }}
          title="Toggle Completed"
        >
          {event.isCompleted ? '✓' : '○'}
        </button>
        <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleEdit(); }} title="Edit">✎</button>
        <button className="action-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(event.id); }} title="Delete">×</button>
      </div>
    </div>
  );
});

export default EventCard;
