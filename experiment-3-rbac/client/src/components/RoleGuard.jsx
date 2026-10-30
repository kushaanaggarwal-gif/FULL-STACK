import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard Component
 * RBAC Route Protection: Validates whether the authenticated user possesses the required role(s).
 * 
 * @param {Array<string>} allowedRoles - e.g. ['Admin'], ['Admin', 'Editor']
 * @param {React.ReactNode} children - The component/page to render if authorized
 */
const RoleGuard = ({ allowedRoles = [], requiredPermission = null, children }) => {
  const { user, hasRole, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return <Navigate to="/unauthorized" state={{ requiredRoles: allowedRoles, currentRole: user.role }} replace />;
  }

  // Check permission authorization if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" state={{ requiredPermission, currentRole: user.role }} replace />;
  }

  return children;
};

export default RoleGuard;
