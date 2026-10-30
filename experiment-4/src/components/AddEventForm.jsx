import React, { useState } from 'react';

const AddEventForm = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAdd(formData);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Add New Event</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input 
              type="time" 
              name="time" 
              value={formData.time} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3" 
            />
          </div>
          <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
              <input type="checkbox" name="completed" checked={!!formData.completed} onChange={handleCheckboxChange} style={{ width: 'auto' }} />
              Completed
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
              <input type="checkbox" name="important" checked={!!formData.important} onChange={handleCheckboxChange} style={{ width: 'auto' }} />
              Important
            </label>
          </div>
          <div className="modal-actions">
            <button type="submit" className="primary">Add Event</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventForm;
