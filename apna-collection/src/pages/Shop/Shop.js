import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { collection, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './Shop.css';

const Shop = () => {
  const location = useLocation();
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
  
  // Mobile menu state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toggle sidebar function for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
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
        
        // Set up real-time listener for products collection
        const productsQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
          if (snapshot.empty) {
            setProducts([]);
            setFilteredProducts([]);
            setLoading(false);
            return;
          }
          
          const productsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
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
        }, (error) => {
          console.error("Error fetching products:", error);
          setError("Failed to load products. Please try again later.");
          setLoading(false);
        });
        
        // Clean up the listener on component unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up products listener:", error);
        setError("Something went wrong. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []); // Empty dependency array to execute only once on mount
  
  // Parse the URL parameter whenever location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam) {
      // Set the current category state
      setCurrentCategory(categoryParam);
      
      // Filter products based on this category
      if (categoryParam === 'all') {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter(product => 
          product.category === categoryParam
        );
        setFilteredProducts(filtered);
      }
    } else {
      // If no category param, show all products
      setCurrentCategory('all');
      setFilteredProducts(products);
    }
  }, [location.search, products]);

  // Function to filter products when category button is clicked
  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    
    // Update the URL to match the selected category
    if (category === 'all') {
      navigate('/shop');
    } else {
      navigate(`/shop?category=${category}`);
    }
    
    // Filter the products
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
    
    // Close sidebar on mobile after selecting a category
    if (window.innerWidth < 992) {
      setIsSidebarOpen(false);
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
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M', // First available size or default
      color: product.colors && product.colors.length > 0 ? product.colors[0] : 'Default' // First available color or default
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
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  return (
    <main className="shop-container">
      <div className="shop-inner">
        <div className="shop-header">
          <h1 className="shop-title">Shop by Category</h1>
          <p className="shop-description">
            Discover our premium collection of men's clothing, crafted with the finest materials for the modern Indian gentleman. 
            From traditional to contemporary, we have styles for every occasion.
          </p>
        </div>
        
        {/* Mobile Filter Toggle Button */}
        <button className="mobile-filter-toggle" onClick={toggleSidebar}>
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-filter'}`}></i> 
          {isSidebarOpen ? 'Close Categories' : 'Browse Categories'}
        </button>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
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
          <div className="shop-layout">
            {/* Category Sidebar */}
            <aside className={`category-sidebar ${isSidebarOpen ? 'active' : ''}`}>
              <div className="sidebar-header">
                <h2 className="sidebar-title">Categories</h2>
                <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <ul className="category-list">
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'all' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('all')}
                  >
                    <i className="fas fa-th category-icon"></i>All Products
                  </button>
                </li>
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
                    className={`category-button ${currentCategory === 'kurta' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('kurta')}
                  >
                    <i className="fas fa-vest-patches category-icon"></i>Kurta
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'tshirt' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('tshirt')}
                  >
                    <i className="fas fa-tshirt category-icon"></i>T-shirt
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'undergarments' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('undergarments')}
                  >
                    <i className="fas fa-socks category-icon"></i>Undergarments
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'sherwanis' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('sherwanis')}
                  >
                    <i className="fas fa-user-tie category-icon"></i>Sherwanis
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
                    <i className="fas fa-vest category-icon"></i>Waistcoats
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'accessories' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('accessories')}
                  >
                    <i className="fas fa-gem category-icon"></i>Accessories
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
                    <i className="fas fa-grip-lines-vertical category-icon"></i>Bottom Wear
                  </button>
                </li>
                <li className="category-item">
                  <button 
                    className={`category-button ${currentCategory === 'ethnic-sets' ? 'active' : ''}`} 
                    onClick={() => handleCategoryClick('ethnic-sets')}
                  >
                    <i className="fas fa-vest-patches category-icon"></i>Ethnic Sets
                  </button>
                </li>
              </ul>
            </aside>
            
            {/* Products Grid */}
            <section className="products-grid-container">
              <div className="products-header">
                <h2 className="products-title">
                  {currentCategory === 'all' ? 'All Products' : capitalizeFirstLetter(currentCategory)}
                </h2>
                <span className="products-count">{filteredProducts.length} items</span>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p className="no-products-message">
                    {currentCategory === 'all' 
                      ? "No products have been added yet. Check back later!" 
                      : `No products found in the ${capitalizeFirstLetter(currentCategory)} category.`}
                  </p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div className="product-card" key={product.id}>
                      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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

export default Shop;