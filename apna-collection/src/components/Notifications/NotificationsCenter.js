import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../../services/notifications';
import './NotificationsCenter.css';

const NotificationsCenter = ({ unreadCount }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications when user is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) {
        setNotifications([]);
        return;
      }
      
      setLoading(true);
      try {
        // Get notifications
        const userNotifications = await getUserNotifications(currentUser.uid);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (showDropdown) {
      fetchNotifications();
    }
  }, [currentUser, showDropdown]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Mark notification as read
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(item => 
            item.id === notification.id ? { ...item, read: true } : item
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // If it's an order notification, navigate to orders page
    if (notification.type === 'order' && notification.orderId) {
      setShowDropdown(false);
      // The Link component will handle navigation
    }
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return 'fas fa-shopping-bag';
      case 'shipment':
        return 'fas fa-truck';
      case 'payment':
        return 'fas fa-credit-card';
      case 'offer':
        return 'fas fa-tag';
      default:
        return 'fas fa-bell';
    }
  };
  
  if (!currentUser) {
    return null; // Don't render if not logged in
  }

  return (
    <div className="notifications-center" ref={dropdownRef}>
      <div className="notification-icon-wrapper" onClick={toggleDropdown}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      
      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount} new</span>
            )}
          </div>
          
          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">
                <div className="loading-spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <i className="fas fa-bell-slash"></i>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {notification.type === 'order' && notification.orderId ? (
                    <Link 
                      to={`/orders?highlight=${notification.orderId}`}
                      className="notification-link"
                    >
                      <div className="notification-icon">
                        <i className={getNotificationIcon(notification.type)}></i>
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                          {formatRelativeTime(notification.createdAt)}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <div className="notification-icon">
                        <i className={getNotificationIcon(notification.type)}></i>
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                          {formatRelativeTime(notification.createdAt)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="notifications-footer">
            <Link to="/user-profile/notifications" className="view-all-link">
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;