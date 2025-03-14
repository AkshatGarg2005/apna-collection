import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './OffersPage.css';

const Offers = ({ addToCart }) => {
  // Updated offer data with only shirts, jeans, kurta, t-shirts, and undergarments
  const offerData = [
    {
      id: 101,
      title: "Premium Formal Shirts",
      description: "Breathable and stylish formal shirts perfect for professional settings.",
      originalPrice: 3999,
      currentPrice: 2799,
      discount: 30,
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80",
      limited: true
    },
    {
      id: 102,
      title: "Designer Denim Jeans",
      description: "Premium quality denim jeans with modern cuts and styles.",
      originalPrice: 2599,
      currentPrice: 1999,
      discount: 20,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
      limited: false
    },
    {
      id: 103,
      title: "Traditional Kurta Collection",
      description: "Elegant kurtas made from premium cotton fabric with traditional designs.",
      originalPrice: 2999,
      currentPrice: 2399,
      discount: 20,
      image: "https://images.unsplash.com/photo-1610366398516-46da9dec5931?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
      limited: true
    },
    {
      id: 104,
      title: "Classic T-Shirt Bundle",
      description: "Set of 3 premium cotton t-shirts in essential colors.",
      originalPrice: 1499,
      currentPrice: 999,
      discount: 35,
      image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
      limited: false
    },
    {
      id: 105,
      title: "Premium Undergarments",
      description: "Soft and comfortable undergarments made with breathable cotton.",
      originalPrice: 1299,
      currentPrice: 999,
      discount: 25,
      image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80",
      limited: false
    },
    {
      id: 106,
      title: "Casual Shirts",
      description: "Stylish and comfortable casual shirts perfect for everyday wear.",
      originalPrice: 2499,
      currentPrice: 1799,
      discount: 30,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=988&q=80",
      limited: true
    }
  ];

  // State for newsletter subscription
  const [email, setEmail] = useState('');
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  // Handle newsletter form submission
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim() !== '') {
      setSubscriptionMessage('Thank you for subscribing to our newsletter!');
      setEmail('');
      setTimeout(() => setSubscriptionMessage(''), 3000);
    } else {
      setSubscriptionMessage('Please enter a valid email address.');
      setTimeout(() => setSubscriptionMessage(''), 3000);
    }
  };

  // Handle shop now button click
  const handleShopNow = (offer) => {
    // Add the first variant of the product to cart
    const product = {
      id: offer.id,
      name: offer.title,
      price: offer.currentPrice,
      image: offer.image,
      quantity: 1,
      size: 'M', // Default size
      color: 'Default' // Default color
    };
    
    addToCart(product);
  };

  return (
    <div className="offers-page">
      {/* Offers Section */}
      <section className="offers-section">
        <h1 className="offers-title">SPECIAL OFFERS</h1>
        <p className="offers-subtitle">Exclusive deals on our essential clothing collection</p>
        
        <div className="offers-grid">
          {offerData.map((offer) => (
            <div className="offer-card" key={offer.id}>
              <div className="offer-image">
                <img src={offer.image} alt={offer.title} />
                <div className="discount-badge">{offer.discount}% OFF</div>
                {offer.limited && <div className="limited-badge">LIMITED TIME</div>}
              </div>
              <div className="offer-content">
                <h3 className="offer-name">{offer.title}</h3>
                <div className="offer-price">
                  <span className="original-price">₹{offer.originalPrice}</span>
                  <span className="current-price">₹{offer.currentPrice}</span>
                </div>
                <p className="offer-description">{offer.description}</p>
                <button 
                  className="shop-now-btn"
                  onClick={() => handleShopNow(offer)}
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Improved Seasonal Banner */}
        <div className="seasonal-banner">
          <div className="banner-content">
            <h2 className="banner-title">End of Season Sale</h2>
            <p className="banner-text">
              Upgrade your wardrobe with our essential clothing collection at unbeatable prices. 
              Shop shirts, jeans, kurtas, t-shirts, and undergarments with the finest materials and craftsmanship.
            </p>
            <Link to="/shop" className="banner-shop-now-btn">Explore Collection</Link>
          </div>
          <div 
            className="banner-image" 
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')` }}
          ></div>
          <div className="banner-badge">Up to 50% Off</div>
        </div>

        {/* Improved Newsletter Section */}
        <div className="newsletter-section">
          <h2 className="newsletter-title">Stay Updated</h2>
          <p className="newsletter-text">
            Subscribe to receive notifications about new arrivals, exclusive offers,
            and seasonal collections. Be the first to know about our limited-time promotions.
          </p>
          
          {subscriptionMessage && (
            <div className={`subscription-message ${email ? 'success' : 'error'}`}>
              {subscriptionMessage}
            </div>
          )}
          
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="newsletter-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="newsletter-button">Subscribe</button>
          </form>
          
          <div className="newsletter-perks">
            <div className="newsletter-perk">
              <i className="fas fa-gift perk-icon"></i>
              <p className="perk-text">Exclusive offers for subscribers</p>
            </div>
            <div className="newsletter-perk">
              <i className="fas fa-clock perk-icon"></i>
              <p className="perk-text">Early access to sales</p>
            </div>
            <div className="newsletter-perk">
              <i className="fas fa-tag perk-icon"></i>
              <p className="perk-text">Special birthday discount</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;