import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './Search.css';
// Add FontAwesome stylesheet for icons
import 'font-awesome/css/font-awesome.min.css';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';
  const { addToCart } = useCart();
  
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toggle sidebar function for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Fetch all products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productsQuery = query(collection(db, 'products'));
        
        const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
          if (snapshot.empty) {
            setAllProducts([]);
            setLoading(false);
            return;
          }
          
          const productsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setAllProducts(productsList);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching products:", error);
          setError("Failed to load products. Please try again later.");
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up products listener:", error);
        setError("Something went wrong. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Perform search when query or filters change
  useEffect(() => {
    if (allProducts.length > 0) {
      performSearch();
    }
  }, [searchQuery, selectedCategory, sortOption, allProducts]);
  
  // Search functionality
  const performSearch = () => {
    // If no search query and category is "all", show no results
    if (!searchQuery && selectedCategory === 'all') {
      setSearchResults([]);
      return;
    }
    
    // Filter products based on search query
    let results = [...allProducts];
    
    if (searchQuery) {
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
    
    // Close sidebar on mobile after selecting a category
    if (window.innerWidth < 992) {
      setIsSidebarOpen(false);
    }
  };
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    
    // Close sidebar on mobile after selecting a sort option
    if (window.innerWidth < 992) {
      setIsSidebarOpen(false);
    }
  };
  
  const toggleFavorite = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    setFavorites(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  // Handle adding to cart
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M", // Default size
      color: product.colors && product.colors.length > 0 ? product.colors[0] : "Default" // Default color
    };
    
    // Add to cart using context
    addToCart(productToAdd);
    
    // Animation effect
    const button = e.target.closest('button');
    if (button) {
      button.textContent = 'Added!';
      button.style.backgroundColor = '#c59b6d';
      
      setTimeout(() => {
        button.textContent = 'Add to Cart';
        button.style.backgroundColor = '#333';
      }, 1000);
    }
  };
  
  // Helper function to capitalize the first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Get unique categories from products for category chips
  const getUniqueCategories = () => {
    if (!allProducts.length) return [];
    
    const categories = allProducts
      .map(product => product.category)
      .filter((value, index, self) => self.indexOf(value) === index);
      
    return categories.slice(0, 5); // Limit to 5 categories for display
  };
  
  // Render the search results or empty state
  const renderSearchResults = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching products...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-container">
          <i className="fas fa-exclamation-circle error-icon"></i>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      );
    }
    
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
            {getUniqueCategories().map(category => (
              <Link 
                key={category} 
                to={`/search?q=${category}`} 
                className="category-chip"
              >
                {capitalizeFirstLetter(category)}
              </Link>
            ))}
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
            {getUniqueCategories().map(category => (
              <Link 
                key={category} 
                to={`/search?q=${category}`} 
                className="category-chip"
              >
                {capitalizeFirstLetter(category)}
              </Link>
            ))}
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
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-category">{capitalizeFirstLetter(product.category)}</p>
            <p className="product-price">₹{product.price.toLocaleString()}</p>
            <div className="product-actions">
              <button 
                className="add-to-cart"
                onClick={(e) => handleAddToCart(e, product)}
              >
                Add to Cart
              </button>
              <div className="product-favorite">
                <i 
                  className={`${favorites[product.id] ? 'fas' : 'far'} fa-heart`}
                  onClick={(e) => toggleFavorite(e, product.id)}
                  style={{ color: favorites[product.id] ? '#e74c3c' : '#777' }}
                ></i>
              </div>
            </div>
          </div>
        </Link>
      </div>
    ));
  };
  
  return (
    <main className="search-page-container">
      <div className="search-page-header">
        <h1 className="search-page-title">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Our Collection'}
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
                  placeholder="Search products..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
                <button type="submit" className="search-again-button" aria-label="Search">
                  <i className="fas fa-arrow-right"></i>
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
          <div className="results-count">
            {searchResults.length > 0 && `${searchResults.length} item${searchResults.length !== 1 ? 's' : ''} found`}
          </div>
        </div>
      </div>
      
      {/* Mobile Filter Toggle Button */}
      <button className="mobile-filter-toggle" onClick={toggleSidebar}>
        <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-sliders-h'}`}></i> 
        {isSidebarOpen ? 'Close' : `Filter & Sort (${searchResults.length} products)`}
      </button>
      
      <div className="search-layout">
        {/* Filters Sidebar */}
        <aside className={`filter-sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-title">Refine Results</h2>
            <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
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
                {allProducts.length > 0 && [...new Set(allProducts.map(product => product.category))]
                  .sort()
                  .map(category => (
                    <option key={category} value={category}>
                      {capitalizeFirstLetter(category)}
                    </option>
                  ))
                }
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