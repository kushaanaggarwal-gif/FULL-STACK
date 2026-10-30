import React, { useRef } from 'react';

const EventCard = React.memo(({ event, onClick }) => {
  const renderCount = useRef(0);
  renderCount.current++;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", event.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div 
      className="event-card"
      draggable="true"
      onDragStart={handleDragStart}
      onClick={onClick}
      title={event.title}
      data-testid="event-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="event-title">
          {event.important && <span style={{ color: '#eab308', marginRight: '4px' }}>★</span>}
          {event.completed && <span style={{ color: '#16a34a', marginRight: '4px' }}>✓</span>}
          <span style={{ textDecoration: event.completed ? 'line-through' : 'none' }}>
            {event.title}
          </span>
        </span>
        <span className="render-counter-badge" title="Component Renders">{renderCount.current}</span>
      </div>
      <div className="event-time">{event.time}</div>
    </div>
  );
});

export default EventCard;
