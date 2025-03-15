// src/pages/Orders.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEye, FaCheckCircle, FaTimesCircle, FaTruck, FaSearch } from 'react-icons/fa';
import { collection, getDocs, updateDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import DashboardLayout from '../components/layout/DashboardLayout';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import { restoreInventory } from '../services/inventoryService';
import { createOrderStatusNotification } from '../services/notificationsService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      (order.shippingAddress?.name && order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
            placeholder="Search orders by ID or customer name..." 
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
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1.5fr;
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
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1.5fr;
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

export default Orders;