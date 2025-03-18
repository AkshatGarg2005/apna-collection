import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Implement newsletter signup functionality
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <footer>
      <div className="footer-container">
        <div className="footer-about">
          <div className="footer-logo">Apna Collection</div>
          <p>Premium men's clothing store in Sehore offering the latest fashion trends with quality fabrics and exceptional service.</p>
        </div>
        
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/shop?category=new-arrivals">New Arrivals</Link></li>
            <li><Link to="/shop?category=best-sellers">Best Sellers</Link></li>
            <li><Link to="/offers">Special Offers</Link></li>
          </ul>
        </div>
        
        <div className="footer-links">
          <h3>Contact Us</h3>
          <ul>
            <li>Shop No. D1, Shri Giriraj Shopping Complex,</li>
            <li>Infront of Tyagi Building, Englishpura,</li>
            <li>Sehore, Madhya Pradesh 466001</li>
            <li>Phone: +91 8817537448</li>
            <li>Email: apnacollectionsehore@gmail.com</li>
          </ul>
        </div>
        
        <div className="footer-newsletter">
          <h3>Newsletter</h3>
          <p>Subscribe to our newsletter for exclusive offers and updates.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Your Email" 
              className="newsletter-input" 
              required 
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 Apna Collection. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;