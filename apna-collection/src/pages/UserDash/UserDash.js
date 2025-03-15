import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; // Added CartContext import
import './UserDash.css';

// Mock data for demonstration
const mockUser = {
  name: "Akshat Garg",
  email: "akshat.garg@example.com",
  phone: "+91 98765 43210",
  joinDate: "January 15, 2024",
  addresses: [
    {
      id: 1,
      type: "Home",
      address: "42, Sunshine Apartments, Juhu Beach Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400049",
      isDefault: true
    },
    {
      id: 2,
      type: "Office",
      address: "B-204, Infinity Tech Park, Sector 21",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122001",
      isDefault: false
    }
  ],
  paymentMethods: [
    {
      id: 1,
      type: "Credit Card",
      name: "HDFC Bank",
      number: "●●●● ●●●● ●●●● 4321",
      expiry: "05/26",
      isDefault: true
    },
    {
      id: 2,
      type: "UPI",
      name: "Google Pay",
      number: "arjun@upi",
      expiry: null,
      isDefault: false
    }
  ],
  recentOrders: [
    {
      id: "ORD48756",
      date: "March 8, 2025",
      total: 4298,
      status: "Delivered",
      items: [
        { name: "Premium Cotton Shirt", color: "White", size: "M", quantity: 1 },
        { name: "Slim Fit Trousers", color: "Navy Blue", size: "32", quantity: 1 }
      ]
    },
    {
      id: "ORD48621",
      date: "February 22, 2025",
      total: 3499,
      status: "Delivered",
      items: [
        { name: "Designer Blazer", color: "Black", size: "L", quantity: 1 }
      ]
    },
    {
      id: "ORD48512",
      date: "February 10, 2025",
      total: 2399,
      status: "Returned",
      items: [
        { name: "Silk Blend Kurta", color: "Maroon", size: "XL", quantity: 1 }
      ]
    }
  ],
  wishlist: [
    {
      id: 101,
      name: "Italian Leather Belt",
      price: 1899,
      image: "/api/placeholder/400/500"
    },
    {
      id: 102,
      name: "Premium Wool Sweater",
      price: 2499,
      image: "/api/placeholder/400/500"
    },
    {
      id: 103,
      name: "Designer Sunglasses",
      price: 3299,
      image: "/api/placeholder/400/500"
    }
  ]
};

