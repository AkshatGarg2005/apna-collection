// src/pages/AboutUs/AboutUs.js
import React from 'react';
import './AboutUs.css';

// Import images
import storeImage from '../../images/store.jpg';
import sumitImage from '../../images/sumit.jpeg';
import sachinImage from '../../images/sachin.jpeg';

const AboutUs = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div className="hero-content">
          <h1>About Apna Collection</h1>
          <p>Quality, Affordability, Local Charm.</p>
        </div>
      </div>

      <section className="store-section">
        <div className="store-image">
          <img src={storeImage} alt="Apna Collection Store" />
        </div>
        <div className="store-content">
          <h2>Our Store</h2>
          <p>
            Founded in 2015, Apna Collection has grown from a small local shop to one of the most trusted apparel stores in the region. 
            Located in the heart of the city, our store offers a wide range of men's clothing that combines quality, style, and affordability.
          </p>
          <p>
            We take pride in offering carefully curated collections that cater to all occasions - from everyday casual wear to festive 
            celebrations and special events like weddings. Our mission is to help every man look his best without breaking the bank.
          </p>
          <div className="store-details">
            <div className="detail-item">
              <span className="detail-number">2000+</span>
              <span className="detail-label">Happy Customers</span>
            </div>
            <div className="detail-item">
              <span className="detail-number">500+</span>
              <span className="detail-label">Products</span>
            </div>
            <div className="detail-item">
              <span className="detail-number">8</span>
              <span className="detail-label">Years of Service</span>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          <div className="value-item">
            <h3>Quality</h3>
            <p>We ensure that every garment meets our high standards of craftsmanship and durability.</p>
          </div>
          <div className="value-item">
            <h3>Affordability</h3>
            <p>Fashion shouldn't be expensive. We provide stylish clothing at prices that won't break the bank.</p>
          </div>
          <div className="value-item">
            <h3>Customer Satisfaction</h3>
            <p>Our customers' happiness is our top priority. We strive to exceed expectations with every purchase.</p>
          </div>
          <div className="value-item">
            <h3>Local Sourcing</h3>
            <p>We support local artisans and manufacturers, contributing to our community's economy.</p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image">
              <img src={sumitImage} alt="Sumit Sharma - Founder & CEO" />
            </div>
            <h3>Sumit Sharma</h3>
            <p className="member-role">Founder & CEO</p>
            <p className="member-bio">
              With over 15 years of experience in the fashion retail industry, Sumit founded Apna Collection 
              with a vision to bring affordable fashion to everyone. His expertise in sourcing quality products 
              and understanding market trends has been instrumental in our growth.
            </p>
          </div>
          <div className="team-member">
            <div className="member-image">
              <img src={sachinImage} alt="Sachin Verma - Store Manager" />
            </div>
            <h3>Sachin Verma</h3>
            <p className="member-role">Store Manager</p>
            <p className="member-bio">
              Sachin ensures that our in-store experience is seamless and memorable. With a keen eye for 
              detail and exceptional customer service skills, he leads our store team to deliver personalized 
              shopping experiences that keep customers coming back.
            </p>
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonial">
          <p className="quote">
            "Apna Collection has been my go-to store for all my clothing needs. Their collection is always 
            up-to-date with the latest trends, and the quality is exceptional. The staff is knowledgeable 
            and friendly, making every shopping experience pleasant."
          </p>
          <p className="customer-name">- Rahul Sharma, Loyal Customer since 2018</p>
        </div>
      </section>

      <section className="visit-section">
        <h2>Visit Us</h2>
        <div className="visit-content">
          <div className="address">
            <h3>Store Address</h3>
            <p>Shop No. D1, Shri Giriraj Shopping Complex,</p>
            <p>Infront of Tyagi Building, Englishpura,</p>
            <p>Sehore, Madhya Pradesh 466001</p>
          </div>
          <div className="hours">
            <h3>Opening Hours</h3>
            <p>All days: 10:00 AM - 10:00 PM</p>
          </div>
          <div className="contact">
            <h3>Contact Us</h3>
            <p>Phone: +91 88175 37448</p>
            <p>Phone: +91 90399 30216</p>
            <p>Email: apnacollectionsehore@gmail.com</p>
          </div>
        </div>
        
        <div className="social-media-section">
          <h3>Connect With Us</h3>
          <div className="social-links">
            <a href="https://www.instagram.com/apna_collection24?utm_source=qr&igsh=c25lM3hmc21vNGk5" target="_blank" rel="noopener noreferrer" className="social-link">
              <div className="social-icon">
                <i className="fab fa-instagram"></i>
              </div>
            </a>
            <a href="https://www.facebook.com/share/1LZHbgMYgE/" target="_blank" rel="noopener noreferrer" className="social-link">
              <div className="social-icon">
                <i className="fab fa-facebook-f"></i>
              </div>
            </a>
            <a href="https://wa.me/919039930216" target="_blank" rel="noopener noreferrer" className="social-link">
              <div className="social-icon">
                <i className="fab fa-whatsapp"></i>
              </div>
            </a>
            <a href="https://x.com/collec85104?s=11" target="_blank" rel="noopener noreferrer" className="social-link">
              <div className="social-icon">
                <i className="fab fa-twitter"></i>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;