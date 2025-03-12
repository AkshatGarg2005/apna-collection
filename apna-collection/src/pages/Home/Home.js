import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  // Sample product data - replace with actual data later
  const newArrivals = [
    { id: 1, name: "Premium Cotton Formal Shirt", price: 1299, image: "/api/placeholder/400/500" },
    { id: 2, name: "Slim Fit Trousers", price: 1599, image: "/api/placeholder/400/500" },
    { id: 3, name: "Designer Blazer", price: 3499, image: "/api/placeholder/400/500" },
    { id: 4, name: "Formal Shoes", price: 2199, image: "/api/placeholder/400/500" }
  ];

  const bestSellers = [
    { id: 5, name: "Classic White Shirt", price: 1199, image: "/api/placeholder/400/500" },
    { id: 6, name: "Navy Blue Suit", price: 7999, image: "/api/placeholder/400/500" },
    { id: 7, name: "Casual Linen Shirt", price: 1499, image: "/api/placeholder/400/500" },
    { id: 8, name: "Traditional Kurta", price: 1899, image: "/api/placeholder/400/500" }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span>Apna</span>
            <span>Collection,</span>
          </h1>
          <p className="hero-tagline">Quality, Affordability, Local Charm.</p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn">Shop Now</Link>
            <Link to="/shop" className="btn-text">Explore Collection</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/api/placeholder/600/800" alt="Men's Fashion Models" />
        </div>
      </section>

      {/* Featured Collections / New Arrivals */}
      <section className="featured">
        <h2 className="section-title">New Arrivals</h2>
        <div className="featured-grid">
          {newArrivals.map(product => (
            <Link to={`/product/${product.id}`} key={product.id}>
              <div className="featured-item">
                <img src={product.image} alt={product.name} className="featured-img" />
                <div className="featured-overlay">
                  <h3 className="featured-name">{product.name}</h3>
                  <p className="featured-price">₹{product.price.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="new-arrivals">
        <h2 className="section-title">Best Sellers</h2>
        <div className="featured-grid">
          {bestSellers.map(product => (
            <Link to={`/product/${product.id}`} key={product.id}>
              <div className="featured-item">
                <img src={product.image} alt={product.name} className="featured-img" />
                <div className="featured-overlay">
                  <h3 className="featured-name">{product.name}</h3>
                  <p className="featured-price">₹{product.price.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Special Offers */}
      <section className="special-offers">
        <h2 className="section-title">Special Offers</h2>
        <div className="offer-banner">
          <div className="offer-content">
            <h3 className="offer-title">Festival Collection</h3>
            <p className="offer-desc">Celebrate with style. Exclusive festival wear with up to 30% discount on selected items.</p>
            <Link to="/shop" className="btn">Shop Now</Link>
          </div>
          <div className="offer-image">
            <img src="/api/placeholder/600/400" alt="Festival Collection" />
          </div>
        </div>
        <div className="offer-banner">
          <div className="offer-image">
            <img src="/api/placeholder/600/400" alt="Wedding Collection" />
          </div>
          <div className="offer-content">
            <h3 className="offer-title">Wedding Season Special</h3>
            <p className="offer-desc">Make a statement at every occasion with our premium wedding collection.</p>
            <Link to="/shop" className="btn">Explore Collection</Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <h2 className="section-title">What Our Customers Say</h2>
        <div className="testimonial-slider">
          <div className="testimonial">
            <p className="quote">"Apna Collection offers the perfect blend of quality and affordability. Their collection is always updated with the latest trends, and the staff is exceptionally helpful."</p>
            <div className="customer-name">- Rahul Sharma</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;