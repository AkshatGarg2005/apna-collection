// src/components/notifications/NotificationsCenter.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaShoppingBag, FaBoxOpen, FaExclamationTriangle, FaTimes, FaCheck } from 'react-icons/fa';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  where, 
  getDocs,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getLowStockProducts } from '../../services/inventoryService';

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch notifications
  useEffect(() => {
    const notificationsQuery = query(
      collection(db, 'adminNotifications'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notificationsList);
      
      // Count unread notifications
      const unread = notificationsList.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Check for low stock products periodically
  useEffect(() => {
    const checkLowStock = async () => {
      const lowStockProducts = await getLowStockProducts(10);
      
      // Create notifications for low stock products if not already notified
      lowStockProducts.forEach(async (product) => {
        // Check if a notification for this product already exists
        const existingQuery = query(
          collection(db, 'adminNotifications'),
          where('type', '==', 'lowStock'),
          where('productId', '==', product.id),
          where('resolved', '==', false)
        );
        
        const existingSnapshot = await getDocs(existingQuery);
        
        if (existingSnapshot.empty) {
          // Create new notification
          await addDoc(collection(db, 'adminNotifications'), {
            type: 'lowStock',
            title: 'Low Stock Alert',
            message: `${product.name} is running low on stock (${product.stock} remaining)`,
            productId: product.id,
            read: false,
            resolved: false,
            createdAt: serverTimestamp()
          });
        }
      });
    };
    
    // Check low stock initially
    checkLowStock();
    
    // Check low stock every hour
    const interval = setInterval(checkLowStock, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'adminNotifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark notification as resolved
  const markAsResolved = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'adminNotifications', notificationId), {
        resolved: true
      });
    } catch (error) {
      console.error('Error marking notification as resolved:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      
      notifications.forEach((notification) => {
        if (!notification.read) {
          const notificationRef = doc(db, 'adminNotifications', notification.id);
          batch.update(notificationRef, { read: true });
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // If today, show time only
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within the last week, show day and time
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    if (date > lastWeek) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <FaShoppingBag />;
      case 'lowStock':
        return <FaBoxOpen />;
      case 'system':
        return <FaExclamationTriangle />;
      default:
        return <FaBell />;
    }
  };
  
  return (
    <NotificationsContainer>
      <NotificationIcon onClick={toggleNotifications}>
        <FaBell />
        {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
      </NotificationIcon>
      
      {showNotifications && (
        <NotificationsPanel>
          <NotificationsHeader>
            <NotificationsTitle>Notifications</NotificationsTitle>
            {unreadCount > 0 && (
              <MarkAllReadButton onClick={markAllAsRead}>
                Mark all as read
              </MarkAllReadButton>
            )}
            <CloseButton onClick={toggleNotifications}>
              <FaTimes />
            </CloseButton>
          </NotificationsHeader>
          
          <NotificationsList>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  className={!notification.read ? 'unread' : ''}
                  onClick={() => markAsRead(notification.id)}
                >
                  <NotificationIconWrapper className={notification.type}>
                    {getNotificationIcon(notification.type)}
                  </NotificationIconWrapper>
                  <NotificationContent>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    <NotificationMessage>{notification.message}</NotificationMessage>
                    <NotificationTime>{formatDate(notification.createdAt)}</NotificationTime>
                  </NotificationContent>
                  {!notification.resolved && (
                    <ResolveButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsResolved(notification.id);
                      }}
                    >
                      <FaCheck />
                    </ResolveButton>
                  )}
                </NotificationItem>
              ))
            ) : (
              <EmptyNotifications>
                No notifications yet
              </EmptyNotifications>
            )}
          </NotificationsList>
        </NotificationsPanel>
      )}
    </NotificationsContainer>
  );
};

// Styled Components
const NotificationsContainer = styled.div`
  position: relative;
`;

const NotificationIcon = styled.div`
  position: relative;
  cursor: pointer;
  color: #555;
  font-size: 18px;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const NotificationsPanel = styled.div`
  position: absolute;
  top: 45px;
  right: -10px;
  width: 350px;
  max-height: 500px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  
  &:before {
    content: '';
    position: absolute;
    top: -8px;
    right: 17px;
    width: 16px;
    height: 16px;
    background-color: #fff;
    transform: rotate(45deg);
    box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 576px) {
    width: 300px;
    right: -15px;
  }
`;

const NotificationsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  position: relative;
`;

const NotificationsTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const MarkAllReadButton = styled.button`
  background: none;
  border: none;
  color: #8e44ad;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  margin-right: 10px;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 5px;
  font-size: 14px;
  
  &:hover {
    color: #333;
  }
`;

const NotificationsList = styled.div`
  max-height: 450px;
  overflow-y: auto;
  flex: 1;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  &.unread {
    background-color: rgba(142, 68, 173, 0.05);
    
    &:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 4px;
      height: 70%;
      background-color: #8e44ad;
      border-radius: 0 2px 2px 0;
    }
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  flex-shrink: 0;
  
  &.order {
    background-color: #2196f3;
  }
  
  &.lowStock {
    background-color: #ff9800;
  }
  
  &.system {
    background-color: #f44336;
  }
  
  &.default {
    background-color: #8e44ad;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  font-size: 11px;
  color: #888;
`;

const ResolveButton = styled.button`
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #4caf50;
    color: white;
  }
`;

const EmptyNotifications = styled.div`
  text-align: center;
  padding: 30px 20px;
  color: #888;
  font-style: italic;
  font-size: 14px;
`;

export default NotificationsCenter;