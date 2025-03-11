import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Offers.css';

const Offers = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Product data for search functionality
  const products = [
    // Shirts
    {
      id: 1,
      name: "Premium Cotton Formal Shirt",
      category: "shirts",
      price: 1299,
      image: "/api/placeholder/400/500",
      isNew: true
    },
    {
      id: 2,
      name: "Classic White Shirt",
      category: "shirts",
      price: 1199,
      image: "/api/placeholder/400/500",
      isNew: false
    },
    {
      id: 3,
      name: "Casual Linen Shirt",
      category: "shirts",
      price: 1499,
      image: "/api/placeholder/400/500",
      isNew: true
    },
    // Jeans
    {
      id: 5,
      name: "Slim Fit Dark Denim Jeans",
      category: "jeans",
      price: 1899,
      image: "/api/placeholder/400/500",
      isNew: true
    },
    {
      id: 6,
      name: "Classic Blue Denim Jeans",
      category: "jeans",
      price: 1799,
      image: "/api/placeholder/400/500",
      isNew: false
    },
    // Kurta
    {
      id: 9,
      name: "Traditional Silk Kurta",
      category: "kurta",
      price: 2999,
      image: "/api/placeholder/400/500",
      isNew: true
    },
    {
      id: 10,
      name: "Designer Wedding Kurta",
      category: "kurta",
      price: 3499,
      image: "/api/placeholder/400/500",
      isNew: false
    }
  ];
  
  // Sample offer data
  const offerData = [
    {
      title: "Premium Linen Shirts",
      description: "Breathable and stylish linen shirts perfect for summer outings.",
      originalPrice: 3999,
      currentPrice: 2799,
      discount: 30,
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80",
      limited: true
    },
    {
      title: "Tailored Formal Suit",
      description: "Elegant suit set with premium fabric and perfect fitting.",
      originalPrice: 12999,
      currentPrice: 9999,
      discount: 25,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80",
      limited: false
    },
    {
      title: "Designer Denim Collection",
      description: "Premium quality denim jeans with modern cuts and styles.",
      originalPrice: 2599,
      currentPrice: 1999,
      discount: 20,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
      limited: true
    },
    {
      title: "Casual T-Shirt Bundle",
      description: "Set of 3 premium cotton t-shirts in essential colors.",
      originalPrice: 1499,
      currentPrice: 999,
      discount: 35,
      image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
      limited: false
    },
    {
      title: "Leather Belt Collection",
      description: "Handcrafted genuine leather belts with elegant buckles.",
      originalPrice: 1999,
      currentPrice: 1599,
      discount: 15,
      image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      limited: false
    },
    {
      title: "Seasonal Jackets",
      description: "Stylish and functional jackets perfect for transitional weather.",
      originalPrice: 4999,
      currentPrice: 3499,
      discount: 30,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80",
      limited: true
    }
  ];

  // Handle search input
  const handleSearchInput = (e) => {
    const query = e.target.value.trim().toLowerCase();
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Search products
    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.category.toLowerCase().includes(query)
    );
    
    setSearchResults(filteredProducts);
  };

  // Search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Open search overlay
  const openSearchOverlay = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      document.getElementById('searchInput')?.focus();
    }, 100);
  };

  // Close search overlay
  const closeSearchOverlay = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle newsletter subscription
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (input.value.trim() !== '') {
      alert('Thank you for subscribing to our newsletter!');
      input.value = '';
    } else {
      alert('Please enter a valid email address.');
    }
  };

  // Handle shop now button click
  const handleShopNow = (e) => {
    e.preventDefault();
    alert('Thank you for your interest! This feature would navigate to the product page in a real implementation.');
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Handle escape key for search overlay
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearchOverlay();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSearchOpen]);

  return (
    <div className="offers-page">
      {/* Search Overlay */}
      <div className={`search-overlay ${isSearchOpen ? 'active' : ''}`}>
        <div className="search-close" onClick={closeSearchOverlay}>
          <i className="fas fa-times"></i>
        </div>
        <div className="search-container">
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              className="search-input" 
              id="searchInput"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={handleSearchInput}
            />
          </form>
        </div>
        <div className="search-results">
          {searchQuery.length >= 2 && (
            <div className="search-result-info">
              {searchResults.length > 0 ? (
                <>
                  Found {searchResults.length} results for "{searchQuery}"
                  <br />
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    (Press Enter to see all results)
                  </span>
                </>
              ) : (
                `No products found for "${searchQuery}"`
              )}
            </div>
          )}
          
          {searchResults.length === 0 && searchQuery.length >= 2 && (
            <div className="no-results">
              Try a different search term or browse our categories
            </div>
          )}
          
          {/* Display only first 4 product cards in search results for preview */}
          {searchResults.slice(0, 4).map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                {product.isNew && <span className="product-badge">New</span>}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{capitalizeFirstLetter(product.category)}</p>
                <p className="product-price">₹{product.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
          
          {/* If there are more results than shown in preview */}
          {searchResults.length > 4 && (
            <div className="view-more-results">
              <button 
                className="view-all-btn"
                onClick={handleSearchSubmit}
              >
                View all {searchResults.length} results
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <header>
        <div className="logo">
          <Link to="/">Apna Collection</Link>
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/aboutus">About Us</Link></li>
            <li><Link to="/offers" className="active">Offers</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
          <div className="nav-icons">
            <div className="icon" onClick={openSearchOverlay}>
              <i className="fas fa-search"></i>
            </div>
            <div className="icon">
              <Link to="/cart">
                <i className="fas fa-shopping-bag"></i>
              </Link>
              <span className="cart-count">3</span>
            </div>
            <div className="icon">
              <Link to="/login">
                <i className="fas fa-user"></i>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Offers Section */}
      <section className="offers-section">
        <h1 className="offers-title">SPECIAL OFFERS</h1>
        <p className="offers-subtitle">Exclusive deals for the modern gentleman</p>
        
        <div className="offers-grid">
          {offerData.map((offer, index) => (
            <div className="offer-card" key={index}>
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
                <a href="#" className="shop-now-btn" onClick={handleShopNow}>Shop Now</a>
              </div>
            </div>
          ))}
        </div>

        {/* Improved Seasonal Banner */}
        <div className="seasonal-banner">
          <div className="banner-content">
            <h2 className="banner-title">End of Season Sale</h2>
            <p className="banner-text">
              Upgrade your wardrobe with premium clothing at unbeatable prices. 
              Our collection features the finest materials and craftsmanship for the modern gentleman.
            </p>
            <a href="#" className="banner-shop-now-btn" onClick={handleShopNow}>
              Explore Collection
            </a>
          </div>
          <div 
            className="banner-image" 
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')` 
            }}
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
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input type="email" placeholder="Your email address" className="newsletter-input" />
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

      {/* Footer */}
      <footer>
        <div className="footer-container">
          <div className="footer-about">
            <div className="footer-logo">Apna Collection</div>
            <p>
              Premium men's clothing store in Sehore offering the latest fashion 
              trends with quality fabrics and exceptional service.
            </p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/shop/new-arrivals">New Arrivals</Link></li>
              <li><Link to="/shop/best-sellers">Best Sellers</Link></li>
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
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input type="email" placeholder="Your Email" className="newsletter-input" />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Apna Collection. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Offers;