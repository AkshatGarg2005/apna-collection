import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AddressDisplay from '../../components/AddressDisplay';
import './Orders.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faBoxOpen, 
  faTimes, 
  faTruck, 
  faCheckCircle, 
  faSpinner,
  faBox,
  faHome,
  faShoppingCart,
  faTimesCircle,
  faCircle,
  faCalendarAlt,
  faArrowRight,
  faInfoCircle,
  faFilter,
  faTag
} from '@fortawesome/free-solid-svg-icons';

const Orders = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  
  // State for orders, filters, search, and modal
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Refs for animation
  const orderRefs = useRef({});
  
  // Load orders from localStorage or Firestore
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, you would fetch from Firestore based on currentUser.uid
        // For now, we'll use localStorage
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Filter orders for the current user if logged in
        const userOrders = currentUser 
          ? savedOrders.filter(order => order.userId === currentUser.uid)
          : savedOrders;
        
        // Sort by date (newest first) - parse the date string properly
        const sortedOrders = userOrders.sort((a, b) => {
          const dateA = new Date(a.date.split(',')[0] + a.date.split(',')[1]);
          const dateB = new Date(b.date.split(',')[0] + b.date.split(',')[1]);
          return dateB - dateA;
        });
        
        // If no orders found, use sample data
        if (sortedOrders.length === 0) {
          setOrders(getSampleOrders());
        } else {
          setOrders(sortedOrders);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders(getSampleOrders());
      }
      
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };
    
    loadOrders();
  }, [currentUser]);
  
  // Sample orders for demo purposes
  const getSampleOrders = () => {
    return [
      {
        id: 'AC23051587',
        date: '4 March, 2025',
        status: 'Delivered',
        items: [
          {
            id: 1,
            name: 'Premium Cotton Formal Shirt',
            image: '/api/placeholder/200/200',
            size: 'L',
            color: 'White',
            quantity: 1,
            price: 1299
          },
          {
            id: 2,
            name: 'Slim Fit Dark Denim Jeans',
            image: '/api/placeholder/200/200',
            size: '32',
            color: 'Dark Blue',
            quantity: 1,
            price: 1899
          }
        ],
        total: 3198,
        payment: {
          method: 'UPI',
          status: 'Paid'
        }
      },
      {
        id: 'AC23051492',
        date: '28 February, 2025',
        status: 'Shipped',
        items: [
          {
            id: 3,
            name: 'Traditional Silk Kurta',
            image: '/api/placeholder/200/200',
            size: 'M',
            color: 'Maroon',
            quantity: 1,
            price: 2999
          }
        ],
        total: 2999,
        payment: {
          method: 'Credit Card',
          status: 'Paid'
        }
      },
      {
        id: 'AC23051375',
        date: '15 February, 2025',
        status: 'Processing',
        items: [
          {
            id: 4,
            name: 'Designer Blazer',
            image: '/api/placeholder/200/200',
            size: '40',
            color: 'Navy Blue',
            quantity: 1,
            price: 3499
          },
          {
            id: 5,
            name: 'Formal Shoes',
            image: '/api/placeholder/200/200',
            size: '9',
            color: 'Brown',
            quantity: 1,
            price: 2199
          }
        ],
        total: 5698,
        payment: {
          method: 'Cash on Delivery',
          status: 'Pending'
        }
      },
      {
        id: 'AC23051240',
        date: '10 February, 2025',
        status: 'Cancelled',
        items: [
          {
            id: 6,
            name: 'Polo T-shirt',
            image: '/api/placeholder/200/200',
            size: 'M',
            color: 'Black',
            quantity: 2,
            price: 1199
          }
        ],
        total: 2398,
        payment: {
          method: 'UPI',
          status: 'Refunded'
        }
      }
    ];
  };
  
  // Filter orders when activeFilter or searchTerm changes
  useEffect(() => {
    let result = [...orders];
    
    // Apply filter with a small delay to show animation
    setIsLoading(true);
    
    setTimeout(() => {
      if (activeFilter !== 'All Orders') {
        if (activeFilter === 'Recent') {
          // Get the two most recent orders
          result = result.slice(0, 2);
        } else {
          result = result.filter(order => 
            order.status === activeFilter
          );
        }
      }
      
      // Apply search
      if (searchTerm.trim() !== '') {
        result = result.filter(order => {
          const matchesId = order.id.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesProduct = order.items.some(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return matchesId || matchesProduct;
        });
      }
      
      setFilteredOrders(result);
      setIsLoading(false);
    }, 300);
  }, [activeFilter, searchTerm, orders]);
  
  // Handle filter button click
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Track order handler
  const handleTrackOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setTrackingOrder(order);
      setShowTrackingModal(true);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  };
  
  // Cancel order handler
  const handleCancelOrder = (orderId) => {
    if (window.confirm(`Are you sure you want to cancel order #${orderId}?`)) {
      // Update the order in state
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? {...order, status: 'Cancelled'} 
          : order
      );
      
      // Update local state
      setOrders(updatedOrders);
      
      // Update in localStorage
      try {
        const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const updatedAllOrders = allOrders.map(order => 
          order.id === orderId 
            ? {...order, status: 'Cancelled'} 
            : order
        );
        localStorage.setItem('orders', JSON.stringify(updatedAllOrders));
      } catch (error) {
        console.error('Error updating order in localStorage:', error);
      }
      
      showToastNotification('Order cancelled successfully');
    }
  };
  
  // Order again handler
  const handleOrderAgain = (items) => {
    // In a real app, this would add the items to cart via context
    // For now, just show a toast
    showToastNotification(`Added ${items.length} items to your cart`);
    
    // Redirect to cart page after a short delay
    setTimeout(() => {
      navigate('/cart');
    }, 1500);
  };

  // Show toast notification
  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Close tracking modal
  const closeTrackingModal = () => {
    setShowTrackingModal(false);
    document.body.style.overflow = ''; // Restore scrolling
  };

  // Format currency
  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`;
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    return status.toLowerCase();
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delivered':
        return faCheckCircle;
      case 'Shipped':
        return faTruck;
      case 'Processing':
        return faSpinner;
      case 'Cancelled':
        return faTimesCircle;
      default:
        return faCircle;
    }
  };
  
  // Get payment method display text
  const getPaymentMethodText = (paymentMethod) => {
    switch(paymentMethod) {
      case 'cardPayment':
        return 'Credit/Debit Card';
      case 'upiPayment':
        return 'UPI';
      case 'netBankingPayment':
        return 'Net Banking';
      case 'codPayment':
        return 'Cash on Delivery';
      default:
        return paymentMethod;
    }
  };
  
  // Get payment status based on order status
  const getPaymentStatus = (order) => {
    if (order.status === 'Cancelled') {
      return 'Refunded';
    } else if (order.paymentMethod === 'codPayment') {
      return order.status === 'Delivered' ? 'Paid' : 'Pending';
    } else {
      return 'Paid';
    }
  };
  
  // Skeleton loading component
  const OrderSkeleton = () => (
    <div className="order-card skeleton">
      <div className="order-header skeleton-header">
        <div className="skeleton-bar skeleton-short"></div>
        <div className="skeleton-info">
          <div className="skeleton-bar skeleton-medium"></div>
          <div className="skeleton-bar skeleton-short"></div>
        </div>
      </div>
      <div className="order-item skeleton-item">
        <div className="skeleton-image"></div>
        <div className="skeleton-details">
          <div className="skeleton-bar skeleton-medium"></div>
          <div className="skeleton-bar skeleton-long"></div>
          <div className="skeleton-bar skeleton-short"></div>
        </div>
      </div>
      <div className="order-actions skeleton-actions">
        <div className="skeleton-bar skeleton-btn"></div>
        <div className="skeleton-bar skeleton-btn"></div>
      </div>
    </div>
  );
  
  return (
    <div className="orders-container">
      <h1 className="page-title">My Orders</h1>

      <div className="orders-layout">
        {/* Filter Section with Icon */}
        <div className="filter-section">
          <div className="filter-header">
            <FontAwesomeIcon icon={faFilter} />
            <span>Filters</span>
          </div>
          
          <button 
            className={`filter-btn ${activeFilter === 'All Orders' ? 'active' : ''}`}
            onClick={() => handleFilterClick('All Orders')}
          >
            <span className="filter-icon">
              <FontAwesomeIcon icon={faBoxOpen} />
            </span>
            All Orders
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'Recent' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Recent')}
          >
            <span className="filter-icon">
              <FontAwesomeIcon icon={faCalendarAlt} />
            </span>
            Recent
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'Delivered' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Delivered')}
          >
            <span className="filter-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </span>
            Delivered
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'Processing' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Processing')}
          >
            <span className="filter-icon">
              <FontAwesomeIcon icon={faSpinner} />
            </span>
            Processing
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'Cancelled' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Cancelled')}
          >
            <span className="filter-icon">
              <FontAwesomeIcon icon={faTimesCircle} />
            </span>
            Cancelled
          </button>
          
          <div className="filter-help">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>Filter orders by status or date to find what you're looking for.</span>
          </div>
        </div>
        
        {/* Orders and Search Content */}
        <div className="orders-content">
          {/* Search Box with Icon */}
          <div className="search-wrapper">
            <div className="search-icon">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search by order ID or product name..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
          
          {/* Order Summary */}
          {!isLoading && filteredOrders.length > 0 && (
            <div className="order-summary">
              <div className="summary-item">
                <span className="summary-label">Orders</span>
                <span className="summary-value">{filteredOrders.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Items</span>
                <span className="summary-value">
                  {filteredOrders.reduce((total, order) => total + order.items.length, 0)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Value</span>
                <span className="summary-value">
                  {formatPrice(filteredOrders.reduce((total, order) => total + order.total, 0))}
                </span>
              </div>
            </div>
          )}
          
          {/* Orders List */}
          <div className="orders-list">
            {isLoading ? (
              // Show skeleton loading UI
              <>
                <OrderSkeleton />
                <OrderSkeleton />
              </>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div className="order-card" key={order.id}>
                  <div className="order-header">
                    <div className="order-id-section">
                      <div className="order-id">
                        <FontAwesomeIcon icon={faTag} className="order-icon" />
                        Order #{order.id}
                      </div>
                      <div className={`order-status ${getStatusClass(order.status || 'Processing')}`}>
                        <FontAwesomeIcon icon={getStatusIcon(order.status || 'Processing')} />
                        <span>{order.status || 'Processing'}</span>
                      </div>
                    </div>
                    <div className="order-info">
                      <div className="order-date">
                        <FontAwesomeIcon icon={faCalendarAlt} className="order-date-icon" />
                        {order.date}
                      </div>
                      <div className="order-payment">
                        <span className="payment-method">
                          {getPaymentMethodText(order.paymentMethod)}
                        </span>
                        <span className={`payment-status ${getPaymentStatus(order).toLowerCase()}`}>
                          {getPaymentStatus(order)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="order-items-container">
                    {order.items.map(item => (
                      <div className="order-item" key={item.id}>
                        <div className="item-image">
                          <img src={item.image} alt={item.name} />
                          <div className="image-overlay">
                            <span className="item-quantity">×{item.quantity}</span>
                          </div>
                        </div>
                        <div className="item-details">
                          <h3 className="item-name">{item.name}</h3>
                          <div className="item-meta">
                            <span className="meta-item">Size: {item.size}</span>
                            <span className="meta-item">
                              <span className="color-dot" style={{ backgroundColor: item.color.toLowerCase() === 'dark blue' ? '#1a2b5e' : 
                                                                  item.color.toLowerCase() === 'white' ? '#fff' :
                                                                  item.color.toLowerCase() === 'maroon' ? '#800000' :
                                                                  item.color.toLowerCase() === 'navy blue' ? '#000080' :
                                                                  item.color.toLowerCase() === 'brown' ? '#8B4513' :
                                                                  item.color.toLowerCase() === 'black' ? '#000' : '#ccc' }}></span>
                              {item.color}
                            </span>
                          </div>
                          <div className="item-price">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="order-total">
                      <span className="total-label">Total:</span>
                      <span className="total-value">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  
                  {/* Order Actions */}
                  <div className="order-actions">
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <button 
                        className="action-btn cancel-btn"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        Cancel Order
                      </button>
                    )}
                    
                    {order.status !== 'Cancelled' && (
                      <button 
                        className="action-btn track-btn"
                        onClick={() => handleTrackOrder(order.id)}
                      >
                        <FontAwesomeIcon icon={faTruck} />
                        Track Order
                      </button>
                    )}
                    
                    <button 
                      className="action-btn order-again-btn"
                      onClick={() => handleOrderAgain(order.items)}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      Order Again
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-orders">
                <FontAwesomeIcon icon={faBoxOpen} size="3x" />
                <h3>No orders found</h3>
                <p>We couldn't find any orders matching your criteria.</p>
                <Link to="/shop" className="shop-link">
                  Continue Shopping
                  <FontAwesomeIcon icon={faArrowRight} className="shop-link-icon" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Tracking Modal */}
      {showTrackingModal && trackingOrder && (
        <div className="tracking-modal-overlay" onClick={closeTrackingModal}>
          <div className="tracking-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-close" onClick={closeTrackingModal}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
            <div className="modal-header">
              <h2>Track Your Order</h2>
              <p>Order #{trackingOrder.id}</p>
            </div>
            <div className="modal-body">
              <div className="tracking-timeline">
                <div className="tracking-steps">
                  <div className={`tracking-step ${trackingOrder.status !== 'Cancelled' ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <div className="step-label">Order Placed</div>
                    <div className="step-date">{trackingOrder.date}</div>
                  </div>
                  <div className={`tracking-step ${['Processing', 'Shipped', 'Delivered'].includes(trackingOrder.status) ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <FontAwesomeIcon icon={faSpinner} />
                    </div>
                    <div className="step-label">Processing</div>
                    <div className="step-date">
                      {new Date(new Date(trackingOrder.date).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={`tracking-step ${['Shipped', 'Delivered'].includes(trackingOrder.status) ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <FontAwesomeIcon icon={faBox} />
                    </div>
                    <div className="step-label">Shipped</div>
                    <div className="step-date">
                      {new Date(new Date(trackingOrder.date).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={`tracking-step ${trackingOrder.status === 'Delivered' ? 'completed' : trackingOrder.status === 'Shipped' ? 'active' : ''}`}>
                    <div className="step-icon">
                      <FontAwesomeIcon icon={faTruck} />
                    </div>
                    <div className="step-label">Out for Delivery</div>
                    <div className="step-date">
                      {new Date(new Date(trackingOrder.date).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={`tracking-step ${trackingOrder.status === 'Delivered' ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <FontAwesomeIcon icon={faHome} />
                    </div>
                    <div className="step-label">Delivered</div>
                    <div className="step-date">
                      {new Date(new Date(trackingOrder.date).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="delivery-details">
                <h3>Estimated Delivery</h3>
                <p className="delivery-date">
                  {trackingOrder.status === 'Delivered' 
                    ? 'Delivered on ' + trackingOrder.date 
                    : trackingOrder.status === 'Cancelled'
                    ? 'Order Cancelled'
                    : 'Expected by ' + new Date(new Date(trackingOrder.date).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                </p>
                
                {trackingOrder.shippingAddress && (
                  <div className="delivery-address">
                    <h4>Delivery Address</h4>
                    <AddressDisplay 
                      address={trackingOrder.shippingAddress} 
                      userName={userProfile?.displayName || currentUser?.displayName}
                      userPhone={userProfile?.phone}
                      showBadge={false}
                    />
                  </div>
                )}
                
                <div className="track-items-preview">
                  <h4>Order Items</h4>
                  <div className="track-items-grid">
                    {trackingOrder.items.map(item => (
                      <div className="track-item" key={item.id}>
                        <img src={item.image} alt={item.name} />
                        <span className="track-item-quantity">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn contact-btn"
                onClick={() => {
                  closeTrackingModal();
                  navigate('/contact');
                }}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                Contact Support
              </button>
              <button className="modal-btn close-btn" onClick={closeTrackingModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      <div className={`toast-message ${showToast ? 'show' : ''}`}>
        <div className="toast-icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <div className="toast-text">{toastMessage}</div>
      </div>
    </div>
  );
};

export default Orders;