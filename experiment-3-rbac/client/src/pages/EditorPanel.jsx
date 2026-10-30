import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Plus, Lock } from 'lucide-react';

const EditorPanel = () => {
  const { user, isTokenExpired } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadDrafts = async () => {
    if (isTokenExpired) {
      showNotification('❌ Task Blocked: Token is expired!', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/editor/drafts');
      setDrafts(res.data.drafts || []);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to load drafts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isTokenExpired) {
      loadDrafts();
    } else {
      setLoading(false);
    }
  }, [isTokenExpired]);

  const handleAddDraft = (e) => {
    e.preventDefault();
    if (isTokenExpired) {
      showNotification('❌ Task Blocked: Cannot add draft while token is expired!', 'error');
      return;
    }
    if (!newTitle.trim()) return;

    const newItem = {
      id: Date.now(),
      title: newTitle,
      status: 'Ready for Review'
    };

    setDrafts([newItem, ...drafts]);
    setNewTitle('');
    showNotification('Draft created successfully', 'success');
  };

  return (
    <div className="mini-container">
      {notification && (
        <div className={`mini-toast mini-toast-${notification.type}`}>
          {notification.msg}
        </div>
      )}

      <div className="mini-header">
        <div>
          <h2>Editor Panel</h2>
          <p className="subtext">
            Restricted to <strong>Admin</strong> and <strong>Editor</strong> roles.
          </p>
        </div>
        <span className="tag tag-editor">Editor Access</span>
      </div>

      {isTokenExpired && (
        <div className="blocked-banner">
          <Lock size={18} className="text-danger" />
          <div className="blocked-text">
            <strong>Editor Tasks Blocked</strong>
            <p>Your access token has expired. You cannot create or edit drafts until you renew your session token from the Dashboard.</p>
          </div>
        </div>
      )}

      {/* Quick Draft Input */}
      <form onSubmit={handleAddDraft} className="mini-create-bar">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New draft title..."
          className="input-mini flex-1"
          disabled={isTokenExpired}
          required
        />
        <button 
          type="submit" 
          className={`btn-primary-mini ${isTokenExpired ? 'btn-disabled' : ''}`}
          disabled={isTokenExpired}
        >
          <Plus size={15} />
          <span>Add Draft</span>
        </button>
      </form>

      {/* Draft List */}
      <div className="mini-card mt-3">
        <div className="mini-card-head">
          <h3>Active Drafts</h3>
          <button 
            onClick={loadDrafts} 
            className="btn-sm"
            disabled={isTokenExpired}
          >
            Reload
          </button>
        </div>

        {loading ? (
          <div className="loading-row">Loading drafts...</div>
        ) : isTokenExpired && drafts.length === 0 ? (
          <div className="loading-row text-danger">⛔ Tasks Blocked: Token is expired.</div>
        ) : (
          <div className="article-rows">
            {drafts.map((draft) => (
              <div key={draft.id} className={`article-row ${isTokenExpired ? 'row-disabled' : ''}`}>
                <div>
                  <h4 className="row-title">{draft.title}</h4>
                  <span className="badge-subtle">{draft.status}</span>
                </div>
                <span className="text-muted text-sm">Editable by {user?.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPanel;
