import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  
  // Cart items state
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Premium Cotton Formal Shirt',
      image: '/api/placeholder/80/100',
      size: 'M',
      color: 'White',
      price: 1299,
      quantity: 1
    },
    {
      id: 2,
      name: 'Slim Fit Dress Pants',
      image: '/api/placeholder/80/100',
      size: 'L',
      color: 'Black',
      price: 1499,
      quantity: 1
    }
  ]);
  
  // Address states
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      icon: 'fas fa-home',
      name: 'Rahul Sharma',
      address: '123, Green Valley Apartments',
      locality: 'Near City Mall, M.G. Road',
      city: 'Sehore, Madhya Pradesh 466001',
      phone: '9876543210',
      isSelected: true
    },
    {
      id: 2,
      type: 'Office',
      icon: 'fas fa-briefcase',
      name: 'Rahul Sharma',
      address: 'Tech Park, 4th Floor',
      locality: 'Koramangala, Near Metro Station',
      city: 'Sehore, Madhya Pradesh 466001',
      phone: '9876543210',
      isSelected: false
    }
  ]);
  
  // Form states
  const [contactInfo, setContactInfo] = useState({
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    orderNotes: ''
  });
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('cardPayment');
  
  // Payment details states
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  
  const [upiDetails, setUpiDetails] = useState({
    upiId: ''
  });
  
  const [netBankingDetails, setNetBankingDetails] = useState({
    bank: ''
  });
  
  // Summary state
  const [summary, setSummary] = useState({
    subtotal: 0,
    discount: 0,
    gst: 0,
    total: 0
  });
  
  // Coupon state
  const [coupon, setCoupon] = useState({
    code: '',
    message: '',
    isValid: false,
    discount: 0.3 // Default 30% discount
  });
  
  // Calculate order summary
  useEffect(() => {
    calculateOrderSummary();
  }, [cartItems, coupon.discount]);
  
  const calculateOrderSummary = () => {
    // Calculate subtotal
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calculate discount
    const discount = Math.round(subtotal * coupon.discount);
    
    // Calculate amount after discount
    const afterDiscount = subtotal - discount;
    
    // Calculate GST (18%)
    const gst = Math.round(afterDiscount * 0.18);
    
    // Calculate total
    const total = afterDiscount + gst;
    
    setSummary({
      subtotal,
      discount,
      gst,
      total
    });
  };
  
  // Handle quantity changes
  const decreaseQuantity = (itemId) => {
    setCartItems(cartItems.map(item => {
      if (item.id === itemId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }));
  };
  
  const increaseQuantity = (itemId) => {
    setCartItems(cartItems.map(item => {
      if (item.id === itemId && item.quantity < 10) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };
  
  const updateQuantity = (itemId, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 1) return;
    
    setCartItems(cartItems.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.min(quantity, 10) };
      }
      return item;
    }));
  };
  
  // Remove item from cart
  const removeItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };
  
  // Select address
  const selectAddress = (addressId) => {
    setAddresses(addresses.map(address => ({
      ...address,
      isSelected: address.id === addressId
    })));
  };
  
  // Handle contact info changes
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.id);
  };
  
  // Handle card details changes
  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle UPI details changes
  const handleUpiDetailsChange = (e) => {
    const { name, value } = e.target;
    setUpiDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle net banking details changes
  const handleNetBankingDetailsChange = (e) => {
    const { name, value } = e.target;
    setNetBankingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle coupon application
  const handleApplyCoupon = () => {
    const couponCode = coupon.code.trim();
    
    if (!couponCode) {
      showCouponMessage('Please enter a coupon code', false);
      return;
    }
    
    // Simulate coupon validation
    if (couponCode.toUpperCase() === 'WELCOME10') {
      showCouponMessage('Coupon applied! 10% discount', true);
      setCoupon(prev => ({
        ...prev,
        isValid: true,
        discount: 0.1
      }));
    } else if (couponCode.toUpperCase() === 'APNA20') {
      showCouponMessage('Coupon applied! 20% discount', true);
      setCoupon(prev => ({
        ...prev,
        isValid: true,
        discount: 0.2
      }));
    } else {
      showCouponMessage('Invalid coupon code', false);
      setCoupon(prev => ({
        ...prev,
        isValid: false
      }));
    }
  };
  
  // Show coupon message
  const showCouponMessage = (message, isSuccess) => {
    setCoupon(prev => ({
      ...prev,
      message,
      isValid: isSuccess
    }));
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setCoupon(prev => ({ ...prev, message: '' }));
    }, 5000);
  };
  
  // Handle place order
  const handlePlaceOrder = () => {
    // Here you would typically validate all inputs and process the order
    
    // For demonstration, we'll just navigate to the confirmation page
    navigate('/order-confirmation');
  };
  
  // Show add address form
  const showAddAddressForm = () => {
    alert('Add New Address Form would be shown here');
    // In a real app, you would show a modal or form component
  };

  return (
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
                      <div className="item-price">₹{item.price}</div>
                    </div>
                    <div className="item-quantity">
                      <div className="quantity-control">
                        <button 
                          className="quantity-btn" 
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          className="quantity-input" 
                          value={item.quantity} 
                          min="1" 
                          max="10" 
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                        />
                        <button 
                          className="quantity-btn" 
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-total">₹{item.price * item.quantity}</div>
                    <div 
                      className="item-remove" 
                      onClick={() => removeItem(item.id)}
                    >
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
                  key={address.id} 
                  className={`address-card ${address.isSelected ? 'selected' : ''}`}
                  onClick={() => selectAddress(address.id)}
                >
                  <div className="address-type">
                    <i className={`${address.icon} address-icon`}></i> {address.type}
                  </div>
                  <div className="address-details">
                    {address.name}<br />
                    {address.address}<br />
                    {address.locality}<br />
                    {address.city}<br />
                    Phone: {address.phone}
                  </div>
                  <div className="address-actions">
                    <div className="address-action">Edit</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="add-address-btn" onClick={showAddAddressForm}>
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
                  onChange={handlePaymentMethodChange}
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
                  onChange={handlePaymentMethodChange}
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
                  onChange={handlePaymentMethodChange}
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
                  onChange={handlePaymentMethodChange}
                />
                <label htmlFor="codPayment" className="payment-label">
                  <i className="fas fa-money-bill-wave payment-icon"></i>
                  <span className="payment-name">Cash on Delivery</span>
                </label>
              </div>
            </div>
            
            {/* Card Payment Details */}
            <div className={`payment-details ${paymentMethod === 'cardPayment' ? 'active' : ''}`} id="cardPaymentDetails">
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
            <div className={`payment-details ${paymentMethod === 'upiPayment' ? 'active' : ''}`} id="upiPaymentDetails">
              <div className="form-group">
                <label className="form-label">UPI ID*</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="yourname@upi" 
                  name="upiId"
                  value={upiDetails.upiId}
                  onChange={handleUpiDetailsChange}
                  required 
                />
              </div>
            </div>
            
            {/* Net Banking Payment Details */}
            <div className={`payment-details ${paymentMethod === 'netBankingPayment' ? 'active' : ''}`} id="netBankingDetails">
              <div className="form-group">
                <label className="form-label">Select Bank*</label>
                <select 
                  className="form-input" 
                  name="bank"
                  value={netBankingDetails.bank}
                  onChange={handleNetBankingDetailsChange}
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
            <div className={`payment-details ${paymentMethod === 'codPayment' ? 'active' : ''}`} id="codDetails">
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
              <div className="summary-value" id="summary-subtotal">₹{summary.subtotal}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-tag" style={{ color: '#c59b6d' }}></i> Discount</div>
              <div className="summary-value" id="summary-discount">-₹{summary.discount}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-percent" style={{ color: '#c59b6d' }}></i> GST (18%)</div>
              <div className="summary-value" id="summary-gst">₹{summary.gst}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-truck" style={{ color: '#c59b6d' }}></i> Delivery Charges</div>
              <div className="summary-value" id="summary-delivery">Free</div>
            </div>
            
            <div className="summary-row summary-total">
              <div className="summary-label"><i className="fas fa-rupee-sign" style={{ marginRight: '5px' }}></i> Total Amount</div>
              <div className="summary-value" id="summary-total">₹{summary.total}</div>
            </div>
            
            <button className="place-order-btn" onClick={handlePlaceOrder}>
              <i className="fas fa-lock"></i> Place Order
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
                    style={{ borderRadius: '12px 0 0 12px', borderRight: 'none' }}
                    value={coupon.code}
                    onChange={(e) => setCoupon(prev => ({ ...prev, code: e.target.value }))}
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
                      fontWeight: '600', 
                      transition: 'all 0.3s ease' 
                    }}
                  >
                    Apply
                  </button>
                </div>
                {coupon.message && (
                  <div 
                    style={{ 
                      marginTop: '8px', 
                      fontSize: '0.9rem', 
                      color: coupon.isValid ? '#28a745' : '#dc3545'
                    }}
                  >
                    {coupon.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;