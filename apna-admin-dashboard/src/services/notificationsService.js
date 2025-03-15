// src/services/notificationsService.js
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
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
 * Creates a system notification for admin dashboard
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<boolean>} - Success status
 */
export const createSystemNotification = async (title, message) => {
  try {
    await addDoc(collection(db, 'adminNotifications'), {
      type: 'system',
      title,
      message,
      read: false,
      resolved: false,
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error creating system notification:', error);
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

export default {
  createOrderNotification,
  createLowStockNotification,
  createSystemNotification,
  createCustomerNotification,
  createOrderStatusNotification
};