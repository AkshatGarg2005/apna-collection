import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
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
          <div className="icon" id="searchIcon">
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
  );
};

export default Header;
