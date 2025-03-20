// src/pages/Orders.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEye, FaCheckCircle, FaTimesCircle, FaTruck, FaSearch, FaTicketAlt } from 'react-icons/fa';
import { collection, getDocs, updateDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import DashboardLayout from '../components/layout/DashboardLayout';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import { restoreInventory } from '../services/inventoryService';
import { createOrderStatusNotification } from '../services/notificationsService';
import { applyCouponToOrder, removeCouponFromOrder } from '../services/orderUtils';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Fetch orders from Firestore with real-time updates
  useEffect(() => {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });
    
    // Cleanup function
    return () => unsubscribe();
  }, []);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.shippingAddress?.name && order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.couponCode && order.couponCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle order status update
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const orderToUpdate = orders.find(order => order.id === orderId);
      
      // If cancelling the order, restore inventory
      if (newStatus === 'Cancelled' && orderToUpdate.items && orderToUpdate.items.length > 0) {
        const restored = await restoreInventory(orderToUpdate.items);
        if (!restored) {
          console.warn('Failed to restore inventory for cancelled order');
          // Continue anyway, but log the issue
        }
      }
      
      // Update order status in Firestore
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        statusUpdatedAt: serverTimestamp()
      });
      
      // Notify the customer about status change
      if (orderToUpdate.userId) {
        await createOrderStatusNotification(orderToUpdate.userId, orderToUpdate, newStatus);
      }
      
      // No need to update state manually as we're using onSnapshot
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Handle status update from modal
  const handleStatusUpdateFromModal = (orderId, newStatus) => {
    // No need to update state manually as we're using onSnapshot
    setShowModal(false);
  };

  // Handle opening coupon apply modal
  const handleOpenCouponModal = (order) => {
    setSelectedOrder(order);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
    setShowCouponModal(true);
  };

  // Handle applying coupon to order
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    try {
      setCouponLoading(true);
      setCouponError('');
      setCouponSuccess('');
      
      const result = await applyCouponToOrder(selectedOrder.id, couponCode.trim());
      
      if (result.success) {
        setCouponSuccess(`Coupon applied successfully! Discount: ${formatPrice(result.discountAmount)}`);
        
        // Close modal after a short delay
        setTimeout(() => {
          setShowCouponModal(false);
        }, 2000);
      } else {
        setCouponError(result.message);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('An error occurred while applying the coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle removing coupon from order
  const handleRemoveCoupon = async (orderId) => {
    if (window.confirm('Are you sure you want to remove the coupon from this order?')) {
      try {
        const result = await removeCouponFromOrder(orderId);
        
        if (!result.success) {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error removing coupon:', error);
        alert('Failed to remove coupon. Please try again.');
      }
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format price to Indian Rupee
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <DashboardLayout title="Order Management">
      <OrdersHeader>
        <SearchContainer>
          <SearchIconWrapper>
            <FaSearch />
          </SearchIconWrapper>
          <SearchInput 
            type="text" 
            placeholder="Search orders by ID, customer name or coupon code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <FilterContainer>
          <FilterLabel>Status:</FilterLabel>
          <StatusSelect 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Accepted">Accepted</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </StatusSelect>
        </FilterContainer>
      </OrdersHeader>
      
      {loading ? (
        <LoadingMessage>Loading orders...</LoadingMessage>
      ) : (
        <OrdersTable>
          <OrdersTableHeader>
            <OrderColumn>Order ID</OrderColumn>
            <OrderColumn>Customer</OrderColumn>
            <OrderColumn>Date</OrderColumn>
            <OrderColumn>Total</OrderColumn>
            <OrderColumn>Coupon</OrderColumn>
            <OrderColumn>Status</OrderColumn>
            <OrderColumn>Actions</OrderColumn>
          </OrdersTableHeader>
          
          <OrdersTableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <OrderRow key={order.id}>
                  <OrderColumn data-label="Order ID">
                    #{order.orderNumber || order.id.slice(0, 8)}
                  </OrderColumn>
                  <OrderColumn data-label="Customer">
                    {order.shippingAddress?.name || 'N/A'}
                  </OrderColumn>
                  <OrderColumn data-label="Date">
                    {formatDate(order.createdAt)}
                  </OrderColumn>
                  <OrderColumn data-label="Total">
                    {formatPrice(order.total || 0)}
                  </OrderColumn>
                  <OrderColumn data-label="Coupon">
                    {order.couponCode ? (
                      <CouponDisplay>
                        <CouponIcon><FaTicketAlt /></CouponIcon>
                        <CouponCode>{order.couponCode}</CouponCode>
                        <CouponDiscount>-{formatPrice(order.couponDiscount || 0)}</CouponDiscount>
                        {(order.status === 'Processing' || order.status === 'Accepted') && (
                          <RemoveCouponButton 
                            onClick={() => handleRemoveCoupon(order.id)}
                            title="Remove coupon"
                          >
                            <FaTimesCircle />
                          </RemoveCouponButton>
                        )}
                      </CouponDisplay>
                    ) : (
                      <CouponPlaceholder>
                        {(order.status === 'Processing' || order.status === 'Accepted') ? (
                          <AddCouponButton 
                            onClick={() => handleOpenCouponModal(order)}
                            title="Add coupon"
                          >
                            <FaTicketAlt /> Add
                          </AddCouponButton>
                        ) : (
                          'No coupon'
                        )}
                      </CouponPlaceholder>
                    )}
                  </OrderColumn>
                  <OrderColumn data-label="Status">
                    <OrderStatus className={order.status?.toLowerCase() || 'processing'}>
                      {order.status || 'Processing'}
                    </OrderStatus>
                  </OrderColumn>
                  <OrderColumn data-label="Actions">
                    <OrderActions>
                      <ActionButton 
                        className="view"
                        onClick={() => handleViewOrder(order)}
                      >
                        <FaEye /> View
                      </ActionButton>
                      
                      {order.status === 'Processing' && (
                        <ActionButton 
                          className="accept"
                          onClick={() => handleUpdateStatus(order.id, 'Accepted')}
                        >
                          <FaCheckCircle /> Accept
                        </ActionButton>
                      )}
                      
                      {order.status === 'Accepted' && (
                        <ActionButton 
                          className="ship"
                          onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                        >
                          <FaTruck /> Ship
                        </ActionButton>
                      )}
                      
                      {(order.status === 'Processing' || order.status === 'Accepted') && (
                        <ActionButton 
                          className="cancel"
                          onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                        >
                          <FaTimesCircle /> Cancel
                        </ActionButton>
                      )}
                      
                      {order.status === 'Shipped' && (
                        <ActionButton 
                          className="deliver"
                          onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                        >
                          <FaCheckCircle /> Deliver
                        </ActionButton>
                      )}
                    </OrderActions>
                  </OrderColumn>
                </OrderRow>
              ))
            ) : (
              <EmptyRow>
                <EmptyMessage>No orders found</EmptyMessage>
              </EmptyRow>
            )}
          </OrdersTableBody>
        </OrdersTable>
      )}
      
      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onStatusUpdate={handleStatusUpdateFromModal}
        />
      )}
      
      {/* Coupon Apply Modal */}
      {showCouponModal && selectedOrder && (
        <CouponModalOverlay>
          <CouponModalContent>
            <CouponModalHeader>
              <CouponModalTitle>Apply Coupon to Order #{selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}</CouponModalTitle>
              <CloseButton onClick={() => setShowCouponModal(false)}>
                <FaTimesCircle />
              </CloseButton>
            </CouponModalHeader>
            
            <CouponModalBody>
              {couponError && <CouponErrorMessage>{couponError}</CouponErrorMessage>}
              {couponSuccess && <CouponSuccessMessage>{couponSuccess}</CouponSuccessMessage>}
              
              <CouponInputGroup>
                <CouponInputLabel htmlFor="couponCode">Enter Coupon Code</CouponInputLabel>
                <CouponInputWrapper>
                  <CouponInputIcon><FaTicketAlt /></CouponInputIcon>
                  <CouponInput 
                    type="text" 
                    id="couponCode" 
                    placeholder="e.g. WELCOME20" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </CouponInputWrapper>
              </CouponInputGroup>
              
              <CouponModalActions>
                <CancelCouponButton onClick={() => setShowCouponModal(false)}>
                  Cancel
                </CancelCouponButton>
                <ApplyCouponButton 
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? 'Applying...' : 'Apply Coupon'}
                </ApplyCouponButton>
              </CouponModalActions>
            </CouponModalBody>
          </CouponModalContent>
        </CouponModalOverlay>
      )}
    </DashboardLayout>
  );
};

