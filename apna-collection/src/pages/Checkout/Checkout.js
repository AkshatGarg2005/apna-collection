import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(2); // 1: Cart, 2: Checkout, 3: Confirmation
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Premium Cotton Formal Shirt',
      price: 1299,
      image: '/api/placeholder/80/100',
      quantity: 1,
      size: 'M',
      color: 'White'
    }
  ]);
  
  // State for form data
  const [contactInfo, setContactInfo] = useState({
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    notes: ''
  });
  
  // State for selected address
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [addresses, setAddresses] = useState([
    {
      type: 'Home',
      name: 'Rahul Sharma',
      line1: '123, Green Valley Apartments',
      line2: 'Near City Mall, M.G. Road',
      city: 'Sehore',
      state: 'Madhya Pradesh',
      zip: '466001',
      phone: '9876543210'
    },
    {
      type: 'Office',
      name: 'Rahul Sharma',
      line1: 'Tech Park, 4th Floor',
      line2: 'Koramangala, Near Metro Station',
      city: 'Sehore',
      state: 'Madhya Pradesh',
      zip: '466001',
      phone: '9876543210'
    }
  ]);
  
  // State for payment method
  const [paymentMethod, setPaymentMethod] = useState('cardPayment');
  
  // State for order summary
  const [summary, setSummary] = useState({
    subtotal: 0,
    discount: 0,
    gst: 0,
    total: 0
  });
  
  // State for coupon
  const [coupon, setCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState({ message: '', type: '' });
  const [discountRate, setDiscountRate] = useState(0.3); // 30% by default
  
  // Reference for tracking previous state
  const prevSummaryRef = useRef({});
  
  // Calculate order summary with optimizations
  useEffect(() => {
    // Store previous summary for animations
    if (summary.subtotal > 0) {
      prevSummaryRef.current = { ...summary };
    }
    
    // Request animation frame to ensure UI is updated first
    requestAnimationFrame(() => {
      calculateOrderSummary();
    });
  }, [cartItems, discountRate]);
  
  const calculateOrderSummary = () => {
    // Calculate subtotal with reduce for performance
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calculate discount 
    const discount = Math.round(subtotal * discountRate);
    
    // Calculate amount after discount
    const afterDiscount = subtotal - discount;
    
    // Calculate GST (18%)
    const gst = Math.round(afterDiscount * 0.18);
    
    // Calculate total
    const total = afterDiscount + gst;
    
    // Update summary state
    setSummary({
      subtotal,
      discount,
      gst,
      total
    });
    
    // If there's a previous summary, animate the changes
    if (prevSummaryRef.current.subtotal) {
      // Slight delay to ensure state updates are processed
      setTimeout(() => {
        animateOrderSummary(prevSummaryRef.current, {
          subtotal,
          discount,
          gst,
          total
        });
      }, 50);
    }
  };
  
  // Animate value changes in order summary
  const animateOrderSummary = (prevValues, newValues) => {
    // Only animate if there's a change and previous values exist
    if (!prevValues.subtotal) return;
    
    // Get all elements to animate
    const subtotalEl = document.getElementById('summary-subtotal');
    const discountEl = document.getElementById('summary-discount');
    const gstEl = document.getElementById('summary-gst');
    const totalEl = document.getElementById('summary-total');
    
    // Animate each value that changed
    if (prevValues.subtotal !== newValues.subtotal && subtotalEl) {
      animateValue(subtotalEl, prevValues.subtotal, newValues.subtotal, false);
      highlightRow(subtotalEl.closest('.summary-row'));
    }
    
    if (prevValues.discount !== newValues.discount && discountEl) {
      animateValue(discountEl, prevValues.discount, newValues.discount, true);
      highlightRow(discountEl.closest('.summary-row'));
    }
    
    if (prevValues.gst !== newValues.gst && gstEl) {
      animateValue(gstEl, prevValues.gst, newValues.gst, false);
      highlightRow(gstEl.closest('.summary-row'));
    }
    
    if (prevValues.total !== newValues.total && totalEl) {
      animateValue(totalEl, prevValues.total, newValues.total, false, true);
      highlightRow(totalEl.closest('.summary-row'));
    }
  };
  
  // Animate changing a value with easing
  const animateValue = (element, start, end, isDiscount = false, isTotal = false) => {
    // Don't animate if start and end are the same
    if (start === end) return;
    
    const duration = 800;
    const startTime = performance.now();
    const prefix = isDiscount ? '-₹' : '₹';
    
    const animate = (currentTime) => {
      // Calculate elapsed time
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function - smooth out the animation
      const easedProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Calculate current value
      const current = Math.round(start + (end - start) * easedProgress);
      element.textContent = `${prefix}${current.toLocaleString()}`;
      
      // Special effects for total
      if (isTotal) {
        const intensity = 1 - progress;
        element.style.textShadow = `0 0 ${5 * intensity}px rgba(197, 155, 109, ${0.8 * intensity})`;
        element.style.transform = `scale(${1 + 0.05 * intensity})`;
      }
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset any special effects
        if (isTotal) {
          setTimeout(() => {
            element.style.textShadow = '';
            element.style.transform = '';
          }, 200);
        }
      }
    };
    
    requestAnimationFrame(animate);
  };
  
  // Highlight row to show it was updated
  const highlightRow = (row) => {
    if (!row) return;
    
    // Save original background
    const originalBackground = row.style.background;
    
    // Add highlight class if defined in CSS
    row.classList.add('highlight-row');
    
    // Or use direct style manipulation
    row.style.transition = 'background-color 1.5s ease';
    row.style.backgroundColor = 'rgba(197, 155, 109, 0.2)';
    
    // Remove highlight after animation
    setTimeout(() => {
      row.classList.remove('highlight-row');
      row.style.backgroundColor = originalBackground;
    }, 1500);
  };
  
  // Handle quantity changes with simplified approach
  const handleQuantityChange = (id, change, isDirectInput = false) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          let newQuantity;
          
          if (isDirectInput) {
            // Direct input - use the value directly (with min/max constraints)
            newQuantity = Math.max(1, Math.min(10, change));
          } else {
            // Button click - increment or decrement
            newQuantity = Math.max(1, Math.min(10, item.quantity + change));
          }
          
          // Store previous summary for animation
          prevSummaryRef.current = { ...summary };
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
    
    // Simple animation for the button
    if (!isDirectInput) {
      const btn = document.activeElement;
      if (btn && btn.classList.contains('quantity-btn')) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 150);
      }
    }
    
    // Highlight the changed price after a short delay
    // to allow state update to complete
    setTimeout(() => {
      // Find and highlight the item's price
      const itemElement = document.querySelector(`.cart-item[data-id="${id}"]`);
      if (itemElement) {
        const priceElement = itemElement.querySelector('.item-total');
        if (priceElement) {
          priceElement.style.color = '#c59b6d';
          priceElement.style.transform = 'scale(1.05)';
          
          setTimeout(() => {
            priceElement.style.color = '';
            priceElement.style.transform = '';
          }, 500);
        }
      }
    }, 50);
  };
  
  // Handle remove item
  const handleRemoveItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Handle address selection
  const handleAddressSelect = (index) => {
    setSelectedAddress(index);
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  // Handle contact info change
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };
  
  // Handle coupon application
  const handleApplyCoupon = () => {
    const couponBtn = document.getElementById('applyCouponBtn');
    const couponInput = document.getElementById('couponInput');
    
    if (!coupon) {
      setCouponMessage({ message: 'Please enter a coupon code', type: 'error' });
      
      // Show validation animation
      if (couponInput) {
        couponInput.style.borderColor = '#dc3545';
        couponInput.style.animation = 'error-shake 0.5s ease-in-out';
        
        setTimeout(() => {
          couponInput.style.borderColor = '';
          couponInput.style.animation = '';
        }, 1000);
      }
      return;
    }
    
    // Button loading state
    if (couponBtn) {
      couponBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      couponBtn.disabled = true;
    }
    
    // Simulate network delay
    setTimeout(() => {
      // Reset button state
      if (couponBtn) {
        couponBtn.innerHTML = 'Apply';
        couponBtn.disabled = false;
      }
      
      // Simulate coupon validation
      if (coupon.toUpperCase() === 'WELCOME10') {
        setCouponMessage({ message: 'Coupon applied! 10% discount', type: 'success' });
        setDiscountRate(0.1);
        
        // Show success animation
        if (couponInput) {
          couponInput.style.borderColor = '#28a745';
          couponInput.style.animation = 'success-pulse 1.5s';
        }
        
        // Highlight the discount row
        const discountEl = document.getElementById('summary-discount');
        const discountRow = discountEl?.closest('.summary-row');
        
        if (discountRow) {
          discountRow.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
          
          setTimeout(() => {
            discountRow.style.transition = 'background-color 1s ease';
            discountRow.style.backgroundColor = '';
          }, 2000);
        }
      } else if (coupon.toUpperCase() === 'APNA20') {
        setCouponMessage({ message: 'Coupon applied! 20% discount', type: 'success' });
        setDiscountRate(0.2);
        
        // Show success animation
        if (couponInput) {
          couponInput.style.borderColor = '#28a745';
          couponInput.style.animation = 'success-pulse 1.5s';
        }
        
        // Highlight the discount row
        const discountEl = document.getElementById('summary-discount');
        const discountRow = discountEl?.closest('.summary-row');
        
        if (discountRow) {
          discountRow.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
          
          setTimeout(() => {
            discountRow.style.transition = 'background-color 1s ease';
            discountRow.style.backgroundColor = '';
          }, 2000);
        }
      } else {
        setCouponMessage({ message: 'Invalid coupon code', type: 'error' });
        
        // Show error animation
        if (couponInput) {
          couponInput.style.borderColor = '#dc3545';
          couponInput.style.animation = 'error-shake 0.5s ease-in-out';
          
          setTimeout(() => {
            couponInput.style.borderColor = '';
            couponInput.style.animation = '';
          }, 1000);
        }
      }
      
      // Clear coupon message after a few seconds
      setTimeout(() => {
        setCouponMessage({ message: '', type: '' });
        
        // Reset input styles
        if (couponInput) {
          couponInput.style.borderColor = '';
          couponInput.style.animation = '';
        }
      }, 5000);
    }, 800);
  };
  
  // Handle place order
  const handlePlaceOrder = () => {
    // Show loading state in button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      placeOrderBtn.disabled = true;
      
      // Add subtle pulsing animation
      placeOrderBtn.style.animation = 'pulse 1.5s infinite';
    }
    
    // Add visual feedback for order processing
    const checkoutSections = document.querySelectorAll('.checkout-section');
    checkoutSections.forEach((section, index) => {
      setTimeout(() => {
        section.style.transition = 'all 0.5s ease';
        section.style.boxShadow = '0 15px 35px rgba(197, 155, 109, 0.15)';
        section.style.borderColor = 'rgba(197, 155, 109, 0.2)';
        
        // Add overlay effect
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        overlay.style.borderRadius = '20px';
        overlay.style.zIndex = '5';
        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease';
        
        section.style.position = 'relative';
        section.appendChild(overlay);
        
        setTimeout(() => {
          overlay.style.opacity = '1';
        }, 100);
      }, 300 * index);
    });
    
    // Simulate order processing with progressive animations
    setTimeout(() => {
      // First update the button to show success
      if (placeOrderBtn) {
        placeOrderBtn.style.animation = 'none';
        placeOrderBtn.innerHTML = '<i class="fas fa-check"></i> Order Placed Successfully!';
        placeOrderBtn.style.background = 'linear-gradient(135deg, #5cb85c, #4cae4c)';
        placeOrderBtn.style.transform = 'scale(1.05)';
        placeOrderBtn.style.boxShadow = '0 15px 30px rgba(92, 184, 92, 0.3)';
      }
      
      // Add success notification
      const notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.left = '50%';
      notification.style.transform = 'translateX(-50%) translateY(-100px)';
      notification.style.background = 'linear-gradient(135deg, #5cb85c, #4cae4c)';
      notification.style.color = 'white';
      notification.style.padding = '15px 25px';
      notification.style.borderRadius = '50px';
      notification.style.boxShadow = '0 5px 20px rgba(92, 184, 92, 0.4)';
      notification.style.fontSize = '1.1rem';
      notification.style.fontWeight = '600';
      notification.style.zIndex = '1000';
      notification.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      notification.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 10px;"></i> Order placed successfully!';
      
      document.body.appendChild(notification);
      
      // Animate notification in
      setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
      }, 100);
      
      // Redirect to confirmation page with delay and cleanup
      setTimeout(() => {
        // Animate notification out
        notification.style.transform = 'translateX(-50%) translateY(-100px)';
        
        // Fade out the page
        const mainContent = document.querySelector('.checkout-container');
        if (mainContent) {
          mainContent.style.transition = 'opacity 0.5s ease';
          mainContent.style.opacity = '0';
        }
        
        // Finally redirect
        setTimeout(() => {
          navigate('/order-confirmation');
        }, 500);
      }, 1500);
    }, 2000);
  };

  // Handle add new address
  const handleAddNewAddress = () => {
    // In a real app, this would open a modal or form
    alert('Add New Address Form will be shown here');
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
          <div className={`step-number ${activeStep >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-name ${activeStep >= 1 ? 'active' : ''}`}>Shopping Cart</div>
        </div>
        <div className="progress-step">
          <div className={`step-number ${activeStep >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step-name ${activeStep >= 2 ? 'active' : ''}`}>Checkout</div>
        </div>
        <div className="progress-step">
          <div className={`step-number ${activeStep >= 3 ? 'active' : ''}`}>3</div>
          <div className={`step-name ${activeStep >= 3 ? 'active' : ''}`}>Confirmation</div>
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
                      <div className="item-price">₹{item.price.toLocaleString()}</div>
                    </div>
                    <div className="item-quantity">
                      <div className="quantity-control">
                        <button 
                          className="quantity-btn" 
                          onClick={() => handleQuantityChange(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <input 
                          type="text" 
                          className="quantity-input" 
                          value={item.quantity} 
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10);
                            if (!isNaN(newValue)) {
                              handleQuantityChange(item.id, newValue, true);
                            }
                          }}
                          min="1"
                          max="10"
                        />
                        <button 
                          className="quantity-btn" 
                          onClick={() => handleQuantityChange(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-total">₹{(item.price * item.quantity).toLocaleString()}</div>
                    <div className="item-remove" onClick={() => handleRemoveItem(item.id)}>
                      <i className="fas fa-times"></i>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <i className="fas fa-shopping-bag" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '15px' }}></i>
                  <p style={{ color: '#888' }}>Your cart is empty</p>
                  <Link to="/shop" style={{ display: 'inline-block', marginTop: '15px', color: '#c59b6d', textDecoration: 'underline' }}>Continue Shopping</Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="checkout-section">
            <h2 className="section-title">Shipping Address</h2>
            
            <div className="address-cards">
              {addresses.map((address, index) => (
                <div 
                  key={index}
                  className={`address-card ${selectedAddress === index ? 'selected' : ''}`}
                  onClick={() => handleAddressSelect(index)}
                >
                  <div className="address-type">
                    <i className={`fas fa-${address.type.toLowerCase() === 'home' ? 'home' : 'briefcase'} address-icon`}></i> 
                    {address.type}
                  </div>
                  <div className="address-details">
                    {address.name}<br />
                    {address.line1}<br />
                    {address.line2}<br />
                    {address.city}, {address.state} {address.zip}<br />
                    Phone: {address.phone}
                  </div>
                  <div className="address-actions">
                    <div className="address-action">Edit</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="add-address-btn" onClick={handleAddNewAddress}>
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
                name="notes"
                value={contactInfo.notes}
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
                  onChange={() => handlePaymentMethodChange('cardPayment')}
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
                  onChange={() => handlePaymentMethodChange('upiPayment')}
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
                  onChange={() => handlePaymentMethodChange('netBankingPayment')}
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
                  onChange={() => handlePaymentMethodChange('codPayment')}
                />
                <label htmlFor="codPayment" className="payment-label">
                  <i className="fas fa-money-bill-wave payment-icon"></i>
                  <span className="payment-name">Cash on Delivery</span>
                </label>
              </div>
            </div>
            
            {/* Card Payment Details */}
            {paymentMethod === 'cardPayment' && (
              <div className="payment-details active">
                <div className="form-group">
                  <label className="form-label">Card Number*</label>
                  <input type="text" className="form-input" placeholder="Card number" required />
                </div>
                
                <div className="form-row">
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">Expiry Date*</label>
                      <input type="text" className="form-input" placeholder="MM/YY" required />
                    </div>
                  </div>
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">CVV*</label>
                      <input type="text" className="form-input" placeholder="CVV" required />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Name on Card*</label>
                  <input type="text" className="form-input" placeholder="Name on card" required />
                </div>
              </div>
            )}
            
            {/* UPI Payment Details */}
            {paymentMethod === 'upiPayment' && (
              <div className="payment-details active">
                <div className="form-group">
                  <label className="form-label">UPI ID*</label>
                  <input type="text" className="form-input" placeholder="yourname@upi" required />
                </div>
              </div>
            )}
            
            {/* Net Banking Payment Details */}
            {paymentMethod === 'netBankingPayment' && (
              <div className="payment-details active">
                <div className="form-group">
                  <label className="form-label">Select Bank*</label>
                  <select className="form-input" required>
                    <option value="">Select Bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="other">Other Bank</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* COD Payment Details */}
            {paymentMethod === 'codPayment' && (
              <div className="payment-details active">
                <p>Pay with cash upon delivery. Please keep exact change handy to help our delivery associates.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="checkout-summary">
          <div className="checkout-section">
            <h2 className="section-title">Order Summary</h2>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-shopping-cart" style={{ color: '#c59b6d' }}></i> Subtotal</div>
              <div className="summary-value" id="summary-subtotal">₹{summary.subtotal.toLocaleString()}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-tag" style={{ color: '#c59b6d' }}></i> Discount</div>
              <div className="summary-value" id="summary-discount">-₹{summary.discount.toLocaleString()}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-percent" style={{ color: '#c59b6d' }}></i> GST (18%)</div>
              <div className="summary-value" id="summary-gst">₹{summary.gst.toLocaleString()}</div>
            </div>
            
            <div className="summary-row">
              <div className="summary-label"><i className="fas fa-truck" style={{ color: '#c59b6d' }}></i> Delivery Charges</div>
              <div className="summary-value" id="summary-delivery">Free</div>
            </div>
            
            <div className="summary-row summary-total">
              <div className="summary-label"><i className="fas fa-rupee-sign" style={{ marginRight: '5px' }}></i> Total Amount</div>
              <div className="summary-value" id="summary-total">₹{summary.total.toLocaleString()}</div>
            </div>
            
            <button className="place-order-btn" id="placeOrderBtn" onClick={handlePlaceOrder}>
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
                    id="couponInput"
                    type="text" 
                    className="form-input" 
                    placeholder="Enter coupon code" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    style={{ borderRadius: '12px 0 0 12px', borderRight: 'none' }}
                  />
                  <button 
                    id="applyCouponBtn"
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
                {couponMessage.message && (
                  <div 
                    style={{ 
                      marginTop: '8px', 
                      fontSize: '0.9rem', 
                      color: couponMessage.type === 'success' ? '#28a745' : '#dc3545'
                    }}
                  >
                    {couponMessage.message}
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