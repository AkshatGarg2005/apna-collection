// src/services/orderUtils.js
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { reduceInventory, checkInventory, restoreInventory } from './inventoryService';
import { createOrderNotification, createCustomerNotification, createSystemNotification } from './notificationsService';

/**
 * Generates a unique order number
 * @returns {string} Unique order number
 */
export const generateOrderNumber = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `OD${timestamp}${random}`;
};

/**
 * Processes a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const processOrder = async (orderData) => {
  try {
    // Check inventory first
    const inventoryCheck = await checkInventory(orderData.items);
    
    if (!inventoryCheck.success) {
      return {
        success: false,
        message: inventoryCheck.message,
        outOfStockItems: inventoryCheck.missingItems
      };
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Prepare order data
    const order = {
      ...orderData,
      orderNumber,
      status: 'Processing',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add order to database
    const docRef = await addDoc(collection(db, 'orders'), order);
    
    // Reduce inventory
    await reduceInventory(orderData.items);
    
    // Create notification for admin
    const orderWithId = { ...order, id: docRef.id };
    await createOrderNotification(orderWithId);
    
    // Create order confirmation notification for customer
    if (orderData.userId) {
      await createCustomerNotification(
        orderData.userId,
        'Order Placed Successfully',
        `Your order #${orderNumber} has been placed successfully. We'll notify you when it's confirmed.`,
        'order',
        docRef.id
      );
    }
    
    return {
      success: true,
      message: 'Order placed successfully',
      orderId: docRef.id,
      orderNumber
    };
  } catch (error) {
    console.error('Error processing order:', error);
    return {
      success: false,
      message: 'Failed to process order. Please try again.'
    };
  }
};

/**
 * Gets order details by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Order object with id
 */
export const getOrderById = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    return {
      id: orderDoc.id,
      ...orderDoc.data()
    };
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

/**
 * Gets orders by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of order objects
 */
export const getOrdersByUserId = async (userId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    return ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

/**
 * Cancels an order
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for verification)
 * @param {string} cancelReason - Reason for cancellation
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const cancelOrder = async (orderId, userId, cancelReason = '') => {
  try {
    // Get order first
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    
    if (!orderDoc.exists()) {
      return {
        success: false,
        message: 'Order not found'
      };
    }
    
    const order = {
      id: orderDoc.id,
      ...orderDoc.data()
    };
    
    // Verify that this order belongs to the user
    if (order.userId !== userId) {
      return {
        success: false,
        message: 'Unauthorized access to this order'
      };
    }
    
    // Check if order is eligible for cancellation
    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return {
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      };
    }
    
    // Update order status
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'Cancelled',
      cancelReason,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Restore inventory
    if (order.items && order.items.length > 0) {
      await restoreInventory(order.items);
    }
    
    // Create notifications
    await createSystemNotification(
      'Order Cancelled by Customer',
      `Order #${order.orderNumber || order.id.slice(0, 8)} has been cancelled by the customer.`
    );
    
    await createCustomerNotification(
      userId,
      'Order Cancelled',
      `Your order #${order.orderNumber || order.id.slice(0, 8)} has been cancelled.`,
      'order',
      orderId
    );
    
    return {
      success: true,
      message: 'Order cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      message: 'Failed to cancel order. Please try again.'
    };
  }
};

export default {
  generateOrderNumber,
  processOrder,
  getOrderById,
  getOrdersByUserId,
  cancelOrder
};