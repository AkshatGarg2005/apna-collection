import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchOverlay from '../../components/SearchOverlay';
import './Cart.css';

const Cart = () => {
  // State for cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Cotton Shirt",
      price: 1299,
      image: "/images/premium-cotton-shirt.png",
      size: "M",
      quantity: 1
    },
    {
      id: 2,
      name: "Slim Fit Trousers",
      price: 1599,
      image: "/images/premium-cotton-shirt.png",
      size: "32",
      quantity: 1
    },
    {
      id: 3,
      name: "Designer Blazer",
      price: 3499,
      image: "/images/premium-cotton-shirt.png",
      size: "L",
      quantity: 1
    }
  ]);

  // State for cart totals
  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    tax: 0,
    discount: 500, // Fixed discount amount
    shipping: 99,  // Fixed shipping cost
    total: 0
  });

  // State for promo code
  const [promoCode, setPromoCode] = useState('');
  
  // Constants
  const TAX_RATE = 0.18;

  // Format currency function
  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  // Calculate individual item subtotal
  const calculateItemSubtotal = (price, quantity) => {
    return price * quantity;
  };

  // Calculate and update cart totals
  const updateCartTotals = () => {
    let subtotal = cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax - cartTotals.discount + cartTotals.shipping;

    setCartTotals({
      ...cartTotals,
      subtotal,
      tax,
      total
    });
  };

  // Update cart totals whenever cart items change
  useEffect(() => {
    updateCartTotals();
  }, [cartItems]);

  // Increase quantity of an item
  const increaseQuantity = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // Decrease quantity of an item
  const decreaseQuantity = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id && item.quantity > 1 
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ));
  };

  // Handle manual quantity change
  const handleQuantityChange = (id, value) => {
    const newQuantity = parseInt(value);
    if (isNaN(newQuantity) || newQuantity < 1) return;
    
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Handle promo code submission
  const handlePromoSubmit = (e) => {
    e.preventDefault();
    if (promoCode.trim() !== '') {
      alert('Promo code applied successfully!');
      // In a real application, this would apply the discount based on the code
    } else {
      alert('Please enter a valid promo code.');
    }
    setPromoCode('');
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length > 0) {
      alert(`Proceeding to checkout. Your total is ${formatCurrency(cartTotals.total)}`);
      // In a real application, this would redirect to a checkout page
      // history.push('/checkout');
    } else {
      alert('Your cart is empty. Please add items before checkout.');
    }
  };

  return (
    <div className="cart-page">
      <SearchOverlay />
      <Header />
      
      <main className="cart-container">
        <h1 className="page-title">Your Shopping Cart</h1>
        
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.length > 0 ? (
              cartItems.map(item => (
                <div className="cart-item" key={item.id}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="item-image"
                  />
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
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity}
                          className="quantity-input"
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        />
                        <button 
                          className="quantity-btn increase"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>
                      <div className="item-subtotal">
                        {formatCurrency(calculateItemSubtotal(item.price, item.quantity))}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="remove-item"
                    onClick={() => removeItem(item.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-cart">
                <i className="fas fa-shopping-bag"></i>
                <p>Your shopping cart is empty</p>
                <Link to="/shop" className="empty-cart-btn">Continue Shopping</Link>
              </div>
            )}
          </div>
          
          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span id="cart-subtotal">{formatCurrency(cartTotals.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (GST 18%)</span>
              <span id="cart-tax">{formatCurrency(cartTotals.tax)}</span>
            </div>
            <div className="summary-row discount">
              <span>Discount</span>
              <span id="cart-discount">{formatCurrency(-cartTotals.discount)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span id="cart-shipping">{formatCurrency(cartTotals.shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span id="cart-total">{formatCurrency(cartTotals.total)}</span>
            </div>
            
            <div className="promo-code">
              <h3>Promo Code</h3>
              <form className="promo-form" onSubmit={handlePromoSubmit}>
                <input 
                  type="text" 
                  placeholder="Enter promo code" 
                  className="promo-input"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button type="submit" className="promo-btn">Apply</button>
              </form>
            </div>
            
            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <div className="continue-shopping">
              <Link to="/">Continue Shopping</Link>
            </div>
            
            <div className="payment-options">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="payment-icon" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="payment-icon" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="payment-icon" />
              <img src="https://cdn.iconscout.com/icon/free/png-256/free-upi-logo-icon-download-in-svg-png-gif-file-formats--unified-payments-interface-payment-money-transfer-logos-icons-1747946.png?f=webp" alt="UPI" className="payment-icon" />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;