import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchOverlay from '../../components/SearchOverlay';
import './Contact.css';

const Contact = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  
  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
    
    // Clear error when typing
    if (formErrors[id]) {
      setFormErrors({
        ...formErrors,
        [id]: ''
      });
    }
  };

  // Validate email
  const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (formData.name.trim() === '') {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (formData.email.trim() === '') {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (formData.message.trim() === '') {
      errors.message = 'Message is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would typically send the data to a server via AJAX/fetch
      console.log('Form data submitted:', formData);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
  };

  return (
    <div className="contact-page">
      <SearchOverlay />
      <Header />
      
      {/* Page Banner */}
      <section className="page-banner">
        <h1>Contact Us</h1>
        <p>We're here to help with any questions you may have about our collections or services.</p>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2 className="section-title">Get in Touch</h2>
        <p className="section-subtitle">Have a question or feedback? We'd love to hear from you. Fill out the form below and our team will get back to you as soon as possible.</p>
        
        <div className="decoration-circle decoration-circle-1"></div>
        <div className="decoration-circle decoration-circle-2"></div>
        
        <div className="contact-container">
          <div className="contact-form-container">
            <div className={`success-message ${showSuccess ? 'show' : ''}`}>
              <i className="fas fa-check-circle"></i>
              Thank you for your message! Our team will get back to you shortly.
            </div>
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3><i className="fas fa-envelope"></i> Send Us a Message</h3>
              
              <div className={`form-group ${formErrors.name ? 'error' : ''}`}>
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="form-control" 
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className={`form-group ${formErrors.email ? 'error' : ''}`}>
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-control" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="form-control" 
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className={`form-group ${formErrors.message ? 'error' : ''}`}>
                <label htmlFor="message">Your Message</label>
                <textarea 
                  id="message" 
                  className="form-control" 
                  placeholder="How can we help you?" 
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="btn-submit">
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
              
              <div className="form-footer">
                <p>We respect your privacy <i className="fas fa-lock"></i> Your information will never be shared with third parties.</p>
              </div>
            </form>
          </div>
          
          <div className="contact-info">
            <div className="info-item">
              <div className="info-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="info-content">
                <h4>Our Location</h4>
                <p>Shop No. D1, Shri Giriraj Shopping Complex,<br />
                Infront of Tyagi Building, Englishpura,<br />
                Sehore, Madhya Pradesh 466001</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <i className="fas fa-phone-alt"></i>
              </div>
              <div className="info-content">
                <h4>Call Us</h4>
                <p>+91 1234567890</p>
                <p>Monday - Saturday: 10:00 AM - 8:00 PM</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="info-content">
                <h4>Email Us</h4>
                <p>info@apnacollection.com</p>
                <p>For inquiries & customer support</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="info-content">
                <h4>Business Hours</h4>
                <p>Monday - Saturday: 10:00 AM - 8:00 PM<br />
                Sunday: 11:00 AM - 6:00 PM</p>
              </div>
            </div>
            
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3677.063883428462!2d77.08307751531844!3d23.201780115122686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c428f8ac68e29%3A0x3df43a96d3df51c3!2sShri%20Giriraj%20Shopping%20Complex%2C%20Englishpura%2C%20Sehore%2C%20Madhya%20Pradesh%20466001!5e0!3m2!1sen!2sin!4v1626861234567!5m2!1sen!2sin" 
            allowFullScreen
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Store Location"
          ></iframe>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contact;