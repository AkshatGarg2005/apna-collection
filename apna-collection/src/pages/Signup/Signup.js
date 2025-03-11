import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    message: '',
    color: ''
  });

  // Notification state
  const [notification, setNotification] = useState({
    message: '',
    visible: false
  });

  // References to input elements for animation
  const inputRefs = {
    firstName: useRef(),
    lastName: useRef(),
    email: useRef(),
    password: useRef(),
    confirmPassword: useRef()
  };

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Check password strength if password field is being updated
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    let message = '';
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
    
    // Determine message and color based on strength
    if (strength <= 25) {
      color = '#ff4d4d';
      message = 'Weak password';
    } else if (strength <= 50) {
      color = '#ffa64d';
      message = 'Moderate password';
    } else if (strength <= 75) {
      color = '#ffee4d';
      message = 'Good password';
    } else {
      color = '#4dff4d';
      message = 'Strong password';
    }

    setPasswordStrength({ strength, message, color });
  };

  // Show notification
  const showNotification = (message) => {
    setNotification({
      message,
      visible: true
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        visible: false
      }));
    }, 3000);
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      showNotification('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match');
      return;
    }
    
    if (!formData.terms) {
      showNotification('Please agree to the Terms of Service');
      return;
    }
    
    // Simulate account creation
    showNotification('Account created successfully! Redirecting to login...');
    
    // Clear form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    });
    
    // In a real app, you would likely make an API call here to create the user

    // Redirect to login page after 3 seconds
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  // Setup input field focus effects
  useEffect(() => {
    // Function to handle focus and blur events
    const setupInputEffects = () => {
      // For each input ref
      Object.entries(inputRefs).forEach(([key, ref]) => {
        if (ref.current) {
          // Focus event
          ref.current.addEventListener('focus', () => {
            ref.current.parentElement.style.transition = 'transform 0.3s ease';
            ref.current.parentElement.style.transform = 'translateY(-2px)';
          });
          
          // Blur event
          ref.current.addEventListener('blur', () => {
            ref.current.parentElement.style.transform = 'translateY(0)';
          });
        }
      });
    };
    
    setupInputEffects();
    
    // Cleanup function to remove event listeners
    return () => {
      Object.entries(inputRefs).forEach(([key, ref]) => {
        if (ref.current) {
          ref.current.removeEventListener('focus', () => {});
          ref.current.removeEventListener('blur', () => {});
        }
      });
    };
  }, []);

  return (
    <>
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
          <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>
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
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                ref={inputRefs.firstName}
                required
              />
              <div className="icon">👤</div>
            </div>
            <div className="input-group">
              <label htmlFor="last-name">Last Name</label>
              <input 
                type="text" 
                id="last-name" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                ref={inputRefs.lastName}
                required
              />
              <div className="icon">👤</div>
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              ref={inputRefs.email}
              required
            />
            <div className="icon">✉️</div>
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              ref={inputRefs.password}
              required
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
            <div className="password-info" style={{display: formData.password ? 'block' : 'none'}}>
              {passwordStrength.message}
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input 
              type="password" 
              id="confirm-password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              ref={inputRefs.confirmPassword}
              required
            />
            <div className="icon">🔒</div>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="terms" 
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              required
            />
            <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
          </div>
          
          <button type="submit" className="signup-button">Create Account</button>
          
          <div className="footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>

      <div className="brand-element">Premium Men's Fashion • Est. 2023</div>

      <div className={`notification ${notification.visible ? 'show' : ''}`}>
        {notification.message}
      </div>
    </>
  );
};

export default Signup;