import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginStatusToast.css';

const LoginStatusToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (currentUser) {
      setMessage(`Signed in as ${currentUser.displayName || currentUser.email}`);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser]);
  
  if (!visible) return null;
  
  return (
    <div className="login-status-toast">
      <div className="toast-icon">
        <i className="fas fa-check-circle"></i>
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
};

export default LoginStatusToast;