// src/pages/Orders/Orders.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import OrderTracker from '../../components/Orders/OrderTracker';
import AddressDisplay from '../../components/AddressDisplay';
import AddReview from '../../components/Reviews/AddReview';
import { hasUserReviewedProduct } from '../../services/reviewService';
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
  faTag,
  faStar,
  faPercent,
  faTicketAlt
} from '@fortawesome/free-solid-svg-icons';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { addToCart } = useCart();
  
  // Order state
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [reviewProductName, setReviewProductName] = useState('');
  const [itemReviewStatus, setItemReviewStatus] = useState({});
  
  // Refs for animations
  const orderRefs = useRef({});

  // Fetch orders from Firebase
  useEffect(() => {
    // Only fetch if user is logged in
    if (!currentUser) {
      setOrders([]);
      setFilteredOrders([]);
      setLoading(false);
      return;
    }
    
    console.log("Starting orders fetch for user:", currentUser.uid);
    setLoading(true);
    
    try {
      // Create query for user's orders - NOW WITH INDEX SUPPORT
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')  // Now works with the index
      );
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        console.log("Orders snapshot received:", snapshot.size, "documents");
        
        if (snapshot.empty) {
          console.log("No orders found for this user");
          setOrders([]);
          setLoading(false);
          return;
        }
        
        const ordersList = snapshot.docs.map(doc => {
          const data = doc.data();
          
          // Format date safely
          let formattedDate;
          try {
            formattedDate = data.createdAt?.toDate ? 
              formatDate(data.createdAt.toDate()) : 
              new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
          } catch (dateError) {
            console.error("Error formatting date for order:", doc.id, dateError);
            formattedDate = "Unknown date";
          }
          
          return {
            id: doc.id,
            ...data,
            date: formattedDate
          };
        });
        
        console.log("Processed orders:", ordersList.length);
        setOrders(ordersList);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setLoading(false);
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up orders listener:", error);
      setOrders([]);
      setLoading(false);
    }
  }, [currentUser]);

  // Filter orders when activeFilter or searchTerm changes
  useEffect(() => {
    let result = [...orders];
    
    // Apply filter
    if (activeFilter !== 'All Orders') {
      if (activeFilter === 'Recent') {
        // Get the two most recent orders
        result = result.slice(0, 2);
      } else {
        result = result.filter(order => order.status === activeFilter);
      }
    }
    
    // Apply search
    if (searchTerm.trim() !== '') {
      result = result.filter(order => {
        // Search in order ID
        const idMatch = (order.orderNumber || order.id || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        
        // Search in product names
        const itemMatch = (order.items || []).some(item => 
          (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return idMatch || itemMatch;
      });
    }
    
    setFilteredOrders(result);
  }, [activeFilter, searchTerm, orders]);

  // Check review status for delivered items
  useEffect(() => {
    const checkReviewStatus = async () => {
      if (!currentUser) return;
      
      // Get all delivered orders
      const deliveredOrders = orders.filter(order => order.status === 'Delivered');
      
      // Check each product in each order
      const reviewStatusMap = {};
      
      for (const order of deliveredOrders) {
        if (!order.items || !Array.isArray(order.items)) continue;
        
        for (const item of order.items) {
          if (!item.id) continue;
          
          // If we haven't checked this product yet
          if (reviewStatusMap[item.id] === undefined) {
            const { hasReviewed } = await hasUserReviewedProduct(currentUser.uid, item.id);
            reviewStatusMap[item.id] = hasReviewed;
          }
        }
      }
      
      setItemReviewStatus(reviewStatusMap);
    };
    
    if (orders.length > 0) {
      checkReviewStatus();
    }
  }, [orders, currentUser]);

  // Utility Functions
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handler Functions
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleShowOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    document.body.style.overflow = ''; // Restore scrolling
  };

  const handleTrackOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setTrackingOrder(order);
      setShowTrackingModal(true);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  };

  const closeTrackingModal = () => {
    setShowTrackingModal(false);
    document.body.style.overflow = ''; // Restore scrolling
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel this order?`)) {
      return;
    }
    
    try {
      // Update the order in Firebase
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'Cancelled',
        cancelReason: 'Cancelled by customer',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Show success message
      showToastNotification('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToastNotification('Failed to cancel order. Please try again.');
    }
  };

  const handleOrderAgain = (items) => {
    if (!items || items.length === 0) {
      showToastNotification('No items to add to cart');
      return;
    }
    
    // Add each item to the cart using the addToCart function from cart context
    items.forEach(item => {
      const cartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity || 1,
        size: item.size,
        color: item.color
      };
      
      addToCart(cartItem);
    });
    
    // Show success message
    showToastNotification(`Added ${items.length} ${items.length === 1 ? 'item' : 'items'} to your cart`);
    
    // Redirect to cart page after a short delay
    setTimeout(() => {
      navigate('/cart');
    }, 1500);
  };

  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };
  
  // Handle review button click
  const handleReviewProduct = (productId, productName) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setShowReviewModal(true);
  };
  
  // Handle review form close
  const handleCloseReviewForm = () => {
    setShowReviewModal(false);
    setReviewProductId(null);
    setReviewProductName('');
  };
  
  // Handle review added
  const handleReviewAdded = () => {
    // Update the review status for this product
    setItemReviewStatus(prev => ({
      ...prev,
      [reviewProductId]: true
    }));
    
    showToastNotification('Your review has been submitted!');
  };

  // UI Helper Functions
  const getStatusDetails = (status) => {
    switch (status) {
      case 'Processing':
        return { 
          color: '#2196f3', 
          message: 'Order received and is being processed', 
          icon: faSpinner 
        };
      case 'Accepted':
        return { 
          color: '#9c27b0', 
          message: 'Order confirmed and being prepared for shipment', 
          icon: faCheckCircle 
        };
      case 'Shipped':
        return { 
          color: '#ff9800', 
          message: 'Order has been shipped and is on its way', 
          icon: faTruck 
        };
      case 'Delivered':
        return { 
          color: '#4caf50', 
          message: 'Order has been successfully delivered', 
          icon: faCheckCircle 
        };
      case 'Cancelled':
        return { 
          color: '#f44336', 
          message: 'Order has been cancelled', 
          icon: faTimesCircle 
        };
      default:
        return { 
          color: '#2196f3', 
          message: 'Order is being processed', 
          icon: faSpinner 
        };
    }
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() || 'processing';
  };

  const getStatusIcon = (status) => {
    return getStatusDetails(status).icon;
  };

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
        return paymentMethod || 'Online Payment';
    }
  };

  const getPaymentStatus = (order) => {
    if (order.status === 'Cancelled') {
      return 'Refunded';
    } else if (order.paymentMethod === 'codPayment') {
      return order.status === 'Delivered' ? 'Paid' : 'Pending';
    } else {
      return 'Paid';
    }
  };

  // Function to check if order has discount
  const hasDiscount = (order) => {
    return (order.couponDiscount > 0 || order.discount > 0);
  };

  // Function to get discount amount from order
  const getDiscountAmount = (order) => {
    return order.couponDiscount || order.discount || 0;
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
        {/* Filter Section */}
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
            className={`filter-btn ${activeFilter === 'Shipped' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Shipped')}
          >
            <span className="filter-icon">
              <FontAwesomeIcon icon={faTruck} />
            </span>
            Shipped
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
          {!loading && filteredOrders.length > 0 && (
            <div className="order-summary">
              <div className="summary-item">
                <span className="summary-label">Orders</span>
                <span className="summary-value">{filteredOrders.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Items</span>
                <span className="summary-value">
                  {filteredOrders.reduce((total, order) => total + (order.items?.length || 0), 0)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Value</span>
                <span className="summary-value">
                  {formatPrice(filteredOrders.reduce((total, order) => total + (order.total || 0), 0))}
                </span>
              </div>
            </div>
          )}
          
          {/* Orders List */}
          <div className="orders-list">
            {loading ? (
              // Show skeleton loading UI
              <>
                <OrderSkeleton />
                <OrderSkeleton />
              </>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div className="order-card" key={order.id} ref={el => orderRefs.current[order.id] = el}>
                  <div className="order-header">
                    <div className="order-id-section">
                      <div className="order-id">
                        <FontAwesomeIcon icon={faTag} className="order-icon" />
                        Order #{order.orderNumber || order.id.slice(0, 8)}
                        
                        {/* Show discount badge if order has discount */}
                        {hasDiscount(order) && (
                          <span className="discount-tag">
                            <FontAwesomeIcon icon={order.couponCode ? faTicketAlt : faPercent} />
                            {formatPrice(getDiscountAmount(order))} saved
                          </span>
                        )}
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
                    {(order.items || []).slice(0, 2).map((item, index) => (
                      <div className="order-item" key={index}>
                        <div className="item-image">
                          <img src={item.image} alt={item.name} />
                          <div className="image-overlay">
                            <span className="item-quantity">×{item.quantity}</span>
                          </div>
                        </div>
                        <div className="item-details">
                          <h3 className="item-name" onClick={() => navigate(`/product/${item.id}`)}>{item.name}</h3>
                          <div className="item-meta">
                            <span className="meta-item">Size: {item.size}</span>
                            <span className="meta-item">
                              <span className="color-dot" style={{ 
                                backgroundColor: item.color?.toLowerCase() === 'dark blue' ? '#1a2b5e' : 
                                                item.color?.toLowerCase() === 'white' ? '#fff' :
                                                item.color?.toLowerCase() === 'maroon' ? '#800000' :
                                                item.color?.toLowerCase() === 'navy blue' ? '#000080' :
                                                item.color?.toLowerCase() === 'brown' ? '#8B4513' :
                                                item.color?.toLowerCase() === 'black' ? '#000' : '#ccc' 
                              }}></span>
                              {item.color}
                            </span>
                          </div>
                          <div className="item-price">
                            {formatPrice(item.price)}
                          </div>
                          
                          {/* Review button - only show for delivered orders */}
                          {order.status === 'Delivered' && (
                            <div className="item-review">
                              {itemReviewStatus[item.id] ? (
                                <div className="reviewed-badge">
                                  <FontAwesomeIcon icon={faStar} /> Reviewed
                                </div>
                              ) : (
                                <button 
                                  className="review-item-btn"
                                  onClick={() => handleReviewProduct(item.id, item.name)}
                                >
                                  <FontAwesomeIcon icon={faStar} /> Write Review
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(order.items || []).length > 2 && (
                      <div className="more-items">
                        +{order.items.length - 2} more {order.items.length - 2 === 1 ? 'item' : 'items'}
                      </div>
                    )}
                    
                    <div className="order-total">
                      <span className="total-label">Total:</span>
                      <span className="total-value">{formatPrice(order.total || 0)}</span>
                      
                      {/* Show discount info if order has discount */}
                      {hasDiscount(order) && (
                        <div className="order-savings">
                          <FontAwesomeIcon icon={order.couponCode ? faTicketAlt : faPercent} />
                          <span>{order.couponCode ? `Saved with coupon: ${order.couponCode}` : 'Discount applied'}</span>
                        </div>
                      )}
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
                      className="action-btn view-btn"
                      onClick={() => handleShowOrderDetails(order)}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                      View Details
                    </button>
                    
                    <button 
                      className="action-btn order-again-btn"
                      onClick={() => handleOrderAgain(order.items || [])}
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
      
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-overlay" onClick={handleCloseOrderDetails}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-modal" onClick={handleCloseOrderDetails}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="order-details-content">
              <div className="order-summary">
                <div className="summary-item">
                  <div className="summary-label">Order Number:</div>
                  <div className="summary-value">#{selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Date Placed:</div>
                  <div className="summary-value">{selectedOrder.date}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Order Status:</div>
                  <div className="summary-value">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusDetails(selectedOrder.status || 'Processing').color }}
                    >
                      {selectedOrder.status || 'Processing'}
                    </span>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Payment Method:</div>
                  <div className="summary-value">{getPaymentMethodText(selectedOrder.paymentMethod)}</div>
                </div>
              </div>
              
              <div className="order-status-tracker">
                <OrderTracker currentStatus={selectedOrder.status || 'Processing'} />
                <div className="status-message">
                  {getStatusDetails(selectedOrder.status || 'Processing').message}
                </div>
              </div>
              
              {/* Savings summary - Redesigned */}
              {(selectedOrder.couponCode || hasDiscount(selectedOrder)) && (
                <div className="details-section savings-section">
                  <h3>Savings Summary</h3>
                  <div className="savings-content">
                    {selectedOrder.couponCode && (
                      <div className="savings-item">
                        <FontAwesomeIcon icon={faTicketAlt} className="savings-icon" />
                        <div className="savings-details">
                          <div className="savings-title">Coupon Applied</div>
                          <div className="savings-subtitle">{selectedOrder.couponCode}</div>
                        </div>
                        <div className="savings-amount">{formatPrice(getDiscountAmount(selectedOrder))}</div>
                      </div>
                    )}
                    
                    {!selectedOrder.couponCode && hasDiscount(selectedOrder) && (
                      <div className="savings-item">
                        <FontAwesomeIcon icon={faPercent} className="savings-icon" />
                        <div className="savings-details">
                          <div className="savings-title">Discount Applied</div>
                          <div className="savings-subtitle">Special offer discount</div>
                        </div>
                        <div className="savings-amount">{formatPrice(getDiscountAmount(selectedOrder))}</div>
                      </div>
                    )}
                    
                    <div className="savings-total">
                      <div className="total-savings-label">Total Savings</div>
                      <div className="total-savings-value">{formatPrice(getDiscountAmount(selectedOrder))}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="order-details-sections">
                <div className="details-section">
                  <h3>Items in Your Order</h3>
                  <div className="all-order-items">
                    {(selectedOrder.items || []).map((item, index) => (
                      <div className="order-item" key={index}>
                        <div className="item-image">
                          <img src={item.image} alt={item.name} />
                        </div>
                        <div className="item-details">
                          <div className="item-name" onClick={() => navigate(`/product/${item.id}`)}>{item.name}</div>
                          <div className="item-meta">
                            Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                          </div>
                          <div className="item-price">{formatPrice(item.price * item.quantity)}</div>
                          
                          {/* Review button in order details */}
                          {selectedOrder.status === 'Delivered' && (
                            <div className="item-review-details">
                              {itemReviewStatus[item.id] ? (
                                <div className="reviewed-badge">
                                  <FontAwesomeIcon icon={faStar} /> Reviewed
                                </div>
                              ) : (
                                <button 
                                  className="review-item-btn"
                                  onClick={() => {
                                    handleCloseOrderDetails();
                                    handleReviewProduct(item.id, item.name);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faStar} /> Write Review
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="details-section shipping-section">
                  <h3>Shipping Address</h3>
                  <div className="address-card">
                    <div className="address-name">{selectedOrder.shippingAddress?.name}</div>
                    <div className="address-line">
                      {selectedOrder.shippingAddress?.address}, 
                      {selectedOrder.shippingAddress?.city}, 
                      {selectedOrder.shippingAddress?.state} - 
                      {selectedOrder.shippingAddress?.pincode}
                    </div>
                    <div className="address-phone">
                      Phone: {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>
                </div>
                
                <div className="details-section price-summary-section">
                  <h3>Price Details</h3>
                  <div className="price-summary">
                    <div className="price-row">
                      <div className="price-label">Subtotal</div>
                      <div className="price-value">{formatPrice(selectedOrder.subtotal || 0)}</div>
                    </div>
                    
                    {/* Show discount row if discount applied - Redesigned */}
                    {hasDiscount(selectedOrder) && (
                      <div className="price-row savings-row">
                        <div className="price-label">
                          <FontAwesomeIcon icon={selectedOrder.couponCode ? faTicketAlt : faPercent} />
                          {selectedOrder.couponCode ? `Coupon (${selectedOrder.couponCode})` : 'Discount'}
                        </div>
                        <div className="price-value savings-value">
                          -{formatPrice(getDiscountAmount(selectedOrder))}
                        </div>
                      </div>
                    )}
                    
                    <div className="price-row">
                      <div className="price-label">Shipping</div>
                      <div className="price-value">
                        {selectedOrder.shipping === 0 ? 'Free' : formatPrice(selectedOrder.shipping || 0)}
                      </div>
                    </div>
                    <div className="price-row">
                      <div className="price-label">Tax</div>
                      <div className="price-value">{formatPrice(selectedOrder.tax || selectedOrder.gst || 0)}</div>
                    </div>
                    <div className="price-row total">
                      <div className="price-label">Total</div>
                      <div className="price-value">{formatPrice(selectedOrder.total || 0)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-actions">
                {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                  <button 
                    className="need-help-button"
                    onClick={() => navigate('/contact')}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} /> Need Help?
                  </button>
                )}
                <button 
                  className="reorder-button"
                  onClick={() => {
                    handleOrderAgain(selectedOrder.items || []);
                    handleCloseOrderDetails();
                  }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} /> Reorder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Tracking Modal */}
      {showTrackingModal && trackingOrder && (
        <div className="tracking-modal-overlay" onClick={closeTrackingModal}>
          <div className="tracking-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-close" onClick={closeTrackingModal}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
            <div className="modal-header">
              <h2>Track Your Order</h2>
              <p>Order #{trackingOrder.orderNumber || trackingOrder.id.slice(0, 8)}</p>
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
                      {new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
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
                      {new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
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
                      {new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
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
                      {new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
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
                    : 'Expected by ' + new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
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
                    {(trackingOrder.items || []).map((item, index) => (
                      <div className="track-item" key={index}>
                        <img src={item.image} alt={item.name} />
                        <span className="track-item-quantity">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Show discount in tracking modal too - Redesigned */}
                {hasDiscount(trackingOrder) && (
                  <div className="track-savings">
                    <h4>Your Savings</h4>
                    <div className="track-savings-card">
                      <div className="savings-icon-container">
                        <FontAwesomeIcon icon={trackingOrder.couponCode ? faTicketAlt : faPercent} />
                      </div>
                      <div className="savings-details-container">
                        <div className="savings-title">
                          {trackingOrder.couponCode ? `Coupon Applied: ${trackingOrder.couponCode}` : 'Discount Applied'}
                        </div>
                        <div className="savings-amount">
                          You saved {formatPrice(getDiscountAmount(trackingOrder))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
      
      {/* Review Modal */}
      {showReviewModal && reviewProductId && (
        <div className="review-form-overlay">
          <AddReview 
            productId={reviewProductId}
            productName={reviewProductName}
            onReviewAdded={handleReviewAdded}
            onClose={handleCloseReviewForm}
          />
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