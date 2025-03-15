// src/services/orders.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { reduceInventory } from './inventory';

const ordersCollection = collection(db, 'orders');

// Generate a unique order number (same as admin)
const generateOrderNumber = () => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `OD${timestamp}${random}`;
};

// Create a new order with inventory check
export const createOrder = async (orderData, userId) => {
  try {
    // Check inventory before placing order
    const items = orderData.items || [];
    for (const item of items) {
      const productRef = doc(db, 'products', item.productId);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        throw new Error(`Product ${item.productId} does not exist`);
      }
      
      const product = productSnap.data();
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock}`);
      }
    }
    
    // Reduce inventory
    await reduceInventory(items);
    
    // Create order
    const orderNumber = generateOrderNumber();
    const orderToCreate = {
      ...orderData,
      userId,
      orderNumber,
      status: 'Processing',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(ordersCollection, orderToCreate);
    
    return {
      id: docRef.id,
      ...orderToCreate,
      status: 'Processing'
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Subscribe to user orders (real-time)
export const subscribeToUserOrders = (userId, callback) => {
  const q = query(
    ordersCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  }, (error) => {
    console.error('Error getting real-time user orders:', error);
    callback([]);
  });
};

// Subscribe to a single order (real-time)
export const subscribeToOrder = (orderId, callback) => {
  const orderRef = doc(db, 'orders', orderId);
  
  return onSnapshot(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      const order = {
        id: snapshot.id,
        ...snapshot.data()
      };
      callback(order);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error getting real-time order:', error);
    callback(null);
  });
};

// Get user orders (non-realtime, for fallback)
export const getUserOrders = async (userId) => {
  try {
    const q = query(
      ordersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

// Get a specific order by ID (non-realtime, for fallback)
export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

// Cancel an order (if still possible)
export const cancelOrder = async (orderId, userId, cancelReason = '') => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const order = orderSnap.data();
    
    // Check if order belongs to user
    if (order.userId !== userId) {
      throw new Error('Unauthorized access to this order');
    }
    
    // Check if order can be cancelled
    if (['Delivered', 'Cancelled'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }
    
    // Update order status
    await updateDoc(orderRef, {
      status: 'Cancelled',
      cancelReason,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Note: Inventory restoration is handled by admin
    
    return { success: true };
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Get order status info for display
export const getOrderStatusInfo = (status) => {
  switch (status) {
    case 'Processing':
      return {
        label: 'Processing',
        description: 'Your order has been received and is being processed.',
        color: '#2196f3',
        icon: 'fas fa-spinner fa-spin'
      };
    case 'Accepted':
      return {
        label: 'Confirmed',
        description: 'Your order has been confirmed and is being prepared.',
        color: '#9c27b0',
        icon: 'fas fa-check-circle'
      };
    case 'Shipped':
      return {
        label: 'Shipped',
        description: 'Your order has been shipped and is on its way.',
        color: '#ff9800',
        icon: 'fas fa-shipping-fast'
      };
    case 'Delivered':
      return {
        label: 'Delivered',
        description: 'Your order has been delivered successfully.',
        color: '#4caf50',
        icon: 'fas fa-box-open'
      };
    case 'Cancelled':
      return {
        label: 'Cancelled',
        description: 'Your order has been cancelled.',
        color: '#f44336',
        icon: 'fas fa-times-circle'
      };
    default:
      return {
        label: status || 'Processing',
        description: 'Your order is being processed.',
        color: '#2196f3',
        icon: 'fas fa-spinner'
      };
  }
};