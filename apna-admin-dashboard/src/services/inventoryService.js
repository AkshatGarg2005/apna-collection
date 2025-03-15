// src/services/inventoryService.js
import { 
    doc, 
    getDoc, 
    updateDoc, 
    increment, 
    runTransaction, 
    collection, 
    getDocs, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  /**
   * Reduces the inventory stock when an order is placed
   * @param {Array} items - Array of order items with productId and quantity
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  export const reduceInventory = async (items) => {
    try {
      // Use transaction to ensure consistency
      await runTransaction(db, async (transaction) => {
        for (const item of items) {
          if (!item.productId || !item.quantity) continue;
  
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) {
            console.error(`Product ${item.productId} does not exist`);
            continue;
          }
          
          const currentStock = productDoc.data().stock || 0;
          
          // Check if enough stock is available
          if (currentStock < item.quantity) {
            throw new Error(`Not enough stock for product ${item.productId}. Requested: ${item.quantity}, Available: ${currentStock}`);
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
   * Restores inventory when an order is cancelled
   * @param {Array} items - Array of order items with productId and quantity
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  export const restoreInventory = async (items) => {
    try {
      // Use transaction to ensure consistency
      await runTransaction(db, async (transaction) => {
        for (const item of items) {
          if (!item.productId || !item.quantity) continue;
  
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);
          
          if (!productDoc.exists()) {
            console.error(`Product ${item.productId} does not exist`);
            continue;
          }
          
          const currentStock = productDoc.data().stock || 0;
          
          // Update the stock
          transaction.update(productRef, {
            stock: currentStock + item.quantity
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error restoring inventory:', error);
      return false;
    }
  };
  
  /**
   * Checks if all items in an order have sufficient stock
   * @param {Array} items - Array of order items with productId and quantity
   * @returns {Promise<{ success: boolean, message: string, missingItems: Array }>}
   */
  export const checkInventory = async (items) => {
    try {
      const missingItems = [];
      
      for (const item of items) {
        if (!item.productId || !item.quantity) continue;
        
        const productRef = doc(db, 'products', item.productId);
        const productDoc = await getDoc(productRef);
        
        if (!productDoc.exists()) {
          missingItems.push({
            productId: item.productId,
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
            productId: item.productId,
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
  
  /**
   * Gets low stock products (below threshold)
   * @param {number} threshold - Stock threshold to consider as low
   * @returns {Promise<Array>} - Array of products with low stock
   */
  export const getLowStockProducts = async (threshold = 10) => {
    try {
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      
      const lowStockProducts = productsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(product => (product.stock || 0) <= threshold);
      
      return lowStockProducts;
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return [];
    }
  };
  
  /**
   * Updates a product's stock level
   * @param {string} productId - Product ID
   * @param {number} newStock - New stock level
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  export const updateProductStock = async (productId, newStock) => {
    try {
      if (newStock < 0) {
        throw new Error('Stock cannot be negative');
      }
      
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
  };
  
  export default {
    reduceInventory,
    restoreInventory,
    checkInventory,
    getLowStockProducts,
    updateProductStock
  };