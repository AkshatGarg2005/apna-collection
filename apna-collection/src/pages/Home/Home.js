import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchOverlay from '../../components/SearchOverlay';
import './Home.css';

const Home = () => {
  // Product data
  const [products, setProducts] = useState([
    // Shirts
    {
      id: 1,
      name: "Premium Cotton Formal Shirt",
      category: "shirts",
      price: 1299,
      image: "/images/premium-cotton-shirt.png",
      isNew: true
    },
    {
      id: 2,
      name: "Classic White Shirt",
      category: "shirts",
      price: 1199,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    {
      id: 3,
      name: "Casual Linen Shirt",
      category: "shirts",
      price: 1499,
      image: "/images/premium-cotton-shirt.png",
      isNew: true
    },
    {
      id: 4,
      name: "Designer Check Shirt",
      category: "shirts",
      price: 1599,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    
    // Jeans
    {
      id: 5,
      name: "Slim Fit Dark Denim Jeans",
      category: "jeans",
      price: 1899,
      image: "/images/premium-cotton-shirt.png",
      isNew: true
    },
    {
      id: 6,
      name: "Classic Blue Denim Jeans",
      category: "jeans",
      price: 1799,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    {
      id: 7,
      name: "Distressed Denim Jeans",
      category: "jeans",
      price: 1999,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    {
      id: 8,
      name: "Black Slim Fit Jeans",
      category: "jeans",
      price: 1899,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    
    // Kurta
    {
      id: 9,
      name: "Traditional Silk Kurta",
      category: "kurta",
      price: 2999,
      image: "/images/premium-cotton-shirt.png",
      isNew: true
    },
    {
      id: 10,
      name: "Designer Wedding Kurta",
      category: "kurta",
      price: 3499,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    {
      id: 11,
      name: "Cotton Casual Kurta",
      category: "kurta",
      price: 1999,
      image: "/images/premium-cotton-shirt.png",
      isNew: true
    },
    {
      id: 12,
      name: "Festive Embroidered Kurta",
      category: "kurta",
      price: 2499,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    
    // T-shirts
    {
      id: 13,
      name: "Classic Round Neck T-shirt",
      category: "tshirt",
      price: 799,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    {
      id: 14,
      name: "Premium V-Neck T-shirt",
      category: "tshirt",
      price: 899,
      image: "/images/premium-cotton-shirt.png",
      isNew: true
    },
    {
      id: 15,
      name: "Graphic Print T-shirt",
      category: "tshirt",
      price: 999,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    {
      id: 16,
      name: "Polo T-shirt",
      category: "tshirt",
      price: 1199,
      image: "/images/premium-cotton-shirt.png",
      isNew: true
    },
    
    // Undergarments
    {
      id: 17,
      name: "Premium Cotton Briefs (Pack of 3)",
      category: "undergarments",
      price: 699,
      image: "/images/premium-cotton-shirt.png",
      isNew: true
    },
    {
      id: 18,
      name: "Boxer Shorts (Pack of 2)",
      category: "undergarments",
      price: 599,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    {
      id: 19,
      name: "Cotton Vest (Pack of 3)",
      category: "undergarments",
      price: 499,
      image: "/images/premium-cotton-shirt.png",
      isNew: false
    },
    {
      id: 20,
      name: "Thermal Underwear Set",
      category: "undergarments",
      price: 999,
      image: "/images/premium-cotton-shirt.png",
      isNew: true
    }
  ]);

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="home-container">
      <SearchOverlay />
      <Header />
      
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
          <img src="/images/heroimg.jpeg" alt="Men's Fashion Models" />
        </div>
      </section>

      {/* Featured Collections */}
      <section className="featured">
        <h2 className="section-title">New Arrivals</h2>
        <div className="featured-grid">
          <Link to="/product/1">
            <div className="featured-item">
              <img src="/images/premium-cotton-shirt.png" alt="Premium Cotton Shirt" className="featured-img" />
              <div className="featured-overlay">
                <h3 className="featured-name">Premium Cotton Shirt</h3>
                <p className="featured-price">₹1,299</p>
              </div>
            </div>
          </Link>
          <Link to="/product/5">
            <div className="featured-item">
              <img src="/images/premium-cotton-shirt.png" alt="Slim Fit Trousers" className="featured-img" />
              <div className="featured-overlay">
                <h3 className="featured-name">Slim Fit Trousers</h3>
                <p className="featured-price">₹1,599</p>
              </div>
            </div>
          </Link>
          <Link to="/product/10">
            <div className="featured-item">
              <img src="/images/premium-cotton-shirt.png" alt="Designer Blazer" className="featured-img" />
              <div className="featured-overlay">
                <h3 className="featured-name">Designer Blazer</h3>
                <p className="featured-price">₹3,499</p>
              </div>
            </div>
          </Link>
          <Link to="/product/16">
            <div className="featured-item">
              <img src="/images/premium-cotton-shirt.png" alt="Formal Shoes" className="featured-img" />
              <div className="featured-overlay">
                <h3 className="featured-name">Formal Shoes</h3>
                <p className="featured-price">₹2,199</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="new-arrivals">
        <h2 className="section-title">Best Sellers</h2>
        <div className="featured-grid">
          <Link to="/product/2">
            <div className="featured-item">
              <img src="/images/premium-cotton-shirt.png" alt="Classic White Shirt" className="featured-img" />
              <div className="featured-overlay">
                <h3 className="featured-name">Classic White Shirt</h3>
                <p className="featured-price">₹1,199</p>
              </div>
            </div>
          </Link>
          <Link to="/product/6">
            <div className="featured-item">
              <img src="/images/premium-cotton-shirt.png" alt="Navy Blue Suit" className="featured-img" />
              <div className="featured-overlay">
                <h3 className="featured-name">Navy Blue Suit</h3>
                <p className="featured-price">₹7,999</p>
              </div>
            </div>
          </Link>
          <Link to="/product/3">
            <div className="featured-item">
              <img src="/images/premium-cotton-shirt.png" alt="Casual Linen Shirt" className="featured-img" />
              <div className="featured-overlay">
                <h3 className="featured-name">Casual Linen Shirt</h3>
                <p className="featured-price">₹1,499</p>
              </div>
            </div>
          </Link>
          <Link to="/product/11">
            <div className="featured-item">
              <img src="/images/premium-cotton-shirt.png" alt="Traditional Kurta" className="featured-img" />
              <div className="featured-overlay">
                <h3 className="featured-name">Traditional Kurta</h3>
                <p className="featured-price">₹1,899</p>
              </div>
            </div>
          </Link>
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
            <img src="/images/festive.png" alt="Festival Collection" />
          </div>
        </div>
        <div className="offer-banner">
          <div className="offer-image">
            <img src="/images/wedding.jpg" alt="Wedding Collection" />
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

      <Footer />
    </div>
  );
};

export default Home;