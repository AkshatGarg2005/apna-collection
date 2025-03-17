import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './FestiveCollection.css';

const FestiveCollection = () => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // Set up state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  
  // Load initial favorites state from wishlist
  useEffect(() => {
    const initialFavorites = {};
    products.forEach(product => {
      initialFavorites[product.id] = isInWishlist(product.id);
    });
    setFavorites(initialFavorites);
  }, [products, isInWishlist]);
  
  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all products and then filter the ones appropriate for festive collection
        const productsQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(50)
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
        
        // Filter by isFestive flag if it exists, otherwise show all products temporarily
        if (productsList.some(product => product.isFestive !== undefined)) {
          productsList = productsList.filter(product => product.isFestive === true);
        }
        
        setProducts(productsList);
        
        // Apply any existing category filter
        if (currentCategory === 'all') {
          setFilteredProducts(productsList);
        } else {
          const filtered = productsList.filter(product => 
            product.category === currentCategory
          );
          setFilteredProducts(filtered);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching festive products:", error);
        setError("Failed to load festive collection. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentCategory]);
  
  // Function to filter products when category button is clicked
  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    
    // Filter the products
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
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
      price: product.price,
      image: product.image,
      quantity: 1,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M',
      color: product.colors && product.colors.length > 0 ? product.colors[0] : 'Default'
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
  
  // If there's an error with retry button
  if (error) {
    return (
      <div className="festive-container">
        <div className="festive-banner">
          <div className="festive-overlay">
            <h1 className="festive-title">Festival Collection</h1>
            <p className="festive-subtitle">Celebrate with Style</p>
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
    <main className="festive-container">
      <div className="festive-banner">
        <div className="festive-overlay">
          <h1 className="festive-title">Festival Collection</h1>
          <p className="festive-subtitle">Celebrate with Style</p>
        </div>
      </div>
      
      <div className="festive-inner">
        <div className="festive-header">
          <h2 className="collection-title">Festival Collection</h2>
          <p className="collection-description">
            Discover our exclusive festival collection, designed to make your celebrations more special. 
            From traditional kurtas to modern festive wear, find the perfect outfit for every occasion.
          </p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading festive collection...</p>
          </div>
        ) : (
          <div className="festive-layout">
            {/* Category Sidebar */}
            <aside className="category-sidebar">
              <h2 className="sidebar-title">Festive Categories</h2>
              <ul className="category-list">
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'all' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('all')}
                  >
                    <i className="fas fa-th category-icon"></i>All Festival Items
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'kurta' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('kurta')}
                  >
                    <i className="fas fa-vest-patches category-icon"></i>Traditional Kurtas
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'shirts' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('shirts')}
                  >
                    <i className="fas fa-tshirt category-icon"></i>Festive Shirts
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'jeans' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('jeans')}
                  >
                    <i className="fas fa-stream category-icon"></i>Bottom Wear
                  </button>
                </li>
              </ul>
              
              <div className="festive-occasion">
                <h3 className="occasion-title">Shop by Occasion</h3>
                <div className="occasion-tags">
                  <span className="occasion-tag">Diwali</span>
                  <span className="occasion-tag">Holi</span>
                  <span className="occasion-tag">Weddings</span>
                  <span className="occasion-tag">Eid</span>
                  <span className="occasion-tag">Durga Puja</span>
                </div>
              </div>
            </aside>
            
            {/* Products Grid */}
            <section className="products-grid-container">
              <div className="products-header">
                <h2 className="products-title">
                  {currentCategory === 'all' ? 'All Festival Wear' : `Festive ${capitalizeFirstLetter(currentCategory)}`}
                </h2>
                <span className="products-count">{filteredProducts.length} items</span>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p className="no-products-message">
                    {currentCategory === 'all' 
                      ? "No festive products have been added yet. Check back later!" 
                      : `No festive products found in the ${capitalizeFirstLetter(currentCategory)} category.`}
                  </p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div className="product-card festive-card" key={product.id}>
                      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="product-image">
                          <img src={product.image || "https://images.unsplash.com/photo-1616150638538-ffb0679a3fc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} alt={product.name} />
                          <span className="product-badge festive-badge">Festive</span>
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-category">{capitalizeFirstLetter(product.category)}</p>
                          <p className="product-price">₹{product.price?.toLocaleString() || 0}</p>
                          <div className="product-actions">
                            <button 
                              className="add-to-cart festive-btn"
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

export default FestiveCollection;