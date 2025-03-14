import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { cart, calculateCartTotals, clearCart } = useCart();
  
  // Cart items state - now connected to cart context
  const [cartItems, setCartItems] = useState([]);
  
  // Load cart items when component mounts
  useEffect(() => {
    if (cart && cart.length > 0) {
      setCartItems(cart);
    } else {
      // Redirect to cart if cart is empty
      navigate('/cart');
    }
  }, [cart, navigate]);
  
  // Address states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // Load user addresses
  useEffect(() => {
    if (userProfile?.addresses && userProfile.addresses.length > 0) {
      setAddresses(userProfile.addresses);
      
      // Set default address as selected
      const defaultAddress = userProfile.addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(userProfile.addresses[0].id);
      }
    }
  }, [userProfile]);
  
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
  
  // Animation references
  const subtotalRef = useRef(null);
  const discountRef = useRef(null);
  const gstRef = useRef(null);
  const totalRef = useRef(null);
  
  // Place order animation state
  const [orderButtonState, setOrderButtonState] = useState({
    isLoading: false,
    isSuccess: false,
    text: 'Place Order',
    icon: 'fas fa-lock'
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
    
    // Update state with new values
    setSummary(prevSummary => {
      const newSummary = {
        subtotal,
        discount,
        gst,
        total
      };
      
      // Animate changes if values are different
      if (prevSummary.subtotal !== 0) {
        if (prevSummary.subtotal !== subtotal) animateValue(subtotalRef.current, prevSummary.subtotal, subtotal);
        if (prevSummary.discount !== discount) animateValue(discountRef.current, prevSummary.discount, discount, true);
        if (prevSummary.gst !== gst) animateValue(gstRef.current, prevSummary.gst, gst);
        if (prevSummary.total !== total) animateValue(totalRef.current, prevSummary.total, total, false, true);
      }
      
      return newSummary;
    });
  };
  
  // Animate value change
  const animateValue = (element, start, end, isDiscount = false, isTotal = false) => {
    if (!element) return;
    
    const duration = 800;
    const startTime = performance.now();
    const prefix = isDiscount ? '-₹' : '₹';
    
    // Highlight the element
    element.style.transition = 'all 0.3s ease';
    element.style.backgroundColor = isTotal 
      ? 'rgba(197, 155, 109, 0.15)' 
      : 'rgba(241, 236, 229, 0.5)';
    element.style.transform = 'scale(1.05)';
    
    const animateFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = t => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(progress);
      
      // Calculate current value
      const current = Math.round(start + (end - start) * easedProgress);
      
      // Update the element
      element.textContent = `${prefix}${current.toLocaleString()}`;
      
      // Add glow effect for total
      if (isTotal) {
        const intensity = 1 - progress;
        element.style.textShadow = `0 0 ${5 * intensity}px rgba(197, 155, 109, ${0.8 * intensity})`;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        // Restore element style after animation
        setTimeout(() => {
          element.style.backgroundColor = '';
          element.style.transform = '';
          element.style.textShadow = '';
        }, 300);
      }
    };
    
    requestAnimationFrame(animateFrame);
  };
  
  // Handle quantity changes
  const decreaseQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    
    // If quantity is 1, remove the item instead of decreasing
    if (item && item.quantity === 1) {
      removeItem(itemId);
    } else {
      setCartItems(cartItems.map(item => {
        if (item.id === itemId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }));
    }
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
  
  // Remove item from cart with animation
  const removeItem = (itemId) => {
    // Find the cart item element
    const itemElement = document.querySelector(`.cart-item[data-id="${itemId}"]`);
    
    if (itemElement) {
      // Add removal animation
      itemElement.style.transition = 'all 0.5s ease';
      itemElement.style.height = `${itemElement.offsetHeight}px`;
      itemElement.style.overflow = 'hidden';
      
      // First fade out
      itemElement.style.opacity = '0';
      itemElement.style.transform = 'translateX(20px)';
      
      setTimeout(() => {
        // Then collapse
        itemElement.style.height = '0';
        itemElement.style.marginTop = '0';
        itemElement.style.marginBottom = '0';
        itemElement.style.padding = '0';
        
        // Finally remove from state after animation completes
        setTimeout(() => {
          setCartItems(cartItems.filter(item => item.id !== itemId));
        }, 300);
      }, 300);
    } else {
      // If element not found, just update the state
      setCartItems(cartItems.filter(item => item.id !== itemId));
    }
  };
  
  // Select address
  const selectAddress = (addressId) => {
    setSelectedAddressId(addressId);
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
  
  // Handle coupon application with animation
  const handleApplyCoupon = () => {
    const couponCode = coupon.code.trim();
    
    if (!couponCode) {
      showCouponMessage('Please enter a coupon code', false);
      return;
    }
    
    // Add a loading effect to the input
    const couponInput = document.querySelector('.coupon-form .form-input');
    if (couponInput) {
      couponInput.style.transition = 'all 0.3s ease';
      couponInput.style.backgroundColor = '#f9f9f9';
      couponInput.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.05)';
      couponInput.disabled = true;
    }
    
    // Simulate API validation with delay
    setTimeout(() => {
      if (couponInput) {
        couponInput.style.backgroundColor = '';
        couponInput.style.boxShadow = '';
        couponInput.disabled = false;
      }
      
      // Validate coupon code
      if (couponCode.toUpperCase() === 'WELCOME10') {
        showCouponSuccess('Coupon applied! 10% discount', 0.1);
      } else if (couponCode.toUpperCase() === 'APNA20') {
        showCouponSuccess('Coupon applied! 20% discount', 0.2);
      } else {
        showCouponError('Invalid coupon code');
      }
    }, 800);
  };
  
  // Show success animation for coupon
  const showCouponSuccess = (message, discountRate) => {
    // Show message
    showCouponMessage(message, true);
    
    // Update discount rate
    setCoupon(prev => ({
      ...prev,
      isValid: true,
      discount: discountRate
    }));
    
    // Highlight the summary section
    const discountRow = document.querySelector('.summary-row:nth-child(2)');
    if (discountRow) {
      discountRow.style.transition = 'all 0.5s ease';
      discountRow.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
      discountRow.style.borderLeft = '3px solid #28a745';
      
      setTimeout(() => {
        discountRow.style.backgroundColor = '';
        discountRow.style.borderLeft = '';
      }, 3000);
    }
  };
  
  // Show error animation for coupon
  const showCouponError = (message) => {
    showCouponMessage(message, false);
    
    // Shake effect on the input
    const couponInput = document.querySelector('.coupon-form .form-input');
    if (couponInput) {
      couponInput.style.transition = 'all 0.1s ease';
      couponInput.style.borderColor = '#dc3545';
      
      // Create shake animation
      let position = 1;
      const shake = setInterval(() => {
        couponInput.style.transform = position ? 'translateX(2px)' : 'translateX(-2px)';
        position = !position;
      }, 50);
      
      // Stop after a short time
      setTimeout(() => {
        clearInterval(shake);
        couponInput.style.transform = '';
        
        setTimeout(() => {
          couponInput.style.borderColor = '';
        }, 500);
      }, 300);
      
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
  
  // Progress animation for order processing
  const createProgressAnimation = () => {
    const container = document.querySelector('.checkout-container');
    if (!container) return;
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'order-progress-bar';
    progressBar.innerHTML = `
      <div class="progress-inner"></div>
    `;
    
    container.appendChild(progressBar);
    
    // Start animation
    setTimeout(() => {
      const inner = progressBar.querySelector('.progress-inner');
      if (inner) inner.style.width = '100%';
    }, 50);
    
    // Remove after completion
    setTimeout(() => {
      progressBar.style.opacity = '0';
      setTimeout(() => progressBar.remove(), 500);
    }, 2500);
  };
  
  // Success animation
  const createSuccessAnimation = () => {
    const container = document.querySelector('.checkout-container');
    if (!container) return;
    
    // Create success overlay
    const overlay = document.createElement('div');
    overlay.className = 'order-success-overlay';
    
    // Add animated check mark
    overlay.innerHTML = `
      <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
      </svg>
      <div class="success-message">Order Confirmed!</div>
    `;
    
    container.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 100);
    
    // Animate out before redirect
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }, 1800);
  };
  
  // Play celebratory sound (silent by default, uncomment to enable)
  const playCelebrativeSound = () => {
    // Uncomment below for audio feedback
    // const audio = new Audio('success-sound-url.mp3');
    // audio.volume = 0.3;
    // audio.play().catch(e => console.log('Audio play prevented by browser policy'));
  };
  
  // Enhanced confetti effect for successful order
  const triggerConfettiEffect = () => {
    const colors = ['#c59b6d', '#d4af7a', '#e1d9d2', '#f1ece5', '#ffffff', '#28a745', '#ffc107'];
    const confettiCount = 250;
    const container = document.querySelector('.checkout-container');
    
    if (!container) return;
    
    // Create confetti container for better performance
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    container.appendChild(confettiContainer);
    
    // Generate different types of confetti
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      
      // Randomize confetti type (circle, square, or star)
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        confetti.className = 'confetti confetti-circle';
      } else if (type === 1) {
        confetti.className = 'confetti';
      } else {
        confetti.className = 'confetti confetti-star';
        confetti.innerHTML = '★';
      }
      
      // Random styling
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 5 + 3 + 'px';
      confetti.style.opacity = Math.random() + 0.5;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      // Animation duration and delay
      confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      
      confettiContainer.appendChild(confetti);
    }
    
    // Clean up confetti after animation
    setTimeout(() => {
      confettiContainer.style.transition = 'opacity 1s ease';
      confettiContainer.style.opacity = '0';
      setTimeout(() => {
        confettiContainer.remove();
      }, 1000);
    }, 5000);
  };
  
  // Enhanced place order with advanced animation and order saving
  const handlePlaceOrder = () => {
    // Store the original button width and text for consistency
    const button = document.querySelector('.place-order-btn');
    if (button) {
      // Ensure consistent width during state changes
      const buttonWidth = button.offsetWidth;
      button.style.width = `${buttonWidth}px`;
    }
    
    // Add a ripple effect to the button first
    if (button) {
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${button.clientWidth / 2 - radius}px`;
      ripple.style.top = `${button.clientHeight / 2 - radius}px`;
      
      button.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);
    }
    
    // Set loading state with progress animation
    setOrderButtonState({
      isLoading: true,
      isSuccess: false,
      text: 'Processing...',
      icon: 'fas fa-spinner fa-spin'
    });
    
    // Create a progress indication
    createProgressAnimation();
    
    // Create order object with all necessary details
    const order = {
      id: 'AC' + Math.floor(10000000 + Math.random() * 90000000),
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      items: cartItems,
      shippingAddress: addresses.find(addr => addr.id === selectedAddressId),
      paymentMethod: paymentMethod,
      subtotal: summary.subtotal,
      discount: summary.discount,
      tax: summary.gst,
      shipping: summary.shipping || 0,
      total: summary.total,
      status: 'Processing',
      userId: currentUser?.uid
    };
    
    // Store order in localStorage for demo purposes
    // In a real app, you would save this to Firestore
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([...existingOrders, order]));
    
    // Store the most recent order for order confirmation page
    localStorage.setItem('recentOrder', JSON.stringify(order));
    
    // Simulate order processing (would be an API call in real app)
    setTimeout(() => {
      // Flash summary section
      const summary = document.querySelector('.checkout-summary .checkout-section');
      if (summary) {
        summary.style.transition = 'all 0.5s ease';
        summary.style.boxShadow = '0 0 30px rgba(197, 155, 109, 0.5)';
        
        setTimeout(() => {
          summary.style.boxShadow = '';
        }, 800);
      }
      
      // Clear the cart
      clearCart();
      
      // Set success state
      setOrderButtonState({
        isLoading: false,
        isSuccess: true,
        text: 'Order Placed Successfully!',
        icon: 'fas fa-check'
      });
      
      // Celebration effects
      triggerConfettiEffect();
      createSuccessAnimation();
      playCelebrativeSound();
      
      // Navigate to confirmation page after a delay
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 2200);
    }, 2500);
  };
  
  // Show add address form
  const showAddAddressForm = () => {
    navigate('/account');
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
                  <div className="cart-item" key={item.id} data-id={item.id}>
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
                          title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                        >
                          {item.quantity === 1 ? <i className="fas fa-trash-alt"></i> : "-"}
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
              {addresses.length > 0 ? (
                addresses.map(address => (
                  <div 
                    key={address.id} 
                    className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                    onClick={() => selectAddress(address.id)}
                  >
                    <div className="address-type">
                      <i className={`${address.type === 'Home' ? 'fas fa-home' : 'fas fa-briefcase'} address-icon`}></i> 
                      {address.type}
                    </div>
                    <div className="address-details">
                      {userProfile?.displayName || currentUser?.displayName || 'User'}<br />
                      {address.address}<br />
                      {address.city}, {address.state} - {address.pincode}<br />
                      {userProfile?.phone && `Phone: ${userProfile.phone}`}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{padding: '20px', textAlign: 'center'}}>
                  <p>No saved addresses found. Please add an address to continue.</p>
                  <Link to="/account" className="add-address-btn" style={{marginTop: '15px', display: 'inline-block'}}>
                    Add New Address
                  </Link>
                </div>
              )}
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
              <div className="summary-value" id="summary-subtotal" ref={subtotalRef}>₹{summary.subtotal}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-tag" style={{ color: '#c59b6d' }}></i> Discount</div>
              <div className="summary-value" id="summary-discount" ref={discountRef}>-₹{summary.discount}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-percent" style={{ color: '#c59b6d' }}></i> GST (18%)</div>
              <div className="summary-value" id="summary-gst" ref={gstRef}>₹{summary.gst}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-truck" style={{ color: '#c59b6d' }}></i> Delivery Charges</div>
              <div className="summary-value" id="summary-delivery">Free</div>
            </div>
            
            <div className="summary-row summary-total">
              <div className="summary-label"><i className="fas fa-rupee-sign" style={{ marginRight: '5px' }}></i> Total Amount</div>
              <div className="summary-value" id="summary-total" ref={totalRef}>₹{summary.total}</div>
            </div>
            
            <button 
              className={`place-order-btn ${orderButtonState.isSuccess ? 'success' : ''} ${orderButtonState.isLoading ? 'loading' : ''}`} 
              onClick={handlePlaceOrder}
              disabled={orderButtonState.isLoading || orderButtonState.isSuccess || addresses.length === 0}
            >
              <span className="btn-content">
                <i className={orderButtonState.icon}></i> 
                <span>{orderButtonState.text}</span>
              </span>
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
                <div style={{ display: 'flex' }} className="coupon-form">
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
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>Apply</span>
                    <span 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: '-100%', 
                        width: '100%', 
                        height: '100%', 
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)', 
                        transition: 'all 0.6s ease',
                        zIndex: 1
                      }}
                      className="btn-shine"
                      onMouseEnter={(e) => { e.currentTarget.style.left = '100%' }}
                    ></span>
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