import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchOverlay from '../../components/SearchOverlay';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  
  // State for cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Premium Cotton Formal Shirt',
      price: 1299,
      quantity: 1,
      image: '/api/placeholder/80/100',
      size: 'M',
      color: 'White'
    }
  ]);
  
  // State for addresses
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      isSelected: true,
      name: 'Rahul Sharma',
      address: '123, Green Valley Apartments',
      area: 'Near City Mall, M.G. Road',
      city: 'Sehore, Madhya Pradesh 466001',
      phone: '9876543210'
    },
    {
      id: 2,
      type: 'Office',
      isSelected: false,
      name: 'Rahul Sharma',
      address: 'Tech Park, 4th Floor',
      area: 'Koramangala, Near Metro Station',
      city: 'Sehore, Madhya Pradesh 466001',
      phone: '9876543210'
    }
  ]);
  
  // State for contact information
  const [contactInfo, setContactInfo] = useState({
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    orderNotes: ''
  });
  
  // State for payment method
  const [paymentMethod, setPaymentMethod] = useState('cardPayment');
  
  // State for card payment details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  
  // State for UPI payment
  const [upiId, setUpiId] = useState('');
  
  // State for net banking
  const [selectedBank, setSelectedBank] = useState('');
  
  // State for order summary
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 1299,
    discount: 390,
    gst: 164,
    total: 1073
  });
  
  // State for coupon
  const [coupon, setCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const [showCouponMessage, setShowCouponMessage] = useState(false);
  
  // State for checkout process
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Handle contact information change
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value
    });
  };
  
  // Handle card details change
  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };
  
  // Select address
  const handleAddressSelect = (id) => {
    setAddresses(addresses.map(address => ({
      ...address,
      isSelected: address.id === id
    })));
  };
  
  // Handle quantity change
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  // Remove item from cart
  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  // Calculate item total
  const calculateItemTotal = (price, quantity) => {
    return price * quantity;
  };
  
  // Apply coupon
  const handleApplyCoupon = () => {
    if (!coupon.trim()) {
      displayCouponMessage('Please enter a coupon code', 'error');
      return;
    }
    
    const couponCode = coupon.toUpperCase();
    
    if (couponCode === 'WELCOME10') {
      displayCouponMessage('Coupon applied! 10% discount', 'success');
      applyDiscount(0.1); // 10% discount
    } else if (couponCode === 'APNA20') {
      displayCouponMessage('Coupon applied! 20% discount', 'success');
      applyDiscount(0.2); // 20% discount
    } else {
      displayCouponMessage('Invalid coupon code', 'error');
    }
  };
  
  // Display coupon message
  const displayCouponMessage = (text, type) => {
    setCouponMessage({ text, type });
    setShowCouponMessage(true);
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setShowCouponMessage(false);
    }, 5000);
  };
  
  // Apply discount
  const applyDiscount = (rate) => {
    const newDiscount = Math.round(orderSummary.subtotal * rate);
    
    setOrderSummary({
      ...orderSummary,
      discount: newDiscount
    });
  };
  
  // Update order summary
  const updateOrderSummary = () => {
    let subtotal = 0;
    
    // Calculate subtotal from all items
    cartItems.forEach(item => {
      subtotal += item.price * item.quantity;
    });
    
    // Calculate discount (30% for demonstration)
    const discountRate = 0.3;
    const discount = Math.round(subtotal * discountRate);
    
    // Calculate amount after discount
    const afterDiscount = subtotal - discount;
    
    // Calculate GST (18%)
    const gstRate = 0.18;
    const gst = Math.round(afterDiscount * gstRate);
    
    // Calculate total
    const total = afterDiscount + gst;
    
    setOrderSummary({
      subtotal,
      discount,
      gst,
      total
    });
  };
  
  // Effect to update order summary when cart items change
  useEffect(() => {
    updateOrderSummary();
  }, [cartItems]);
  
  // Handle place order
  const handlePlaceOrder = () => {
    // Start processing animation
    setIsProcessingOrder(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Order placed successfully
      setOrderPlaced(true);
      
      // Redirect after a moment
      setTimeout(() => {
        alert('Thank you for your order! Your order has been placed successfully.');
        navigate('/order-confirmation');
      }, 1500);
    }, 2000);
  };
  
  return (
    <div className="checkout-page">
      <SearchOverlay />
      <Header />
      
      <div className="checkout-container">
        {/* Checkout Header */}
        <div className="checkout-header">
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">Please fill in your details below to complete your purchase</p>
        </div>
        
        {/* Checkout Progress */}
        <div className="checkout-progress">
          <div className="progress-line">
            <div className="progress-line-fill" style={{ width: '50%' }}></div>
          </div>
          <div className="progress-step">
            <div className="step-number active">1</div>
            <div className="step-name active">Shopping Cart</div>
          </div>
          <div className="progress-step">
            <div className="step-number active">2</div>
            <div className="step-name active">Checkout</div>
          </div>
          <div className="progress-step">
            <div className="step-number">3</div>
            <div className="step-name">Confirmation</div>
          </div>
        </div>
        
        {/* Checkout Content */}
        <div className="checkout-content">
          {/* Checkout Details */}
          <div className="checkout-details">
            {/* Order Items */}
            <div className="checkout-section">
              <h2 className="section-title">Your Order</h2>
              <div className="cart-items">
                {cartItems.length > 0 ? (
                  cartItems.map(item => (
                    <div className="cart-item" key={item.id}>
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-info">
                          <span>Size: {item.size}</span>
                          <span>Color: {item.color}</span>
                        </div>
                        <div className="item-price">₹{item.price.toLocaleString()}</div>
                      </div>
                      <div className="item-quantity">
                        <div className="quantity-control">
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            className="quantity-input" 
                            value={item.quantity} 
                            min="1" 
                            max="10" 
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          />
                          <button 
                            className="quantity-btn" 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="item-total">
                        ₹{calculateItemTotal(item.price, item.quantity).toLocaleString()}
                      </div>
                      <div className="item-remove" onClick={() => handleRemoveItem(item.id)}>
                        <i className="fas fa-times"></i>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <i className="fas fa-shopping-bag" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '15px' }}></i>
                    <p style={{ color: '#888' }}>Your cart is empty</p>
                    <Link to="/shop" style={{ display: 'inline-block', marginTop: '15px', color: '#c59b6d', textDecoration: 'underline' }}>
                      Continue Shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            {/* Shipping Address */}
            <div className="checkout-section">
              <h2 className="section-title">Shipping Address</h2>
              
              <div className="address-cards">
                {addresses.map(address => (
                  <div 
                    className={`address-card ${address.isSelected ? 'selected' : ''}`} 
                    key={address.id}
                    onClick={() => handleAddressSelect(address.id)}
                  >
                    <div className="address-type">
                      <i className={`fas fa-${address.type.toLowerCase() === 'home' ? 'home' : 'briefcase'} address-icon`}></i> {address.type}
                    </div>
                    <div className="address-details">
                      {address.name}<br />
                      {address.address}<br />
                      {address.area}<br />
                      {address.city}<br />
                      Phone: {address.phone}
                    </div>
                    <div className="address-actions">
                      <div className="address-action">Edit</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="add-address-btn">
                <i className="fas fa-plus"></i> Add New Address
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="checkout-section">
              <h2 className="section-title">Contact Information</h2>
              
              <div className="form-group">
                <label className="form-label">Full Name*</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Your full name" 
                  name="fullName"
                  value={contactInfo.fullName} 
                  onChange={handleContactInfoChange}
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label">Email Address*</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="Your email address" 
                      name="email"
                      value={contactInfo.email} 
                      onChange={handleContactInfoChange}
                      required 
                    />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label">Phone Number*</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="Your phone number" 
                      name="phone"
                      value={contactInfo.phone} 
                      onChange={handleContactInfoChange}
                      required 
                    />
                  </div>
                </div>
              </div>
              
              <div className="order-note">
                <div className="note-heading">Order Notes (Optional)</div>
                <textarea 
                  className="note-textarea" 
                  placeholder="Special notes about your order, e.g. special instructions for delivery"
                  name="orderNotes"
                  value={contactInfo.orderNotes}
                  onChange={handleContactInfoChange}
                ></textarea>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="checkout-section">
              <h2 className="section-title">Payment Method</h2>
              
              <div className="payment-methods">
                <div className="payment-method">
                  <input 
                    type="radio" 
                    id="cardPayment" 
                    name="paymentMethod" 
                    className="payment-radio" 
                    checked={paymentMethod === 'cardPayment'}
                    onChange={() => setPaymentMethod('cardPayment')}
                  />
                  <label htmlFor="cardPayment" className="payment-label">
                    <i className="fas fa-credit-card payment-icon"></i>
                    <span className="payment-name">Credit/Debit Card</span>
                  </label>
                </div>
                
                <div className="payment-method">
                  <input 
                    type="radio" 
                    id="upiPayment" 
                    name="paymentMethod" 
                    className="payment-radio"
                    checked={paymentMethod === 'upiPayment'}
                    onChange={() => setPaymentMethod('upiPayment')}
                  />
                  <label htmlFor="upiPayment" className="payment-label">
                    <i className="fas fa-mobile-alt payment-icon"></i>
                    <span className="payment-name">UPI</span>
                  </label>
                </div>
                
                <div className="payment-method">
                  <input 
                    type="radio" 
                    id="netBankingPayment" 
                    name="paymentMethod" 
                    className="payment-radio"
                    checked={paymentMethod === 'netBankingPayment'}
                    onChange={() => setPaymentMethod('netBankingPayment')}
                  />
                  <label htmlFor="netBankingPayment" className="payment-label">
                    <i className="fas fa-university payment-icon"></i>
                    <span className="payment-name">Net Banking</span>
                  </label>
                </div>
                
                <div className="payment-method">
                  <input 
                    type="radio" 
                    id="codPayment" 
                    name="paymentMethod" 
                    className="payment-radio"
                    checked={paymentMethod === 'codPayment'}
                    onChange={() => setPaymentMethod('codPayment')}
                  />
                  <label htmlFor="codPayment" className="payment-label">
                    <i className="fas fa-money-bill-wave payment-icon"></i>
                    <span className="payment-name">Cash on Delivery</span>
                  </label>
                </div>
              </div>
              
              {/* Card Payment Details */}
              <div className={`payment-details ${paymentMethod === 'cardPayment' ? 'active' : ''}`}>
                <div className="form-group">
                  <label className="form-label">Card Number*</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Card number" 
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardDetailsChange}
                    required 
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">Expiry Date*</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="MM/YY" 
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardDetailsChange}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">CVV*</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="CVV" 
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardDetailsChange}
                        required 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Name on Card*</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Name on card" 
                    name="nameOnCard"
                    value={cardDetails.nameOnCard}
                    onChange={handleCardDetailsChange}
                    required 
                  />
                </div>
              </div>
              
              {/* UPI Payment Details */}
              <div className={`payment-details ${paymentMethod === 'upiPayment' ? 'active' : ''}`}>
                <div className="form-group">
                  <label className="form-label">UPI ID*</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="yourname@upi" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              {/* Net Banking Payment Details */}
              <div className={`payment-details ${paymentMethod === 'netBankingPayment' ? 'active' : ''}`}>
                <div className="form-group">
                  <label className="form-label">Select Bank*</label>
                  <select 
                    className="form-input" 
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    required
                  >
                    <option value="">Select Bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="other">Other Bank</option>
                  </select>
                </div>
              </div>
              
              {/* COD Payment Details */}
              <div className={`payment-details ${paymentMethod === 'codPayment' ? 'active' : ''}`}>
                <p>Pay with cash upon delivery. Please keep exact change handy to help our delivery associates.</p>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="checkout-section">
              <h2 className="section-title">Order Summary</h2>
              
              <div className="summary-row">
                <div className="summary-label"><i className="fas fa-shopping-cart" style={{ color: '#c59b6d' }}></i> Subtotal</div>
                <div className="summary-value">₹{orderSummary.subtotal.toLocaleString()}</div>
              </div>
              
              <div className="summary-row">
                <div className="summary-label"><i className="fas fa-tag" style={{ color: '#c59b6d' }}></i> Discount</div>
                <div className="summary-value">-₹{orderSummary.discount.toLocaleString()}</div>
              </div>
              
              <div className="summary-row">
                <div className="summary-label"><i className="fas fa-percent" style={{ color: '#c59b6d' }}></i> GST (18%)</div>
                <div className="summary-value">₹{orderSummary.gst.toLocaleString()}</div>
              </div>
              
              <div className="summary-row">
                <div className="summary-label"><i className="fas fa-truck" style={{ color: '#c59b6d' }}></i> Delivery Charges</div>
                <div className="summary-value">Free</div>
              </div>
              
              <div className="summary-row summary-total">
                <div className="summary-label"><i className="fas fa-rupee-sign" style={{ marginRight: '5px' }}></i> Total Amount</div>
                <div className="summary-value">₹{orderSummary.total.toLocaleString()}</div>
              </div>
              
              <button 
                className="place-order-btn" 
                onClick={handlePlaceOrder}
                disabled={isProcessingOrder || orderPlaced}
              >
                {isProcessingOrder ? (
                  orderPlaced ? (
                    <><i className="fas fa-check"></i> Order Placed Successfully!</>
                  ) : (
                    <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                  )
                ) : (
                  <><i className="fas fa-lock"></i> Place Order</>
                )}
              </button>
              
              <div className="secure-info">
                <i className="fas fa-shield-alt secure-icon"></i>
                <span>Transactions are 100% secure and encrypted</span>
              </div>
              
              <div className="payment-icons">
                <i className="fab fa-cc-visa"></i>
                <i className="fab fa-cc-mastercard"></i>
                <i className="fab fa-cc-amex"></i>
                <i className="fab fa-cc-paypal"></i>
                <i className="fab fa-google-pay"></i>
              </div>
            </div>
            
            <div className="checkout-section">
              <div className="coupon-form">
                <div className="form-group">
                  <label className="form-label">Apply Coupon</label>
                  <div style={{ display: 'flex' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter coupon code" 
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      style={{ borderRadius: '12px 0 0 12px', borderRight: 'none' }}
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      style={{ 
                        padding: '0 20px', 
                        background: 'linear-gradient(135deg, #d4af7a, #c59b6d)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0 12px 12px 0', 
                        cursor: 'pointer', 
                        fontWeight: 600, 
                        transition: 'all 0.3s ease' 
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  {showCouponMessage && (
                    <div 
                      style={{ 
                        marginTop: '8px', 
                        fontSize: '0.9rem', 
                        color: couponMessage.type === 'success' ? '#28a745' : '#dc3545' 
                      }}
                    >
                      {couponMessage.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;