// src/components/auth/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminRoute = ({ children }) => {
  const { currentAdmin, loading } = useAdminAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentAdmin) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default AdminRoute;