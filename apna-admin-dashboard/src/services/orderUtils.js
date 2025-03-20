// src/services/orderUtils.js
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { reduceInventory, checkInventory, restoreInventory } from './inventoryService';
import { createOrderNotification, createCustomerNotification, createSystemNotification } from './notificationsService';
import { validateCoupon } from './couponService';

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
    
    // Process coupon if provided
    let finalOrderData = { ...orderData };
    
    if (orderData.couponCode) {
      const couponResult = await validateCoupon(
        orderData.couponCode, 
        orderData.subtotal || 0,
        orderData.userId
      );
      
      if (couponResult.valid) {
        finalOrderData = {
          ...finalOrderData,
          couponId: couponResult.coupon.id,
          couponDiscount: couponResult.discountAmount,
          total: (orderData.total || 0) - couponResult.discountAmount
        };
      } else {
        // If coupon is invalid, remove it from the order
        delete finalOrderData.couponCode;
        delete finalOrderData.couponId;
        delete finalOrderData.couponDiscount;
      }
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Prepare order data
    const order = {
      ...finalOrderData,
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

/**
 * Apply a coupon to an existing order
 * @param {string} orderId - Order ID
 * @param {string} couponCode - Coupon code
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const applyCouponToOrder = async (orderId, couponCode) => {
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
    
    // Check if order already has a coupon
    if (order.couponCode) {
      return {
        success: false,
        message: 'Order already has a coupon applied'
      };
    }
    
    // Check if order is eligible for coupon
    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return {
        success: false,
        message: `Cannot apply coupon to order with status: ${order.status}`
      };
    }
    
    // Validate coupon
    const couponResult = await validateCoupon(
      couponCode, 
      order.subtotal || 0,
      order.userId
    );
    
    if (!couponResult.valid) {
      return {
        success: false,
        message: couponResult.message
      };
    }
    
    // Calculate new total
    const newTotal = (order.total || 0) - couponResult.discountAmount;
    
    // Update order with coupon details
    await updateDoc(doc(db, 'orders', orderId), {
      couponCode,
      couponId: couponResult.coupon.id,
      couponDiscount: couponResult.discountAmount,
      total: newTotal,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Coupon applied successfully',
      discountAmount: couponResult.discountAmount,
      newTotal
    };
  } catch (error) {
    console.error('Error applying coupon to order:', error);
    return {
      success: false,
      message: 'Failed to apply coupon. Please try again.'
    };
  }
};

/**
 * Remove a coupon from an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const removeCouponFromOrder = async (orderId) => {
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
    
    // Check if order has a coupon
    if (!order.couponCode) {
      return {
        success: false,
        message: 'Order does not have a coupon applied'
      };
    }
    
    // Check if order is eligible for coupon removal
    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return {
        success: false,
        message: `Cannot remove coupon from order with status: ${order.status}`
      };
    }
    
    // Calculate new total
    const newTotal = (order.total || 0) + (order.couponDiscount || 0);
    
    // Update order to remove coupon details
    await updateDoc(doc(db, 'orders', orderId), {
      couponCode: null,
      couponId: null,
      couponDiscount: null,
      total: newTotal,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Coupon removed successfully',
      newTotal
    };
  } catch (error) {
    console.error('Error removing coupon from order:', error);
    return {
      success: false,
      message: 'Failed to remove coupon. Please try again.'
    };
  }
};

/**
 * Gets coupon usage statistics
 * @returns {Promise<Object>} - Coupon usage statistics
 */
export const getCouponUsageStats = async () => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('couponId', '!=', null)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    const ordersWithCoupons = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate stats
    const totalOrders = ordersWithCoupons.length;
    const totalDiscount = ordersWithCoupons.reduce((sum, order) => sum + (order.couponDiscount || 0), 0);
    
    // Group by coupon ID
    const couponUsage = {};
    ordersWithCoupons.forEach(order => {
      const couponId = order.couponId;
      if (!couponUsage[couponId]) {
        couponUsage[couponId] = {
          couponId,
          couponCode: order.couponCode,
          usageCount: 0,
          totalDiscount: 0
        };
      }
      
      couponUsage[couponId].usageCount += 1;
      couponUsage[couponId].totalDiscount += (order.couponDiscount || 0);
    });
    
    return {
      totalOrders,
      totalDiscount,
      couponUsage: Object.values(couponUsage)
    };
  } catch (error) {
    console.error('Error getting coupon usage stats:', error);
    throw error;
  }
};

export default {
  generateOrderNumber,
  processOrder,
  getOrderById,
  getOrdersByUserId,
  cancelOrder,
  applyCouponToOrder,
  removeCouponFromOrder,
  getCouponUsageStats
};