// src/components/auth/AdminRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setCheckingAdmin(false);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
      
      setCheckingAdmin(false);
    };
    
    if (!loading) {
      checkAdminStatus();
    }
  }, [currentUser, loading]);
  
  if (loading || checkingAdmin) {
    // You could render a loading spinner here
    return <div>Loading...</div>;
  }
  
  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default AdminRoute;