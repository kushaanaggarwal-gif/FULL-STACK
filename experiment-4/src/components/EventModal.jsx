import React, { useState } from 'react';

const EventModal = ({ event, onUpdate, onDelete, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...event });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  if (!isEditing) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3>
            {event.title}
            {event.important && <span style={{ color: '#eab308', marginLeft: '8px' }}>★</span>}
            {event.completed && <span style={{ color: '#16a34a', marginLeft: '8px' }}>✓</span>}
          </h3>
          <p><strong>Date:</strong> {event.date}</p>
          <p><strong>Time:</strong> {event.time}</p>
          <p><strong>Description:</strong> {event.description}</p>
          <p><strong>Status:</strong> {event.completed ? 'Completed' : 'Pending'}</p>
          <div className="modal-actions" style={{ flexWrap: 'wrap' }}>
            <button 
              onClick={() => onUpdate({ ...event, completed: !event.completed })}
              style={{ marginRight: 'auto', backgroundColor: event.completed ? '#f3f4f6' : '#16a34a', color: event.completed ? 'inherit' : 'white', borderColor: event.completed ? 'var(--border-color)' : '#16a34a' }}
            >
              {event.completed ? 'Mark Incomplete' : '✓ Mark Complete'}
            </button>
            <button className="primary" onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => onDelete(event.id)}>Delete</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Edit Event</h3>
        <div className="form-group">
          <label>Title</label>
          <input name="title" value={formData.title} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
            <input type="checkbox" name="completed" checked={!!formData.completed} onChange={handleCheckboxChange} style={{ width: 'auto' }} />
            Mark as Completed
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
            <input type="checkbox" name="important" checked={!!formData.important} onChange={handleCheckboxChange} style={{ width: 'auto' }} />
            Important Event
          </label>
        </div>
        <div className="modal-actions">
          <button className="primary" onClick={handleSave}>Save Changes</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
