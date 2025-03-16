import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { subscribeToUnreadCount, getUserNotifications, markNotificationAsRead } from '../services/notifications';
import './Header.css';

// NotificationsCenter Component
const NotificationsCenter = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);

  // Fetch notifications and subscribe to unread count
  useEffect(() => {
    if (!currentUser) return;

    // Get initial notifications
    const fetchNotifications = async () => {
      const userNotifications = await getUserNotifications(currentUser.uid, 10);
      setNotifications(userNotifications);
    };
    
    fetchNotifications();

    // Subscribe to unread count
    const unsubscribe = subscribeToUnreadCount(currentUser.uid, (count) => {
      setUnreadCount(count);
    });

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentUser]);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(item => 
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
    }
    
    // Handle navigation based on notification type
    if (notification.type === 'order' && notification.orderId) {
      navigate(`/orders/${notification.orderId}`);
    } else {
      navigate('/notifications');
    }
    
    setIsOpen(false);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return 'fa-box';
      case 'payment':
        return 'fa-credit-card';
      case 'shipment':
        return 'fa-shipping-fast';
      case 'promotion':
        return 'fa-tag';
      default:
        return 'fa-bell';
    }
  };

  return (
    <div className="notifications-center" ref={notificationRef}>
      <div className="notifications-icon" onClick={() => setIsOpen(!isOpen)}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount} new</span>
            )}
          </div>
          
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.createdAt)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-notifications">
                <i className="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
              </div>
            )}
          </div>
          
          <div className="notifications-footer">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              See All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Header Component
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart();
  
  // UI state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // Added unreadCount state
  
  // Refs
  const dropdownRef = useRef(null);
  
  // Calculate total number of items in cart
  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Check if path is active
  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') {
      return false;
    }
    return location.pathname.startsWith(path);
  };

  // Subscribe to unread notifications count
  useEffect(() => {
    let unsubscribe = () => {};
    
    if (currentUser) {
      unsubscribe = subscribeToUnreadCount(currentUser.uid, (count) => {
        setUnreadCount(count);
      });
    } else {
      setUnreadCount(0);
    }
    
    return () => unsubscribe();
  }, [currentUser]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Find if the clicked element is one of the action items
        const isActionItem = event.target.closest('.action-item');
        if (!isActionItem || !isActionItem.classList.contains('user-dropdown')) {
          // If not, or if it's not the user dropdown, ensure dropdowns are closed
          const dropdowns = document.querySelectorAll('.dropdown-content');
          dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
          });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search
  const handleSearch = (searchTerm) => {
    setShowSearchOverlay(false);
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    
    // Prevent body scroll when mobile menu is open
    if (!showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Toggle search overlay
  const toggleSearch = () => {
    setShowSearchOverlay(!showSearchOverlay);
  };

  // Close mobile menu when changing routes
  useEffect(() => {
    setShowMobileMenu(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            Apna Collection
          </Link>
        </div>

        {/* Navigation */}
        <nav>
          {/* Main Navigation */}
          <ul className={`nav-links ${showMobileMenu ? 'show' : ''}`}>
            <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
            <li><Link to="/shop" className={isActive('/shop') ? 'active' : ''}>Shop</Link></li>
            <li><Link to="/about" className={isActive('/about') ? 'active' : ''}>About Us</Link></li>
            <li><Link to="/offers" className={isActive('/offers') ? 'active' : ''}>Offers</Link></li>
            <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link></li>
          </ul>

          {/* Nav Icons */}
          <div className="nav-icons">
            {/* Search Icon */}
            <div className="icon" onClick={toggleSearch}>
              <i className="fas fa-search"></i>
            </div>
            
            {/* Notifications */}
            {currentUser && (
              <div className="icon">
                <NotificationsCenter />
              </div>
            )}
            
            {/* Cart Icon */}
            <div className="icon">
              <Link to="/cart">
                <i className="fas fa-shopping-bag"></i>
                {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
              </Link>
            </div>
            
            {/* User/Account Icon */}
            {currentUser ? (
              <div className="icon user-icon-container" ref={dropdownRef}>
                <Link to="/account">
                  <div className="user-avatar">
                    {currentUser.displayName 
                      ? currentUser.displayName.charAt(0).toUpperCase() 
                      : currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                </Link>
                <div className="user-dropdown">
                  <div className="dropdown-username">
                    {currentUser.displayName || currentUser.email || 'User'}
                  </div>
                  <Link to="/account">My Account</Link>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/wishlist">My Wishlist</Link>
                  {unreadCount > 0 ? (
                    <Link to="/notifications" className="notification-link">
                      Notifications
                      <span className="dropdown-notification-badge">{unreadCount}</span>
                    </Link>
                  ) : (
                    <Link to="/notifications">Notifications</Link>
                  )}
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            ) : (
              <div className="icon">
                <Link to="/login">
                  <i className="fas fa-user"></i>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Toggle */}
          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="sr-only">{showMobileMenu ? 'Close Menu' : 'Open Menu'}</span>
            <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
          </div>
        </nav>
      </div>
      
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>
      )}
      
      {/* Search Overlay */}
      {showSearchOverlay && (
        <div className="search-overlay active">
          <div className="search-close" onClick={toggleSearch}>
            <i className="fas fa-times"></i>
          </div>
          <div className="search-container">
            <form id="searchForm" onSubmit={(e) => {
              e.preventDefault();
              const searchValue = e.target.querySelector('input').value;
              handleSearch(searchValue);
            }}>
              <input 
                type="text" 
                className="search-input"
                placeholder="Search for products..."
                autoFocus
              />
            </form>
          </div>
          <div className="search-results" id="searchResults">
            {/* Search results will be displayed here */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;