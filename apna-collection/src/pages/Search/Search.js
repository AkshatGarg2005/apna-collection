import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Search.css';

// Import shared components
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchOverlay from '../../components/SearchOverlay';

const Search = () => {
  // Get search query from URL
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';

  // State management
  const [searchResults, setSearchResults] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Mock product data (in a real app, you would fetch this from an API)
  const products = [
    // Shirts
    {
      id: 1,
      name: "Premium Cotton Formal Shirt",
      category: "shirts",
      price: 1299,
      image: "/product-images/shirt1.jpg",
      isNew: true
    },
    {
      id: 2,
      name: "Classic White Shirt",
      category: "shirts",
      price: 1199,
      image: "/product-images/shirt2.jpg",
      isNew: false
    },
    {
      id: 3,
      name: "Casual Linen Shirt",
      category: "shirts",
      price: 1499,
      image: "/product-images/shirt3.jpg",
      isNew: true
    },
    {
      id: 4,
      name: "Designer Check Shirt",
      category: "shirts",
      price: 1599,
      image: "/product-images/shirt4.jpg",
      isNew: false
    },
    
    // Jeans
    {
      id: 5,
      name: "Slim Fit Dark Denim Jeans",
      category: "jeans",
      price: 1899,
      image: "/product-images/jeans1.jpg",
      isNew: true
    },
    {
      id: 6,
      name: "Classic Blue Denim Jeans",
      category: "jeans",
      price: 1799,
      image: "/product-images/jeans2.jpg",
      isNew: false
    },
    {
      id: 7,
      name: "Distressed Denim Jeans",
      category: "jeans",
      price: 1999,
      image: "/product-images/jeans3.jpg",
      isNew: false
    },
    {
      id: 8,
      name: "Black Slim Fit Jeans",
      category: "jeans",
      price: 1899,
      image: "/product-images/jeans4.jpg",
      isNew: false
    },
    
    // Kurta
    {
      id: 9,
      name: "Traditional Silk Kurta",
      category: "kurta",
      price: 2999,
      image: "/product-images/kurta1.jpg",
      isNew: true
    },
    {
      id: 10,
      name: "Designer Wedding Kurta",
      category: "kurta",
      price: 3499,
      image: "/product-images/kurta2.jpg",
      isNew: false
    },
    {
      id: 11,
      name: "Cotton Casual Kurta",
      category: "kurta",
      price: 1999,
      image: "/product-images/kurta3.jpg",
      isNew: true
    },
    {
      id: 12,
      name: "Festive Embroidered Kurta",
      category: "kurta",
      price: 2499,
      image: "/product-images/kurta4.jpg",
      isNew: false
    },
    
    // T-shirts
    {
      id: 13,
      name: "Classic Round Neck T-shirt",
      category: "tshirt",
      price: 799,
      image: "/product-images/tshirt1.jpg",
      isNew: false
    },
    {
      id: 14,
      name: "Premium V-Neck T-shirt",
      category: "tshirt",
      price: 899,
      image: "/product-images/tshirt2.jpg",
      isNew: true
    },
    {
      id: 15,
      name: "Graphic Print T-shirt",
      category: "tshirt",
      price: 999,
      image: "/product-images/tshirt3.jpg",
      isNew: false
    },
    {
      id: 16,
      name: "Polo T-shirt",
      category: "tshirt",
      price: 1199,
      image: "/product-images/tshirt4.jpg",
      isNew: true
    },
    
    // Undergarments
    {
      id: 17,
      name: "Premium Cotton Briefs (Pack of 3)",
      category: "undergarments",
      price: 699,
      image: "/product-images/undergarment1.jpg",
      isNew: true
    },
    {
      id: 18,
      name: "Boxer Shorts (Pack of 2)",
      category: "undergarments",
      price: 599,
      image: "/product-images/undergarment2.jpg",
      isNew: false
    },
    {
      id: 19,
      name: "Cotton Vest (Pack of 3)",
      category: "undergarments",
      price: 499,
      image: "/product-images/undergarment3.jpg",
      isNew: false
    },
    {
      id: 20,
      name: "Thermal Underwear Set",
      category: "undergarments",
      price: 999,
      image: "/product-images/undergarment4.jpg",
      isNew: true
    },
    {
      id: 21,
      name: "Bamboo Fiber Briefs (Pack of 3)",
      category: "undergarments",
      price: 799,
      image: "/product-images/undergarment5.jpg",
      isNew: false
    },
    {
      id: 22,
      name: "Designer Boxer Shorts",
      category: "undergarments",
      price: 499,
      image: "/product-images/undergarment6.jpg",
      isNew: true
    },
    {
      id: 23,
      name: "Sports Underwear (Pack of 2)",
      category: "undergarments",
      price: 699,
      image: "/product-images/undergarment7.jpg",
      isNew: false
    },
    {
      id: 24,
      name: "Premium Cotton Vests (Pack of 5)",
      category: "undergarments",
      price: 799,
      image: "/product-images/undergarment8.jpg",
      isNew: false
    }
  ];

  // Update search results whenever filters or search query changes
  useEffect(() => {
    // Filter products by search query
    let filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Apply category filter if not "all"
    if (categoryFilter !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sorting remains as is
        break;
    }
    
    setSearchResults(filteredProducts);
  }, [searchQuery, categoryFilter, sortOption]);

  // Handle form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchInputValue)}`);
  };

  // Handle sort filter change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Handle adding to cart
  const handleAddToCart = (productId) => {
    // In a real app, you would update cart state/context here
    // For now, we'll just add a visual indication that the item was added
    const button = document.querySelector(`#add-to-cart-${productId}`);
    if (button) {
      button.textContent = 'Added!';
      button.style.backgroundColor = '#c59b6d';
      setTimeout(() => {
        button.textContent = 'Add to Cart';
        button.style.backgroundColor = '#333';
      }, 1000);
    }
  };

  // Handle favorite toggling
  const handleToggleFavorite = (e, productId) => {
    const target = e.currentTarget;
    const isFavorite = target.classList.contains('fas');
    
    if (isFavorite) {
      target.classList.remove('fas');
      target.classList.add('far');
      target.style.color = '#777';
    } else {
      target.classList.remove('far');
      target.classList.add('fas');
      target.style.color = '#e74c3c';
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Render NoResults component
  const NoResults = () => (
    <div className="no-search-results">
      <div className="no-results-icon">
        <i className="fas fa-search"></i>
      </div>
      <h2 className="no-results-heading">
        {!searchQuery 
          ? "Please enter a search term" 
          : `No products found for "${searchQuery}"`
        }
      </h2>
      <p className="no-results-message">
        {!searchQuery 
          ? "Try searching for product names, categories, or specific styles you're looking for."
          : "Try checking for typos or using more general terms. You can also browse our categories to find what you're looking for."
        }
      </p>
      <div className="search-category-chips">
        <Link to="/search?q=shirts" className="category-chip">Shirts</Link>
        <Link to="/search?q=jeans" className="category-chip">Jeans</Link>
        <Link to="/search?q=kurta" className="category-chip">Kurta</Link>
        <Link to="/search?q=tshirt" className="category-chip">T-shirts</Link>
      </div>
    </div>
  );

  return (
    <>
      <Header onSearchIconClick={() => setShowSearchOverlay(true)} />
      
      {showSearchOverlay && (
        <SearchOverlay 
          onClose={() => setShowSearchOverlay(false)}
          initialSearchQuery={searchQuery}
        />
      )}
      
      <main className="search-page-container">
        <div className="search-page-header">
          <h1 className="search-page-title">
            Search Results for "<span className="search-query">{searchQuery}</span>"
          </h1>
          <p className="search-page-subtitle">
            Discover our premium collection matching your search criteria.
          </p>
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
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                  />
                  <button type="submit" className="search-again-button">Search</button>
                </div>
              </form>
            </div>
            <div className="results-count">
              {searchResults.length} item{searchResults.length !== 1 ? 's' : ''} found
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
                  value={categoryFilter}
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
              {(!searchQuery || searchResults.length === 0) ? (
                <NoResults />
              ) : (
                searchResults.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="product-card"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Link to={`/product/${product.id}`} className="product-link">
                      <div className="product-image">
                        <img src={product.image} alt={product.name} />
                        {product.isNew && <span className="product-badge">New</span>}
                      </div>
                    </Link>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-category">{capitalizeFirstLetter(product.category)}</p>
                      <p className="product-price">₹{product.price.toLocaleString()}</p>
                      <div className="product-actions">
                        <button 
                          id={`add-to-cart-${product.id}`}
                          className="add-to-cart"
                          onClick={() => handleAddToCart(product.id)}
                        >
                          Add to Cart
                        </button>
                        <i 
                          className="far fa-heart product-favorite"
                          onClick={(e) => handleToggleFavorite(e, product.id)}
                        ></i>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Search;