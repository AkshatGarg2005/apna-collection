// src/components/Orders/OrderTracker.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscribeToOrder, getOrderStatusInfo } from '../../services/orders';
import { useAuth } from '../../context/AuthContext';
import './OrderTracker.css';

const OrderTracker = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (!currentUser || !orderId) return;
    
    // Subscribe to real-time order updates
    const unsubscribe = subscribeToOrder(orderId, (updatedOrder) => {
      if (updatedOrder) {
        setOrder(updatedOrder);
      } else {
        setError('Order not found');
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [orderId, currentUser]);
  
  if (loading) {
    return (
      <div className="order-tracker-loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="order-tracker-error">
        <i className="fas fa-exclamation-circle"></i>
        <h3>Error Loading Order</h3>
        <p>{error}</p>
        <Link to="/orders" className="back-btn">Back to Orders</Link>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="order-tracker-not-found">
        <i className="fas fa-search"></i>
        <h3>Order Not Found</h3>
        <p>We couldn't find the order you're looking for.</p>
        <Link to="/orders" className="back-btn">Back to Orders</Link>
      </div>
    );
  }
  
  // Get status info for display
  const statusInfo = getOrderStatusInfo(order.status);
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
  };
  
  // Calculate order progress percentage
  const getProgressPercentage = () => {
    switch (order.status) {
      case 'Processing':
        return 25;
      case 'Accepted':
        return 50;
      case 'Shipped':
        return 75;
      case 'Delivered':
        return 100;
      case 'Cancelled':
        return 0;
      default:
        return 25;
    }
  };
  
  return (
    <div className="order-tracker">
      <div className="order-tracker-header">
        <div className="order-info">
          <h2>Order #{order.orderNumber || order.id.slice(0, 8)}</h2>
          <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="order-status">
          <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
            <i className={statusInfo.icon}></i> {statusInfo.label}
          </span>
        </div>
      </div>
      
      {/* Order status timeline */}
      {order.status !== 'Cancelled' && (
        <div className="order-timeline">
          <div className="timeline-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="timeline-steps">
            <div className={`timeline-step ${order.status ? 'active' : ''}`}>
              <div className="step-icon">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <p>Order Placed</p>
            </div>
            <div className={`timeline-step ${order.status === 'Accepted' || order.status === 'Shipped' || order.status === 'Delivered' ? 'active' : ''}`}>
              <div className="step-icon">
                <i className="fas fa-box"></i>
              </div>
              <p>Processing</p>
            </div>
            <div className={`timeline-step ${order.status === 'Shipped' || order.status === 'Delivered' ? 'active' : ''}`}>
              <div className="step-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <p>Shipped</p>
            </div>
            <div className={`timeline-step ${order.status === 'Delivered' ? 'active' : ''}`}>
              <div className="step-icon">
                <i className="fas fa-home"></i>
              </div>
              <p>Delivered</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Order cancelled info */}
      {order.status === 'Cancelled' && (
        <div className="cancelled-info">
          <i className="fas fa-times-circle"></i>
          <p>This order was cancelled {order.cancelledAt ? `on ${formatDate(order.cancelledAt)}` : ''}.</p>
          {order.cancelReason && (
            <p className="cancel-reason">Reason: {order.cancelReason}</p>
          )}
        </div>
      )}
      
      {/* Order details */}
      <div className="order-sections">
        <div className="order-section">
          <h3>Shipping Address</h3>
          <div className="address-box">
            <p className="name">{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>
        
        <div className="order-section">
          <h3>Payment Information</h3>
          <div className="payment-box">
            <p><strong>Method:</strong> {order.paymentMethod || 'Cash on Delivery'}</p>
            <p><strong>Status:</strong> <span className={order.paymentStatus === 'Paid' ? 'paid' : 'pending'}>
              {order.paymentStatus || 'Pending'}
            </span></p>
          </div>
        </div>
      </div>
      
      {/* Order items */}
      <div className="order-section">
        <h3>Order Items</h3>
        <div className="order-items">
          {order.items && order.items.map((item, index) => (
            <div className="order-item" key={index}>
              <div className="item-image">
                <img src={item.image || '/api/placeholder/80/80'} alt={item.name} />
              </div>
              <div className="item-details">
                <h4>{item.name}</h4>
                {item.size && <p className="item-variant">Size: {item.size}</p>}
                {item.color && <p className="item-variant">Color: {item.color}</p>}
                <p className="item-price">
                  {formatPrice(item.price)} x {item.quantity}
                </p>
              </div>
              <div className="item-total">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Order summary */}
      <div className="order-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>{formatPrice(order.shippingFee)}</span>
        </div>
        <div className="summary-row">
          <span>Tax</span>
          <span>{formatPrice(order.tax)}</span>
        </div>
        {order.discount > 0 && (
          <div className="summary-row discount">
            <span>Discount</span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="order-actions">
        <Link to="/orders" className="btn-secondary">
          Back to Orders
        </Link>
        
        {order.status === 'Processing' && (
          <button className="btn-danger">
            Cancel Order
          </button>
        )}
        
        <button className="btn-primary">
          Need Help?
        </button>
      </div>
    </div>
  );
};

export default OrderTracker;