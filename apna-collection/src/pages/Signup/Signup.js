import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    text: '',
    color: '#eee'
  });
  const [notification, setNotification] = useState({ message: '', show: false });
  const navigate = useNavigate();

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ strength: 0, text: '', color: '#eee' });
      return;
    }

    let strength = 0;
    let text = '';
    let color = '';

    if (password.length >= 8) {
      strength += 25;
    }
    
    if (password.match(/[A-Z]/)) {
      strength += 25;
    }
    
    if (password.match(/[0-9]/)) {
      strength += 25;
    }
    
    if (password.match(/[^A-Za-z0-9]/)) {
      strength += 25;
    }
    
    if (strength <= 25) {
      color = '#ff4d4d';
      text = 'Weak password';
    } else if (strength <= 50) {
      color = '#ffa64d';
      text = 'Moderate password';
    } else if (strength <= 75) {
      color = '#ffee4d';
      text = 'Good password';
    } else {
      color = '#4dff4d';
      text = 'Strong password';
    }

    setPasswordStrength({ strength, text, color });
  }, [password]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showNotification('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      showNotification('Passwords do not match');
      return;
    }
    
    if (!termsAccepted) {
      showNotification('Please agree to the Terms of Service');
      return;
    }
    
    // Simulate sign up (would connect to backend in real application)
    showNotification('Account created successfully! Redirecting...');
    
    // Clear form
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTermsAccepted(false);
    
    // In a real app, you would create an account here
    // then redirect on success
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  // Notification helper
  const showNotification = (message) => {
    setNotification({ message, show: true });
    
    setTimeout(() => {
      setNotification({ message: '', show: false });
    }, 3000);
  };

  // Handle login link click
  const handleLoginClick = (e) => {
    e.preventDefault();
    showNotification('Redirecting to login page...');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="signup-page">
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

      <div className="signup-container">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Apna Collection</h1>
          </Link>
        </div>
        <div className="form-header">Create your account to access exclusive men's fashion</div>
        <form id="signup-form" onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="first-name">First Name</label>
              <input 
                type="text" 
                id="first-name" 
                required 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <div className="icon">👤</div>
            </div>
            <div className="input-group">
              <label htmlFor="last-name">Last Name</label>
              <input 
                type="text" 
                id="last-name" 
                required 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <div className="icon">👤</div>
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="icon">✉️</div>
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="icon">🔒</div>
            <div className="password-strength">
              <div 
                className="strength-meter" 
                style={{ 
                  width: `${passwordStrength.strength}%`,
                  backgroundColor: passwordStrength.color
                }}
              ></div>
            </div>
            {password && (
              <div className="password-info">
                {passwordStrength.text}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input 
              type="password" 
              id="confirm-password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="icon">🔒</div>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="terms" 
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </label>
          </div>
          
          <button type="submit" className="signup-button">Create Account</button>
          
          <div className="footer">
            Already have an account? <a href="#" onClick={handleLoginClick}>Login</a>
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

export default Signup;