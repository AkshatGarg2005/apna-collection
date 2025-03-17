// src/pages/Home/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Import the images
import heroImage from '../../images/heroimg.jpeg';
import festiveImage from '../../images/festive.png';
import weddingImage from '../../images/wedding.jpg';

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch New Arrivals
        const newArrivalsQuery = query(
          collection(db, 'products'),
          where('isNew', '==', true),
          limit(8)
        );
        
        const newArrivalsSnapshot = await getDocs(newArrivalsQuery);
        
        const newArrivalsData = newArrivalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setNewArrivals(newArrivalsData);
        
        // Fetch Best Sellers
        const bestSellersQuery = query(
          collection(db, 'products'),
          where('isBestSeller', '==', true),
          limit(8)
        );
        
        const bestSellersSnapshot = await getDocs(bestSellersQuery);
        
        const bestSellersData = bestSellersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setBestSellers(bestSellersData);
        setError(null);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Format price function
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₹0";
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

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
          <img src={heroImage} alt="Men's Fashion Models" />
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="featured">
        <h2 className="section-title">New Arrivals</h2>
        {error && <div className="error-message">Error loading products: {error}</div>}
        <div className="featured-grid">
          {loading ? (
            <div className="loading-message">Loading new arrivals...</div>
          ) : newArrivals.length > 0 ? (
            newArrivals.map(product => (
              <Link to={`/product/${product.id}`} key={product.id}>
                <div className="featured-item">
                  <img src={product.image} alt={product.name} className="featured-img" />
                  <div className="featured-overlay">
                    <h3 className="featured-name">{product.name || "Untitled Product"}</h3>
                    <p className="featured-price">{formatPrice(product.price)}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-message">No new arrivals to show</div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="new-arrivals">
        <h2 className="section-title">Best Sellers</h2>
        {error && <div className="error-message">Error loading products: {error}</div>}
        <div className="featured-grid">
          {loading ? (
            <div className="loading-message">Loading best sellers...</div>
          ) : bestSellers.length > 0 ? (
            bestSellers.map(product => (
              <Link to={`/product/${product.id}`} key={product.id}>
                <div className="featured-item">
                  <img src={product.image} alt={product.name} className="featured-img" />
                  <div className="featured-overlay">
                    <h3 className="featured-name">{product.name || "Untitled Product"}</h3>
                    <p className="featured-price">{formatPrice(product.price)}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-message">No best sellers to show</div>
          )}
        </div>
      </section>

      {/* Special Offers */}
      <section className="special-offers">
        <h2 className="section-title">Special Offers</h2>
        <div className="offer-banner">
          <div className="offer-content">
            <h3 className="offer-title">Festival Collection</h3>
            <p className="offer-desc">Celebrate with style. Exclusive festival wear with up to 30% discount on selected items.</p>
            <Link to="/festive-collection" className="btn">Shop Now</Link>
          </div>
          <div className="offer-image">
            <img src={festiveImage} alt="Festival Collection" />
          </div>
        </div>
        <div className="offer-banner">
          <div className="offer-image">
            <img src={weddingImage} alt="Wedding Collection" />
          </div>
          <div className="offer-content">
            <h3 className="offer-title">Wedding Season Special</h3>
            <p className="offer-desc">Make a statement at every occasion with our premium wedding collection.</p>
            <Link to="/wedding-collection" className="btn">Explore Collection</Link>
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