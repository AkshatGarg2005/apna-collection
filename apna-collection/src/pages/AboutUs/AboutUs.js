import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchOverlay from '../../components/SearchOverlay';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="aboutus-container">
      <SearchOverlay />
      <Header />
      
      {/* Main About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-header">
            <h1>About Us</h1>
            <p>At Apna Collection, we blend tradition with contemporary style to bring you premium quality men's clothing that reflects both heritage and modern sensibilities.</p>
          </div>
          
          <div className="about-cards">
            <div className="about-card">
              <i className="fas fa-medal fa-3x about-card-icon"></i>
              <h3>Premium Quality</h3>
              <p>We source the finest fabrics and materials to create clothing that not only looks good but is built to last. Each piece undergoes rigorous quality checks before reaching our customers.</p>
            </div>
            
            <div className="about-card">
              <i className="fas fa-tags fa-3x about-card-icon"></i>
              <h3>Affordability</h3>
              <p>We believe that quality fashion shouldn't come with an exorbitant price tag. Our direct-sourcing model allows us to offer premium clothing at prices that won't break the bank.</p>
            </div>
            
            <div className="about-card">
              <i className="fas fa-map-marker-alt fa-3x about-card-icon"></i>
              <h3>Local Charm</h3>
              <p>Rooted in Sehore's rich cultural heritage, our designs incorporate elements that celebrate local craftsmanship while embracing contemporary global trends.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="container">
        <div className="story-section">
          <div className="story-image">
            <img src="/images/store.jpg" alt="Apna Collection Store" />
          </div>
          <div className="story-content">
            <h2>Our Story</h2>
            <p>Apna Collection began as a small family business in the heart of Sehore with a simple mission: to provide men with stylish, high-quality clothing at reasonable prices. What started as a modest shop has now grown into a beloved local institution.</p>
            <p>Our journey has been defined by an unwavering commitment to quality and customer satisfaction. We've evolved with changing fashion trends while staying true to our core values of authenticity, craftsmanship, and community connection.</p>
            <p>Today, we continue to serve the men of Sehore and beyond with clothing that empowers them to look and feel their best, blending traditional elements with modern aesthetics for a truly unique style experience.</p>
          </div>
        </div>
      </section>
      
      {/* Our Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="team-header">
            <h2>Meet Our Team</h2>
            <p>The passionate individuals behind Apna Collection who make it all possible</p>
          </div>
          
          <div className="team-grid">
            <div className="team-member">
              <img src="/images/sumit.jpeg" alt="Team Member" />
              <div className="team-member-info">
                <h3>Sumit Bhaiya</h3>
                <p>Founder</p>
              </div>
            </div>
            
            <div className="team-member">
              <img src="/images/sachin.jpeg" alt="Team Member" />
              <div className="team-member-info">
                <h3>Sachin Bhaiya</h3>
                <p>Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-header">
            <h2>Get In Touch</h2>
            <p>We'd love to hear from you! Visit our store or reach out to us through any of these channels.</p>
          </div>
          
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-map-marker-alt fa-2x"></i>
              <h3>Visit Us</h3>
              <p>Shop No. D1, Shri Giriraj Shopping Complex,</p>
              <p>Infront of Tyagi Building, Englishpura,</p>
              <p>Sehore, Madhya Pradesh 466001</p>
            </div>
            
            <div className="contact-item">
              <i className="fas fa-phone-alt fa-2x"></i>
              <h3>Call Us</h3>
              <p>+91 98765 43210</p>
              <p>Mon-Sat: 10am - 8pm</p>
            </div>
            
            <div className="contact-item">
              <i className="fas fa-envelope fa-2x"></i>
              <h3>Email Us</h3>
              <p>info@apnacollection.com</p>
              <p>support@apnacollection.com</p>
            </div>
          </div>
          
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" title="WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AboutUs;