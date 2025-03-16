// src/services/inventory.js
import { 
    doc, 
    getDoc, 
    updateDoc, 
    increment, 
    runTransaction
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  /**
   * Reduces the inventory stock when an order is placed
   * @param {Array} items - Array of order items with id and quantity
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  export const reduceInventory = async (items) => {
    try {
      // Use transaction to ensure consistency
      await runTransaction(db, async (transaction) => {
        for (const item of items) {
          if (!item.id || !item.quantity) continue;
  
          const productRef = doc(db, 'products', item.id);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) {
            console.error(`Product ${item.id} does not exist`);
            continue;
          }
          
          const currentStock = productDoc.data().stock || 0;
          
          // Check if enough stock is available
          if (currentStock < item.quantity) {
            throw new Error(`Not enough stock for product ${item.id}. Requested: ${item.quantity}, Available: ${currentStock}`);
          }
          
          // Update the stock
          transaction.update(productRef, {
            stock: currentStock - item.quantity
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error reducing inventory:', error);
      return false;
    }
  };
  
  /**
   * Checks product availability and returns details
   * @param {string} productId - Product ID
   * @param {number} quantity - Requested quantity
   * @returns {Promise<{available: boolean, currentStock: number, product: Object}>}
   */
  export const checkProductAvailability = async (productId, quantity = 1) => {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        return {
          available: false,
          currentStock: 0,
          product: null,
          message: 'Product not found'
        };
      }
      
      const product = productDoc.data();
      const currentStock = product.stock || 0;
      
      return {
        available: currentStock >= quantity,
        currentStock,
        product: {
          id: productDoc.id,
          ...product
        },
        message: currentStock >= quantity 
          ? 'Product available' 
          : `Only ${currentStock} items available`
      };
    } catch (error) {
      console.error('Error checking product availability:', error);
      return {
        available: false,
        currentStock: 0,
        product: null,
        message: 'Error checking availability'
      };
    }
  };
  
  export default {
    reduceInventory,
    checkProductAvailability
  };