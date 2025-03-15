// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaShoppingBag, 
  FaUsers, 
  FaRupeeSign, 
  FaChartLine,
  FaBoxOpen,
  FaTruck,
  FaCheckCircle
} from 'react-icons/fa';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  collectionGroup 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import DashboardLayout from '../components/layout/DashboardLayout';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listeners
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Set up listeners for products
        const productsQuery = collection(db, 'products');
        const productsUnsubscribe = onSnapshot(productsQuery, (snapshot) => {
          const productsCount = snapshot.docs.length;
          
          setStats(prev => ({
            ...prev,
            totalProducts: productsCount
          }));
        });
        
        // Set up listeners for customers
        const customersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'customer')
        );
        const customersUnsubscribe = onSnapshot(customersQuery, (snapshot) => {
          const customersCount = snapshot.docs.length;
          
          setStats(prev => ({
            ...prev,
            totalCustomers: customersCount
          }));
        });
        
        // Set up listeners for orders
        const ordersQuery = collection(db, 'orders');
        const ordersUnsubscribe = onSnapshot(ordersQuery, (snapshot) => {
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Calculate statistics from orders
          const totalOrders = orders.length;
          const pendingOrders = orders.filter(order => order.status === 'Pending' || !order.status).length;
          const processingOrders = orders.filter(order => order.status === 'Processing' || order.status === 'Accepted').length;
          const shippedOrders = orders.filter(order => order.status === 'Shipped').length;
          const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
          
          // Calculate total revenue
          const totalRevenue = orders.reduce((acc, order) => {
            return acc + (order.total || 0);
          }, 0);
          
          setStats(prev => ({
            ...prev,
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            totalRevenue
          }));
        });
        
        // Set up listener for recent orders
        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentOrdersUnsubscribe = onSnapshot(recentOrdersQuery, (snapshot) => {
          const recentOrdersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setRecentOrders(recentOrdersData);
          setLoading(false);
        });
        
        // Return a cleanup function to unsubscribe from all listeners
        return () => {
          productsUnsubscribe();
          customersUnsubscribe();
          ordersUnsubscribe();
          recentOrdersUnsubscribe();
        };
      } catch (error) {
        console.error('Error setting up dashboard listeners:', error);
        setLoading(false);
      }
    };
    
    const unsubscribe = fetchDashboardData();
    
    // Clean up function
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

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
    <DashboardLayout title="Dashboard Overview">
      {loading ? (
        <LoadingMessage>Loading dashboard data...</LoadingMessage>
      ) : (
        <DashboardContent>
          {/* Statistics Cards */}
          <StatsGrid>
            <StatCard>
              <StatIconWrapper className="orders">
                <FaShoppingBag />
              </StatIconWrapper>
              <StatContent>
                <StatValue>{stats.totalOrders}</StatValue>
                <StatLabel>Total Orders</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIconWrapper className="revenue">
                <FaRupeeSign />
              </StatIconWrapper>
              <StatContent>
                <StatValue>{formatPrice(stats.totalRevenue)}</StatValue>
                <StatLabel>Total Revenue</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIconWrapper className="products">
                <FaBoxOpen />
              </StatIconWrapper>
              <StatContent>
                <StatValue>{stats.totalProducts}</StatValue>
                <StatLabel>Products</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIconWrapper className="customers">
                <FaUsers />
              </StatIconWrapper>
              <StatContent>
                <StatValue>{stats.totalCustomers}</StatValue>
                <StatLabel>Customers</StatLabel>
              </StatContent>
            </StatCard>
          </StatsGrid>
          
          {/* Order Status Cards */}
          <OrderStatusSection>
            <SectionTitle>Order Status</SectionTitle>
            <OrderStatusGrid>
              <OrderStatusCard>
                <StatusIconWrapper className="pending">
                  <FaBoxOpen />
                </StatusIconWrapper>
                <StatusValue>{stats.pendingOrders}</StatusValue>
                <StatusLabel>Pending</StatusLabel>
              </OrderStatusCard>
              
              <OrderStatusCard>
                <StatusIconWrapper className="processing">
                  <FaChartLine />
                </StatusIconWrapper>
                <StatusValue>{stats.processingOrders}</StatusValue>
                <StatusLabel>Processing</StatusLabel>
              </OrderStatusCard>
              
              <OrderStatusCard>
                <StatusIconWrapper className="shipped">
                  <FaTruck />
                </StatusIconWrapper>
                <StatusValue>{stats.shippedOrders}</StatusValue>
                <StatusLabel>Shipped</StatusLabel>
              </OrderStatusCard>
              
              <OrderStatusCard>
                <StatusIconWrapper className="delivered">
                  <FaCheckCircle />
                </StatusIconWrapper>
                <StatusValue>{stats.deliveredOrders}</StatusValue>
                <StatusLabel>Delivered</StatusLabel>
              </OrderStatusCard>
            </OrderStatusGrid>
          </OrderStatusSection>
          
          {/* Recent Orders */}
          <RecentOrdersSection>
            <SectionTitle>Recent Orders</SectionTitle>
            <OrdersTable>
              <OrdersTableHeader>
                <OrderColumnID>Order ID</OrderColumnID>
                <OrderColumn>Customer</OrderColumn>
                <OrderColumn>Date</OrderColumn>
                <OrderColumn>Total</OrderColumn>
                <OrderColumn>Status</OrderColumn>
              </OrdersTableHeader>
              
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <OrderRow key={order.id}>
                    <OrderColumnID>#{order.orderNumber || order.id.slice(0, 8)}</OrderColumnID>
                    <OrderColumn>{order.shippingAddress?.name || 'N/A'}</OrderColumn>
                    <OrderColumn>{formatDate(order.createdAt)}</OrderColumn>
                    <OrderColumn>{formatPrice(order.total || 0)}</OrderColumn>
                    <OrderColumn>
                      <OrderStatus className={order.status?.toLowerCase() || 'processing'}>
                        {order.status || 'Processing'}
                      </OrderStatus>
                    </OrderColumn>
                  </OrderRow>
                ))
              ) : (
                <EmptyMessage>No recent orders found</EmptyMessage>
              )}
            </OrdersTable>
          </RecentOrdersSection>
        </DashboardContent>
      )}
    </DashboardLayout>
  );
};

