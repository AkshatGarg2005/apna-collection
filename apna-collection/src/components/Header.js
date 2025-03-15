// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';
import SearchOverlay from './SearchOverlay';
import NotificationsCenter from './Notifications/NotificationsCenter';
import { subscribeToUnreadCount } from '../services/notifications';

const Header = ({ toggleSearch }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { cart } = useCart();

  // Check if path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Subscribe to unread notifications count
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = subscribeToUnreadCount(currentUser.uid, (count) => {
      setUnreadCount(count);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  const handleSearchToggle = () => {
    if (toggleSearch) {
      toggleSearch();
    } else {
      setSearchOpen(!searchOpen);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Redirect handled by auth context
  };

  return (
    <>
      {searchOpen && <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
      
      <header className="header">
        <div className="logo">
          <Link to="/">Apna Collection</Link>
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
            <li><Link to="/shop" className={isActive('/shop') ? 'active' : ''}>Shop</Link></li>
            <li><Link to="/about-us" className={isActive('/about-us') ? 'active' : ''}>About Us</Link></li>
            <li><Link to="/offers" className={isActive('/offers') ? 'active' : ''}>Offers</Link></li>
            <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link></li>
          </ul>
          <div className="nav-icons">
            <div className="icon" onClick={handleSearchToggle}>
              <i className="fas fa-search"></i>
            </div>
            
            {currentUser && (
              <NotificationsCenter />
            )}
            
            <div className="icon">
              <Link to="/cart">
                <i className="fas fa-shopping-bag"></i>
                <span className="cart-count">{cart.length}</span>
              </Link>
            </div>
            
            {currentUser ? (
              <div className="icon user-icon-container">
                <Link to="/account">
                  <div className="user-avatar">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </Link>
                <div className="user-dropdown">
                  <div className="dropdown-username">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <Link to="/account">My Account</Link>
                  <Link to="/orders">My Orders</Link>
                  {unreadCount > 0 && (
                    <Link to="/notifications" className="notification-link">
                      Notifications
                      <span className="dropdown-notification-badge">{unreadCount}</span>
                    </Link>
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
        </nav>
      </header>
    </>
  );
};

export default Header;