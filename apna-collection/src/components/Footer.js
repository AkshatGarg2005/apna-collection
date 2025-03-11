import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the newsletter subscription
    console.log('Newsletter subscription for:', email);
    // Reset form
    setEmail('');
    // You could show a success message here
  };

  return (
    <footer className="footer">
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
            <li><Link to="/shop?category=new">New Arrivals</Link></li>
            <li><Link to="/shop?category=bestsellers">Best Sellers</Link></li>
            <li><Link to="/offers">Special Offers</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h3>Contact Us</h3>
          <ul>
            <li>Shop No. D1, Shri Giriraj Shopping Complex,</li>
            <li>Infront of Tyagi Building, Englishpura,</li>
            <li>Sehore, Madhya Pradesh 466001</li>
            <li>Phone: 1234567890</li>
            <li>Email: info@apnacollection.com</li>
          </ul>
        </div>
        <div className="footer-newsletter">
          <h3>Newsletter</h3>
          <p>Subscribe to our newsletter for exclusive offers and updates.</p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Your Email" 
              className="newsletter-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Apna Collection. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;