// src/components/orders/OrderDetailModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCheckCircle, FaTruck, FaTimesCircle } from 'react-icons/fa';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  
  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!order.items || !Array.isArray(order.items)) return;
      
      const itemsWithDetails = await Promise.all(
        order.items.map(async (item) => {
          if (item.productId) {
            try {
              const productDoc = await getDoc(doc(db, 'products', item.productId));
              if (productDoc.exists()) {
                const productData = productDoc.data();
                return {
                  ...item,
                  productDetails: {
                    name: productData.name,
                    image: productData.image,
                    price: productData.price
                  }
                };
              }
            } catch (error) {
              console.error('Error fetching product details:', error);
            }
          }
          return item;
        })
      );
      
      setOrderItems(itemsWithDetails);
    };
    
    fetchOrderItems();
  }, [order]);
  
  // Handle order status update
  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'orders', order.id), {
        status: newStatus
      });
      onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Order #{order.orderNumber || order.id.slice(0, 8)}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <ModalSection>
            <SectionTitle>Order Information</SectionTitle>
            <OrderInfoGrid>
              <InfoItem>
                <InfoLabel>Order Date:</InfoLabel>
                <InfoValue>{formatDate(order.createdAt)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Status:</InfoLabel>
                <OrderStatus className={order.status?.toLowerCase() || 'processing'}>
                  {order.status || 'Processing'}
                </OrderStatus>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Payment Method:</InfoLabel>
                <InfoValue>{order.paymentMethod || 'Cash On Delivery'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Payment Status:</InfoLabel>
                <InfoValue className={order.paymentStatus === 'Paid' ? 'success' : 'pending'}>
                  {order.paymentStatus || 'Pending'}
                </InfoValue>
              </InfoItem>
            </OrderInfoGrid>
          </ModalSection>
          
          <ModalSection>
            <SectionTitle>Customer Information</SectionTitle>
            <CustomerInfo>
              <div>
                <InfoLabel>Name:</InfoLabel>
                <InfoValue>{order.shippingAddress?.name || 'N/A'}</InfoValue>
              </div>
              <div>
                <InfoLabel>Phone:</InfoLabel>
                <InfoValue>{order.shippingAddress?.phone || 'N/A'}</InfoValue>
              </div>
              <div>
                <InfoLabel>Email:</InfoLabel>
                <InfoValue>{order.email || 'N/A'}</InfoValue>
              </div>
              <div>
                <InfoLabel>Address:</InfoLabel>
                <AddressValue>
                  {order.shippingAddress ? (
                    <>
                      {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </>
                  ) : (
                    'N/A'
                  )}
                </AddressValue>
              </div>
            </CustomerInfo>
          </ModalSection>
          
          <ModalSection>
            <SectionTitle>Order Items</SectionTitle>
            <OrderItemsTable>
              <TableHeader>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.length > 0 ? (
                  orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <ProductCell>
                          {item.productDetails?.image ? (
                            <ProductImage src={item.productDetails.image} alt={item.productDetails.name} />
                          ) : (
                            <ProductImagePlaceholder />
                          )}
                          <ProductName>{item.productDetails?.name || item.name || 'Product'}</ProductName>
                        </ProductCell>
                      </TableCell>
                      <TableCell>{item.size || 'N/A'}</TableCell>
                      <TableCell>{item.color || 'N/A'}</TableCell>
                      <TableCell>{formatPrice(item.price || item.productDetails?.price || 0)}</TableCell>
                      <TableCell>{item.quantity || 1}</TableCell>
                      <TableCell>{formatPrice((item.price || item.productDetails?.price || 0) * (item.quantity || 1))}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="6">No items found in this order</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </OrderItemsTable>
          </ModalSection>
          
          <ModalSection>
            <SectionTitle>Order Summary</SectionTitle>
            <OrderSummary>
              <SummaryItem>
                <SummaryLabel>Subtotal:</SummaryLabel>
                <SummaryValue>{formatPrice(order.subtotal || 0)}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Shipping Fee:</SummaryLabel>
                <SummaryValue>{formatPrice(order.shippingFee || 0)}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Discount:</SummaryLabel>
                <SummaryValue>{formatPrice(order.discount || 0)}</SummaryValue>
              </SummaryItem>
              <SummaryTotal>
                <SummaryLabel>Total:</SummaryLabel>
                <TotalValue>{formatPrice(order.total || 0)}</TotalValue>
              </SummaryTotal>
            </OrderSummary>
          </ModalSection>
          
          <ModalActions>
            {(order.status === 'Processing' || !order.status) && (
              <ActionButton 
                className="accept"
                onClick={() => handleUpdateStatus('Accepted')}
                disabled={loading}
              >
                <FaCheckCircle /> Accept Order
              </ActionButton>
            )}
            
            {order.status === 'Accepted' && (
              <ActionButton 
                className="ship"
                onClick={() => handleUpdateStatus('Shipped')}
                disabled={loading}
              >
                <FaTruck /> Mark as Shipped
              </ActionButton>
            )}
            
            {order.status === 'Shipped' && (
              <ActionButton 
                className="deliver"
                onClick={() => handleUpdateStatus('Delivered')}
                disabled={loading}
              >
                <FaCheckCircle /> Mark as Delivered
              </ActionButton>
            )}
            
            {(order.status === 'Processing' || order.status === 'Accepted') && (
              <ActionButton 
                className="cancel"
                onClick={() => handleUpdateStatus('Cancelled')}
                disabled={loading}
              >
                <FaTimesCircle /> Cancel Order
              </ActionButton>
            )}
          </ModalActions>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
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
  max-width: 900px;
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

const ModalSection = styled.div`
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  background-color: #fff;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
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

const OrderInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #555;
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: #666;
  font-size: 14px;
  
  &.success {
    color: #4caf50;
    font-weight: 600;
  }
  
  &.pending {
    color: #ff9800;
    font-weight: 600;
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

const CustomerInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
  
  div {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
`;

const AddressValue = styled.span`
  color: #666;
  font-size: 14px;
  line-height: 1.5;
`;

const OrderItemsTable = styled.div`
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
`;

const TableBody = styled.div``;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 2fr 1fr 1fr;
    
    &:nth-of-type(even) {
      background-color: #f9f9f9;
    }
    
    ${TableHeader} & {
      display: none;
    }
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 15px 10px;
  }
`;

const TableCell = styled.div`
  padding: 5px;
  
  @media (max-width: 768px) {
    &:nth-child(n+4) {
      grid-column: span 2;
    }
  }
  
  @media (max-width: 576px) {
    grid-column: 1 / -1 !important;
    display: flex;
    justify-content: space-between;
    padding: 3px 5px;
    
    &:before {
      content: attr(data-label);
      font-weight: 600;
      color: #555;
    }
  }
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
`;

const ProductImagePlaceholder = styled.div`
  width: 50px;
  height: 50px;
  background-color: #f0f0f0;
  border-radius: 8px;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #333;
`;

const OrderSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin-left: auto;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
`;

const SummaryLabel = styled.div`
  font-weight: 500;
  color: #555;
`;

const SummaryValue = styled.div`
  color: #666;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-top: 5px;
  border-top: 2px solid #eee;
`;

const TotalValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #8e44ad;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: flex-end;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background-color: inherit;
      color: inherit;
    }
  }
`;

export default OrderDetailModal;