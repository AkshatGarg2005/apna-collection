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
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  const ordersCollection = collection(db, 'orders');
  
  // Create a new order
  export const createOrder = async (orderData, userId) => {
    try {
      const docRef = await addDoc(ordersCollection, {
        ...orderData,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'Processing', // Initial status
        orderNumber: generateOrderNumber()
      });
      
      return {
        id: docRef.id,
        ...orderData,
        status: 'Processing'
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };
  
  // Generate a unique order number
  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `AC${year}${month}${day}${random}`;
  };
  
  // Get orders for a specific user
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
  
  // Get a specific order by ID
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
  
  // Update order status
  export const updateOrderStatus = async (orderId, status) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: status,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };
  
  // Get all orders (for admin)
  export const getAllOrders = async () => {
    try {
      const q = query(
        ordersCollection,
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  };
  
  // Get orders by status (for admin)
  export const getOrdersByStatus = async (status) => {
    try {
      const q = query(
        ordersCollection,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw error;
    }
  };