// Styled Components
const OrdersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  margin-right: 10px;
  font-weight: 500;
  color: #555;
`;

const StatusSelect = styled.select`
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #666;
  height: 200px;
`;

const OrdersTable = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const OrdersTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr 1.5fr;
  padding: 15px 20px;
  background-color: #f9f9f9;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 992px) {
    display: none;
  }
`;

const OrdersTableBody = styled.div``;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr 1.5fr;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 992px) {
    display: block;
    padding: 15px;
    position: relative;
    
    &:after {
      content: "";
      display: table;
      clear: both;
    }
  }
`;

const OrderColumn = styled.div`
  padding: 5px;
  
  @media (max-width: 992px) {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    
    &:before {
      content: attr(data-label);
      font-weight: 600;
      padding-right: 10px;
    }
  }
`;

const OrderStatus = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  
  &.processing {
    background-color: rgba(33, 150, 243, 0.15);
    color: #2196f3;
  }
  
  &.accepted {
    background-color: rgba(156, 39, 176, 0.15);
    color: #9c27b0;
  }
  
  &.shipped {
    background-color: rgba(255, 152, 0, 0.15);
    color: #ff9800;
  }
  
  &.delivered {
    background-color: rgba(76, 175, 80, 0.15);
    color: #4caf50;
  }
  
  &.cancelled {
    background-color: rgba(244, 67, 54, 0.15);
    color: #f44336;
  }
`;

