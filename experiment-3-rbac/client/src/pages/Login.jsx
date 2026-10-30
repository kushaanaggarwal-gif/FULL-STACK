import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, KeyRound, AlertCircle } from 'lucide-react';

const PRESET_USERS = [
  {
    role: 'Admin',
    name: 'Eleanor Admin',
    email: 'admin@app.com',
    password: 'password123',
    permissions: 'Create, Edit, Delete, Read',
    badgeClass: 'badge-admin',
    desc: 'Unrestricted access to all routes and actions.'
  },
  {
    role: 'Editor',
    name: 'Ethan Editor',
    email: 'editor@app.com',
    password: 'password123',
    permissions: 'Create, Edit, Read',
    badgeClass: 'badge-editor',
    desc: 'Access to Dashboard & Editor Panel. Cannot delete.'
  },
  {
    role: 'Viewer',
    name: 'Victor Viewer',
    email: 'viewer@app.com',
    password: 'password123',
    permissions: 'Read only',
    badgeClass: 'badge-viewer',
    desc: 'Read-only access to Dashboard. Blocked from Editor/Admin panels.'
  }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = async (preset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setError('');
    setIsSubmitting(true);
    const result = await login(preset.email, preset.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-icon-circle">
            <Shield size={28} className="auth-logo" />
          </div>
          <h2>Role-Based Authentication</h2>
          <p className="auth-subtitle">
            Secure JWT authentication with automated token refresh & RBAC route protection.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="e.g. admin@app.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick-Login Preset Users */}
        <div className="quick-presets-section">
          <div className="divider-label">
            <span>Quick 1-Click Role Presets</span>
          </div>

          <div className="presets-list">
            {PRESET_USERS.map((preset) => (
              <button
                key={preset.role}
                type="button"
                className="preset-card"
                onClick={() => handleQuickLogin(preset)}
                disabled={isSubmitting}
              >
                <div className="preset-top">
                  <div className="preset-role-info">
                    <UserCheck size={16} />
                    <span className="preset-name">{preset.name}</span>
                  </div>
                  <span className={`role-badge ${preset.badgeClass}`}>{preset.role}</span>
                </div>
                <div className="preset-meta">
                  <code>{preset.email}</code>
                  <span className="preset-permissions">{preset.permissions}</span>
                </div>
                <p className="preset-desc">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="auth-footer-note">
          <KeyRound size={14} />
          <span>Short-lived access token: 15s | Refresh token: 7d</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
