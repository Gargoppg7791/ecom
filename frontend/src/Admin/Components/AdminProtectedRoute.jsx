import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminProtectedRoute = ({ children }) => {
  const { auth } = useSelector((store) => store);
  const location = useLocation();
  const userType = localStorage.getItem('userType');

  if (!auth.jwt || userType !== 'admin') {
    // Redirect to admin login if not authenticated or not an admin
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute; 