// Coupon Display Styles
const CouponDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(142, 68, 173, 0.1);
  padding: 6px 10px;
  border-radius: 6px;
  max-width: fit-content;
`;

const CouponIcon = styled.span`
  color: #8e44ad;
  display: flex;
  align-items: center;
  font-size: 12px;
`;

const CouponCode = styled.span`
  font-family: monospace;
  font-weight: 600;
  font-size: 12px;
  color: #6c3483;
`;

const CouponDiscount = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #f44336;
`;

const RemoveCouponButton = styled.button`
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const CouponPlaceholder = styled.div`
  color: #999;
  font-size: 13px;
  font-style: italic;
`;

const AddCouponButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: 1px dashed #8e44ad;
  color: #8e44ad;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(142, 68, 173, 0.05);
  }
`;

const OrderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 992px) {
    justify-content: flex-end;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.view {
    background-color: rgba(33, 150, 243, 0.15);
    color: #2196f3;
    
    &:hover {
      background-color: #2196f3;
      color: white;
    }
  }
  
  &.accept {
    background-color: rgba(76, 175, 80, 0.15);
    color: #4caf50;
    
    &:hover {
      background-color: #4caf50;
      color: white;
    }
  }
  
  &.ship {
    background-color: rgba(255, 152, 0, 0.15);
    color: #ff9800;
    
    &:hover {
      background-color: #ff9800;
      color: white;
    }
  }
  
  &.deliver {
    background-color: rgba(76, 175, 80, 0.15);
    color: #4caf50;
    
    &:hover {
      background-color: #4caf50;
      color: white;
    }
  }
  
  &.cancel {
    background-color: rgba(244, 67, 54, 0.15);
    color: #f44336;
    
    &:hover {
      background-color: #f44336;
      color: white;
    }
  }
`;

const EmptyRow = styled.div`
  padding: 30px 20px;
  text-align: center;
`;

const EmptyMessage = styled.div`
  color: #666;
  font-style: italic;
`;

// Coupon Modal Styles
const CouponModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const CouponModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CouponModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const CouponModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
`;

const CouponModalBody = styled.div`
  padding: 20px;
`;

const CouponErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
`;

const CouponSuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
`;

const CouponInputGroup = styled.div`
  margin-bottom: 20px;
`;

const CouponInputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

const CouponInputWrapper = styled.div`
  position: relative;
`;

const CouponInputIcon = styled.span`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #8e44ad;
`;

const CouponInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
`;

const CouponModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const CancelCouponButton = styled.button`
  background-color: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ApplyCouponButton = styled.button`
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #7d3c98;
  }
  
  &:disabled {
    background-color: #b39ddb;
    cursor: not-allowed;
  }
`;

export default Orders;