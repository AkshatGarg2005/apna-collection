import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  getFirestore, 
  writeBatch
} from 'firebase/firestore';
import './Notifications.css';

const Notifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);

  // Fetch notifications directly from Firestore
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) {
        console.log("No current user, skipping fetch");
        return;
      }
      
      console.log("Starting to fetch notifications for user:", currentUser.uid);
      setLoading(true);
      setError(null);
      
      try {
        const db = getFirestore();
        const simpleQuery = query(
          collection(db, 'userNotifications'),
          where('userId', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(simpleQuery);
        console.log(`Found ${snapshot.docs.length} notifications`);
        
        const notificationsList = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            jsDate: data.createdAt && data.createdAt.seconds 
                    ? new Date(data.createdAt.seconds * 1000) 
                    : null
          };
        });
        
        // Sort notifications by date (most recent first)
        notificationsList.sort((a, b) => {
          if (a.jsDate && b.jsDate) return b.jsDate - a.jsDate;
          if (a.jsDate) return -1;
          if (b.jsDate) return 1;
          return 0;
        });
        
        console.log("Processed and sorted notifications:", notificationsList);
        setNotifications(notificationsList);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  // Mark a single notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log("Marking notification as read:", notificationId);
      const db = getFirestore();
      await updateDoc(doc(db, 'userNotifications', notificationId), {
        read: true
      });
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    // Recalculate unread notifications at time of action
    const currentUnreadCount = notifications.filter(notification => !notification.read).length;
    if (currentUnreadCount === 0) return;
    
    try {
      console.log("Marking all notifications as read");
      setLoading(true);
      
      const db = getFirestore();
      const batch = writeBatch(db);
      
      const unreadNotifications = notifications.filter(notification => !notification.read);
      console.log(`Marking ${unreadNotifications.length} notifications as read`);
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'userNotifications', notification.id);
        batch.update(notificationRef, { read: true });
      });
      
      await batch.commit();
      console.log("Successfully marked all as read");
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Failed to mark notifications as read. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get appropriate icon for a notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return 'fa-box';
      case 'payment':
        return 'fa-credit-card';
      case 'shipment':
        return 'fa-shipping-fast';
      case 'promotion':
        return 'fa-tag';
      case 'wishlist':
        return 'fa-heart';
      default:
        return 'fa-bell';
    }
  };

  // Format the timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Date unknown';
    
    try {
      let date;
      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp.jsDate) {
        date = timestamp.jsDate;
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) return 'Date unknown';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);
      
      if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch (e) {
      console.error('Error formatting time:', e);
      return 'Date unknown';
    }
  };

  // Filter notifications based on the selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    return notification.type === activeFilter;
  });

  // Calculate the unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <header className="notifications-page-header">
          <h1>Your Notifications</h1>
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </header>

        <div className="notifications-filter">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveFilter('unread')}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'order' ? 'active' : ''}`}
            onClick={() => setActiveFilter('order')}
          >
            Orders
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'shipment' ? 'active' : ''}`}
            onClick={() => setActiveFilter('shipment')}
          >
            Shipments
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'promotion' ? 'active' : ''}`}
            onClick={() => setActiveFilter('promotion')}
          >
            Promotions
          </button>
        </div>

        <div className="notifications-list-container">
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="notifications-list">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-time">
                        {formatTime(notification.jsDate || notification.createdAt)}
                      </div>
                    </div>
                    <div className="notification-message">{notification.message}</div>
                    {!notification.read && (
                      <button 
                        className="mark-read-btn"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-notifications">
              <i className="fas fa-bell-slash"></i>
              <p>No notifications found</p>
              {activeFilter !== 'all' && (
                <button 
                  className="filter-btn"
                  onClick={() => setActiveFilter('all')}
                >
                  Show all notifications
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
