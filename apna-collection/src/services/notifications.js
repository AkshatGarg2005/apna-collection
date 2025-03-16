// src/services/notifications.js
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  deleteDoc,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Creates a new order notification for admin dashboard
 * @param {Object} order - Order object
 * @returns {Promise<boolean>} - Success status
 */
export const createOrderNotification = async (order) => {
  try {
    await addDoc(collection(db, 'adminNotifications'), {
      type: 'order',
      title: 'New Order Received',
      message: `Order #${order.orderNumber || order.id.slice(0, 8)} for ${order.total ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(order.total) : 'N/A'} from ${order.shippingAddress?.name || 'Customer'}`,
      orderId: order.id,
      read: false,
      resolved: false,
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error creating order notification:', error);
    return false;
  }
};

/**
 * Creates a low stock notification for admin dashboard
 * @param {Object} product - Product object
 * @returns {Promise<boolean>} - Success status
 */
export const createLowStockNotification = async (product) => {
  try {
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
    
    return true;
  } catch (error) {
    console.error('Error creating low stock notification:', error);
    return false;
  }
};

/**
 * Creates a customer notification
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (order, shipment, general)
 * @param {string} orderId - Optional order ID
 * @returns {Promise<boolean>} - Success status
 */
export const createCustomerNotification = async (userId, title, message, type = 'general', orderId = null) => {
  try {
    if (!userId) {
      console.error('Cannot create notification: No user ID provided');
      return false;
    }
    
    await addDoc(collection(db, 'userNotifications'), {
      userId,
      type,
      title,
      message,
      read: false,
      orderId,
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error creating customer notification:', error);
    return false;
  }
};

/**
 * Creates a promotional notification for multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<{success: boolean, count: number}>} - Success status and count of notifications created
 */
export const createBulkNotifications = async (userIds, title, message) => {
  try {
    if (!userIds || !userIds.length) {
      console.error('Cannot create bulk notifications: No user IDs provided');
      return { success: false, count: 0 };
    }
    
    let batch = writeBatch(db);
    let count = 0;
    
    // Add notifications in batches of 500 (Firestore limit)
    const notificationsCollectionRef = collection(db, 'userNotifications');
    for (const userId of userIds) {
      const notificationRef = doc(notificationsCollectionRef);
      batch.set(notificationRef, {
        userId,
        type: 'promotion',
        title,
        message,
        read: false,
        createdAt: serverTimestamp()
      });
      count++;
      
      // If we reach the batch limit, commit and start a new batch
      if (count % 500 === 0) {
        await batch.commit();
        batch = writeBatch(db);
      }
    }
    
    // Commit any remaining notifications
    if (count % 500 !== 0) {
      await batch.commit();
    }
    
    return { success: true, count };
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return { success: false, count: 0 };
  }
};

/**
 * Creates an order status update notification for customer
 * @param {string} userId - User ID
 * @param {Object} order - Order object
 * @param {string} newStatus - New order status
 * @returns {Promise<boolean>} - Success status
 */
export const createOrderStatusNotification = async (userId, order, newStatus) => {
  try {
    let title = '';
    let message = '';
    
    switch (newStatus) {
      case 'Accepted':
        title = 'Order Confirmed';
        message = `Your order #${order.orderNumber || order.id.slice(0, 8)} has been confirmed and is being processed.`;
        break;
      case 'Shipped':
        title = 'Order Shipped';
        message = `Your order #${order.orderNumber || order.id.slice(0, 8)} has been shipped and is on its way to you.`;
        break;
      case 'Delivered':
        title = 'Order Delivered';
        message = `Your order #${order.orderNumber || order.id.slice(0, 8)} has been delivered. Thank you for shopping with us!`;
        break;
      case 'Cancelled':
        title = 'Order Cancelled';
        message = `Your order #${order.orderNumber || order.id.slice(0, 8)} has been cancelled. Please contact customer support for more information.`;
        break;
      default:
        title = 'Order Update';
        message = `Your order #${order.orderNumber || order.id.slice(0, 8)} status has been updated to ${newStatus}.`;
        break;
    }
    
    await createCustomerNotification(userId, title, message, 'order', order.id);
    
    return true;
  } catch (error) {
    console.error('Error creating order status notification:', error);
    return false;
  }
};

/**
 * Creates a payment notification for customer
 * @param {string} userId - User ID
 * @param {Object} order - Order object
 * @param {string} status - Payment status (success, failed, refunded)
 * @returns {Promise<boolean>} - Success status
 */
export const createPaymentNotification = async (userId, order, status) => {
  try {
    let title = '';
    let message = '';
    const orderNumber = order.orderNumber || order.id.slice(0, 8);
    const amount = order.total ? new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(order.total) : 'N/A';
    
    switch (status) {
      case 'success':
        title = 'Payment Successful';
        message = `Your payment of ${amount} for order #${orderNumber} was successful.`;
        break;
      case 'failed':
        title = 'Payment Failed';
        message = `Your payment for order #${orderNumber} failed. Please try again or contact customer support.`;
        break;
      case 'refunded':
        title = 'Payment Refunded';
        message = `A refund of ${amount} for order #${orderNumber} has been processed and will be credited to your account within 5-7 business days.`;
        break;
      default:
        title = 'Payment Update';
        message = `There's an update regarding your payment for order #${orderNumber}.`;
        break;
    }
    
    await createCustomerNotification(userId, title, message, 'payment', order.id);
    
    return true;
  } catch (error) {
    console.error('Error creating payment notification:', error);
    return false;
  }
};

/**
 * Gets unread notifications count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of unread notifications
 */
export const getUnreadNotificationsCount = async (userId) => {
  try {
    if (!userId) return 0;
    
    const notificationsQuery = query(
      collection(db, 'userNotifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    return notificationsSnapshot.size;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return 0;
  }
};

/**
 * Subscribe to unread notifications count in real-time
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle count updates
 * @returns {Function} - Unsubscribe function to stop listening
 */
export const subscribeToUnreadCount = (userId, callback) => {
  if (!userId) {
    callback(0);
    return () => {}; // Return empty function if no user
  }
  
  const notificationsQuery = query(
    collection(db, 'userNotifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
    callback(snapshot.size);
  }, (error) => {
    console.error('Error subscribing to notifications:', error);
    callback(0);
  });
  
  // Return unsubscribe function to stop listening when needed
  return unsubscribe;
};

/**
 * Gets user notifications
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of notifications to retrieve (optional)
 * @returns {Promise<Array>} - Array of notification objects
 */
export const getUserNotifications = async (userId, notificationsLimit = 50) => {
  try {
    if (!userId) return [];
    
    console.log('Fetching notifications for user:', userId);
    
    const notificationsQuery = query(
      collection(db, 'userNotifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(notificationsLimit)
    );
    
    const notificationsSnapshot = await getDocs(notificationsQuery);
    console.log(`Found ${notificationsSnapshot.docs.length} notifications`);
    
    return notificationsSnapshot.docs.map(doc => {
      const data = doc.data();
      let createdAtDate;
      
      // Handle different timestamp formats
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
          // It's a Firestore timestamp
          createdAtDate = data.createdAt.toDate();
        } else if (data.createdAt._seconds) {
          // It's a Firestore timestamp in serialized format
          createdAtDate = new Date(data.createdAt._seconds * 1000);
        } else if (typeof data.createdAt === 'string') {
          // It's a date string
          createdAtDate = new Date(data.createdAt);
        } else if (typeof data.createdAt === 'number') {
          // It's a timestamp in milliseconds
          createdAtDate = new Date(data.createdAt);
        } else {
          // Fallback
          createdAtDate = new Date();
        }
      } else {
        // No timestamp available
        createdAtDate = new Date();
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: createdAtDate
      };
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    console.error('Error details:', error.message, error.stack);
    return [];
  }
};

/**
 * Subscribe to user notifications in real-time
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle notifications updates
 * @param {number} notificationsLimit - Maximum number of notifications to retrieve (optional)
 * @returns {Function} - Unsubscribe function to stop listening
 */
export const subscribeToUserNotifications = (userId, callback, notificationsLimit = 20) => {
  if (!userId) {
    callback([]);
    return () => {}; // Return empty function if no user
  }
  
  const notificationsQuery = query(
    collection(db, 'userNotifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(notificationsLimit)
  );
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      let createdAtDate;
      
      // Handle different timestamp formats
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
          // It's a Firestore timestamp
          createdAtDate = data.createdAt.toDate();
        } else if (data.createdAt._seconds) {
          // It's a Firestore timestamp in serialized format
          createdAtDate = new Date(data.createdAt._seconds * 1000);
        } else if (typeof data.createdAt === 'string') {
          // It's a date string
          createdAtDate = new Date(data.createdAt);
        } else if (typeof data.createdAt === 'number') {
          // It's a timestamp in milliseconds
          createdAtDate = new Date(data.createdAt);
        } else {
          // Fallback
          createdAtDate = new Date();
        }
      } else {
        // No timestamp available
        createdAtDate = new Date();
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: createdAtDate
      };
    });
    callback(notifications);
  }, (error) => {
    console.error('Error subscribing to user notifications:', error);
    callback([]);
  });
  
  // Return unsubscribe function to stop listening when needed
  return unsubscribe;
};

/**
 * Marks a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} - Success status
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    if (!notificationId) return false;
    
    const notificationRef = doc(db, 'userNotifications', notificationId);
    
    // Check if notification exists
    const notificationDoc = await getDoc(notificationRef);
    if (!notificationDoc.exists()) {
      console.error('Notification not found:', notificationId);
      return false;
    }
    
    await updateDoc(notificationRef, {
      read: true
    });
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Marks all notifications for a user as read
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, count: number}>} - Success status and count of notifications marked as read
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    if (!userId) return { success: false, count: 0 };
    
    const batch = writeBatch(db);
    let count = 0;
    
    // Get unread notifications
    const notificationsQuery = query(
      collection(db, 'userNotifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    
    // Update each notification in a batch
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true });
      count++;
    });
    
    // Commit the batch if there are updates to make
    if (count > 0) {
      await batch.commit();
    }
    
    return { success: true, count };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, count: 0 };
  }
};

/**
 * Deletes a notification
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID for validation (optional)
 * @returns {Promise<boolean>} - Success status
 */
export const deleteNotification = async (notificationId, userId = null) => {
  try {
    if (!notificationId) return false;
    
    const notificationRef = doc(db, 'userNotifications', notificationId);
    
    // If userId is provided, validate that the notification belongs to the user
    if (userId) {
      const notificationDoc = await getDoc(notificationRef);
      if (!notificationDoc.exists()) {
        console.error('Notification not found:', notificationId);
        return false;
      }
      
      const notificationData = notificationDoc.data();
      if (notificationData.userId !== userId) {
        console.error('Unauthorized access to notification:', notificationId);
        return false;
      }
    }
    
    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

/**
 * Gets notification type icon and color
 * @param {string} type - Notification type
 * @returns {Object} - Icon and color information
 */
export const getNotificationTypeInfo = (type) => {
  switch (type) {
    case 'order':
      return {
        icon: 'fa-box',
        color: '#4caf50'
      };
    case 'payment':
      return {
        icon: 'fa-credit-card',
        color: '#2196f3'
      };
    case 'shipment':
      return {
        icon: 'fa-shipping-fast',
        color: '#ff9800'
      };
    case 'promotion':
      return {
        icon: 'fa-tag',
        color: '#9c27b0'
      };
    case 'alert':
      return {
        icon: 'fa-exclamation-circle',
        color: '#f44336'
      };
    default:
      return {
        icon: 'fa-bell',
        color: '#607d8b'
      };
  }
};

export default {
  createOrderNotification,
  createLowStockNotification,
  createCustomerNotification,
  createBulkNotifications,
  createOrderStatusNotification,
  createPaymentNotification,
  getUnreadNotificationsCount,
  subscribeToUnreadCount,
  getUserNotifications,
  subscribeToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationTypeInfo
};