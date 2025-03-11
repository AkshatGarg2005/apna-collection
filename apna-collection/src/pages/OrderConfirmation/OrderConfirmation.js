import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Order details - in a real app, this would come from API/context
  const orderDetails = {
    orderNumber: '#AC78945612',
    orderDate: 'March 11, 2025',
    paymentMethod: 'Credit Card (•••• 4582)',
    shippingAddress: {
      name: 'Rahul Sharma',
      street: '123 Shivaji Nagar',
      city: 'Sehore, Madhya Pradesh 466001',
      country: 'India'
    },
    items: [
      {
        id: 1,
        name: 'Premium Cotton Formal Shirt',
        meta: 'Size: M | Color: White | Quantity: 1',
        price: 1299,
        image: '/api/placeholder/80/80'
      },
      {
        id: 2,
        name: 'Designer Blazer',
        meta: 'Size: 40 | Color: Navy Blue | Quantity: 1',
        price: 3499,
        image: '/api/placeholder/80/80'
      },
      {
        id: 3,
        name: 'Slim Fit Trousers',
        meta: 'Size: 32 | Color: Black | Quantity: 1',
        price: 1599,
        image: '/api/placeholder/80/80'
      }
    ],
    summary: {
      subtotal: 6397,
      shipping: 0,
      tax: 1151,
      total: 7548
    },
    estimatedDelivery: 'March 15-17, 2025'
  };

  // Animation function for order confirmation
  const animateElements = () => {
    // This would be handled by CSS animations in React
    // The CSS has the proper animations defined
  };

  // Create confetti effect
  const createConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);
    
    const colors = ['#c59b6d', '#E1D9D2', '#ffffff', '#333333'];
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 6 + 4 + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.opacity = Math.random() * 0.7 + 0.3;
      confetti.style.top = '-10px';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      
      confettiContainer.appendChild(confetti);
      
      const speed = Math.random() * 3 + 2;
      const rotation = Math.random() * 15 - 7.5;
      const horizontalMovement = Math.random() * 5 - 2.5;
      
      fallConfetti(confetti, speed, rotation, horizontalMovement);
    }
    
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  };

  const fallConfetti = (confetti, speed, rotation, horizontalMovement) => {
    let topPosition = parseFloat(confetti.style.top);
    let leftPosition = parseFloat(confetti.style.left);
    let currentRotation = 0;
    
    const fallInterval = setInterval(() => {
      topPosition += speed;
      leftPosition += horizontalMovement;
      currentRotation += rotation;
      
      confetti.style.top = topPosition + 'px';
      confetti.style.left = leftPosition + 'vw';
      confetti.style.transform = 'rotate(' + currentRotation + 'deg)';
      
      if (topPosition > window.innerHeight) {
        clearInterval(fallInterval);
        confetti.remove();
      }
    }, 20);
  };

  // Open search overlay
  const openSearchOverlay = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      document.getElementById('searchInput')?.focus();
    }, 100);
  };

  // Close search overlay
  const closeSearchOverlay = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle escape key for search overlay
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearchOverlay();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    // Run animation and confetti on page load
    setTimeout(animateElements, 300);
    setTimeout(createConfetti, 1000);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSearchOpen]);

  // Format price as Indian Rupees
  const formatPrice = (price) => {
    return '₹' + price.toLocaleString();
  };

  return (
    <div className="order-confirmation-page">
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
        <div className="search-results" id="searchResults">
          {/* Search results would be rendered here */}
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
            <li><Link to="/shop">Shop</Link></li>
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
              <span className="cart-count">0</span>
            </div>
            <div className="icon">
              <Link to="/login">
                <i className="fas fa-user"></i>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Order Confirmation Section */}
      <main>
        <div className="confirmation-container">
          <div className="confirmation-header">
            <div className="checkmark-circle">
              <i className="fas fa-check-circle checkmark"></i>
            </div>
            <h1 className="confirmation-title">Order Confirmed!</h1>
            <p className="confirmation-message">
              Thank you for shopping with Apna Collection. Your order has been successfully placed and is being processed.
            </p>
          </div>
          
          <div className="order-details">
            <div className="order-info">
              <div>
                <div className="info-item">
                  <div className="info-label">Order Number</div>
                  <div className="info-value">{orderDetails.orderNumber}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Order Date</div>
                  <div className="info-value">{orderDetails.orderDate}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Payment Method</div>
                  <div className="info-value">{orderDetails.paymentMethod}</div>
                </div>
              </div>
              <div>
                <div className="info-item">
                  <div className="info-label">Shipping Address</div>
                  <div className="info-value">
                    {orderDetails.shippingAddress.name}<br />
                    {orderDetails.shippingAddress.street}<br />
                    {orderDetails.shippingAddress.city}<br />
                    {orderDetails.shippingAddress.country}
                  </div>
                </div>
              </div>
            </div>
            
            <h3>Order Items</h3>
            <div className="ordered-items">
              {orderDetails.items.map(item => (
                <div className="item-card" key={item.id}>
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">{item.meta}</div>
                    <div className="item-price">{formatPrice(item.price)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-summary">
              <div className="summary-row">
                <div>Subtotal</div>
                <div>{formatPrice(orderDetails.summary.subtotal)}</div>
              </div>
              <div className="summary-row">
                <div>Shipping</div>
                <div>{formatPrice(orderDetails.summary.shipping)}</div>
              </div>
              <div className="summary-row">
                <div>Tax</div>
                <div>{formatPrice(orderDetails.summary.tax)}</div>
              </div>
              <div className="summary-row total">
                <div>Total Amount</div>
                <div>{formatPrice(orderDetails.summary.total)}</div>
              </div>
            </div>
            
            <div className="delivery-status">
              <div className="status-title">Order Status</div>
              <div className="status-steps">
                <div className="step active">
                  <div className="step-icon"><i className="fas fa-check"></i></div>
                  <div className="step-label">Order Confirmed</div>
                </div>
                <div className="step">
                  <div className="step-icon"><i className="fas fa-box"></i></div>
                  <div className="step-label">Processing</div>
                </div>
                <div className="step">
                  <div className="step-icon"><i className="fas fa-shipping-fast"></i></div>
                  <div className="step-label">Shipped</div>
                </div>
                <div className="step">
                  <div className="step-icon"><i className="fas fa-home"></i></div>
                  <div className="step-label">Delivered</div>
                </div>
              </div>
              <div className="estimated-delivery">
                Estimated Delivery: {orderDetails.estimatedDelivery}
              </div>
            </div>
            
            <div className="contact-support">
              <div className="contact-title">Need Help?</div>
              <div className="contact-info">Email: support@apnacollection.com</div>
              <div className="contact-info">Phone: +91 1234567890</div>
              <div className="contact-info">Order Reference: {orderDetails.orderNumber}</div>
            </div>
            
            <div className="action-buttons">
              <Link to="/shop" className="btn-continue">
                <i className="fas fa-shopping-bag" style={{ marginRight: '8px' }}></i>Continue Shopping
              </Link>
              <Link to="/orders" className="btn-continue">
                <i className="fas fa-clipboard-list" style={{ marginRight: '8px' }}></i>View All Orders
              </Link>
            </div>
          </div>
        </div>
      </main>

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

export default OrderConfirmation;