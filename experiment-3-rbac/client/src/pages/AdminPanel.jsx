import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const USERS_LIST = [
  { id: 1, name: 'Eleanor Admin', email: 'admin@app.com', role: 'Admin', perms: 'Create, Edit, Delete, Read' },
  { id: 2, name: 'Ethan Editor', email: 'editor@app.com', role: 'Editor', perms: 'Create, Edit, Read' },
  { id: 3, name: 'Victor Viewer', email: 'viewer@app.com', role: 'Viewer', perms: 'Read only' }
];

const AdminPanel = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.get('/admin/metrics')
      .then(res => setMetrics(res.data.metrics))
      .catch(() => {});
  }, []);

  return (
    <div className="mini-container">
      <div className="mini-header">
        <div>
          <h2>Admin Panel</h2>
          <p className="subtext">
            Restricted strictly to <strong>Admin</strong> (Root permissions).
          </p>
        </div>
        <span className="tag tag-admin">Root Admin</span>
      </div>

      {/* Clean Quick Stats Bar */}
      <div className="mini-stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total Users</span>
          <span className="stat-val">{metrics?.totalUsers ?? '3'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Server Status</span>
          <span className="stat-val text-success">Online (99.9%)</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Session</span>
          <span className="stat-val">{user?.email}</span>
        </div>
      </div>

      {/* Clean Minimal Role Table */}
      <div className="mini-card mt-3">
        <div className="mini-card-head">
          <h3>User Role Assignments</h3>
        </div>

        <div className="table-wrap">
          <table className="mini-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {USERS_LIST.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`tag tag-${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="text-sm">{u.perms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
