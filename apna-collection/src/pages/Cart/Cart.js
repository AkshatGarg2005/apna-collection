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

  // Checkout handler with animation
  const handleCheckout = (e) => {
    e.preventDefault();
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
      margin: '40px auto',
      padding: '0 20px',
      backgroundColor: '#E1D9D2'
    }}>
      <h1 className="page-title" style={{
        fontSize: '2.5rem',
        marginBottom: '40px',
        textAlign: 'center',
        color: '#333',
        fontWeight: 600,
        position: 'relative'
      }}>
        Your Shopping Cart
      </h1>
      
      <div className="cart-layout" style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 992 ? '2fr 1fr' : '1fr',
        gap: '40px'
      }}>
        <div className="cart-items" style={{
          backgroundColor: 'transparent'
        }}>
          {!cart || cart.length === 0 ? (
            <div className="empty-cart" style={{
              textAlign: 'center',
              padding: '80px 0',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <i className="fas fa-shopping-bag" style={{
                fontSize: '5rem',
                color: '#e1d9d2',
                marginBottom: '30px',
                display: 'block'
              }}></i>
              <p style={{
                fontSize: '1.3rem',
                color: '#666',
                marginBottom: '30px'
              }}>Your shopping cart is empty</p>
              <Link to="/shop" className="empty-cart-btn" style={{
                display: 'inline-block',
                padding: '12px 30px',
                backgroundColor: '#c59b6d',
                color: 'white',
                borderRadius: '30px',
                fontWeight: 500,
                transition: 'all 0.3s'
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
                    padding: '25px',
                    marginBottom: '25px',
                    display: 'flex',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.03)',
                    animation: 'fadeIn 0.5s ease forwards',
                    animationDelay: `${0.1 * index}s`
                  }}
                >
                  <img 
                    src={item.image || "/api/placeholder/400/500"} 
                    alt={item.name} 
                    className="item-image" 
                    style={{
                      width: window.innerWidth > 768 ? '120px' : '100%',
                      height: window.innerWidth > 768 ? '150px' : '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginRight: window.innerWidth > 768 ? '25px' : '0',
                      marginBottom: window.innerWidth > 768 ? '0' : '15px',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <div className="item-details" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 className="item-name" style={{
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: '#222'
                      }}>{item.name}</h3>
                      <p className="item-size" style={{
                        color: '#666',
                        marginBottom: '12px',
                        fontSize: '0.95rem',
                        backgroundColor: '#f7f5f2',
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: '20px'
                      }}>
                        Size: {item.size}, Color: {item.color}
                      </p>
                      <p className="item-price" style={{
                        fontWeight: 600,
                        fontSize: '1.2rem',
                        color: '#c59b6d',
                        marginBottom: '15px',
                        position: 'relative'
                      }}>{formatCurrency(item.price)}</p>
                    </div>
                    <div className="item-controls" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: window.innerWidth > 768 ? 'row' : 'column',
                      gap: window.innerWidth > 768 ? '0' : '15px'
                    }}>
                      <div className="quantity-control" style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#f7f5f2',
                        padding: '5px',
                        borderRadius: '30px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                      }}>
                        {/* Show trash icon when quantity is 1, minus button otherwise */}
                        {item.quantity === 1 ? (
                          <button 
                            className="quantity-btn trash" 
                            onClick={() => removeFromCart(item.id, item.size, item.color)}
                            style={{
                              width: '30px',
                              height: '30px',
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
                            <i className="fas fa-trash-alt" style={{ fontSize: '0.85rem' }}></i>
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
                              width: '30px',
                              height: '30px',
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
                            width: '40px',
                            height: '30px',
                            textAlign: 'center',
                            margin: '0 10px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            fontWeight: 500,
                            fontSize: '1rem'
                          }}
                        />
                        <button 
                          className="quantity-btn increase" 
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          style={{
                            width: '30px',
                            height: '30px',
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
                        fontSize: '1.1rem',
                        color: '#333',
                        alignSelf: window.innerWidth > 768 ? 'auto' : 'flex-end'
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
                      top: '20px',
                      right: '20px',
                      background: 'none',
                      border: 'none',
                      fontSize: '0.9rem',
                      color: '#999',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
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
          padding: '30px',
          height: 'fit-content',
          position: window.innerWidth > 992 ? 'sticky' : 'relative',
          top: window.innerWidth > 992 ? '30px' : '0',
          border: '1px solid rgba(0,0,0,0.03)'
        }}>
          <h2 className="summary-title" style={{
            fontSize: '1.4rem',
            fontWeight: 600,
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '2px solid #f5f3ef',
            color: '#222'
          }}>Order Summary</h2>
          
          <div className="summary-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            fontSize: '1rem',
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
              fontSize: '1rem',
              color: '#28a745'
            }}>
              <span>Discount</span>
              <span id="cart-discount">{formatCurrency(-discount)}</span>
            </div>
          )}
          
          <div className="summary-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            fontSize: '1rem',
            color: '#555'
          }}>
            <span>Tax (GST 18%)</span>
            <span id="cart-tax" className="animated-value">{formatCurrency(displayTax)}</span>
          </div>
          
          <div className="summary-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            fontSize: '1rem',
            color: '#555'
          }}>
            <span>Shipping</span>
            <span id="cart-shipping">{subtotal > 1000 ? 'Free' : formatCurrency(shippingFee)}</span>
          </div>
          
          <div className="summary-row total" style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            fontSize: '1.3rem',
            fontWeight: 600,
            marginTop: '25px',
            paddingTop: '20px',
            borderTop: '2px solid #f5f3ef',
            color: '#222'
          }}>
            <span>Total</span>
            <span id="cart-total" className="animated-value">{formatCurrency(displayTotal)}</span>
          </div>
          
          <div className="promo-code" style={{
            marginTop: '25px',
            paddingTop: '20px',
            borderTop: '2px solid #f5f3ef'
          }}>
            <h3 style={{
              fontSize: '1rem',
              marginBottom: '15px',
              color: '#555'
            }}>Promo Code</h3>
            
            <div className="promo-form" style={{
              display: 'flex',
              marginBottom: '20px'
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
                  padding: '12px 15px',
                  border: '1px solid #e1d9d2',
                  borderRadius: '4px 0 0 4px',
                  fontSize: '0.9rem',
                  backgroundColor: isLoadingPromo ? '#f9f9f9' : 'white'
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
                  borderRadius: '0 4px 4px 0',
                  fontWeight: 500,
                  cursor: isLoadingPromo ? 'wait' : 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                {isLoadingPromo ? 'Applying...' : 'Apply'}
              </button>
            </div>
            
            {promoError && (
              <div style={{ color: '#dc3545', fontSize: '0.9rem', marginBottom: '15px' }}>
                {promoError}
              </div>
            )}
            
            {promoSuccess && (
              <div style={{ color: '#28a745', fontSize: '0.9rem', marginBottom: '15px' }}>
                {promoSuccess}
              </div>
            )}
          </div>
          
          <button 
            className={`checkout-btn ${isCheckingOut ? 'animating' : ''}`}
            onClick={handleCheckout}
            style={{
              display: 'block',
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
            marginTop: '20px',
            fontSize: '0.95rem',
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
            gap: '10px',
            marginTop: '25px'
          }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
              alt="Visa" 
              className="payment-icon"
              style={{
                width: '40px',
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
                width: '40px',
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
                width: '40px',
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
                width: '40px',
                height: 'auto',
                opacity: 1,
                transition: 'opacity 0.3s'
              }}
            />
          </div>
        </div>
      </div>
      
      <style>
        {`
          body {
            background-color: #E1D9D2;
            color: #333;
            line-height: 1.6;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
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
        `}
      </style>
    </div>
  );
};

export default Cart;