import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AddressDisplay from '../../components/AddressDisplay';
import { useAuth } from '../../context/AuthContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { currentUser, userProfile } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    try {
      // Retrieve the recent order from localStorage
      const recentOrderJson = localStorage.getItem('recentOrder');
      if (recentOrderJson) {
        const recentOrder = JSON.parse(recentOrderJson);
        console.log("Retrieved order data:", recentOrder);
        
        // Format data structure to match component expectations
        setOrderDetails({
          orderId: recentOrder.id || recentOrder.orderNumber || 'N/A',
          orderNumber: recentOrder.orderNumber,
          orderDate: recentOrder.date || new Date().toLocaleDateString('en-IN'),
          paymentMethod: getPaymentMethodText(recentOrder.paymentMethod),
          shippingAddress: recentOrder.shippingAddress,
          items: recentOrder.items || [],
          subtotal: recentOrder.subtotal || 0,
          shipping: recentOrder.shipping || 0,
          tax: recentOrder.gst || recentOrder.tax || 0, // Adjust for the 'gst' field
          total: recentOrder.total || 0
        });
      } else {
        console.error("No order data found in localStorage");
        // Don't set a fallback - this will show an error state instead
        setOrderDetails(null);
      }
    } catch (error) {
      console.error("Error processing order data:", error);
      setOrderDetails(null);
    }
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Run animations with delays
    setTimeout(() => {
      animateElements();
      // Run confetti effect
      setTimeout(createConfetti, 500);
    }, 300);
  }, []);

  // Safe formatter function for prices
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0";
    return Number(price).toLocaleString();
  };

  // Helper function to format payment method text
  const getPaymentMethodText = (paymentMethod) => {
    if (!paymentMethod) return 'N/A';
    
    switch(paymentMethod) {
      case 'cardPayment':
        return 'Credit/Debit Card';
      case 'upiPayment':
        return 'UPI Payment';
      case 'netBankingPayment':
        return 'Net Banking';
      case 'codPayment':
        return 'Cash on Delivery';
      default:
        return paymentMethod;
    }
  };

  const createConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);
    
    const colors = ['#c59b6d', '#E1D9D2', '#ffffff', '#333333'];
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 6 + 4 + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.opacity = Math.random() * 0.7 + 0.3;
      confetti.style.top = '-10px';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      
      confettiContainer.appendChild(confetti);
      
      const speed = Math.random() * 3 + 2;
      const rotation = Math.random() * 15 - 7.5;
      const horizontalMovement = Math.random() * 5 - 2.5;
      
      fallConfetti(confetti, speed, rotation, horizontalMovement);
    }
    
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  };

  const fallConfetti = (confetti, speed, rotation, horizontalMovement) => {
    let topPosition = parseFloat(confetti.style.top);
    let leftPosition = parseFloat(confetti.style.left);
    let currentRotation = 0;
    
    const fallInterval = setInterval(() => {
      topPosition += speed;
      leftPosition += horizontalMovement;
      currentRotation += rotation;
      
      confetti.style.top = topPosition + 'px';
      confetti.style.left = leftPosition + 'vw';
      confetti.style.transform = 'rotate(' + currentRotation + 'deg)';
      
      if (topPosition > window.innerHeight) {
        clearInterval(fallInterval);
        confetti.remove();
      }
    }, 20);
  };

  const animateElements = () => {
    const confirmationContainer = document.querySelector('.confirmation-container');
    const checkmarkCircle = document.querySelector('.checkmark-circle');
    const confirmationTitle = document.querySelector('.confirmation-title');
    const confirmationMessage = document.querySelector('.confirmation-message');
    const orderDetails = document.querySelector('.order-details');
    
    if (confirmationContainer) {
      confirmationContainer.style.opacity = '0';
      confirmationContainer.style.transform = 'translateY(30px)';
      confirmationContainer.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      
      setTimeout(() => {
        confirmationContainer.style.opacity = '1';
        confirmationContainer.style.transform = 'translateY(0)';
        
        // Animate checkmark with delay
        if (checkmarkCircle) {
          checkmarkCircle.style.opacity = '0';
          checkmarkCircle.style.transform = 'scale(0.8)';
          checkmarkCircle.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          
          setTimeout(() => {
            checkmarkCircle.style.opacity = '1';
            checkmarkCircle.style.transform = 'scale(1)';
            
            // Animate title
            if (confirmationTitle) {
              confirmationTitle.style.opacity = '0';
              confirmationTitle.style.transform = 'translateY(15px)';
              confirmationTitle.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              
              setTimeout(() => {
                confirmationTitle.style.opacity = '1';
                confirmationTitle.style.transform = 'translateY(0)';
                
                // Animate message
                if (confirmationMessage) {
                  confirmationMessage.style.opacity = '0';
                  confirmationMessage.style.transition = 'opacity 0.5s ease';
                  
                  setTimeout(() => {
                    confirmationMessage.style.opacity = '1';
                    
                    // Animate order details section
                    if (orderDetails) {
                      orderDetails.style.opacity = '0';
                      orderDetails.style.transform = 'translateY(20px)';
                      orderDetails.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
                      
                      setTimeout(() => {
                        orderDetails.style.opacity = '1';
                        orderDetails.style.transform = 'translateY(0)';
                        
                        // Animate each order item with staggered delay
                        const orderItems = document.querySelectorAll('.item-card');
                        orderItems.forEach((item, index) => {
                          item.style.opacity = '0';
                          item.style.transform = 'translateX(-15px)';
                          item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                          
                          setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateX(0)';
                          }, 100 * (index + 1));
                        });
                        
                        // Animate delivery status
                        const deliveryStatus = document.querySelector('.delivery-status');
                        if (deliveryStatus) {
                          deliveryStatus.style.opacity = '0';
                          deliveryStatus.style.transition = 'opacity 0.7s ease';
                          
                          setTimeout(() => {
                            deliveryStatus.style.opacity = '1';
                            
                            // Animate status steps
                            const steps = document.querySelectorAll('.step');
                            steps.forEach((step, index) => {
                              step.style.opacity = '0';
                              step.style.transform = 'translateY(10px)';
                              step.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                              
                              setTimeout(() => {
                                step.style.opacity = '1';
                                step.style.transform = 'translateY(0)';
                              }, 150 * (index + 1));
                            });
                          }, 300);
                        }
                      }, 200);
                    }
                  }, 150);
                }
              }, 150);
            }
          }, 150);
        }
      }, 300);
    }
  };

  const printOrder = () => {
    window.print();
  };

  if (!orderDetails) {
    return (
      <div className="confirmation-container" style={{ textAlign: 'center', padding: '50px 20px' }}>
        <div className="error-icon" style={{ fontSize: '3rem', color: '#c59b6d', marginBottom: '20px' }}>
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Order Information Not Found</h2>
        <p style={{ marginBottom: '30px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          We couldn't find information about your recent order. This might happen if you refreshed the page or accessed this page directly.
        </p>
        <div style={{ marginTop: '30px' }}>
          <Link to="/orders" className="btn-continue" style={{ marginRight: '15px' }}>
            <i className="fas fa-clipboard-list" style={{ marginRight: '8px' }}></i>
            View Your Orders
          </Link>
          <Link to="/shop" className="btn-continue">
            <i className="fas fa-shopping-bag" style={{ marginRight: '8px' }}></i>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-header">
        <div className="checkmark-circle">
          <i className="fas fa-check checkmark"></i>
        </div>
        <h1 className="confirmation-title">Order Confirmed!</h1>
        <p className="confirmation-message">Thank you for shopping with Apna Collection. Your order has been successfully placed and is being processed.</p>
      </div>
      
      <div className="order-details">
        <div className="order-info">
          <div>
            <div className="info-item">
              <div className="info-label">Order Number</div>
              <div className="info-value">#{orderDetails.orderNumber || orderDetails.orderId}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Order Date</div>
              <div className="info-value">{orderDetails.orderDate}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Payment Method</div>
              <div className="info-value">{orderDetails.paymentMethod}</div>
            </div>
          </div>
          <div>
            <div className="info-item">
              <div className="info-label">Shipping Address</div>
              <div className="info-value">
                {orderDetails.shippingAddress && (
                  <AddressDisplay 
                    address={orderDetails.shippingAddress} 
                    userName={userProfile?.displayName || currentUser?.displayName}
                    userPhone={userProfile?.phone}
                    showBadge={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <h3>Order Items</h3>
        <div className="ordered-items">
          {orderDetails.items && orderDetails.items.length > 0 ? (
            orderDetails.items.map((item, index) => (
              <div className="item-card" key={item.id || index}>
                <div className="item-image">
                  <img src={item.image || '/api/placeholder/80/80'} alt={item.name || 'Product'} />
                </div>
                <div className="item-details">
                  <div className="item-name">{item.name || 'Product'}</div>
                  <div className="item-meta">
                    Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'} | Quantity: {item.quantity || 1}
                  </div>
                  <div className="item-price">₹{formatPrice(item.price)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-items">No items in this order</div>
          )}
        </div>
        
        <div className="order-summary">
          <div className="summary-row">
            <div>Subtotal</div>
            <div>₹{formatPrice(orderDetails.subtotal)}</div>
          </div>
          <div className="summary-row">
            <div>Shipping</div>
            <div>{orderDetails.shipping === 0 ? 'Free' : `₹${formatPrice(orderDetails.shipping)}`}</div>
          </div>
          <div className="summary-row">
            <div>Tax</div>
            <div>₹{formatPrice(orderDetails.tax)}</div>
          </div>
          <div className="summary-row total">
            <div>Total Amount</div>
            <div>₹{formatPrice(orderDetails.total)}</div>
          </div>
        </div>
        
        <div className="delivery-status">
          <div className="status-title">Order Status</div>
          <div className="status-steps">
            <div className="step active">
              <div className="step-icon"><i className="fas fa-check"></i></div>
              <div className="step-label">Order Confirmed</div>
            </div>
            <div className="step">
              <div className="step-icon"><i className="fas fa-box"></i></div>
              <div className="step-label">Processing</div>
            </div>
            <div className="step">
              <div className="step-icon"><i className="fas fa-shipping-fast"></i></div>
              <div className="step-label">Shipped</div>
            </div>
            <div className="step">
              <div className="step-icon"><i className="fas fa-home"></i></div>
              <div className="step-label">Delivered</div>
            </div>
          </div>
          <div className="estimated-delivery">
            Estimated Delivery: {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        <div className="contact-support">
          <div className="contact-title">Need Help?</div>
          <div className="contact-info">Email: support@apnacollection.com</div>
          <div className="contact-info">Phone: +91 1234567890</div>
          <div className="contact-info">Order Reference: #{orderDetails.orderNumber || orderDetails.orderId}</div>
        </div>
        
        <div className="action-buttons">
          <button className="btn-print" onClick={printOrder}>
            <i className="fas fa-print" style={{ marginRight: '8px' }}></i>
            Print Order
          </button>
          <Link to="/shop" className="btn-continue">
            <i className="fas fa-shopping-bag" style={{ marginRight: '8px' }}></i>
            Continue Shopping
          </Link>
          <Link to="/orders" className="btn-continue">
            <i className="fas fa-clipboard-list" style={{ marginRight: '8px' }}></i>
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;