import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import SearchOverlay from './SearchOverlay';

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Check if path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
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
            <div className="icon" onClick={toggleSearch}>
              <i className="fas fa-search"></i>
            </div>
            <div className="icon">
              <Link to="/cart">
                <i className="fas fa-shopping-bag"></i>
                <span className="cart-count">3</span>
              </Link>
            </div>
            <div className="icon">
              <Link to="/login">
                <i className="fas fa-user"></i>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;