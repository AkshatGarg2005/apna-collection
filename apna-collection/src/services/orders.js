// src/services/orders.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { reduceInventory } from './inventory';
import { createOrderNotification, createCustomerNotification } from './notifications';

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
    
    // Reduce inventory for each ordered item
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
    
    // Store the recent order in localStorage for OrderConfirmation page
    const localStorageOrder = {
      id: docRef.id,
      orderNumber: orderNumber,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      total: orderData.total,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping || 0,
      tax: orderData.tax
    };
    
    localStorage.setItem('recentOrder', JSON.stringify(localStorageOrder));
    
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
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
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
 * Checks if there's enough inventory for all items in the order
 * @param {Array} items - Array of order items with productId and quantity
 * @returns {Promise<{ success: boolean, message: string, missingItems: Array }>}
 */
export const checkInventory = async (items) => {
  try {
    const missingItems = [];
    
    for (const item of items) {
      if (!item.id) continue;
      
      const productRef = doc(db, 'products', item.id);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        missingItems.push({
          productId: item.id,
          name: item.name || 'Unknown Product',
          requested: item.quantity,
          available: 0,
          message: 'Product not found'
        });
        continue;
      }
      
      const product = productDoc.data();
      const currentStock = product.stock || 0;
      
      if (currentStock < item.quantity) {
        missingItems.push({
          productId: item.id,
          name: product.name || 'Unknown Product',
          requested: item.quantity,
          available: currentStock,
          message: 'Insufficient stock'
        });
      }
    }
    
    if (missingItems.length > 0) {
      return {
        success: false,
        message: 'Some items are out of stock',
        missingItems
      };
    }
    
    return {
      success: true,
      message: 'All items are in stock',
      missingItems: []
    };
  } catch (error) {
    console.error('Error checking inventory:', error);
    return {
      success: false,
      message: 'Error checking inventory',
      missingItems: []
    };
  }
};

export default {
  generateOrderNumber,
  processOrder,
  getOrderById,
  getOrdersByUserId,
  checkInventory
};