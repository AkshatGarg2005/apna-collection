import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Search.css';
// Add FontAwesome stylesheet for icons
import 'font-awesome/css/font-awesome.min.css';

// Mock product data - in a real app, this would come from an API or context
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
  {
    id: 7,
    name: "Distressed Denim Jeans",
    category: "jeans",
    price: 1999,
    image: "/api/placeholder/400/500",
    isNew: false
  },
  {
    id: 8,
    name: "Black Slim Fit Jeans",
    category: "jeans",
    price: 1899,
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
  },
  {
    id: 11,
    name: "Cotton Casual Kurta",
    category: "kurta",
    price: 1999,
    image: "/api/placeholder/400/500",
    isNew: true
  },
  {
    id: 12,
    name: "Festive Embroidered Kurta",
    category: "kurta",
    price: 2499,
    image: "/api/placeholder/400/500",
    isNew: false
  },
  
  // T-shirts
  {
    id: 13,
    name: "Classic Round Neck T-shirt",
    category: "tshirt",
    price: 799,
    image: "/api/placeholder/400/500",
    isNew: false
  },
  {
    id: 14,
    name: "Premium V-Neck T-shirt",
    category: "tshirt",
    price: 899,
    image: "/api/placeholder/400/500",
    isNew: true
  },
  {
    id: 15,
    name: "Graphic Print T-shirt",
    category: "tshirt",
    price: 999,
    image: "/api/placeholder/400/500",
    isNew: false
  },
  {
    id: 16,
    name: "Polo T-shirt",
    category: "tshirt",
    price: 1199,
    image: "/api/placeholder/400/500",
    isNew: true
  },
  
  // Undergarments
  {
    id: 17,
    name: "Premium Cotton Briefs (Pack of 3)",
    category: "undergarments",
    price: 699,
    image: "/api/placeholder/400/500",
    isNew: true
  },
  {
    id: 18,
    name: "Boxer Shorts (Pack of 2)",
    category: "undergarments",
    price: 599,
    image: "/api/placeholder/400/500",
    isNew: false
  },
  {
    id: 19,
    name: "Cotton Vest (Pack of 3)",
    category: "undergarments",
    price: 499,
    image: "/api/placeholder/400/500",
    isNew: false
  },
  {
    id: 20,
    name: "Thermal Underwear Set",
    category: "undergarments",
    price: 999,
    image: "/api/placeholder/400/500",
    isNew: true
  },
  {
    id: 21,
    name: "Bamboo Fiber Briefs (Pack of 3)",
    category: "undergarments",
    price: 799,
    image: "/api/placeholder/400/500",
    isNew: false
  },
  {
    id: 22,
    name: "Designer Boxer Shorts",
    category: "undergarments",
    price: 499,
    image: "/api/placeholder/400/500",
    isNew: true
  },
  {
    id: 23,
    name: "Sports Underwear (Pack of 2)",
    category: "undergarments",
    price: 699,
    image: "/api/placeholder/400/500",
    isNew: false
  },
  {
    id: 24,
    name: "Premium Cotton Vests (Pack of 5)",
    category: "undergarments",
    price: 799,
    image: "/api/placeholder/400/500",
    isNew: false
  }
];