// Styled Components
const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #666;
  height: 200px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 25px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  }
`;

const StatIconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-right: 20px;
  
  &.orders {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
  }
  
  &.revenue {
    background: linear-gradient(135deg, #2196f3, #0d47a1);
  }
  
  &.products {
    background: linear-gradient(135deg, #ff9800, #e65100);
  }
  
  &.customers {
    background: linear-gradient(135deg, #9c27b0, #6a1b9a);
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #777;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  position: relative;
  padding-left: 15px;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: linear-gradient(to bottom, #8e44ad, #9b59b6);
    border-radius: 4px;
  }
`;

const OrderStatusSection = styled.div`
  margin-top: 20px;
`;

const OrderStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const OrderStatusCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 25px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  }
`;

const StatusIconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  margin: 0 auto 15px;
  
  &.pending {
    background: linear-gradient(135deg, #ff9800, #e65100);
  }
  
  &.processing {
    background: linear-gradient(135deg, #2196f3, #0d47a1);
  }
  
  &.shipped {
    background: linear-gradient(135deg, #9c27b0, #6a1b9a);
  }
  
  &.delivered {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
  }
`;

const StatusValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
`;

const StatusLabel = styled.div`
  font-size: 14px;
  color: #777;
`;

const RecentOrdersSection = styled.div`
  margin-top: 20px;
`;

const OrdersTable = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const OrdersTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr;
  padding: 20px;
  background-color: #f9f9f9;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const OrderColumn = styled.div`
  padding: 5px;
  
  @media (max-width: 768px) {
    padding: 8px 0;
    display: flex;
    
    &:before {
      content: attr(data-label);
      font-weight: 600;
      width: 40%;
      margin-right: 10px;
    }
  }
`;

const OrderColumnID = styled(OrderColumn)`
  font-weight: 600;
  color: #8e44ad;
`;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr;
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
  
  @media (max-width: 768px) {
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

const OrderStatus = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  
  &.pending {
    background-color: rgba(255, 152, 0, 0.15);
    color: #ff9800;
  }
  
  &.processing {
    background-color: rgba(33, 150, 243, 0.15);
    color: #2196f3;
  }
  
  &.accepted {
    background-color: rgba(156, 39, 176, 0.15);
    color: #9c27b0;
  }
  
  &.shipped {
    background-color: rgba(156, 39, 176, 0.15);
    color: #9c27b0;
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

const EmptyMessage = styled.div`
  padding: 30px;
  text-align: center;
  color: #777;
  font-style: italic;
`;

export default Dashboard;