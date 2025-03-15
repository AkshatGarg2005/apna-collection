// src/pages/Customers.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaPhone, FaShoppingBag, FaSearch, FaMapMarkerAlt, FaTimes, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { collection, getDocs, query, where, doc, getDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import DashboardLayout from '../components/layout/DashboardLayout';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [customerStats, setCustomerStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch customers from Firestore with real-time updates
  useEffect(() => {
    const customersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'customer')
    );
    
    const unsubscribe = onSnapshot(customersQuery, async (snapshot) => {
      const customersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCustomers(customersList);
      
      // Fetch order statistics for all customers
      const ordersQuery = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Count orders and calculate total spending per customer
      const stats = {};
      orders.forEach(order => {
        if (order.userId) {
          if (!stats[order.userId]) {
            stats[order.userId] = { orderCount: 0, totalSpent: 0 };
          }
          stats[order.userId].orderCount += 1;
          stats[order.userId].totalSpent += (order.total || 0);
        }
      });
      
      setCustomerStats(stats);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching customers:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.displayName || ''}`.toLowerCase();
    const email = customer.email?.toLowerCase() || '';
    
    return fullName.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase());
  });

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

  // Handle view profile click
  const handleViewProfile = async (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
    
    // Fetch customer orders with real-time updates
    try {
      setLoadingOrders(true);
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', customer.id),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        const ordersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCustomerOrders(ordersList);
        setLoadingOrders(false);
      }, (error) => {
        console.error('Error fetching customer orders:', error);
        setCustomerOrders([]);
        setLoadingOrders(false);
      });
      
      // Store the unsubscribe function to clean up when the modal closes
      setSelectedCustomer(prev => ({
        ...prev,
        unsubscribe
      }));
    } catch (error) {
      console.error('Error setting up orders listener:', error);
      setCustomerOrders([]);
      setLoadingOrders(false);
    }
  };

  // Close modal
  const closeModal = () => {
    if (selectedCustomer && selectedCustomer.unsubscribe) {
      selectedCustomer.unsubscribe();
    }
    setShowModal(false);
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  return (
    <DashboardLayout title="Customer Management">
      <CustomersHeader>
        <SearchContainer>
          <SearchIconWrapper>
            <FaSearch />
          </SearchIconWrapper>
          <SearchInput 
            type="text" 
            placeholder="Search customers by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <CustomerStats>
          <StatItem>
            <StatValue>{customers.length}</StatValue>
            <StatLabel>Total Customers</StatLabel>
          </StatItem>
        </CustomerStats>
      </CustomersHeader>
      
      {loading ? (
        <LoadingMessage>Loading customers...</LoadingMessage>
      ) : (
        <CustomersContainer>
          {filteredCustomers.length > 0 ? (
            <CustomersGrid>
              {filteredCustomers.map(customer => (
                <CustomerCard key={customer.id}>
                  <CustomerAvatar>
                    {customer.displayName ? customer.displayName.charAt(0).toUpperCase() : 'U'}
                  </CustomerAvatar>
                  <CustomerInfo>
                    <CustomerName>{customer.displayName || 'Unnamed User'}</CustomerName>
                    <CustomerEmail>
                      <FaEnvelope /> {customer.email}
                    </CustomerEmail>
                    <CustomerPhone>
                      <FaPhone /> {customer.phone || 'No phone'}
                    </CustomerPhone>
                    <CustomerMeta>
                      <MetaItem>
                        <MetaLabel>Joined:</MetaLabel>
                        <MetaValue>{formatDate(customer.createdAt)}</MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Orders:</MetaLabel>
                        <MetaValue className="orders">
                          <FaShoppingBag /> {customerStats[customer.id]?.orderCount || 0}
                        </MetaValue>
                      </MetaItem>
                    </CustomerMeta>
                    {customer.addresses && customer.addresses.length > 0 && (
                      <AddressSection>
                        <AddressTitle>Default Address:</AddressTitle>
                        <AddressText>
                          {customer.addresses.find(addr => addr.isDefault)?.address || 
                           customer.addresses[0].address}
                        </AddressText>
                      </AddressSection>
                    )}
                    {customerStats[customer.id]?.totalSpent > 0 && (
                      <TotalSpent>
                        Total Spent: <span>{formatPrice(customerStats[customer.id].totalSpent)}</span>
                      </TotalSpent>
                    )}
                  </CustomerInfo>
                  <ViewButton onClick={() => handleViewProfile(customer)}>
                    View Profile
                  </ViewButton>
                </CustomerCard>
              ))}
            </CustomersGrid>
          ) : (
            <EmptyMessage>
              No customers found. {searchTerm && `Try a different search term.`}
            </EmptyMessage>
          )}
        </CustomersContainer>
      )}

      {/* Customer Profile Modal */}
      {showModal && selectedCustomer && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Customer Profile</ModalTitle>
              <CloseButton onClick={closeModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <ProfileHeader>
                <LargeAvatar>
                  {selectedCustomer.displayName ? selectedCustomer.displayName.charAt(0).toUpperCase() : 'U'}
                </LargeAvatar>
                <ProfileInfo>
                  <ProfileName>{selectedCustomer.displayName || 'Unnamed User'}</ProfileName>
                  <ProfileDetail>
                    <FaEnvelope /> {selectedCustomer.email}
                  </ProfileDetail>
                  <ProfileDetail>
                    <FaPhone /> {selectedCustomer.phone || 'No phone number provided'}
                  </ProfileDetail>
                  <ProfileDetail>
                    <FaCalendarAlt /> Joined on {formatDate(selectedCustomer.createdAt)}
                  </ProfileDetail>
                  {customerStats[selectedCustomer.id]?.orderCount > 0 && (
                    <ProfileStats>
                      <StatBox>
                        <StatNumber>{customerStats[selectedCustomer.id]?.orderCount || 0}</StatNumber>
                        <StatDescription>Orders</StatDescription>
                      </StatBox>
                      <StatBox>
                        <StatNumber>{formatPrice(customerStats[selectedCustomer.id]?.totalSpent || 0)}</StatNumber>
                        <StatDescription>Total Spent</StatDescription>
                      </StatBox>
                    </ProfileStats>
                  )}
                </ProfileInfo>
              </ProfileHeader>
              
              <ModalSection>
                <SectionTitle>Addresses</SectionTitle>
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                  <AddressList>
                    {selectedCustomer.addresses.map((address, index) => (
                      <AddressCard key={index} className={address.isDefault ? 'default' : ''}>
                        {address.isDefault && <DefaultBadge>Default</DefaultBadge>}
                        <AddressType>
                          {address.type || 'Home'}
                        </AddressType>
                        <AddressLine>
                          <FaUser /> {selectedCustomer.displayName}
                        </AddressLine>
                        <AddressLine>
                          <FaMapMarkerAlt /> {address.address}, {address.city}, {address.state} - {address.pincode}
                        </AddressLine>
                      </AddressCard>
                    ))}
                  </AddressList>
                ) : (
                  <NoDataMessage>No addresses found.</NoDataMessage>
                )}
              </ModalSection>
              
              <ModalSection>
                <SectionTitle>Order History</SectionTitle>
                {loadingOrders ? (
                  <LoadingSpinner>Loading orders...</LoadingSpinner>
                ) : customerOrders.length > 0 ? (
                  <OrdersTable>
                    <TableHeader>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Total</TableCell>
                    </TableHeader>
                    {customerOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.orderNumber || order.id.slice(0, 8)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <OrderStatus className={order.status?.toLowerCase() || 'processing'}>
                            {order.status || 'Processing'}
                          </OrderStatus>
                        </TableCell>
                        <TableCell>{formatPrice(order.total || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </OrdersTable>
                ) : (
                  <NoDataMessage>No orders found for this customer.</NoDataMessage>
                )}
              </ModalSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </DashboardLayout>
  );
};

// Styled Components
const CustomersHeader = styled.div`
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

const CustomerStats = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const StatItem = styled.div`
  text-align: center;
  background-color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #8e44ad;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #666;
  height: 200px;
`;

const CustomersContainer = styled.div``;

const CustomersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
`;

const CustomerCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const CustomerAvatar = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #8e44ad;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const CustomerInfo = styled.div`
  width: 100%;
  text-align: center;
`;

const CustomerName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
`;

const CustomerEmail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const CustomerPhone = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
`;

const CustomerMeta = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const MetaLabel = styled.span`
  font-size: 12px;
  color: #888;
`;

const MetaValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &.orders {
    color: #8e44ad;
  }
`;

const AddressSection = styled.div`
  margin-bottom: 15px;
  text-align: center;
`;

const AddressTitle = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
`;

const AddressText = styled.div`
  font-size: 14px;
  color: #666;
`;

const TotalSpent = styled.div`
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
  
  span {
    font-weight: 700;
    color: #8e44ad;
  }
`;

const ViewButton = styled.button`
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    background-color: #7d3c98;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  color: #666;
  font-size: 16px;
`;

// Modal Styled Components
const ModalOverlay = styled.div`
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
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const LargeAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #8e44ad;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  font-weight: 600;
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h3`
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
`;

const ProfileDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #666;
  margin-bottom: 8px;
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 15px;
`;

const StatBox = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 10px 15px;
  text-align: center;
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #8e44ad;
  margin-bottom: 5px;
`;

const StatDescription = styled.div`
  font-size: 12px;
  color: #666;
`;

const ModalSection = styled.div`
  border-top: 1px solid #eee;
  padding-top: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
`;

const AddressList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
`;

const AddressCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  position: relative;
  
  &.default {
    border: 2px solid #8e44ad;
    background-color: rgba(142, 68, 173, 0.05);
  }
`;

const DefaultBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #8e44ad;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const AddressType = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
`;

const AddressLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const OrdersTable = styled.div`
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  background-color: #f5f5f5;
  padding: 12px;
  font-weight: 600;
  
  @media (max-width: 576px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 12px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 576px) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 15px;
  }
`;

const TableCell = styled.div`
  padding: 5px;
  
  @media (max-width: 576px) {
    &:before {
      content: attr(data-label);
      font-weight: 600;
      margin-right: 10px;
    }
  }
`;

const OrderStatus = styled.span`
  display: inline-block;
  padding: 5px 10px;
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

const NoDataMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #777;
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

export default Customers;