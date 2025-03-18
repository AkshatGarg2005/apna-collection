import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Make sure you have this import

const Contact = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Loading and message states
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Add to Firebase
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        status: 'new', // new, read, replied
        createdAt: serverTimestamp()
      });
      
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
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('There was an error submitting your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
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
            {error && (
              <div className="error-message show">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
            
            {showSuccess && (
              <div className="success-message show">
                <i className="fas fa-check-circle"></i>
                Thank you for your message! Our team will get back to you shortly.
              </div>
            )}
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3><i className="fas fa-envelope"></i> Send Us a Message</h3>
              
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="form-control" 
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-control" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea 
                  id="message" 
                  className="form-control" 
                  placeholder="How can we help you?" 
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                ></textarea>
              </div>
              
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <span><i className="fas fa-spinner fa-spin"></i> Sending...</span>
                ) : (
                  <span><i className="fas fa-paper-plane"></i> Send Message</span>
                )}
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
                <p>+91 88175 37448</p>
                <p>+91 90399 30216</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="info-content">
                <h4>Email Us</h4>
                <p>apnacollectionsehore@gmail.com</p>
                <p>For inquiries & customer support</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="info-content">
                <h4>Business Hours</h4>
                <p>All Days: 10:00 AM - 10:00 PM</p>
              </div>
            </div>
            
            <div className="social-links">
              <a href="https://www.facebook.com/share/1LZHbgMYgE/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/apna_collection24?utm_source=qr&igsh=c25lM3hmc21vNGk5" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="https://x.com/collec85104?s=11" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="https://wa.me/919039930216" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
        </div>
        
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3677.063883428462!2d77.08307751531844!3d23.201780115122686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c428f8ac68e29%3A0x3df43a96d3df51c3!2sShri%20Giriraj%20Shopping%20Complex%2C%20Englishpura%2C%20Sehore%2C%20Madhya%20Pradesh%20466001!5e0!3m2!1sen!2sin!4v1626861234567!5m2!1sen!2sin" 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Apna Collection Store Location"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default Contact;