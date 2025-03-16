import React from 'react';
import './OrderTracker.css';

const OrderTracker = ({ currentStatus }) => {
  // Define statuses and their order
  const statuses = [
    { key: 'Processing', label: 'Order Placed', icon: 'fa-clipboard-check' },
    { key: 'Accepted', label: 'Confirmed', icon: 'fa-clipboard-check' },
    { key: 'Shipped', label: 'Shipped', icon: 'fa-shipping-fast' },
    { key: 'Delivered', label: 'Delivered', icon: 'fa-box-open' }
  ];
  
  // Find index of current status
  let currentIndex = statuses.findIndex(status => status.key === currentStatus);
  
  // If status not found or is "Cancelled", handle specially
  if (currentIndex === -1) {
    if (currentStatus === 'Cancelled') {
      // Handle cancelled order
      return (
        <div className="order-tracker cancelled">
          <div className="tracker-status cancelled-status">
            <div className="status-icon-wrapper">
              <i className="fas fa-times"></i>
            </div>
            <div className="status-label">Order Cancelled</div>
            <div className="status-description">This order has been cancelled</div>
          </div>
        </div>
      );
    } else {
      // Default to first status if not found
      currentIndex = 0;
    }
  }

  return (
    <div className="order-tracker">
      <div className="tracker-path">
        {statuses.map((status, index) => {
          // Determine status classes
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div 
              key={status.key} 
              className={`tracker-status ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="status-icon-wrapper">
                <i className={`fas ${status.icon}`}></i>
              </div>
              <div className="status-label">{status.label}</div>
              {index < statuses.length - 1 && (
                <div className={`connector ${index < currentIndex ? 'active' : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Estimated delivery for active orders */}
      {currentStatus !== 'Delivered' && currentStatus !== 'Cancelled' && (
        <div className="delivery-estimate">
          Estimated Delivery: {getEstimatedDeliveryDate()}
        </div>
      )}
    </div>
  );
};

// Helper function to calculate estimated delivery date
const getEstimatedDeliveryDate = () => {
  const deliveryDate = new Date();
  
  // Add 5 days to current date
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  
  // Format date
  return deliveryDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default OrderTracker;