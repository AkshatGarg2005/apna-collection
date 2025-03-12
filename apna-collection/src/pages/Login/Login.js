import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ message: '', show: false });
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!username || !password) {
      showNotification('Please fill in all fields');
      return;
    }
    
    // Simulate login (would connect to backend in real application)
    showNotification('Login successful! Redirecting...');
    
    // Clear form
    setUsername('');
    setPassword('');
    
    // In a real app, you would perform authentication here
    // then redirect on success
    setTimeout(() => {
      navigate('/');
    }, 2000);
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

  // Handle sign up click
  const handleSignUp = (e) => {
    e.preventDefault();
    showNotification('Redirecting to Sign Up page...');
    setTimeout(() => {
      navigate('/signup');
    }, 1000);
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
            <label htmlFor="username">Email or Username</label>
            <input 
              type="text" 
              id="username" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username" 
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
            <a href="#" onClick={handleSignUp}>Sign Up</a>
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