// src/services/inventory.js
import { 
    doc, 
    getDoc, 
    updateDoc, 
    runTransaction 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  /**
   * Reduces inventory when an order is placed
   * Matches the admin-side inventory reduction logic
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
   * Checks inventory levels for cart items before checkout
   * @param {Array} items - Cart items to check
   * @returns {Promise<Object>} - Result object with status and any issues
   */
  export const checkCartInventory = async (items) => {
    try {
      const issues = [];
      
      for (const item of items) {
        if (!item.id) continue;
        
        const productRef = doc(db, 'products', item.id);
        const productDoc = await getDoc(productRef);
        
        if (!productDoc.exists()) {
          issues.push({
            id: item.id,
            name: item.name || 'Unknown product',
            issue: 'Product no longer available',
            requested: item.quantity,
            available: 0
          });
          continue;
        }
        
        const product = productDoc.data();
        const currentStock = product.stock || 0;
        
        // Check if the product is in stock
        if (currentStock <= 0) {
          issues.push({
            id: item.id,
            name: product.name,
            issue: 'Out of stock',
            requested: item.quantity,
            available: 0
          });
        }
        // Check if enough quantity is available
        else if (currentStock < item.quantity) {
          issues.push({
            id: item.id,
            name: product.name,
            issue: 'Insufficient stock',
            requested: item.quantity,
            available: currentStock
          });
        }
      }
      
      return {
        success: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('Error checking cart inventory:', error);
      return {
        success: false,
        issues: [{ issue: 'Error checking inventory: ' + error.message }]
      };
    }
  };
  
  /**
   * Validates all items in a cart to ensure they exist and have sufficient stock
   * @param {Array} cartItems - Cart items to validate
   * @returns {Promise<Object>} - Result with valid items and any issues
   */
  export const validateCartItems = async (cartItems) => {
    try {
      const validatedItems = [];
      const invalidItems = [];
      
      for (const item of cartItems) {
        try {
          const productRef = doc(db, 'products', item.id);
          const productSnap = await getDoc(productRef);
          
          if (!productSnap.exists()) {
            invalidItems.push({
              ...item,
              issue: 'Product no longer exists'
            });
            continue;
          }
          
          const product = productSnap.data();
          
          // Check if product is in stock
          if (product.stock <= 0) {
            invalidItems.push({
              ...item,
              issue: 'Product is out of stock'
            });
            continue;
          }
          
          // Check if requested quantity is available
          if (product.stock < item.quantity) {
            invalidItems.push({
              ...item,
              issue: `Only ${product.stock} items available`,
              availableStock: product.stock
            });
            continue;
          }
          
          // If everything is valid, add to validated items with current price
          validatedItems.push({
            ...item,
            price: product.price, // Use current price from database
            productId: item.id,
            name: product.name,
            image: product.image
          });
        } catch (error) {
          console.error(`Error validating item ${item.id}:`, error);
          invalidItems.push({
            ...item,
            issue: 'Error validating product'
          });
        }
      }
      
      return {
        valid: validatedItems,
        invalid: invalidItems,
        isValid: invalidItems.length === 0 && validatedItems.length > 0
      };
    } catch (error) {
      console.error('Error validating cart items:', error);
      throw error;
    }
  };