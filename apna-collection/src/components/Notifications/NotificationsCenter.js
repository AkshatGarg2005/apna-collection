// src/components/Notifications/NotificationsCenter.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  subscribeToUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../services/notifications';
import './NotificationsCenter.css';

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to user notifications
    const unsubscribe = subscribeToUserNotifications(currentUser.uid, (notificationsList) => {
      setNotifications(notificationsList);
      
      // Count unread notifications
      const unread = notificationsList.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    });
    
    // Handle clicks outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up on unmount
    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentUser]);
  
  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if not already
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    
    // Close notifications panel
    setShowNotifications(false);
    
    // Handle navigation based on notification type if needed
    // e.g., redirect to order details
  };
  
  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (currentUser) {
      await markAllNotificationsAsRead(currentUser.uid);
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
        return <i className="fas fa-shopping-bag"></i>;
      case 'shipment':
        return <i className="fas fa-shipping-fast"></i>;
      case 'delivery':
        return <i className="fas fa-box-open"></i>;
      default:
        return <i className="fas fa-bell"></i>;
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="notifications-container" ref={dropdownRef}>
      <div className="notifications-icon" onClick={toggleNotifications}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
      </div>
      
      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`notification-icon ${notification.type}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatDate(notification.createdAt)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">No notifications yet</div>
            )}
          </div>
          
          <div className="notifications-footer">
            <Link to="/notifications" onClick={() => setShowNotifications(false)}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;