const Search = ({ addToCart }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';
  
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState({});
  
  useEffect(() => {
    // Reset search input when query changes
    setSearchInput(searchQuery);
    
    // Perform search
    performSearch();
  }, [searchQuery, selectedCategory, sortOption]);
  
  const performSearch = () => {
    if (!searchQuery && selectedCategory === 'all') {
      setSearchResults([]);
      return;
    }
    
    // Filter products based on search query
    let results = products;
    
    if (searchQuery) {
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter if not "all"
    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        results.sort((a, b) => b.name.localeCompare(a.name));
        break;
      // Default sorting is as is
    }
    
    setSearchResults(results);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchInput)}`);
  };
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const toggleFavorite = (productId) => {
    setFavorites(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  const handleAddToCart = (product) => {
    const productToAdd = {
      ...product,
      size: "M", // Default size
      color: "Default", // Default color
      quantity: 1
    };
    
    addToCart(productToAdd);
  };
  
  // Helper function to capitalize the first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Render the search results or empty state
  const renderSearchResults = () => {
    if (!searchQuery) {
      return (
        <div className="no-search-results">
          <div className="no-results-icon">
            <i className="fas fa-search"></i>
          </div>
          <h2 className="no-results-heading">Please enter a search term</h2>
          <p className="no-results-message">
            Try searching for product names, categories, or specific styles you're looking for.
          </p>
          <div className="search-category-chips">
            <Link to="/search?q=shirts" className="category-chip">Shirts</Link>
            <Link to="/search?q=jeans" className="category-chip">Jeans</Link>
            <Link to="/search?q=kurta" className="category-chip">Kurta</Link>
            <Link to="/search?q=tshirt" className="category-chip">T-shirts</Link>
          </div>
        </div>
      );
    }
    
    if (searchResults.length === 0) {
      return (
        <div className="no-search-results">
          <div className="no-results-icon">
            <i className="fas fa-search"></i>
          </div>
          <h2 className="no-results-heading">No products found for "{searchQuery}"</h2>
          <p className="no-results-message">
            Try checking for typos or using more general terms. 
            You can also browse our categories to find what you're looking for.
          </p>
          <div className="search-category-chips">
            <Link to="/search?q=shirts" className="category-chip">Shirts</Link>
            <Link to="/search?q=jeans" className="category-chip">Jeans</Link>
            <Link to="/search?q=kurta" className="category-chip">Kurta</Link>
            <Link to="/search?q=tshirt" className="category-chip">T-shirts</Link>
          </div>
        </div>
      );
    }
    
    return searchResults.map((product, index) => (
      <div className="product-card" key={product.id} style={{ animationDelay: `${index * 0.05}s` }}>
        <Link to={`/product/${product.id}`} className="product-link">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
            {product.isNew && <span className="product-badge">New</span>}
          </div>
        </Link>
        <div className="product-info">
          <h3 className="product-name">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <p className="product-category">{capitalizeFirstLetter(product.category)}</p>
          <p className="product-price">₹{product.price.toLocaleString()}</p>
          <div className="product-actions">
            <button 
              className="add-to-cart"
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </button>
            <i 
              className={`${favorites[product.id] ? 'fas' : 'far'} fa-heart product-favorite`}
              onClick={() => toggleFavorite(product.id)}
              style={{ color: favorites[product.id] ? '#e74c3c' : '#777' }}
            ></i>
          </div>
        </div>
      </div>
    ));
  };
  
  return (
    <main className="search-page-container">
      <div className="search-page-header">
        <h1 className="search-page-title">
          Search Results for "<span className="search-query">{searchQuery}</span>"
        </h1>
        <p className="search-page-subtitle">Discover our premium collection matching your search criteria.</p>
      </div>
      
      <div className="search-controls-container">
        <div className="navigation-controls">
          <Link to="/shop" className="back-to-shop">
            <i className="fas fa-arrow-left"></i> 
            <span>Back to Shop</span>
          </Link>
        </div>
        
        <div className="search-bar-wrapper">
          <div className="search-bar">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-input-container">
                <i className="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  className="search-again-input" 
                  placeholder="Refine your search..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="search-again-button">Search</button>
              </div>
            </form>
          </div>
          <div className="results-count">
            {searchResults.length > 0 && `${searchResults.length} item${searchResults.length !== 1 ? 's' : ''} found`}
          </div>
        </div>
      </div>
      
      <div className="search-layout">
        {/* Filters Sidebar */}
        <aside className="filter-sidebar">
          <h2 className="sidebar-title">Refine Results</h2>
          <div className="filter-options">
            <div className="filter-group">
              <h3 className="filter-title">Sort By</h3>
              <select 
                className="filter-select" 
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
            
            <div className="filter-group">
              <h3 className="filter-title">Category</h3>
              <select 
                className="filter-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="all">All Categories</option>
                <option value="shirts">Shirts</option>
                <option value="jeans">Jeans</option>
                <option value="kurta">Kurta</option>
                <option value="tshirt">T-shirts</option>
                <option value="undergarments">Undergarments</option>
              </select>
            </div>
          </div>
        </aside>
        
        {/* Search Results Grid */}
        <section className="search-results-container">
          <div className="search-results-grid">
            {renderSearchResults()}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Search;