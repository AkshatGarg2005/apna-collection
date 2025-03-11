import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProductPage.css';

const ProductPage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mainImage, setMainImage] = useState('/api/placeholder/600/700');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('White');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();

  // Product data
  const product = {
    name: 'Premium Cotton Formal Shirt',
    price: 1299,
    originalPrice: 1699,
    discount: 24,
    rating: 4.5,
    reviewCount: 128,
    tag: 'New Arrival',
    description: 'Elevate your formal attire with our Premium Cotton Formal Shirt. Crafted from high-quality Egyptian cotton, this shirt offers exceptional comfort and a sophisticated appearance. The tailored fit accentuates your silhouette while allowing ease of movement throughout the day. Perfect for office wear, formal events, or pair with jeans for a smart-casual look.',
    stock: 12,
    images: [
      '/api/placeholder/600/700',
      '/api/placeholder/600/700',
      '/api/placeholder/600/700',
      '/api/placeholder/600/700'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'White', class: 'color-white' },
      { name: 'Blue', class: 'color-blue' },
      { name: 'Black', class: 'color-black' },
      { name: 'Beige', class: 'color-beige' }
    ],
    features: [
      {
        icon: 'tshirt',
        title: 'Premium Fabric',
        desc: 'Made from 100% Egyptian cotton with a thread count of 120, ensuring softness and durability.'
      },
      {
        icon: 'ruler',
        title: 'Tailored Fit',
        desc: 'Designed with a contemporary tailored fit that provides comfort while maintaining a sleek appearance.'
      },
      {
        icon: 'palette',
        title: 'Superior Finishing',
        desc: 'Single-needle stitching with 18 stitches per inch for a refined finish and enhanced durability.'
      },
      {
        icon: 'th',
        title: 'Detail-Oriented Design',
        desc: 'Features mother-of-pearl buttons, reinforced collar and cuffs, and a classic pointed collar style.'
      }
    ],
    specs: [
      { label: 'Material', value: '100% Egyptian Cotton' },
      { label: 'Pattern', value: 'Solid' },
      { label: 'Sleeve', value: 'Full Sleeve' },
      { label: 'Collar', value: 'Classic Pointed Collar' },
      { label: 'Cuff', value: 'Single Button' },
      { label: 'Fit', value: 'Tailored Fit' },
      { label: 'Occasion', value: 'Formal, Office, Business Casual' },
      { label: 'Package Contents', value: '1 Shirt' }
    ],
    careInstructions: [
      { icon: 'tint', text: 'Machine wash cold with similar colors' },
      { icon: 'ban', text: 'Do not use bleach' },
      { icon: 'temperature-low', text: 'Tumble dry on low heat' },
      { icon: 'iron', text: 'Iron on medium heat' },
      { icon: 'minus-circle', text: 'Do not dry clean' }
    ],
    reviews: [
      {
        name: 'Rajesh Kumar',
        date: '15 Feb, 2025',
        rating: 5,
        text: 'The quality of this shirt is exceptional! The fabric feels premium and comfortable, even after a full day at the office. The fit is perfect for my body type, not too tight or loose. Definitely worth the price and I\'ll be ordering more colors soon.',
        photos: []
      },
      {
        name: 'Aman Singh',
        date: '3 Feb, 2025',
        rating: 4,
        text: 'Great formal shirt that looks very professional. The Egyptian cotton makes a noticeable difference compared to regular cotton shirts. The only minor issue is that the sleeves are slightly longer than expected, but otherwise perfect.',
        photos: ['/api/placeholder/80/80', '/api/placeholder/80/80']
      },
      {
        name: 'Vikram Patel',
        date: '27 Jan, 2025',
        rating: 4.5,
        text: 'I\'ve been searching for quality formal shirts for a while, and Apna Collection has nailed it with this premium cotton shirt. The material is breathable and doesn\'t wrinkle easily, which is perfect for long workdays. The stitching and buttons are top-notch too. Highly recommend!',
        photos: []
      }
    ],
    relatedProducts: [
      {
        name: 'Classic White Shirt',
        price: 1199,
        image: '/api/placeholder/400/500',
        colors: ['color-white', 'color-blue', 'color-black']
      },
      {
        name: 'Slim Fit Trousers',
        price: 1599,
        image: '/api/placeholder/400/500',
        colors: ['color-black', 'color-beige']
      },
      {
        name: 'Designer Blazer',
        price: 3499,
        image: '/api/placeholder/400/500',
        colors: ['color-black', 'color-blue']
      },
      {
        name: 'Formal Shoes',
        price: 2199,
        image: '/api/placeholder/400/500',
        colors: ['color-black', 'color-beige']
      }
    ]
  };

  // Review statistics
  const reviewStats = [
    { stars: 5, count: 96, percentage: 75 },
    { stars: 4, count: 19, percentage: 15 },
    { stars: 3, count: 6, percentage: 5 },
    { stars: 2, count: 4, percentage: 3 },
    { stars: 1, count: 3, percentage: 2 }
  ];

  // Handle search overlay
  const openSearchOverlay = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      document.getElementById('searchInput')?.focus();
    }, 100);
  };

  const closeSearchOverlay = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    setMainImage(product.images[index]);
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 10) {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    alert(`Added to cart: ${product.name}\nSize: ${selectedSize}\nColor: ${selectedColor}\nQuantity: ${quantity}`);
    
    // In a real application, you would dispatch an action to add the item to the cart
    // For demo purposes, just update the cart count in the UI
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = parseInt(cartCount.textContent || '0') + 1;
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    // In a real application, you might add the item to cart and redirect
    navigate('/checkout');
  };

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle escape key for search overlay
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearchOverlay();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSearchOpen]);

  // Function to render stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  return (
    <div className="product-page">
      {/* Search Overlay */}
      <div className={`search-overlay ${isSearchOpen ? 'active' : ''}`}>
        <div className="search-close" onClick={closeSearchOverlay}>
          <i className="fas fa-times"></i>
        </div>
        <div className="search-container">
          <form>
            <input 
              type="text" 
              className="search-input" 
              id="searchInput"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        <div className="search-results">
          {/* Search results would be displayed here */}
        </div>
      </div>

      {/* Header */}
      <header>
        <div className="logo">
          <Link to="/">Apna Collection</Link>
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop" className="active">Shop</Link></li>
            <li><Link to="/aboutus">About Us</Link></li>
            <li><Link to="/offers">Offers</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
          <div className="nav-icons">
            <div className="icon" onClick={openSearchOverlay}>
              <i className="fas fa-search"></i>
            </div>
            <div className="icon">
              <Link to="/cart">
                <i className="fas fa-shopping-bag"></i>
              </Link>
              <span className="cart-count">3</span>
            </div>
            <div className="icon">
              <Link to="/login">
                <i className="fas fa-user"></i>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-links">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">&#8250;</span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-separator">&#8250;</span>
          <Link to="/shop/formal-shirts">Formal Shirts</Link>
          <span className="breadcrumb-separator">&#8250;</span>
          <span>{product.name}</span>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="product-container">
        {/* Product Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={mainImage} alt={product.name} id="mainImage" />
          </div>
          <div className="image-thumbnails">
            {product.images.map((image, index) => (
              <div 
                key={index}
                className={`thumbnail ${image === mainImage ? 'active' : ''}`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img src={image} alt={`${product.name} - View ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-header">
            <span className="product-tag">{product.tag}</span>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price">
              ₹{product.price.toLocaleString()} 
              <span className="price-original">₹{product.originalPrice.toLocaleString()}</span> 
              <span className="price-discount">{product.discount}% OFF</span>
            </div>
            <div className="product-rating">
              <div className="rating-stars">
                {renderStars(product.rating)}
              </div>
              <span className="rating-count">{product.rating}/5 ({product.reviewCount} reviews)</span>
            </div>
            <p className="product-description">
              {product.description}
            </p>
          </div>

          <div className="product-options">
            <div className="option-group">
              <div className="option-label">Size</div>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <div 
                    key={size}
                    className={`size-option ${size === selectedSize ? 'active' : ''}`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
              <a href="#" className="size-guide">Size Guide</a>
            </div>

            <div className="option-group">
              <div className="option-label">Color</div>
              <div className="color-options">
                {product.colors.map((color) => (
                  <div 
                    key={color.name}
                    className={`color-option ${color.class} ${color.name === selectedColor ? 'active' : ''}`}
                    data-color={color.name}
                    onClick={() => handleColorSelect(color.name)}
                  ></div>
                ))}
              </div>
            </div>

            <div className="option-group">
              <div className="option-label">Quantity</div>
              <div className="quantity-selector">
                <div className="quantity-control">
                  <button className="quantity-btn" onClick={decreaseQuantity}>-</button>
                  <input 
                    type="number" 
                    value={quantity} 
                    min="1" 
                    max="10" 
                    className="quantity-input"
                    onChange={handleQuantityChange}
                  />
                  <button className="quantity-btn" onClick={increaseQuantity}>+</button>
                </div>
                <span className="stock-status">In Stock ({product.stock} items)</span>
              </div>
            </div>

            <div className="product-buttons">
              <button className="btn-primary" onClick={handleAddToCart}>
                <i className="fas fa-shopping-bag"></i> Add to Cart
              </button>
              <button className="btn-secondary" onClick={handleBuyNow}>
                <i className="fas fa-bolt"></i> Buy Now
              </button>
            </div>
          </div>

          <div className="delivery-info">
            <div className="delivery-item">
              <i className="fas fa-truck delivery-icon"></i>
              <div>Free delivery on orders above ₹999</div>
            </div>
            <div className="delivery-item">
              <i className="fas fa-exchange-alt delivery-icon"></i>
              <div>Easy 30-day returns & exchanges</div>
            </div>
            <div className="delivery-item">
              <i className="fas fa-shield-alt delivery-icon"></i>
              <div>100% authentic products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="additional-info">
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => handleTabChange('details')}
          >
            Product Details
          </div>
          <div 
            className={`tab ${activeTab === 'care' ? 'active' : ''}`}
            onClick={() => handleTabChange('care')}
          >
            Care Instructions
          </div>
          <div 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            Customer Reviews
          </div>
        </div>

        {/* Product Details Tab */}
        <div className={`tab-content ${activeTab === 'details' ? 'active' : ''}`} id="tab-details">
          <div className="product-features">
            {product.features.map((feature, index) => (
              <div className="feature-item" key={index}>
                <div className="feature-icon">
                  <i className={`fas fa-${feature.icon}`}></i>
                </div>
                <div className="feature-text">
                  <div className="feature-title">{feature.title}</div>
                  <div className="feature-desc">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <table className="product-spec-table">
            <tbody>
              {product.specs.map((spec, index) => (
                <tr key={index}>
                  <td><strong>{spec.label}:</strong></td>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Care Instructions Tab */}
        <div className={`tab-content ${activeTab === 'care' ? 'active' : ''}`} id="tab-care">
          <h3>Washing & Care Instructions</h3>
          <p>To maintain the premium quality and appearance of your shirt, please follow these care instructions:</p>
          
          <div className="care-instructions">
            {product.careInstructions.map((instruction, index) => (
              <div className="care-item" key={index}>
                <div className="care-icon">
                  <i className={`fas fa-${instruction.icon}`}></i>
                </div>
                <div>{instruction.text}</div>
              </div>
            ))}
          </div>
          
          <div className="care-tips">
            <h4>Additional Care Tips:</h4>
            <ul>
              <li>Turn the shirt inside out before washing to protect the buttons and surface of the fabric</li>
              <li>Always unbutton the shirt completely before washing</li>
              <li>Remove collar stays before washing</li>
              <li>For best results, iron while slightly damp</li>
              <li>Hang on a quality hanger when not in use to maintain the shape</li>
            </ul>
          </div>
        </div>

        {/* Customer Reviews Tab */}
        <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`} id="tab-reviews">
          <div className="review-header">
            <div className="review-total">
              <div className="review-average">{product.rating}</div>
              <div className="rating-stars">
                {renderStars(product.rating)}
              </div>
              <div>Based on {product.reviewCount} reviews</div>
            </div>
            
            <div className="review-distribution">
              {reviewStats.map((stat) => (
                <div className="review-bar" key={stat.stars}>
                  <div className="review-stars">{stat.stars} <i className="fas fa-star"></i></div>
                  <div className="review-progress">
                    <div 
                      className="review-progress-fill" 
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <div className="review-count">{stat.count}</div>
                </div>
              ))}
            </div>
            
            <button className="write-review-btn">Write a Review</button>
          </div>
          
          <div className="review-list">
            {product.reviews.map((review, index) => (
              <div className="review-item" key={index}>
                <div className="review-user">
                  <div className="review-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="review-user-info">
                    <div className="review-user-name">{review.name}</div>
                    <div className="review-date">{review.date}</div>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                <div className="review-text">
                  {review.text}
                </div>
                {review.photos.length > 0 && (
                  <div className="review-photos">
                    {review.photos.map((photo, photoIndex) => (
                      <div className="review-photo" key={photoIndex}>
                        <img src={photo} alt="Customer Photo" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="related-products">
        <h2 className="related-title">You May Also Like</h2>
        <div className="related-grid">
          {product.relatedProducts.map((item, index) => (
            <div className="related-item" key={index}>
              <div className="related-img">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="related-info">
                <h3 className="related-name">{item.name}</h3>
                <div className="related-price">₹{item.price.toLocaleString()}</div>
                <div className="related-colors">
                  {item.colors.map((color, colorIndex) => (
                    <div key={colorIndex} className={`related-color ${color}`}></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-container">
          <div className="footer-about">
            <div className="footer-logo">Apna Collection</div>
            <p>Premium men's clothing store in Sehore offering the latest fashion trends with quality fabrics and exceptional service.</p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/shop/new-arrivals">New Arrivals</Link></li>
              <li><Link to="/shop/best-sellers">Best Sellers</Link></li>
              <li><Link to="/offers">Special Offers</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Contact Us</h3>
            <ul>
              <li>Shop No. D1, Shri Giriraj Shopping Complex,</li>
              <li>Infront of Tyagi Building, Englishpura,</li>
              <li>Sehore, Madhya Pradesh 466001</li>
              <li>Phone: 1234567890</li>
              <li>Email: info@apnacollection.com</li>
            </ul>
          </div>
          <div className="footer-newsletter">
            <h3>Newsletter</h3>
            <p>Subscribe to our newsletter for exclusive offers and updates.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your Email" className="newsletter-input" />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Apna Collection. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductPage;