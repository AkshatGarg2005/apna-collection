// src/services/notifications.js
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit, 
    updateDoc,
    onSnapshot,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  const userNotificationsCollection = 'userNotifications';
  
  /**
   * Subscribe to user notifications in real-time
   * @param {string} userId - The user ID
   * @param {Function} callback - Callback function that receives notifications
   * @returns {Function} - Unsubscribe function
   */
  export const subscribeToUserNotifications = (userId, callback) => {
    const q = query(
      collection(db, userNotificationsCollection),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    }, (error) => {
      console.error('Error getting real-time notifications:', error);
      callback([]);
    });
  };
  
  /**
   * Get user notifications (non-realtime fallback)
   * @param {string} userId - The user ID
   * @param {number} limitCount - Maximum number of notifications to fetch
   * @returns {Promise<Array>} Array of notification objects
   */
  export const getUserNotifications = async (userId, limitCount = 50) => {
    try {
      const q = query(
        collection(db, userNotificationsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  };
  
  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID to mark as read
   * @returns {Promise<boolean>} Success indicator
   */
  export const markNotificationAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, userNotificationsCollection, notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };
  
  /**
   * Mark all user notifications as read
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} Success indicator
   */
  export const markAllNotificationsAsRead = async (userId) => {
    try {
      const notifications = await getUserNotifications(userId);
      
      // Update each unread notification
      const updatePromises = notifications
        .filter(notification => !notification.read)
        .map(notification => 
          updateDoc(doc(db, userNotificationsCollection, notification.id), {
            read: true,
            readAt: serverTimestamp()
          })
        );
      
      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };
  
  /**
   * Get count of unread notifications
   * @param {string} userId - The user ID
   * @returns {Promise<number>} Count of unread notifications
   */
  export const getUnreadNotificationCount = async (userId) => {
    try {
      const q = query(
        collection(db, userNotificationsCollection),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  };
  
  /**
   * Subscribe to unread notification count
   * @param {string} userId - The user ID
   * @param {Function} callback - Callback function that receives the count
   * @returns {Function} - Unsubscribe function
   */
  export const subscribeToUnreadCount = (userId, callback) => {
    const q = query(
      collection(db, userNotificationsCollection),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.size);
    }, (error) => {
      console.error('Error getting real-time unread count:', error);
      callback(0);
    });
  };