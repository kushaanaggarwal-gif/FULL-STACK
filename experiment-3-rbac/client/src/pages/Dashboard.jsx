import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Trash2, Edit2, Check, X, RefreshCw, AlertTriangle, Lock } from 'lucide-react';

const Dashboard = () => {
  const { user, hasRole, simulateExpireToken, isTokenExpired, renewSessionToken } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [viewingArticle, setViewingArticle] = useState(null);
  const [tokenTime, setTokenTime] = useState(15);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadArticles = async () => {
    if (isTokenExpired) {
      showNotification('❌ Action Blocked: Token is expired! Cannot fetch articles.', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/content');
      setArticles(res.data.data || []);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error loading articles. Task blocked!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isTokenExpired) {
      loadArticles();
    } else {
      setLoading(false);
    }
  }, [isTokenExpired]);

  // 15-second token lifespan timer
  useEffect(() => {
    if (isTokenExpired) {
      setTokenTime(0);
      return;
    }

    const timer = setInterval(() => {
      setTokenTime((prev) => {
        if (prev <= 1) {
          simulateExpireToken();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTokenExpired]);

  // Helper guard to check if token is valid before executing tasks
  const checkTokenValidBeforeTask = (taskName) => {
    if (isTokenExpired || tokenTime === 0) {
      showNotification(`❌ Task Blocked: Cannot ${taskName}! Token has expired. Renew token to perform tasks.`, 'error');
      return false;
    }
    return true;
  };

  // 1. View Action
  const handleView = (article) => {
    if (!checkTokenValidBeforeTask('view content')) return;
    setViewingArticle(article);
  };

  // 2. Edit Action
  const startEdit = (article) => {
    if (!checkTokenValidBeforeTask('edit content')) return;
    setEditingId(article.id);
    setEditText(article.title);
  };

  const saveEdit = async (id) => {
    if (!checkTokenValidBeforeTask('save edit')) return;
    try {
      const res = await api.post('/content/edit', { id, title: editText });
      showNotification(res.data.message || 'Article updated', 'success');
      setEditingId(null);
      loadArticles();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Task failed: Token expired or unauthorized!', 'error');
    }
  };

  // 3. Delete Action
  const handleDelete = async (id) => {
    if (!checkTokenValidBeforeTask('delete content')) return;
    try {
      const res = await api.delete(`/content/delete/${id}`);
      showNotification(res.data.message || 'Article deleted', 'success');
      if (viewingArticle?.id === id) setViewingArticle(null);
      loadArticles();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Task failed: Token expired or unauthorized!', 'error');
    }
  };

  // Manually trigger token expiry to demonstrate task blocking
  const handleSimulateExpiry = () => {
    simulateExpireToken();
    setTokenTime(0);
    showNotification('⛔ Access Token Expired! All task actions are now BLOCKED.', 'error');
  };

  // Renew token to restore task permissions
  const handleRenewToken = async () => {
    setIsRefreshing(true);
    const result = await renewSessionToken();
    setIsRefreshing(false);
    if (result.success) {
      setTokenTime(15);
      showNotification('✅ Token Renewed! Task access restored.', 'success');
      loadArticles();
    } else {
      showNotification('❌ Failed to renew token. Please log in again.', 'error');
    }
  };

  return (
    <div className="mini-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`mini-toast mini-toast-${notification.type}`}>
          {notification.msg}
        </div>
      )}

      {/* Header with Token Lifespan & Renewal Control */}
      <div className="mini-header">
        <div>
          <h2>Dashboard</h2>
          <p className="subtext">
            Signed in as <strong>{user?.name}</strong> • Role: <span className="tag">{user?.role}</span>
          </p>
        </div>

        <div className={`token-pill ${isTokenExpired ? 'token-pill-expired' : ''}`}>
          <span>
            Token Status:{' '}
            {isTokenExpired ? (
              <strong className="text-danger">EXPIRED (Tasks Blocked)</strong>
            ) : (
              <strong className="text-success">{tokenTime}s active</strong>
            )}
          </span>

          {isTokenExpired ? (
            <button
              onClick={handleRenewToken}
              className="btn-renew"
              disabled={isRefreshing}
              title="Renew access token to restore task permissions"
            >
              <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
              <span>Renew Token</span>
            </button>
          ) : (
            <button
              onClick={handleSimulateExpiry}
              className="btn-link text-danger"
              title="Forces token expiry to block tasks"
            >
              Expire Token
            </button>
          )}
        </div>
      </div>

      {/* PROMINENT TASK BLOCKED WARNING BANNER */}
      {isTokenExpired && (
        <div className="blocked-banner">
          <Lock size={18} className="text-danger" />
          <div className="blocked-text">
            <strong>Tasks Disabled (Token Expired)</strong>
            <p>You cannot View, Edit, or Delete content while your access token is expired. Click <strong>"Renew Token"</strong> above to resume task execution.</p>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="mini-card">
        <div className="mini-card-head">
          <h3>Protected Content Library</h3>
          <button 
            onClick={loadArticles} 
            className="btn-sm"
            disabled={isTokenExpired}
          >
            Reload
          </button>
        </div>

        {loading ? (
          <div className="loading-row">Loading content...</div>
        ) : isTokenExpired && articles.length === 0 ? (
          <div className="loading-row text-danger">
            ⛔ Tasks Blocked: Token is expired. Renew token to load articles.
          </div>
        ) : (
          <div className="article-rows">
            {articles.map((item) => (
              <div key={item.id} className={`article-row ${isTokenExpired ? 'row-disabled' : ''}`}>
                <div className="article-info">
                  {editingId === item.id ? (
                    <div className="edit-inline">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="input-mini"
                        disabled={isTokenExpired}
                        autoFocus
                      />
                      <button 
                        onClick={() => saveEdit(item.id)} 
                        className="btn-icon text-success"
                        disabled={isTokenExpired}
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)} 
                        className="btn-icon text-muted"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4 className="row-title">{item.title}</h4>
                      <p className="row-author">By {item.author} • {item.lastModified}</p>
                    </>
                  )}
                </div>

                {/* Conditional RBAC & Token Protected Action Buttons */}
                <div className="row-actions">
                  {/* 1. View Button (Requires Valid Token) */}
                  <button 
                    onClick={() => handleView(item)} 
                    className={`btn-action ${isTokenExpired ? 'btn-disabled' : ''}`}
                    title={isTokenExpired ? 'Blocked: Token Expired' : 'View Content'}
                  >
                    View
                  </button>

                  {/* 2. Edit Button (Admin and Editor + Valid Token) */}
                  {hasRole('Admin', 'Editor') && (
                    <button 
                      onClick={() => startEdit(item)} 
                      className={`btn-action ${isTokenExpired ? 'btn-disabled' : ''}`}
                      title={isTokenExpired ? 'Blocked: Token Expired' : 'Edit Content'}
                    >
                      Edit
                    </button>
                  )}

                  {/* 3. Delete Button (Admin Only + Valid Token) */}
                  {hasRole('Admin') && (
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className={`btn-action text-danger ${isTokenExpired ? 'btn-disabled' : ''}`}
                      title={isTokenExpired ? 'Blocked: Token Expired' : 'Delete Content'}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail View */}
      {viewingArticle && !isTokenExpired && (
        <div className="mini-modal">
          <div className="mini-modal-content">
            <div className="mini-modal-header">
              <h3>{viewingArticle.title}</h3>
              <button onClick={() => setViewingArticle(null)} className="btn-close">
                <X size={16} />
              </button>
            </div>
            <p className="modal-desc">{viewingArticle.summary}</p>
            <div className="modal-footer">
              <span>Author: {viewingArticle.author}</span>
              <span>Date: {viewingArticle.lastModified}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
