import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { validateCoupon } from '../../services/couponService';

const Cart = () => {
  const { cart, removeFromCart, updateCartItemQuantity } = useCart();
  const { currentUser } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(99);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isLoadingPromo, setIsLoadingPromo] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  
  // References for animated values
  const subtotalRef = useRef(0);
  const taxRef = useRef(0);
  const totalRef = useRef(0);
  const itemSubtotalsRef = useRef({});
  
  // Animation state for displayed values
  const [displaySubtotal, setDisplaySubtotal] = useState(0);
  const [displayTax, setDisplayTax] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [displayItemSubtotals, setDisplayItemSubtotals] = useState({});

  // Constants
  const TAX_RATE = 0.18;
  const MOBILE_BREAKPOINT = 768;
  const LARGE_PHONE_BREAKPOINT = 896; // For larger phones like iPhone Pro Max models
  const TABLET_BREAKPOINT = 992;

  // Determine if mobile view
  const isMobile = windowWidth <= MOBILE_BREAKPOINT;
  const isLargePhone = windowWidth <= LARGE_PHONE_BREAKPOINT && windowWidth > MOBILE_BREAKPOINT;
  const isTablet = windowWidth <= TABLET_BREAKPOINT;

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      // Update mobile viewport height variable for better mobile handling
      if (typeof document !== 'undefined') {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Checkout handler with animation
  const handleCheckout = (e) => {
    if (e) e.preventDefault();
    if (!cart || cart.length === 0) return;
    
    setIsCheckingOut(true);
    
    // If a coupon was applied, store it for checkout
    if (isPromoApplied && promoSuccess) {
      localStorage.setItem('appliedCoupon', JSON.stringify({
        code: promoCode.trim().toUpperCase(),
        discount: discount,
        discountType: discount > 100 ? 'fixed' : 'percentage',
        discountValue: discount > 100 ? discount : (discount / calculateSubtotal()) * 100
      }));
    }
    
    // Simulate processing and redirect after animation completes
    setTimeout(() => {
      navigate('/checkout');
    }, 1500); // Match this to animation duration
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart ? cart.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  // Apply promo code - Updated to use coupon service
  const applyPromoCode = async () => {
    // Reset previous messages
    setPromoError('');
    setPromoSuccess('');
    
    if (promoCode.trim() === '') {
      setPromoError('Please enter a valid promo code.');
      return;
    }
    
    const subtotal = calculateSubtotal();
    const code = promoCode.trim().toUpperCase();
    
    try {
      setIsLoadingPromo(true);
      
      // Call the coupon validation service
      const result = await validateCoupon(code, subtotal, currentUser?.uid);
      
      if (result.valid) {
        // Set the discount amount
        setDiscount(result.discountAmount);
        setIsPromoApplied(true);
        setPromoSuccess(`Coupon applied! ${result.coupon.discountType === 'percentage' ? 
          `${result.coupon.discount}% discount` : 
          `₹${result.discountAmount} discount`}`);
        
        // Store coupon info in localStorage for checkout
        localStorage.setItem('appliedCoupon', JSON.stringify({
          code: code,
          id: result.coupon.id,
          discount: result.discountAmount,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discount
        }));
      } else {
        setPromoError(result.message);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setPromoError('Failed to apply coupon. Please try again.');
    } finally {
      setIsLoadingPromo(false);
      setPromoCode(''); // Clear the input field
    }
  };

  // Animation for counting up/down
  const animateValue = (start, end, setter, duration = 500) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);
      setter(currentValue);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setter(end);
      }
    };
    window.requestAnimationFrame(step);
  };

  // Animation for item subtotals
  const animateItemSubtotal = (itemKey, start, end) => {
    let startTimestamp = null;
    const duration = 500;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);
      
      setDisplayItemSubtotals(prev => ({
        ...prev,
        [itemKey]: currentValue
      }));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayItemSubtotals(prev => ({
          ...prev,
          [itemKey]: end
        }));
      }
    };
    
    window.requestAnimationFrame(step);
  };

  // Update function to use updateCartItemQuantity
  const updateQuantity = (itemId, size, color, newQuantity) => {
    updateCartItemQuantity(itemId, size, color, newQuantity);
  };

  // Calculate order summary values
  const subtotal = calculateSubtotal();
  
  // Determine shipping fee - free for orders over ₹1000
  const actualShippingFee = subtotal > 1000 ? 0 : 99;
  useEffect(() => {
    setShippingFee(subtotal > 1000 ? 0 : 99);
  }, [subtotal]);

  // Calculate tax based on post-discount subtotal (for consistency with checkout)
  const discountedSubtotal = subtotal - discount;
  const tax = Math.round(discountedSubtotal * TAX_RATE);
  const total = discountedSubtotal + tax + actualShippingFee;

  // Update item subtotals when quantities change
  useEffect(() => {
    if (!cart) return;
    
    cart.forEach(item => {
      const itemKey = `${item.id}-${item.size}-${item.color}`;
      const newSubtotal = item.price * item.quantity;
      
      // If we haven't tracked this item before, initialize it
      if (!itemSubtotalsRef.current[itemKey]) {
        itemSubtotalsRef.current[itemKey] = newSubtotal;
        setDisplayItemSubtotals(prev => ({
          ...prev,
          [itemKey]: newSubtotal
        }));
      } 
      // If the subtotal has changed, animate it
      else if (itemSubtotalsRef.current[itemKey] !== newSubtotal) {
        animateItemSubtotal(
          itemKey,
          itemSubtotalsRef.current[itemKey],
          newSubtotal
        );
        itemSubtotalsRef.current[itemKey] = newSubtotal;
      }
    });
  }, [cart]);

  // Handle value animations when values change
  useEffect(() => {
    if (subtotalRef.current !== subtotal) {
      animateValue(subtotalRef.current, subtotal, setDisplaySubtotal);
      subtotalRef.current = subtotal;
    }
    
    if (taxRef.current !== tax) {
      animateValue(taxRef.current, tax, setDisplayTax);
      taxRef.current = tax;
    }
    
    if (totalRef.current !== total) {
      animateValue(totalRef.current, total, setDisplayTotal);
      totalRef.current = total;
    }
  }, [subtotal, tax, total, discount]);

  // Initialize display values on component mount
  useEffect(() => {
    setDisplaySubtotal(subtotal);
    setDisplayTax(tax);
    setDisplayTotal(total);
    
    const initialItemSubtotals = {};
    if (cart) {
      cart.forEach(item => {
        const itemKey = `${item.id}-${item.size}-${item.color}`;
        initialItemSubtotals[itemKey] = item.price * item.quantity;
      });
    }
    
    setDisplayItemSubtotals(initialItemSubtotals);
    itemSubtotalsRef.current = { ...initialItemSubtotals };
    
    subtotalRef.current = subtotal;
    taxRef.current = tax;
    totalRef.current = total;
  }, []);

  return (
    <div className="cart-container" style={{
      maxWidth: '1200px',
      margin: isMobile ? '20px auto' : '40px auto',
      padding: isMobile ? '0 15px' : '0 20px',
      backgroundColor: '#E1D9D2',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <h1 className="page-title" style={{
        fontSize: isMobile ? '1.8rem' : '2.5rem',
        marginBottom: isMobile ? '25px' : '40px',
        textAlign: 'center',
        color: '#333',
        fontWeight: 600,
        position: 'relative'
      }}>
        Your Shopping Cart
      </h1>
      
      <div className="cart-layout" style={{
        display: 'grid',
        gridTemplateColumns: !isTablet ? '2fr 1fr' : '1fr',
        gap: isMobile || isLargePhone ? '15px' : '40px',
        width: '100%',
        position: 'relative' // For positioning the sticky footer
      }}>
        <div className="cart-items" style={{
          backgroundColor: 'transparent'
        }}>
          {!cart || cart.length === 0 ? (
            <div className="empty-cart" style={{
              textAlign: 'center',
              padding: isMobile ? '50px 15px' : '80px 0',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <i className="fas fa-shopping-bag" style={{
                fontSize: isMobile ? '4rem' : '5rem',
                color: '#e1d9d2',
                marginBottom: isMobile ? '20px' : '30px',
                display: 'block'
              }}></i>
              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.3rem',
                color: '#666',
                marginBottom: isMobile ? '20px' : '30px'
              }}>Your shopping cart is empty</p>
              <Link to="/shop" className="empty-cart-btn" style={{
                display: 'inline-block',
                padding: isMobile ? '10px 25px' : '12px 30px',
                backgroundColor: '#c59b6d',
                color: 'white',
                borderRadius: '30px',
                fontWeight: 500,
                transition: 'all 0.3s',
                fontSize: isMobile ? '0.95rem' : '1rem'
              }}>Continue Shopping</Link>
            </div>
          ) : (
            cart.map((item, index) => {
              const itemKey = `${item.id}-${item.size}-${item.color}`;
              return (
                <div 
                  key={itemKey} 
                  className="cart-item" 
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)',
                    padding: isMobile || isLargePhone ? '20px 20px' : '25px',
                    marginBottom: isMobile || isLargePhone ? '20px' : '25px',
                    display: 'flex',
                    flexDirection: isMobile || isLargePhone ? 'column' : 'row',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    overflow: 'visible', // Changed from hidden to visible
                    width: '100%',
                    maxWidth: '100%',
                    border: '1px solid rgba(0,0,0,0.03)',
                    animation: 'fadeIn 0.5s ease forwards',
                    animationDelay: `${0.1 * index}s`
                  }}
                >
                  <div className="item-image-container" style={{
                    width: isMobile || isLargePhone ? '100%' : '120px',
                    marginRight: isMobile || isLargePhone ? '0' : '25px',
                    marginBottom: isMobile || isLargePhone ? '15px' : '0',
                    display: 'flex',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}>
                    <img 
                      src={item.image || "/api/placeholder/400/500"} 
                      alt={item.name} 
                      className="item-image" 
                      style={{
                        width: isMobile || isLargePhone ? '120px' : '120px',
                        height: isMobile || isLargePhone ? '150px' : '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        maxWidth: '100%'
                      }}
                    />
                  </div>
                  <div className="item-details" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 className="item-name" style={{
                        fontSize: isMobile || isLargePhone ? '1.1rem' : '1.3rem',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: '#222',
                        paddingRight: isMobile || isLargePhone ? '0' : '30px', // Space for remove button
                        wordBreak: 'break-word'
                      }}>{item.name}</h3>
                      <p className="item-size" style={{
                        color: '#666',
                        marginBottom: '12px',
                        fontSize: isMobile || isLargePhone ? '0.9rem' : '0.95rem',
                        backgroundColor: '#f7f5f2',
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: '20px'
                      }}>
                        Size: {item.size}, Color: {item.color}
                      </p>
                      <p className="item-price" style={{
                        fontWeight: 600,
                        fontSize: isMobile || isLargePhone ? '1.1rem' : '1.2rem',
                        color: '#c59b6d',
                        marginBottom: '15px',
                        position: 'relative'
                      }}>{formatCurrency(item.price)}</p>
                    </div>
                    <div className="item-controls" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: isMobile || isLargePhone ? 'column' : 'row',
                      gap: isMobile || isLargePhone ? '15px' : '0',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <div className="quantity-control" style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f7f5f2',
                        padding: '5px 10px',
                        borderRadius: '30px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                        width: isMobile || isLargePhone ? '100%' : 'auto',
                        justifyContent: isMobile || isLargePhone ? 'space-between' : 'flex-start',
                        boxSizing: 'border-box',
                        minWidth: isMobile || isLargePhone ? '100%' : '140px'
                      }}>
                        {/* Show trash icon when quantity is 1, minus button otherwise */}
                        {item.quantity === 1 ? (
                          <button 
                            className="quantity-btn trash" 
                            onClick={() => removeFromCart(item.id, item.size, item.color)}
                            style={{
                              width: isMobile || isLargePhone ? '40px' : '30px',
                              height: isMobile || isLargePhone ? '40px' : '30px',
                              backgroundColor: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              transition: 'all 0.2s ease',
                              color: '#333',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                          >
                            <i className="fas fa-trash-alt" style={{ fontSize: isMobile || isLargePhone ? '0.9rem' : '0.85rem' }}></i>
                          </button>
                        ) : (
                          <button 
                            className="quantity-btn decrease" 
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.size, item.color, item.quantity - 1);
                              }
                            }}
                            style={{
                              width: isMobile || isLargePhone ? '40px' : '30px',
                              height: isMobile || isLargePhone ? '40px' : '30px',
                              backgroundColor: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              transition: 'all 0.2s ease',
                              color: '#333',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                          >-</button>
                        )}
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value);
                            if (!isNaN(newQuantity) && newQuantity >= 1) {
                              updateQuantity(item.id, item.size, item.color, newQuantity);
                            }
                          }}
                          className="quantity-input"
                          style={{
                            width: isMobile || isLargePhone ? '60px' : '40px',
                            height: isMobile || isLargePhone ? '40px' : '30px',
                            textAlign: 'center',
                            margin: '0 10px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            fontWeight: 500,
                            fontSize: isMobile || isLargePhone ? '1.1rem' : '1rem'
                          }}
                        />
                        <button 
                          className="quantity-btn increase" 
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          style={{
                            width: isMobile || isLargePhone ? '40px' : '30px',
                            height: isMobile || isLargePhone ? '40px' : '30px',
                            backgroundColor: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'all 0.2s ease',
                            color: '#333',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                          }}
                        >+</button>
                      </div>
                      <div className="item-subtotal animated-value" style={{
                        fontWeight: 600,
                        fontSize: isMobile || isLargePhone ? '1.2rem' : '1.1rem',
                        color: '#333',
                        alignSelf: isMobile || isLargePhone ? 'flex-end' : 'auto',
                        width: isMobile || isLargePhone ? '100%' : 'auto',
                        textAlign: isMobile || isLargePhone ? 'right' : 'inherit',
                        boxSizing: 'border-box'
                      }}>
                        {formatCurrency(displayItemSubtotals[itemKey] || (item.price * item.quantity))}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="remove-item" 
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    style={{
                      position: 'absolute',
                      top: isMobile || isLargePhone ? '15px' : '20px',
                      right: isMobile || isLargePhone ? '15px' : '20px',
                      background: 'none',
                      border: 'none',
                      fontSize: '0.9rem',
                      color: '#999',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: isMobile || isLargePhone ? '34px' : '30px',
                      height: isMobile || isLargePhone ? '34px' : '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 5
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              );
            })
          )}
        </div>
        
        <div className="cart-summary" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)',
          padding: isMobile || isLargePhone ? '15px' : '30px',
          height: 'fit-content',
          position: !isTablet ? 'sticky' : 'relative',
          top: !isTablet ? '30px' : '0',
          border: '1px solid rgba(0,0,0,0.03)',
          marginBottom: isMobile || isLargePhone ? '70px' : '0', // Extra margin for mobile to account for the sticky footer
          width: '100%',
          boxSizing: 'border-box',
          ...(isMobile || isLargePhone ? {
            maxHeight: 'calc(var(--vh, 1vh) * 60)', // 60% of viewport height
            overflow: 'auto',
            position: 'relative'
          } : {})
        }}>
          <h2 className="summary-title" style={{
            fontSize: isMobile || isLargePhone ? '1.2rem' : '1.4rem',
            fontWeight: 600,
            marginBottom: isMobile || isLargePhone ? '15px' : '25px',
            paddingBottom: isMobile || isLargePhone ? '10px' : '15px',
            borderBottom: '2px solid #f5f3ef',
            color: '#222',
            wordBreak: 'break-word'
          }}>Order Summary</h2>
          
          <div className="summary-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: isMobile || isLargePhone ? '10px' : '15px',
            fontSize: isMobile || isLargePhone ? '1rem' : '1rem',
            color: '#555'
          }}>
            <span>Subtotal</span>
            <span id="cart-subtotal" className="animated-value">{formatCurrency(displaySubtotal)}</span>
          </div>
          
          {isPromoApplied && (
            <div className="summary-row discount" style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '15px',
              fontSize: isMobile || isLargePhone ? '1.05rem' : '1rem',
              color: '#28a745'
            }}>
              <span>Discount</span>
              <span id="cart-discount">{formatCurrency(-discount)}</span>
            </div>
          )}
          
          <div className="summary-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: isMobile || isLargePhone ? '10px' : '15px',
            fontSize: isMobile || isLargePhone ? '1rem' : '1rem',
            color: '#555'
          }}>
            <span>Tax (GST 18%)</span>
            <span id="cart-tax" className="animated-value">{formatCurrency(displayTax)}</span>
          </div>
          
          <div className="summary-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: isMobile || isLargePhone ? '10px' : '15px',
            fontSize: isMobile || isLargePhone ? '1rem' : '1rem',
            color: '#555'
          }}>
            <span>Shipping</span>
            <span id="cart-shipping">{subtotal > 1000 ? 'Free' : formatCurrency(shippingFee)}</span>
          </div>
          
          <div className="summary-row total" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: isMobile || isLargePhone ? '10px' : '15px',
            fontSize: isMobile || isLargePhone ? '1.2rem' : '1.3rem',
            fontWeight: 600,
            marginTop: isMobile || isLargePhone ? '15px' : '25px',
            paddingTop: isMobile || isLargePhone ? '12px' : '20px',
            borderTop: '2px solid #f5f3ef',
            color: '#222'
          }}>
            <span>Total</span>
            <span id="cart-total" className="animated-value">{formatCurrency(displayTotal)}</span>
          </div>
          
          <div className="promo-code" style={{
            marginTop: isMobile || isLargePhone ? '15px' : '25px',
            paddingTop: isMobile || isLargePhone ? '12px' : '20px',
            borderTop: '2px solid #f5f3ef'
          }}>
            <h3 style={{
              fontSize: isMobile || isLargePhone ? '1rem' : '1rem',
              marginBottom: isMobile || isLargePhone ? '10px' : '15px',
              color: '#555'
            }}>Promo Code</h3>
            
            <div className="promo-form" style={{
              display: 'flex',
              marginBottom: isMobile || isLargePhone ? '15px' : '20px',
              flexWrap: isMobile || isLargePhone ? 'wrap' : 'nowrap'
            }}>
              <input 
                type="text" 
                placeholder="Enter promo code" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="promo-input"
                disabled={isLoadingPromo}
                style={{
                  flex: 1,
                  padding: isMobile || isLargePhone ? '10px 12px' : '12px 15px',
                  border: '1px solid #e1d9d2',
                  borderRadius: isMobile || isLargePhone ? '4px' : '4px 0 0 4px',
                  fontSize: isMobile || isLargePhone ? '0.9rem' : '0.9rem',
                  backgroundColor: isLoadingPromo ? '#f9f9f9' : 'white',
                  marginBottom: isMobile || isLargePhone ? '8px' : 0,
                  width: isMobile || isLargePhone ? '100%' : 'auto'
                }}
              />
              <button 
                type="button" 
                className="promo-btn"
                onClick={applyPromoCode}
                disabled={isLoadingPromo}
                style={{
                  padding: '0 15px',
                  backgroundColor: isLoadingPromo ? '#d0b895' : '#c59b6d',
                  color: 'white',
                  border: 'none',
                  borderRadius: isMobile || isLargePhone ? '4px' : '0 4px 4px 0',
                  fontWeight: 500,
                  cursor: isLoadingPromo ? 'wait' : 'pointer',
                  transition: 'background-color 0.3s',
                  fontSize: isMobile || isLargePhone ? '0.9rem' : 'inherit',
                  height: isMobile || isLargePhone ? '38px' : 'auto',
                  width: isMobile || isLargePhone ? '100%' : 'auto'
                }}
              >
                {isLoadingPromo ? 'Applying...' : 'Apply'}
              </button>
            </div>
            
            {promoError && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: isMobile || isLargePhone ? '1rem' : '0.9rem', 
                marginBottom: '15px' 
              }}>
                {promoError}
              </div>
            )}
            
            {promoSuccess && (
              <div style={{ 
                color: '#28a745', 
                fontSize: isMobile || isLargePhone ? '1rem' : '0.9rem', 
                marginBottom: '15px' 
              }}>
                {promoSuccess}
              </div>
            )}
          </div>
          
          <button 
            className={`checkout-btn ${isCheckingOut ? 'animating' : ''}`}
            onClick={handleCheckout}
            style={{
              display: isMobile || isLargePhone ? 'none' : 'block', // Hide on mobile since we have sticky footer
              width: '100%',
              padding: '15px',
              backgroundColor: '#c59b6d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 500,
              cursor: cart && cart.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              marginTop: '25px',
              boxShadow: '0 4px 15px rgba(197, 155, 109, 0.2)',
              opacity: cart && cart.length > 0 ? 1 : 0.7,
              position: 'relative',
              overflow: 'hidden'
            }}
            disabled={!cart || cart.length === 0 || isCheckingOut}
          >
            {isCheckingOut ? (
              <span className="btn-animation-container">
                <span className="spinner"></span>
                <span className="check-icon"><i className="fas fa-check"></i></span>
              </span>
            ) : (
              'Proceed to Checkout'
            )}
          </button>
          
          <div className="continue-shopping" style={{
            textAlign: 'center',
            marginTop: isMobile || isLargePhone ? '12px' : '20px',
            fontSize: isMobile || isLargePhone ? '0.9rem' : '0.95rem',
            color: '#666'
          }}>
            <Link to="/shop" style={{
              color: '#c59b6d',
              fontWeight: 500,
              transition: 'all 0.3s'
            }}>Continue Shopping</Link>
          </div>
          
          <div className="payment-options" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile || isLargePhone ? '10px' : '10px',
            marginTop: isMobile || isLargePhone ? '15px' : '25px',
            flexWrap: 'wrap',
            padding: '0 10px'
          }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
              alt="Visa" 
              className="payment-icon"
              style={{
                width: isMobile || isLargePhone ? '30px' : '40px',
                height: 'auto',
                opacity: 1,
                transition: 'opacity 0.3s'
              }}
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
              alt="Mastercard" 
              className="payment-icon"
              style={{
                width: isMobile || isLargePhone ? '30px' : '40px',
                height: 'auto',
                opacity: 1,
                transition: 'opacity 0.3s'
              }}
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
              alt="PayPal" 
              className="payment-icon"
              style={{
                width: isMobile || isLargePhone ? '30px' : '40px',
                height: 'auto',
                opacity: 1,
                transition: 'opacity 0.3s'
              }}
            />
            <img 
              src="https://cdn.iconscout.com/icon/free/png-256/free-upi-logo-icon-download-in-svg-png-gif-file-formats--unified-payments-interface-payment-money-transfer-logos-icons-1747946.png?f=webp" 
              alt="UPI" 
              className="payment-icon"
              style={{
                width: isMobile || isLargePhone ? '30px' : '40px',
                height: 'auto',
                opacity: 1,
                transition: 'opacity 0.3s'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Mobile-only Sticky Checkout Bar */}
      {(isMobile || isLargePhone) && cart && cart.length > 0 && (
        <div className="mobile-sticky-checkout" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          padding: '10px 15px',
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          borderTop: '1px solid #f0f0f0'
        }}>
          <div className="sticky-total">
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Total:</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(displayTotal)}</div>
          </div>
          <button 
            onClick={handleCheckout}
            style={{
              backgroundColor: '#c59b6d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 20px',
              fontWeight: 500,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(197, 155, 109, 0.3)'
            }}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      )}
      
      <style>
        {`
          body {
            background-color: #E1D9D2;
            color: #333;
            line-height: 1.6;
            max-width: 100vw;
            overflow-x: hidden;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          /* Custom scrollbar for cart summary on mobile */
          .cart-summary::-webkit-scrollbar {
            width: 4px;
          }
          
          .cart-summary::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          .cart-summary::-webkit-scrollbar-thumb {
            background: #c59b6d;
            border-radius: 4px;
          }
          
          .cart-summary::-webkit-scrollbar-thumb:hover {
            background: #b08c5f;
          }
          
          /* Fade effect for summary to indicate scrollable content */
          @media (max-width: 896px) {
            .cart-summary::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 30px;
              background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
              pointer-events: none;
              z-index: 1;
            }
          }
          
          .cart-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
          }
          
          .cart-item:hover .item-image {
            transform: scale(1.03);
          }
          
          .quantity-btn:hover {
            background-color: #c59b6d;
            color: white;
          }
          
          .quantity-btn.trash:hover {
            background-color: #dc3545;
            color: white;
          }
          
          .remove-item:hover {
            background-color: #f8f0e7;
            color: #c59b6d;
          }
          
          .promo-btn:hover {
            background-color: #b08c5f;
          }
          
          .checkout-btn:hover {
            background-color: #b08c5f;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(197, 155, 109, 0.3);
          }
          
          .payment-icon:hover {
            opacity: 0.8;
          }
          
          .continue-shopping a:hover {
            color: #b08c5f;
            text-decoration: underline;
          }
          
          .empty-cart-btn:hover {
            background-color: #b08c5f;
            transform: translateY(-2px);
          }
          
          .page-title:after {
            content: '';
            position: absolute;
            width: 80px;
            height: 3px;
            background-color: #c59b6d;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
          }
          
          .item-price::after {
            content: '';
            display: block;
            width: 50%;
            height: 2px;
            background-color: #c59b6d;
            margin: 4px auto 0;
          }
          
          .animated-value {
            transition: color 0.3s;
          }
          
          @keyframes pulse {
            0% { color: #c59b6d; }
            50% { color: #b08c5f; }
            100% { color: inherit; }
          }
          
          .animated-value.updated {
            animation: pulse 1s;
          }
          
          /* Checkout Button Animation */
          @keyframes buttonPop {
            0% { transform: scale(1); }
            20% { transform: scale(0.96); }
            60% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          
          @keyframes spinFade {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            10% { opacity: 1; transform: scale(1) rotate(0deg); }
            90% { opacity: 1; transform: scale(1) rotate(720deg); }
            100% { opacity: 0; transform: scale(0) rotate(720deg); }
          }
          
          @keyframes checkmark {
            0% { opacity: 0; transform: scale(0); }
            50% { opacity: 0; transform: scale(0); }
            80% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes ripple {
            0% { transform: scale(0); opacity: 0.5; }
            100% { transform: scale(10); opacity: 0; }
          }
          
          .checkout-btn.animating {
            animation: buttonPop 0.4s ease forwards;
            background-color: #b08c5f;
            pointer-events: none;
          }
          
          .btn-animation-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            width: 100%;
          }
          
          .spinner {
            display: inline-block;
            width: 24px;
            height: 24px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spinFade 1.5s ease-in-out forwards;
            position: absolute;
          }
          
          .check-icon {
            font-size: 24px;
            position: absolute;
            animation: checkmark 1.5s ease-in-out forwards;
            color: white;
          }
          
          .checkout-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.5);
            opacity: 0;
            border-radius: 100%;
            transform: scale(1, 1) translate(-50%);
            transform-origin: 50% 50%;
          }
          
          .checkout-btn.animating::before {
            animation: ripple 1s ease-out;
          }
          
          /* Mobile specific styles */
          @media (max-width: 896px) {
            .item-controls {
              margin-top: 15px;
            }
            
            .quantity-control {
              margin-bottom: 5px;
            }
            
            input[type="number"]::-webkit-inner-spin-button,
            input[type="number"]::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            
            input[type="number"] {
              -moz-appearance: textfield;
            }
            
            /* Fix horizontal scrolling */
            .cart-container, 
            .cart-layout,
            .cart-items,
            .cart-item,
            .cart-summary {
              max-width: 100%;
              box-sizing: border-box;
            }
            
            /* Safe area inset for notched phones */
            .mobile-sticky-checkout {
              padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
            }
            
            /* Animation for sticky bar */
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            
            .mobile-sticky-checkout {
              animation: slideUp 0.3s ease-out;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Cart;