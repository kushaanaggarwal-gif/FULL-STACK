import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX, ArrowLeft, LogOut, Lock } from 'lucide-react';

const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requiredRoles = location.state?.requiredRoles || [];
  const currentRole = location.state?.currentRole || user?.role || 'Unknown';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon-circle">
          <ShieldX size={36} className="text-danger" />
        </div>
        <h2>403 - Access Restricted</h2>
        <p className="unauthorized-subtitle">
          Your active role does not have authorization to view this protected resource.
        </p>

        <div className="rbac-context-box">
          <div className="rbac-row">
            <span className="rbac-label">Your Current Role:</span>
            <span className="role-badge badge-default">{currentRole}</span>
          </div>
          {requiredRoles.length > 0 && (
            <div className="rbac-row">
              <span className="rbac-label">Required Role(s):</span>
              <span className="rbac-allowed">{requiredRoles.join(' or ')}</span>
            </div>
          )}
        </div>

        <div className="unauthorized-actions">
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
          <button onClick={handleLogout} className="btn btn-outline">
            <LogOut size={16} />
            <span>Switch User Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
