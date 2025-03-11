import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchOverlay.css';

const SearchOverlay = () => {
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Product data (in a real application, this would come from an API or context)
  const products = [
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
  ];

  // Listen for search icon click (this is just for component testing)
  useEffect(() => {
    // This would normally be handled through props or a global state manager
    // For testing, we'll use a custom event
    const handleSearchOpen = () => {
      setIsActive(true);
    };

    document.addEventListener('openSearch', handleSearchOpen);

    return () => {
      document.removeEventListener('openSearch', handleSearchOpen);
    };
  }, []);

  // Listen for escape key to close overlay
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isActive) {
        closeOverlay();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isActive]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
    
    if (query.length >= 2) {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        // Filter products based on search query
        const results = products.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) || 
          product.category.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(results);
        setIsLoading(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  // Navigate to search results page
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      closeOverlay();
    }
  };

  // Navigate to full search results
  const handleViewAllResults = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    closeOverlay();
  };

  // Close overlay and reset state
  const closeOverlay = () => {
    setIsActive(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className={`search-overlay ${isActive ? 'active' : ''}`}>
      <div className="search-close" onClick={closeOverlay}>
        <i className="fas fa-times"></i>
      </div>
      <div className="search-container">
        <form onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for products..." 
            value={searchQuery}
            onChange={handleSearchChange}
            ref={searchInputRef}
          />
        </form>
      </div>
      <div className="search-results">
        {searchQuery.length >= 2 && (
          <>
            <div className="search-result-info">
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  Found {searchResults.length} results for "{searchQuery}"
                  <br />
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    (Press Enter to see all results)
                  </span>
                </>
              )}
            </div>

            {!isLoading && searchResults.length === 0 && (
              <div className="no-results">
                Try a different search term or browse our categories
              </div>
            )}

            {!isLoading && searchResults.slice(0, 4).map(product => (
              <div className="product-card" key={product.id} onClick={handleViewAllResults}>
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

            {!isLoading && searchResults.length > 4 && (
              <div className="view-more-results">
                <button className="view-all-btn" onClick={handleViewAllResults}>
                  View all {searchResults.length} results
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;