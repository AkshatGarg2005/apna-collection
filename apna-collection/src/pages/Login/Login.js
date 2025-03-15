// src/pages/Login/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', show: false });
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      showNotification('Please fill in all fields');
      return;
    }
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        showNotification('Login successful! Redirecting...');
        
        // Clear form
        setEmail('');
        setPassword('');
        
        // Redirect after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        showNotification(result.error || 'Login failed');
      }
    } catch (error) {
      showNotification(error.message || 'Login failed');
    }
  };

  // Notification helper
  const showNotification = (message) => {
    setNotification({ message, show: true });
    
    setTimeout(() => {
      setNotification({ message: '', show: false });
    }, 3000);
  };

  // Handle forgot password click
  const handleForgotPassword = (e) => {
    e.preventDefault();
    showNotification('Password reset feature coming soon');
  };

  return (
    <div className="login-page">
      {/* Background pattern */}
      <div className="pattern"></div>
      
      {/* Decorative elements */}
      <div className="decoration circle1"></div>
      <div className="decoration circle2"></div>
      <div className="decoration diagonal-line"></div>
      
      {/* Floating shapes */}
      <div className="floating-shape shape1"></div>
      <div className="floating-shape shape2"></div>
      <div className="floating-shape shape3"></div>

      <div className="login-container">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Apna Collection</h1>
          </Link>
        </div>
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Email</label>
            <input 
              type="email" 
              id="username" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" 
            />
            <div className="icon">👤</div>
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" 
            />
            <div className="icon">🔒</div>
          </div>
          <button type="submit" className="login-button">Login</button>
          <div className="footer">
            <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
            <Link to="/signup">Sign Up</Link>
          </div>
        </form>
      </div>

      <div className="brand-element">Premium Men's Fashion • Est. 2023</div>

      <div className={`notification ${notification.show ? 'show' : ''}`}>
        {notification.message}
      </div>
    </div>
  );
};

export default Login;