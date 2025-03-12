import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';

const Cart = ({ cart, removeFromCart, updateQuantity }) => {
  const [cartItems, setCartItems] = useState(cart);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  // Constants for calculation
  const TAX_RATE = 0.18;
  const DISCOUNT = 500;
  const SHIPPING = 99;

  useEffect(() => {
    setCartItems(cart);
  }, [cart]);

  // Format currency
  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate tax
  const calculateTax = () => {
    return Math.round(calculateSubtotal() * TAX_RATE);
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - DISCOUNT + SHIPPING;
  };

  // Handle quantity decrease
  const handleDecrease = (itemId, size, color) => {
    const item = cartItems.find(
      item => item.id === itemId && item.size === size && item.color === color
    );
    
    if (item && item.quantity > 1) {
      updateQuantity(itemId, size, color, item.quantity - 1);
    }
  };

  // Handle quantity increase
  const handleIncrease = (itemId, size, color) => {
    const item = cartItems.find(
      item => item.id === itemId && item.size === size && item.color === color
    );
    
    if (item) {
      updateQuantity(itemId, size, color, item.quantity + 1);
    }
  };

  // Handle direct quantity change
  const handleQuantityChange = (itemId, size, color, value) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity >= 1) {
      updateQuantity(itemId, size, color, quantity);
    }
  };

  // Handle promo code submission
  const handleApplyPromo = () => {
    if (promoCode.trim() !== '') {
      setPromoMessage('Promo code applied successfully!');
      // Here you would typically verify the promo code with an API
      // and apply additional discounts if valid
      setTimeout(() => setPromoMessage(''), 3000);
    } else {
      setPromoMessage('Please enter a valid promo code.');
      setTimeout(() => setPromoMessage(''), 3000);
    }
    setPromoCode('');
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length > 0) {
      // Navigate to checkout page
      window.location.href = '/checkout';
    }
  };

  return (
    <main className="cart-container">
      <h1 className="page-title">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <i className="fas fa-shopping-bag"></i>
          <p>Your shopping cart is empty</p>
          <Link to="/shop" className="empty-cart-btn">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div className="cart-item" key={`${item.id}-${item.size}-${item.color}`} data-price={item.price}>
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <div>
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-size">Size: {item.size}</p>
                    <p className="item-price">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="item-controls">
                    <div className="quantity-control">
                      <button 
                        className="quantity-btn decrease"
                        onClick={() => handleDecrease(item.id, item.size, item.color)}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        className="quantity-input"
                        onChange={(e) => handleQuantityChange(item.id, item.size, item.color, e.target.value)}
                      />
                      <button 
                        className="quantity-btn increase"
                        onClick={() => handleIncrease(item.id, item.size, item.color)}
                      >
                        +
                      </button>
                    </div>
                    <div className="item-subtotal">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                </div>
                <button 
                  className="remove-item"
                  onClick={() => removeFromCart(item.id, item.size, item.color)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span id="cart-subtotal">{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="summary-row">
              <span>Tax (GST 18%)</span>
              <span id="cart-tax">{formatCurrency(calculateTax())}</span>
            </div>
            <div className="summary-row discount">
              <span>Discount</span>
              <span id="cart-discount">{formatCurrency(-DISCOUNT)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span id="cart-shipping">{formatCurrency(SHIPPING)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span id="cart-total">{formatCurrency(calculateTotal())}</span>
            </div>
            
            <div className="promo-code">
              <h3>Promo Code</h3>
              {promoMessage && (
                <div className={`promo-message ${promoMessage.includes('success') ? 'success' : 'error'}`}>
                  {promoMessage}
                </div>
              )}
              <div className="promo-form">
                <input 
                  type="text" 
                  placeholder="Enter promo code" 
                  className="promo-input"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button type="button" className="promo-btn" onClick={handleApplyPromo}>Apply</button>
              </div>
            </div>
            
            <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
            <div className="continue-shopping">
              <Link to="/shop">Continue Shopping</Link>
            </div>
            
            <div className="payment-options">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="payment-icon" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="payment-icon" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="payment-icon" />
              <img src="https://cdn.iconscout.com/icon/free/png-256/free-upi-logo-icon-download-in-svg-png-gif-file-formats--unified-payments-interface-payment-money-transfer-logos-icons-1747946.png?f=webp" alt="UPI" className="payment-icon" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;