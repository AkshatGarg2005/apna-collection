import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Shop.css';

// Import shared components
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchOverlay from '../../components/SearchOverlay';

const Shop = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const navigate = useNavigate();

  // Mock product data (in a real app, you would fetch this from an API)
  useEffect(() => {
    // This simulates fetching data from an API
    const fetchProducts = () => {
      const productData = [
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
      
      setProducts(productData);
      setFilteredProducts(productData);
    };

    fetchProducts();
  }, []);

  // Filter products by category
  useEffect(() => {
    if (currentCategory === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === currentCategory);
      setFilteredProducts(filtered);
    }
  }, [currentCategory, products]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
  };

  // Handle adding to cart
  const handleAddToCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    // In a real app, you would update cart state/context here
    // For now, we'll just add a visual indication that the item was added
    const button = e.target;
    button.textContent = 'Added!';
    button.style.backgroundColor = '#c59b6d';
    setTimeout(() => {
      button.textContent = 'Add to Cart';
      button.style.backgroundColor = '#333';
    }, 1000);
  };

  // Handle favorite toggling
  const handleToggleFavorite = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target;
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
  
  // Category data for the sidebar
  const categories = [
    { id: 'all', name: 'All Products', icon: 'fas fa-th' },
    { id: 'shirts', name: 'Shirts', icon: 'fas fa-tshirt' },
    { id: 'jeans', name: 'Jeans', icon: 'fas fa-stream' },
    { id: 'kurta', name: 'Kurta', icon: 'fas fa-vest-patches' },
    { id: 'tshirt', name: 'T-shirt', icon: 'fas fa-tshirt' },
    { id: 'undergarments', name: 'Undergarments', icon: 'fas fa-underwear' }
  ];

  return (
    <>
      <Header onSearchIconClick={() => setShowSearchOverlay(true)} />
      
      {showSearchOverlay && (
        <SearchOverlay 
          onClose={() => setShowSearchOverlay(false)}
          products={products}
          onSearch={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)}
        />
      )}
      
      <main className="shop-container">
        <div className="shop-header">
          <h1 className="shop-title">Shop by Category</h1>
          <p className="shop-description">
            Discover our premium collection of men's clothing, crafted with the finest materials 
            for the modern Indian gentleman. From traditional to contemporary, we have styles for every occasion.
          </p>
        </div>
        
        <div className="shop-layout">
          {/* Category Sidebar */}
          <aside className="category-sidebar">
            <h2 className="sidebar-title">Categories</h2>
            <ul className="category-list">
              {categories.map(category => (
                <li key={category.id} className="category-item">
                  <button 
                    className={`category-button ${currentCategory === category.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    <i className={`${category.icon} category-icon`}></i>
                    {category.name}
                  </button>
                </li>
              ))}
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
            
            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p className="no-products-message">No products found in this category.</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
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
                            onClick={(e) => handleAddToCart(e, product.id)}
                          >
                            Add to Cart
                          </button>
                          <i 
                            className="far fa-heart product-favorite"
                            onClick={(e) => handleToggleFavorite(e, product.id)}
                          ></i>
                        </div>
                      </div>
                    </Link>
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

export default Shop;