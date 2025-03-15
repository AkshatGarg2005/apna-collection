import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchOverlay.css';

const SearchOverlay = ({ isOpen, closeSearch, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Create a function that will use whichever close prop is provided
  const handleClose = () => {
    if (typeof closeSearch === 'function') {
      closeSearch();
    } else if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Sample product data - replace with actual data later
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
    {
      id: 4,
      name: "Designer Check Shirt",
      category: "shirts",
      price: 1599,
      image: "/api/placeholder/400/500",
      isNew: false
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
    // More products truncated for brevity
  ];

  // Reset search query when overlay opens
  useEffect(() => {
    if (isOpen) {
      // Clear previous search query when opening
      setSearchQuery('');
      setSearchResults([]);
      
      // Focus on input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Close overlay with escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  // Handle search input
  const handleSearchInput = (e) => {
    const query = e.target.value;
    console.log("Search input:", query); // Debug log
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Search products
    const filteredResults = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) || 
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filteredResults);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      handleClose(); // Use our new function that handles either prop
    }
  };

  // Capitalize first letter helper
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className={`search-overlay ${isOpen ? 'active' : ''}`}>
      <div className="search-close" onClick={handleClose}>
        <i className="fas fa-times"></i>
      </div>
      <div className="search-container">
        <form onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for products..." 
            value={searchQuery}
            onChange={handleSearchInput}
            ref={inputRef}
            style={{ 
              color: '#fff', // Make sure text is visible
              caretColor: '#fff', // Make cursor visible
              backgroundColor: 'transparent',
              border: 'none',
              width: '100%',
              padding: '20px',
              fontSize: '1.8rem',
              outline: 'none',
              borderBottom: '2px solid #c59b6d'
            }}
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
              <>No products found for "{searchQuery}"</>
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
          <div className="product-card" key={product.id} onClick={handleSearchSubmit}>
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

        {/* View more button */}
        {searchResults.length > 4 && (
          <div className="view-more-results">
            <button className="view-all-btn" onClick={handleSearchSubmit}>
              View all {searchResults.length} results
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;