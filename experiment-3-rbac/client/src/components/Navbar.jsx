import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <header className="mini-navbar">
      <div className="mini-nav-container">
        {/* Brand */}
        <div className="mini-brand">
          <Shield size={18} className="text-primary" />
          <span>RBAC Portal</span>
        </div>

        {/* Route Links */}
        <nav className="mini-nav-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'mini-link active' : 'mini-link')}
          >
            Dashboard
          </NavLink>

          {hasRole('Admin', 'Editor') && (
            <NavLink
              to="/editor-panel"
              className={({ isActive }) => (isActive ? 'mini-link active' : 'mini-link')}
            >
              Editor Panel
            </NavLink>
          )}

          {hasRole('Admin') && (
            <NavLink
              to="/admin-panel"
              className={({ isActive }) => (isActive ? 'mini-link active' : 'mini-link')}
            >
              Admin Panel
            </NavLink>
          )}
        </nav>

        {/* User Identity & Logout */}
        <div className="mini-nav-user">
          <span className="user-email-text">{user?.email}</span>
          <span className={`tag tag-${user?.role?.toLowerCase()}`}>{user?.role}</span>
          <button onClick={handleLogout} className="btn-logout-mini">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
