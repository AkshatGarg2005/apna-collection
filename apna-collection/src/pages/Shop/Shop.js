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
  
  // Sample product data for fallback
  const sampleProductData = [
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
    // ... [rest of the sample data] ...
  ];
  
  // Set up state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [useFallbackData, setUseFallbackData] = useState(false);
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
        // Set up real-time listener for products collection
        const productsQuery = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
          const productsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // If we successfully got products from Firebase
          if (productsList.length > 0) {
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
          } else {
            // If no products were returned, use sample data
            setUseFallbackData(true);
            setProducts(sampleProductData);
            
            if (currentCategory === 'all') {
              setFilteredProducts(sampleProductData);
            } else {
              const filtered = sampleProductData.filter(product => 
                product.category === currentCategory
              );
              setFilteredProducts(filtered);
            }
          }
          
          setLoading(false);
        }, (error) => {
          console.error("Error fetching products:", error);
          // Use sample data on error
          setUseFallbackData(true);
          setProducts(sampleProductData);
          
          if (currentCategory === 'all') {
            setFilteredProducts(sampleProductData);
          } else {
            const filtered = sampleProductData.filter(product => 
              product.category === currentCategory
            );
            setFilteredProducts(filtered);
          }
          
          setLoading(false);
        });
        
        // Clean up the listener on component unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up products listener:", error);
        // Use sample data on error
        setUseFallbackData(true);
        setProducts(sampleProductData);
        
        if (currentCategory === 'all') {
          setFilteredProducts(sampleProductData);
        } else {
          const filtered = sampleProductData.filter(product => 
            product.category === currentCategory
          );
          setFilteredProducts(filtered);
        }
        
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
  };

  // Updated handleAddToCart function to use CartContext
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

  // Updated function to toggle favorite status using WishlistContext
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
    <main className="shop-container">
      <div className="shop-inner">
        <div className="shop-header">
          <h1 className="shop-title">Shop by Category</h1>
          <p className="shop-description">
            Discover our premium collection of men's clothing, crafted with the finest materials for the modern Indian gentleman. 
            From traditional to contemporary, we have styles for every occasion.
          </p>
          {useFallbackData && (
            <div className="data-notice">
              <p>Currently displaying sample data. Connect to Firebase for live data.</p>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="shop-layout">
            {/* Category Sidebar */}
            <aside className="category-sidebar">
              <h2 className="sidebar-title">Categories</h2>
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
                    <i className="fas fa-underwear category-icon"></i>Undergarments
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
                  <p className="no-products-message">No products found in this category.</p>
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