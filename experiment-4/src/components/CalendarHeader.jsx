import React from 'react';

const CalendarHeader = React.memo(({ 
  currentDate, 
  onPrevMonth, 
  onNextMonth, 
  onToday, 
  searchTerm, 
  onSearchChange,
  onAddClick 
}) => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const currentMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div className="calendar-controls">
      <div className="controls-left">
        <button onClick={onToday} aria-label="Go to today">Today</button>
        <div className="month-nav">
          <button onClick={onPrevMonth} aria-label="Previous month">←</button>
          <h2>{currentMonthYear}</h2>
          <button onClick={onNextMonth} aria-label="Next month">→</button>
        </div>
      </div>
      <div className="controls-right">
        <input 
          type="text" 
          className="search-input"
          placeholder="Search events..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button className="primary" onClick={onAddClick}>Add Event</button>
      </div>
    </div>
  );
});

export default CalendarHeader;
