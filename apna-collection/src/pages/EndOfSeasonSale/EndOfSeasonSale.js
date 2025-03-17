import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './EndOfSeasonSale.css';

const EndOfSeasonSale = () => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // Set up state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [priceFilter, setPriceFilter] = useState('all');
  
  // Load initial favorites state from wishlist
  useEffect(() => {
    const initialFavorites = {};
    products.forEach(product => {
      initialFavorites[product.id] = isInWishlist(product.id);
    });
    setFavorites(initialFavorites);
  }, [products, isInWishlist]);
  
  // Handle error function
  const handleError = (message) => {
    setError(message);
    setLoading(false);
  };
  
  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get products collection reference
        const productsRef = collection(db, 'products');
        
        // Get all documents without any filtering or sorting
        const snapshot = await getDocs(productsRef);
        
        if (snapshot.empty) {
          setProducts([]);
          setFilteredProducts([]);
          setLoading(false);
          return;
        }
        
        // Process data client-side
        const allProducts = [];
        snapshot.forEach((doc) => {
          allProducts.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Filter for products marked as on sale
        const onSaleProducts = allProducts.filter(product => product.onSale === true);
        
        // Get the sale end date from the first product
        // (assuming all products have the same sale end date)
        if (onSaleProducts.length > 0 && onSaleProducts[0].saleEndDate) {
          setSaleEndDate(onSaleProducts[0].saleEndDate);
        }
        
        // Sort by price
        onSaleProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        
        console.log(`Found ${onSaleProducts.length} products on sale`);
        
        setProducts(onSaleProducts);
        
        // Apply any existing filters
        applyFilters(onSaleProducts, currentCategory, priceFilter);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sale products:", error);
        handleError("Failed to load sale collection. Please try again later.");
      }
    };
    
    fetchProducts();
  }, []);
  
  // Function to apply all filters
  const applyFilters = (productsList, category, priceRange) => {
    let filtered = [...productsList];
    
    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }
    
    // Apply price filter
    if (priceRange !== 'all') {
      switch(priceRange) {
        case 'under1000':
          filtered = filtered.filter(product => product.discountedPrice < 1000);
          break;
        case '1000to2000':
          filtered = filtered.filter(product => product.discountedPrice >= 1000 && product.discountedPrice <= 2000);
          break;
        case '2000to5000':
          filtered = filtered.filter(product => product.discountedPrice > 2000 && product.discountedPrice <= 5000);
          break;
        case 'above5000':
          filtered = filtered.filter(product => product.discountedPrice > 5000);
          break;
        default:
          break;
      }
    }
    
    setFilteredProducts(filtered);
  };
  
  // Function to filter products when category button is clicked
  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    applyFilters(products, category, priceFilter);
  };

  // Function to handle price filter change
  const handlePriceFilterChange = (range) => {
    setPriceFilter(range);
    applyFilters(products, currentCategory, range);
  };
  
  // Function to get products by category
  const getProductsByCategory = (category) => {
    // Filter products client-side
    if (category === 'all') {
      return products;
    } else {
      return products.filter(product => product.category === category);
    }
  };

  // Function to add product to cart
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a properly formatted product object for the cart
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.price, // Use the discounted price if available
      originalPrice: product.price, // Store original for reference
      image: product.image,
      quantity: 1,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M',
      color: product.colors && product.colors.length > 0 ? product.colors[0] : 'Default'
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

  // Function to toggle favorite status using WishlistContext
  const handleToggleFavorite = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create wishlist item
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.price,
      originalPrice: product.price,
      image: product.image,
      category: product.category
    };
    
    // Toggle item in wishlist and get result
    const isAdded = toggleWishlist(wishlistItem);
    
    // Update local UI state
    setFavorites(prev => ({
      ...prev,
      [product.id]: isAdded
    }));
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };
  
  // State to store sale end date
  const [saleEndDate, setSaleEndDate] = useState(null);
  
  // Calculate days left based on saleEndDate
  const calculateDaysLeft = () => {
    if (!saleEndDate) return 7; // Default fallback
    
    const today = new Date();
    const endDate = new Date(saleEndDate);
    
    // Get time difference in milliseconds
    const diffTime = endDate - today;
    
    // Convert to days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Return at least 1 day if sale is ending today, or 0 if already passed
    return diffDays > 0 ? diffDays : (diffDays === 0 ? 1 : 0);
  };
  
  // If there's an error with retry button
  if (error) {
    return (
      <div className="sale-container">
        <div className="sale-banner">
          <div className="sale-overlay">
            <h1 className="sale-title">End of Season Sale</h1>
            <p className="sale-subtitle">Up to 50% Off</p>
          </div>
        </div>
        
        <div className="error-container">
          <i className="fas fa-exclamation-circle error-icon"></i>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="sale-container">
      <div className="sale-banner">
        <div className="sale-overlay">
          <h1 className="sale-title">End of Season Sale</h1>
          <p className="sale-subtitle">Up to 50% Off - Limited Time</p>
          <div className="countdown-banner">
            <span className="countdown-text">Sale Ends In:</span>
            <span className="countdown-days">{calculateDaysLeft()}</span>
            <span className="countdown-label">Days</span>
          </div>
        </div>
      </div>
      
      <div className="sale-inner">
        <div className="sale-header">
          <h2 className="collection-title">End of Season Clearance</h2>
          <p className="collection-description">
            Enjoy massive discounts on our premium clothing collection. Hurry now and shop our limited-time offers
            before they're gone. Quality essentials at incredible prices.
          </p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading sale items...</p>
          </div>
        ) : (
          <div className="sale-layout">
            {/* Category Sidebar */}
            <aside className="category-sidebar">
              <h2 className="sidebar-title">Categories</h2>
              <ul className="category-list">
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'all' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('all')}
                  >
                    <i className="fas fa-th category-icon"></i>All Sale Items
                  </button>
                </li>
                
                {/* Regular Wear Categories */}
                <li className="category-group">Regular Wear</li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'shirts' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('shirts')}
                  >
                    <i className="fas fa-tshirt category-icon"></i>Shirts
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'jeans' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('jeans')}
                  >
                    <i className="fas fa-stream category-icon"></i>Jeans
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'tshirt' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('tshirt')}
                  >
                    <i className="fas fa-tshirt category-icon"></i>T-Shirts
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'undergarments' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('undergarments')}
                  >
                    <i className="fas fa-box category-icon"></i>Undergarments
                  </button>
                </li>
                
                {/* Wedding Collection Categories */}
                <li className="category-group">Wedding Collection</li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'sherwanis' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('sherwanis')}
                  >
                    <i className="fas fa-vest category-icon"></i>Sherwanis
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'weddingsuits' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('weddingsuits')}
                  >
                    <i className="fas fa-user-tie category-icon"></i>Wedding Suits
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'waistcoats' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('waistcoats')}
                  >
                    <i className="fas fa-vest-patches category-icon"></i>Waistcoats
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'accessories' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('accessories')}
                  >
                    <i className="fas fa-ring category-icon"></i>Accessories
                  </button>
                </li>
                
                {/* Festive Collection Categories */}
                <li className="category-group">Festive Collection</li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'kurta' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('kurta')}
                  >
                    <i className="fas fa-vest-patches category-icon"></i>Kurtas
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'festive-shirts' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('festive-shirts')}
                  >
                    <i className="fas fa-tshirt category-icon"></i>Festive Shirts
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'bottom-wear' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('bottom-wear')}
                  >
                    <i className="fas fa-socks category-icon"></i>Bottom Wear
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'ethnic-sets' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('ethnic-sets')}
                  >
                    <i className="fas fa-vest category-icon"></i>Ethnic Sets
                  </button>
                </li>
              </ul>
              
              <div className="price-filter">
                <h3 className="filter-title">Price Range</h3>
                <div className="price-options">
                  <button 
                    className={`price-option ${priceFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handlePriceFilterChange('all')}
                  >
                    All Prices
                  </button>
                  <button 
                    className={`price-option ${priceFilter === 'under1000' ? 'active' : ''}`}
                    onClick={() => handlePriceFilterChange('under1000')}
                  >
                    Under ₹1000
                  </button>
                  <button 
                    className={`price-option ${priceFilter === '1000to2000' ? 'active' : ''}`}
                    onClick={() => handlePriceFilterChange('1000to2000')}
                  >
                    ₹1000 - ₹2000
                  </button>
                  <button 
                    className={`price-option ${priceFilter === '2000to5000' ? 'active' : ''}`}
                    onClick={() => handlePriceFilterChange('2000to5000')}
                  >
                    ₹2000 - ₹5000
                  </button>
                  <button 
                    className={`price-option ${priceFilter === 'above5000' ? 'active' : ''}`}
                    onClick={() => handlePriceFilterChange('above5000')}
                  >
                    Above ₹5000
                  </button>
                </div>
              </div>
              
              <div className="sale-highlights">
                <h3 className="highlights-title">Sale Highlights</h3>
                <ul className="highlights-list">
                  <li><i className="fas fa-tag"></i> Up to 50% off</li>
                  <li><i className="fas fa-truck"></i> Free shipping on orders above ₹999</li>
                  <li><i className="fas fa-undo"></i> Easy 30-day returns</li>
                  <li><i className="fas fa-clock"></i> Sale ends soon!</li>
                </ul>
              </div>
            </aside>
            
            {/* Products Grid */}
            <section className="products-grid-container">
              <div className="products-header">
                <h2 className="products-title">
                  {currentCategory === 'all' ? 'All Sale Items' : `${capitalizeFirstLetter(currentCategory)} on Sale`}
                </h2>
                <span className="products-count">{filteredProducts.length} items</span>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p className="no-products-message">
                    {currentCategory === 'all' 
                      ? "Our End of Season Sale is coming soon! Check back later for amazing deals." 
                      : `No sale products found in the ${capitalizeFirstLetter(currentCategory)} category.`}
                  </p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div className="product-card sale-card" key={product.id}>
                      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="product-image">
                          <img src={product.image || "https://images.unsplash.com/photo-1616150638538-ffb0679a3fc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} alt={product.name} />
                          {product.discountPercentage && <span className="product-badge sale-badge">{product.discountPercentage}% OFF</span>}
                          <div className="sale-timer">
                            <i className="fas fa-clock"></i> Limited Time
                          </div>
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-category">{capitalizeFirstLetter(product.category)}</p>
                          <div className="product-price-container">
                            {product.discountedPrice ? (
                              <>
                                <p className="product-original-price">₹{product.price?.toLocaleString()}</p>
                                <p className="product-discounted-price">₹{product.discountedPrice?.toLocaleString()}</p>
                              </>
                            ) : (
                              <p className="product-price">₹{product.price?.toLocaleString()}</p>
                            )}
                          </div>
                          <div className="product-actions">
                            <button 
                              className="add-to-cart sale-btn"
                              onClick={(e) => handleAddToCart(e, product)}
                            >
                              Add to Cart
                            </button>
                            <div className="product-favorite">
                              <i 
                                className={`${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart`}
                                onClick={(e) => handleToggleFavorite(e, product)}
                                style={{ color: isInWishlist(product.id) ? '#e74c3c' : '#777' }}
                              ></i>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="sale-banner-bottom">
                <div className="sale-banner-content">
                  <h3>Don't Miss Out!</h3>
                  <p>End of season sale ends in just {calculateDaysLeft()} days. Shop now before it's too late!</p>
                  <Link to="/shop" className="view-all-button">View All Collections</Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default EndOfSeasonSale;