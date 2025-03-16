import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    arrayUnion, 
    arrayRemove, 
    updateDoc,
    onSnapshot
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  import { getProductById } from './products';
  
  // Add product to user's wishlist
  export const addToWishlist = async (userId, productId) => {
    try {
      const userWishlistRef = doc(db, 'wishlists', userId);
      const docSnap = await getDoc(userWishlistRef);
      
      if (docSnap.exists()) {
        // Update existing wishlist
        await updateDoc(userWishlistRef, {
          products: arrayUnion(productId),
          updatedAt: new Date()
        });
      } else {
        // Create new wishlist
        await setDoc(userWishlistRef, {
          userId,
          products: [productId],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };
  
  // Remove product from user's wishlist
  export const removeFromWishlist = async (userId, productId) => {
    try {
      const userWishlistRef = doc(db, 'wishlists', userId);
      
      await updateDoc(userWishlistRef, {
        products: arrayRemove(productId),
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };
  
  // Clear all products from user's wishlist
  export const clearWishlist = async (userId) => {
    try {
      const userWishlistRef = doc(db, 'wishlists', userId);
      
      await updateDoc(userWishlistRef, {
        products: [],
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  };
  
  // Check if a product is in the user's wishlist
  export const isProductInWishlist = async (userId, productId) => {
    try {
      const userWishlistRef = doc(db, 'wishlists', userId);
      const docSnap = await getDoc(userWishlistRef);
      
      if (docSnap.exists()) {
        const wishlistData = docSnap.data();
        return wishlistData.products.includes(productId);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      throw error;
    }
  };
  
  // Get user's wishlist with full product details
  export const getUserWishlist = async (userId) => {
    try {
      const userWishlistRef = doc(db, 'wishlists', userId);
      const docSnap = await getDoc(userWishlistRef);
      
      if (!docSnap.exists()) {
        return [];
      }
      
      const wishlistData = docSnap.data();
      const productIds = wishlistData.products || [];
      
      // Fetch full product details for each product in the wishlist
      const productPromises = productIds.map(productId => getProductById(productId));
      const products = await Promise.all(productPromises);
      
      // Filter out any null results (products that might have been deleted)
      return products.filter(product => product !== null);
    } catch (error) {
      console.error('Error getting wishlist:', error);
      throw error;
    }
  };
  
  // Get number of items in user's wishlist
  export const getWishlistCount = async (userId) => {
    try {
      const userWishlistRef = doc(db, 'wishlists', userId);
      const docSnap = await getDoc(userWishlistRef);
      
      if (docSnap.exists()) {
        const wishlistData = docSnap.data();
        return wishlistData.products?.length || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      throw error;
    }
  };
  
  // Subscribe to wishlist changes (for real-time updates)
  export const subscribeToWishlist = (userId, callback) => {
    try {
      const userWishlistRef = doc(db, 'wishlists', userId);
      
      // Set up onSnapshot listener
      const unsubscribe = onSnapshot(userWishlistRef, (docSnap) => {
        if (docSnap.exists()) {
          const wishlistData = docSnap.data();
          callback(wishlistData.products || []);
        } else {
          callback([]);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to wishlist:', error);
      throw error;
    }
  };
  
  // Toggle product in wishlist (add if not present, remove if present)
  export const toggleWishlistItem = async (userId, productId) => {
    try {
      const isInWishlist = await isProductInWishlist(userId, productId);
      
      if (isInWishlist) {
        await removeFromWishlist(userId, productId);
        return false; // Indicates item was removed
      } else {
        await addToWishlist(userId, productId);
        return true; // Indicates item was added
      }
    } catch (error) {
      console.error('Error toggling wishlist item:', error);
      throw error;
    }
  };