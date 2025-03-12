import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [cartCount, setCartCount] = useState(3); // Initial cart count from the design

  // Sample product data
  const productData = [
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

  // Initialize products on component mount
  useEffect(() => {
    setProducts(productData);
    setFilteredProducts(productData);
  }, []);

  // Function to filter products by category
  const filterProducts = (category) => {
    setCurrentCategory(category);
    
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
  };

  // Function to handle adding product to cart
  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    // In a real app, you would add the product to the cart here
    setCartCount(prevCount => prevCount + 1);
    
    // Get the button reference
    const button = e.target;
    
    // Animation effect
    button.textContent = 'Added!';
    button.style.backgroundColor = '#c59b6d';
    
    setTimeout(() => {
      button.textContent = 'Add to Cart';
      button.style.backgroundColor = '#333';
    }, 1000);
  };

  // Function to toggle favorite status
  const handleToggleFavorite = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const icon = e.target;
    
    // Toggle the icon classes
    icon.classList.toggle('fas');
    icon.classList.toggle('far');
    
    // Change color based on favorite status
    icon.style.color = icon.classList.contains('fas') ? '#e74c3c' : '#777';
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <main className="shop-container">
      <div className="shop-header">
        <h1 className="shop-title">Shop by Category</h1>
        <p className="shop-description">
          Discover our premium collection of men's clothing, crafted with the finest materials for the modern Indian gentleman. 
          From traditional to contemporary, we have styles for every occasion.
        </p>
      </div>
      
      <div className="shop-layout">
        {/* Category Sidebar */}
        <aside className="category-sidebar">
          <h2 className="sidebar-title">Categories</h2>
          <ul className="category-list">
            <li className="category-item">
              <button 
                className={`category-button ${currentCategory === 'all' ? 'active' : ''}`} 
                onClick={() => filterProducts('all')}
              >
                <i className="fas fa-th category-icon"></i>All Products
              </button>
            </li>
            <li className="category-item">
              <button 
                className={`category-button ${currentCategory === 'shirts' ? 'active' : ''}`} 
                onClick={() => filterProducts('shirts')}
              >
                <i className="fas fa-tshirt category-icon"></i>Shirts
              </button>
            </li>
            <li className="category-item">
              <button 
                className={`category-button ${currentCategory === 'jeans' ? 'active' : ''}`} 
                onClick={() => filterProducts('jeans')}
              >
                <i className="fas fa-stream category-icon"></i>Jeans
              </button>
            </li>
            <li className="category-item">
              <button 
                className={`category-button ${currentCategory === 'kurta' ? 'active' : ''}`} 
                onClick={() => filterProducts('kurta')}
              >
                <i className="fas fa-vest-patches category-icon"></i>Kurta
              </button>
            </li>
            <li className="category-item">
              <button 
                className={`category-button ${currentCategory === 'tshirt' ? 'active' : ''}`} 
                onClick={() => filterProducts('tshirt')}
              >
                <i className="fas fa-tshirt category-icon"></i>T-shirt
              </button>
            </li>
            <li className="category-item">
              <button 
                className={`category-button ${currentCategory === 'undergarments' ? 'active' : ''}`} 
                onClick={() => filterProducts('undergarments')}
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
                          onClick={(e) => handleAddToCart(e, product.id)}
                        >
                          Add to Cart
                        </button>
                        <div className="product-favorite">
                          <i 
                            className="far fa-heart"
                            onClick={(e) => handleToggleFavorite(e, product.id)}
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
    </main>
  );
};

export default Shop;