import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  // Function to add item to cart
  const handleAddToCart = (product) => {
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: 'M', // Default size
      color: 'Default' // Default color
    };
    
    addToCart(productToAdd);
    
    // Show feedback to user
    alert(`${product.name} added to cart!`);
  };

  // Function to remove from wishlist
  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  // Function to handle clear wishlist
  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist();
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist</h1>
          <p className="wishlist-subtitle">Items you've saved for later. Add them to your cart whenever you're ready to shop.</p>
        </div>
        
        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">
              <i className="far fa-heart"></i>
            </div>
            <h2 className="empty-wishlist-title">Your wishlist is empty</h2>
            <p className="empty-wishlist-message">
              Add items you love to your wishlist. Review them anytime and easily move them to your cart.
            </p>
            <Link to="/shop" className="shop-now-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="wishlist-header-controls">
              <Link to="/shop" className="back-to-shop-button">
                <i className="fas fa-arrow-left"></i> Back to Shop
              </Link>
              
              <div className="wishlist-header-actions">
                <div className="wishlist-items-count">
                  <span>{wishlist.length}</span> {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
                </div>
                {wishlist.length > 1 && (
                  <button className="clear-wishlist" onClick={handleClearWishlist}>
                    <i className="fas fa-trash-alt"></i> Clear All
                  </button>
                )}
              </div>
            </div>
            
            <div className="wishlist-grid">
              {wishlist.map(item => (
                <div className="wishlist-item" key={item.id}>
                  <div className="wishlist-item-remove">
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      title="Remove from wishlist"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <Link to={`/product/${item.id}`} className="wishlist-item-image-container">
                    <img src={item.image} alt={item.name} className="wishlist-item-image" />
                  </Link>
                  <div className="wishlist-item-details">
                    <Link to={`/product/${item.id}`} className="wishlist-item-name">
                      {item.name}
                    </Link>
                    <p className="wishlist-item-category">
                      {capitalizeFirstLetter(item.category)}
                    </p>
                    <p className="wishlist-item-price">₹{item.price.toLocaleString()}</p>
                    <button 
                      className="wishlist-add-to-cart"
                      onClick={() => handleAddToCart(item)}
                    >
                      <i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;