const UserDash = () => {
  const { currentUser, userProfile } = useAuth();
  const { addToCart } = useCart(); // Get addToCart from context
  const [activeSection, setActiveSection] = useState('overview');
  const [user] = useState(mockUser);
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimateIn(true);
    }, 100);
  }, []);
  
  // Add animation when changing sections
  useEffect(() => {
    setAnimateIn(false);
    setTimeout(() => {
      setAnimateIn(true);
    }, 100);
  }, [activeSection]);

  // Add function to handle adding item from wishlist to cart
  const handleAddToCartFromWishlist = (item) => {
    const productToAdd = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      size: 'M', // Default size
      color: 'Default' // Default color
    };
    
    addToCart(productToAdd);
    alert(`${item.name} added to cart!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <button className="view-all-btn" onClick={() => setActiveSection('orders')}>
            View All
          </button>
        </div>
        <div className="order-cards">
          {user.recentOrders.slice(0, 2).map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <span className="order-id">{order.id}</span>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <span className="order-date">{order.date}</span>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-details">
                      {item.color}, Size: {item.size}, Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <span className="order-total">{formatPrice(order.total)}</span>
                <Link to={`/orders/${order.id}`} className="view-details-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-section half-width">
          <div className="section-header">
            <h3>Profile Settings</h3>
            <button className="edit-btn" onClick={() => setActiveSection('profile')}>Edit</button>
          </div>
          <div className="profile-preview">
            <div className="avatar">
              <div className="avatar-placeholder">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <div className="profile-details">
              <div className="profile-detail">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email}</span>
              </div>
              <div className="profile-detail">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{user.phone}</span>
              </div>
              <div className="profile-detail">
                <span className="detail-label">Member Since</span>
                <span className="detail-value">{user.joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section half-width">
          <div className="section-header">
            <h3>Wishlist</h3>
            <button className="view-all-btn" onClick={() => setActiveSection('wishlist')}>
              View All
            </button>
          </div>
          <div className="wishlist-preview">
            {user.wishlist.slice(0, 2).map(item => (
              <div className="wishlist-item" key={item.id}>
                <div className="wishlist-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="wishlist-item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{formatPrice(item.price)}</span>
                </div>
                <button 
                  className="add-to-cart-btn" 
                  onClick={() => handleAddToCartFromWishlist(item)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-section half-width">
          <div className="section-header">
            <h3>Saved Addresses</h3>
            <button className="edit-btn" onClick={() => setActiveSection('addresses')}>Manage</button>
          </div>
          <div className="address-preview">
            {user.addresses.filter(addr => addr.isDefault).map(address => (
              <div className="address-card" key={address.id}>
                <div className="address-type">{address.type}</div>
                <div className="address-details">
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                </div>
                <div className="default-badge">Default</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section half-width">
          <div className="section-header">
            <h3>Payment Methods</h3>
            <button className="edit-btn" onClick={() => setActiveSection('payments')}>Manage</button>
          </div>
          <div className="payment-preview">
            {user.paymentMethods.filter(pm => pm.isDefault).map(payment => (
              <div className="payment-card" key={payment.id}>
                <div className="payment-type">{payment.type}</div>
                <div className="payment-details">
                  <p className="payment-name">{payment.name}</p>
                  <p className="payment-number">{payment.number}</p>
                  {payment.expiry && <p className="payment-expiry">Expires: {payment.expiry}</p>}
                </div>
                <div className="default-badge">Default</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="dashboard-orders">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Order History</h3>
        </div>
        <div className="order-list">
          {user.recentOrders.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <span className="order-id">{order.id}</span>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <span className="order-date">{order.date}</span>
              </div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-details">
                      {item.color}, Size: {item.size}, Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <span className="order-total">{formatPrice(order.total)}</span>
                <div className="order-actions">
                  <Link to={`/orders/${order.id}`} className="view-details-btn">
                    View Details
                  </Link>
                  {order.status === "Delivered" && (
                    <button className="reorder-btn">
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="dashboard-profile">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Profile Information</h3>
        </div>
        <div className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" defaultValue={user.name} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" defaultValue={user.email} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" defaultValue={user.phone} />
            </div>
            <div className="form-group">
              <label htmlFor="birthdate">Date of Birth</label>
              <input type="date" id="birthdate" />
            </div>
          </div>
          <div className="form-actions">
            <button className="save-btn">Save Changes</button>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3>Change Password</h3>
        </div>
        <div className="password-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input type="password" id="current-password" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input type="password" id="new-password" />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input type="password" id="confirm-password" />
            </div>
          </div>
          <div className="form-actions">
            <button className="save-btn">Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="dashboard-wishlist">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>My Wishlist</h3>
        </div>
        <div className="wishlist-grid">
          {user.wishlist.map(item => (
            <div className="wishlist-item-card" key={item.id}>
              <div className="wishlist-item-image">
                <img src={item.image} alt={item.name} />
                <button className="remove-wishlist-btn">×</button>
              </div>
              <div className="wishlist-item-details">
                <h4>{item.name}</h4>
                <span className="item-price">{formatPrice(item.price)}</span>
              </div>
              <button 
                className="add-to-cart-btn" 
                onClick={() => handleAddToCartFromWishlist(item)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="dashboard-addresses">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Saved Addresses</h3>
          <button className="add-btn">+ Add New Address</button>
        </div>
        <div className="address-list">
          {user.addresses.map(address => (
            <div className="address-card" key={address.id}>
              <div className="address-type">{address.type}</div>
              <div className="address-details">
                <p>{address.address}</p>
                <p>{address.city}, {address.state} - {address.pincode}</p>
              </div>
              <div className="address-actions">
                <button className="edit-address-btn">Edit</button>
                <button className="delete-address-btn">Delete</button>
                {!address.isDefault && (
                  <button className="set-default-btn">Set as Default</button>
                )}
                {address.isDefault && (
                  <div className="default-badge">Default</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="dashboard-payments">
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Payment Methods</h3>
          <button className="add-btn">+ Add New Payment Method</button>
        </div>
        <div className="payment-list">
          {user.paymentMethods.map(payment => (
            <div className="payment-card-large" key={payment.id}>
              <div className="payment-type">{payment.type}</div>
              <div className="payment-details">
                <p className="payment-name">{payment.name}</p>
                <p className="payment-number">{payment.number}</p>
                {payment.expiry && <p className="payment-expiry">Expires: {payment.expiry}</p>}
              </div>
              <div className="payment-actions">
                {!payment.isDefault ? (
                  <button className="set-default-btn">Set as Default</button>
                ) : (
                  <div className="default-badge">Default</div>
                )}
                <button className="delete-payment-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'orders':
        return renderOrders();
      case 'profile':
        return renderProfile();
      case 'wishlist':
        return renderWishlist();
      case 'addresses':
        return renderAddresses();
      case 'payments':
        return renderPayments();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-welcome">
        <h2>Welcome, {userProfile?.displayName || currentUser?.displayName || 'User'}</h2>
        <div className="welcome-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div className="account-status">
          <span className="status-indicator active"></span>
          <span className="status-text">Signed in as {currentUser?.email}</span>
        </div>
      </div>
      
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="sidebar-avatar">
            <div className="avatar-circle">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="user-name">{user.name}</span>
            <span className="member-since">Member since {user.joinDate}</span>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              <span className="nav-text">Overview</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              <span className="nav-text">My Orders</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <span className="nav-text">Profile</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveSection('wishlist')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </span>
              <span className="nav-text">Wishlist</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveSection('addresses')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <span className="nav-text">Addresses</span>
            </button>
            
            <button
              className={`nav-item ${activeSection === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveSection('payments')}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </span>
              <span className="nav-text">Payment Methods</span>
            </button>
            
            <Link to="/logout" className="nav-item logout">
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="nav-text">Logout</span>
            </Link>
          </nav>
        </div>
        
        <div className="dashboard-content">
          <div className={`dashboard-content-inner ${animateIn ? 'fade-in' : 'fade-out'}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDash;