import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EditorPanel from './pages/EditorPanel';
import AdminPanel from './pages/AdminPanel';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Route: Accessible by ALL authenticated users */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Route: Accessible by Admin and Editor ONLY */}
              <Route
                path="/editor-panel"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['Admin', 'Editor']}>
                      <EditorPanel />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Protected Route: Accessible by Admin ONLY */}
              <Route
                path="/admin-panel"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['Admin']}>
                      <AdminPanel />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-All */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
