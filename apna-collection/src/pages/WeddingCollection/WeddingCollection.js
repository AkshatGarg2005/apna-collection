import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { collection, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './WeddingCollection.css';

const WeddingCollection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // Set up state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  
  // Function to filter products when category button is clicked
  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    
    // For now, we're just setting the active category without actual filtering
    // The real filtering will be implemented later in the admin dashboard
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      // This is a placeholder - in the future, you'll filter based on wedding-specific categories
      setFilteredProducts(products);
    }
  };
  
  // Load initial favorites state from wishlist
  useEffect(() => {
    const initialFavorites = {};
    products.forEach(product => {
      initialFavorites[product.id] = isInWishlist(product.id);
    });
    setFavorites(initialFavorites);
  }, [products, isInWishlist]);
  
  // Fetch wedding products from Firebase
  useEffect(() => {
    const fetchWeddingProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get all products since isWedding field might not exist yet
        const productsQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(productsQuery);
        
        if (querySnapshot.empty) {
          setProducts([]);
          setFilteredProducts([]);
          setLoading(false);
          return;
        }
        
        let productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter by isWedding flag if it exists, otherwise show sample products
        if (productsList.some(product => product.isWedding !== undefined)) {
          productsList = productsList.filter(product => product.isWedding === true);
        } else {
          // If no products have isWedding flag, show first 6 products as samples
          productsList = productsList.slice(0, 6);
        }
        
        setProducts(productsList);
        setFilteredProducts(productsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching wedding products:", error);
        setError("Failed to load wedding collection. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchWeddingProducts();
  }, []);

  // Function to add product to cart
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a properly formatted product object for the cart
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M', // First available size or default
      color: product.colors && product.colors.length > 0 ? product.colors[0] : 'Default' // First available color or default
    };
    
    // Add to cart using context
    addToCart(productToAdd);
    
    // Animation effect
    const button = e.target;
    button.textContent = 'Added!';
    button.style.backgroundColor = '#c59b6d';
    
    setTimeout(() => {
      button.textContent = 'Add to Cart';
      button.style.backgroundColor = '#333';
    }, 1000);
  };

  // Function to toggle favorite status using WishlistContext
  const handleToggleFavorite = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create wishlist item
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
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
    
    // Update the icon appearance
    const icon = e.target;
    
    // Toggle the icon classes
    if (isAdded) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      icon.style.color = '#e74c3c';
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
      icon.style.color = '#777';
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  return (
    <main className="wedding-container">
      <div className="wedding-banner">
        <div className="wedding-overlay">
          <h1 className="wedding-title">Wedding Collection</h1>
          <p className="wedding-subtitle">Elegance for Your Special Day</p>
        </div>
      </div>
      
      <div className="wedding-inner">
        <div className="wedding-header">
          <h2 className="collection-title">Wedding Collection</h2>
          <p className="collection-description">
            Make your special day even more memorable with our exclusive wedding collection. 
            From traditional sherwanis to modern suits, discover the perfect attire for the groom and wedding guests.
          </p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading wedding collection...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <i className="fas fa-exclamation-circle error-icon"></i>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              <i className="fas fa-redo"></i> Try Again
            </button>
          </div>
        ) : (
          <div className="wedding-layout">
            {/* Sidebar with wedding categories */}
            <aside className="category-sidebar">
              <h2 className="sidebar-title">Wedding Categories</h2>
              <ul className="category-list">
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'all' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('all')}
                  >
                    <i className="fas fa-star category-icon"></i>All Wedding Collection
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'sherwanis' ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('sherwanis')}
                  >
                    <i className="fas fa-vest-patches category-icon"></i>Sherwanis
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'weddingsuits' ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('weddingsuits')}
                  >
                    <i className="fas fa-tshirt category-icon"></i>Wedding Suits
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'waistcoats' ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('waistcoats')}
                  >
                    <i className="fas fa-vest category-icon"></i>Waistcoats
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'accessories' ? 'active' : ''}`}
                    onClick={() => handleCategoryClick('accessories')}
                  >
                    <i className="fas fa-socks category-icon"></i>Accessories
                  </button>
                </li>
              </ul>
              
              <div className="wedding-occasions">
                <h3 className="occasion-title">Shop by Occasion</h3>
                <div className="occasion-tags">
                  <span className="occasion-tag">Engagement</span>
                  <span className="occasion-tag">Reception</span>
                  <span className="occasion-tag">Sangeet</span>
                  <span className="occasion-tag">Haldi</span>
                  <span className="occasion-tag">Ceremony</span>
                </div>
              </div>
            </aside>
            
            {/* Products Grid */}
            <section className="products-grid-container">
              <div className="products-header">
                <h2 className="products-title">
                  {currentCategory === 'all' ? 'Wedding Collection' : 
                   currentCategory === 'sherwanis' ? 'Sherwanis' :
                   currentCategory === 'weddingsuits' ? 'Wedding Suits' :
                   currentCategory === 'waistcoats' ? 'Waistcoats' :
                   currentCategory === 'accessories' ? 'Accessories' :
                   'Wedding Collection'}
                </h2>
                <span className="products-count">{filteredProducts.length} items</span>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p className="no-products-message">
                    No wedding collection products available at the moment. Please check back later!
                  </p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div className="product-card wedding-card" key={product.id}>
                      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="product-image">
                          <img src={product.image || "https://images.unsplash.com/photo-1571425046056-2d768d6152a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} alt={product.name} />
                          <span className="product-badge wedding-badge">Wedding</span>
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-category">{capitalizeFirstLetter(product.category)}</p>
                          <p className="product-price">₹{product.price?.toLocaleString() || 0}</p>
                          <div className="product-actions">
                            <button 
                              className="add-to-cart wedding-btn"
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
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default WeddingCollection;