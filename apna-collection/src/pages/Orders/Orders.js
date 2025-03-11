import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');
  
  // Sample orders data
  const orders = [
    {
      id: 'AC23051587',
      date: 'Ordered on 4 March, 2025',
      status: 'Delivered',
      items: [
        {
          id: 1,
          name: 'Premium Cotton Formal Shirt',
          size: 'L',
          color: 'White',
          quantity: 1,
          price: 1299,
          image: '/api/placeholder/200/200'
        },
        {
          id: 2,
          name: 'Slim Fit Dark Denim Jeans',
          size: '32',
          color: 'Dark Blue',
          quantity: 1,
          price: 1899,
          image: '/api/placeholder/200/200'
        }
      ],
      total: 3198,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid'
    },
    {
      id: 'AC23051492',
      date: 'Ordered on 28 February, 2025',
      status: 'Shipped',
      items: [
        {
          id: 3,
          name: 'Traditional Silk Kurta',
          size: 'M',
          color: 'Maroon',
          quantity: 1,
          price: 2999,
          image: '/api/placeholder/200/200'
        }
      ],
      total: 2999,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid'
    },
    {
      id: 'AC23051375',
      date: 'Ordered on 15 February, 2025',
      status: 'Processing',
      items: [
        {
          id: 4,
          name: 'Designer Blazer',
          size: '40',
          color: 'Navy Blue',
          quantity: 1,
          price: 3499,
          image: '/api/placeholder/200/200'
        },
        {
          id: 5,
          name: 'Formal Shoes',
          size: '9',
          color: 'Brown',
          quantity: 1,
          price: 2199,
          image: '/api/placeholder/200/200'
        }
      ],
      total: 5698,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Paid'
    },
    {
      id: 'AC23051240',
      date: 'Ordered on 10 February, 2025',
      status: 'Cancelled',
      items: [
        {
          id: 6,
          name: 'Polo T-shirt',
          size: 'M',
          color: 'Black',
          quantity: 2,
          price: 1199 * 2,
          image: '/api/placeholder/200/200'
        }
      ],
      total: 2398,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Refunded'
    }
  ];

  // Tracking data for the modal
  const trackingData = {
    steps: [
      { label: 'Order Placed', icon: 'check', status: 'completed' },
      { label: 'Processing', icon: 'check', status: 'completed' },
      { label: 'Shipped', icon: 'check', status: 'completed' },
      { label: 'Out for Delivery', icon: 'truck', status: 'active' },
      { label: 'Delivered', icon: 'home', status: '' }
    ],
    timeline: [
      {
        date: '10 March, 2025 - 08:45 AM',
        text: 'Out for delivery',
        location: 'Sehore Distribution Center',
        status: 'completed'
      },
      {
        date: '09 March, 2025 - 10:30 PM',
        text: 'Arrived at delivery facility',
        location: 'Sehore Distribution Center',
        status: 'completed'
      },
      {
        date: '08 March, 2025 - 02:15 PM',
        text: 'Package in transit',
        location: 'Bhopal Hub',
        status: 'completed'
      },
      {
        date: '07 March, 2025 - 05:30 PM',
        text: 'Package shipped',
        location: 'Seller Facility',
        status: 'completed'
      },
      {
        date: '06 March, 2025 - 11:20 AM',
        text: 'Order processed',
        location: 'Seller Facility',
        status: 'completed'
      },
      {
        date: '04 March, 2025 - 03:45 PM',
        text: 'Order placed',
        location: 'Online',
        status: 'completed'
      }
    ]
  };

  // Filter options
  const filterOptions = [
    'All Orders',
    'Recent',
    'Delivered',
    'Processing',
    'Cancelled'
  ];

  // Filtered orders based on active filter and search query
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (activeFilter === 'All Orders') {
      // No status filter
    } else if (activeFilter === 'Recent') {
      // Only show first 2 orders for "Recent" filter
      if (orders.indexOf(order) >= 2) return false;
    } else if (activeFilter !== order.status) {
      return false;
    }

    // Filter by search query
    if (orderSearchQuery) {
      const query = orderSearchQuery.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(query);
      const matchesProduct = order.items.some(item => 
        item.name.toLowerCase().includes(query)
      );
      return matchesId || matchesProduct;
    }

    return true;
  });

  // Format price as Indian Rupees
  const formatPrice = (price) => {
    return '₹' + price.toLocaleString();
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
  };

  // Handle track order button click
  const handleTrackOrder = (orderId) => {
    setCurrentOrderId(orderId);
    setIsTrackingModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  // Close tracking modal
  const closeTrackingModal = () => {
    setIsTrackingModalOpen(false);
    document.body.style.overflow = ''; // Restore scrolling
  };

  // Handle filter button click
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  // Handle Escape key for modals
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          closeSearchOverlay();
        }
        if (isTrackingModalOpen) {
          closeTrackingModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSearchOpen, isTrackingModalOpen]);

  // Handle clicks outside the tracking modal
  const handleModalOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeTrackingModal();
    }
  };

  // Pagination (for demonstration, no actual page change)
  const handlePageClick = (pageNumber) => {
    // In a real implementation, you would fetch orders for the selected page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="orders-page">
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
              <span className="cart-count">3</span>
            </div>
            <div className="icon">
              <Link to="/account">
                <i className="fas fa-user"></i>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content: My Orders */}
      <main className="orders-container">
        <h1 className="page-title">My Orders</h1>
        
        {/* Filters and Search */}
        <div className="orders-filter">
          <div className="filter-options">
            {filterOptions.map((filter, index) => (
              <button 
                key={index}
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="search-orders">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search orders by ID, product..." 
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">{order.date}</div>
                  <div className={`order-status status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </div>
                </div>
                <div className="order-items">
                  {order.items.map(item => (
                    <div className="order-item" key={item.id}>
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <h3 className="item-name">{item.name}</h3>
                        <div className="item-meta">
                          <span>Size: {item.size}</span>
                          <span>Color: {item.color}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <div className="item-price">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-summary">
                  <div className="order-total">Total: {formatPrice(order.total)}</div>
                  <div className="order-payment">
                    <i className={`fas fa-${order.paymentStatus === 'Paid' ? 'check' : 'times'}-circle`} 
                      style={{ color: order.paymentStatus === 'Paid' ? '#28a745' : '#dc3545' }}></i>
                    {order.paymentStatus === 'Paid' 
                      ? `Paid via ${order.paymentMethod}` 
                      : 'Payment Refunded'}
                  </div>
                  <div className="order-actions">
                    {order.status !== 'Cancelled' && (
                      <button 
                        className="btn btn-primary track-order-btn"
                        onClick={() => handleTrackOrder(order.id)}
                      >
                        <i className="fas fa-truck"></i> Track Order
                      </button>
                    )}
                    <button className="btn btn-outline">
                      <i className="fas fa-redo"></i> Buy Again
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-orders">
              <i className="fas fa-box-open"></i>
              <h3>No orders found</h3>
              <p>We couldn't find any orders matching your criteria.</p>
              <Link to="/shop" className="btn-shop">Start Shopping</Link>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="pagination">
          <div className="page-item prev">
            <i className="fas fa-chevron-left"></i>
          </div>
          <div className="page-item active" onClick={() => handlePageClick(1)}>1</div>
          <div className="page-item" onClick={() => handlePageClick(2)}>2</div>
          <div className="page-item" onClick={() => handlePageClick(3)}>3</div>
          <div className="page-item next">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </main>

      {/* Order Tracking Modal */}
      <div 
        className={`modal-overlay ${isTrackingModalOpen ? 'active' : ''}`}
        onClick={handleModalOverlayClick}
      >
        <div className="modal">
          <div className="modal-close" onClick={closeTrackingModal}>
            <i className="fas fa-times"></i>
          </div>
          <div className="modal-header">
            <h2 className="modal-title">Track Your Order</h2>
            <p id="modalOrderId">Order #{currentOrderId}</p>
          </div>
          <div className="modal-body">
            <div className="tracking-container">
              <div className="tracking-steps">
                {trackingData.steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`tracking-step ${step.status}`}
                  >
                    <div className="step-icon">
                      <i className={`fas fa-${step.icon}`}></i>
                    </div>
                    <div className="step-label">{step.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="tracking-details">
                <h3>Shipment Updates</h3>
                <div className="tracking-timeline">
                  {trackingData.timeline.map((item, index) => (
                    <div 
                      key={index} 
                      className={`timeline-item ${item.status}`}
                    >
                      <div className="timeline-point"></div>
                      <div className="timeline-date">{item.date}</div>
                      <div className="timeline-text">{item.text}</div>
                      <div className="timeline-location">{item.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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

export default Orders;