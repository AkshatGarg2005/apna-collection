// src/services/couponService.js
import { 
    collection, 
    addDoc, 
    updateDoc, 
    doc, 
    getDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp,
    Timestamp
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  /**
   * Creates a new coupon
   * @param {Object} couponData - Coupon data
   * @returns {Promise<Object>} - Result object with success status and message
   */
  export const createCoupon = async (couponData) => {
    try {
      // Check if a coupon with the same code already exists
      const codeExists = await checkCouponCodeExists(couponData.code);
      
      if (codeExists) {
        return {
          success: false,
          message: 'A coupon with this code already exists'
        };
      }
      
      // Convert date strings to Firestore timestamps
      const formattedData = {
        ...couponData,
        startDate: Timestamp.fromDate(new Date(couponData.startDate)),
        endDate: Timestamp.fromDate(new Date(couponData.endDate)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add coupon to Firestore
      const docRef = await addDoc(collection(db, 'coupons'), formattedData);
      
      return {
        success: true,
        message: 'Coupon created successfully',
        couponId: docRef.id
      };
    } catch (error) {
      console.error('Error creating coupon:', error);
      return {
        success: false,
        message: 'Failed to create coupon. Please try again.'
      };
    }
  };
  
  /**
   * Checks if a coupon code already exists
   * @param {string} code - Coupon code to check
   * @returns {Promise<boolean>} - Whether the code exists
   */
  export const checkCouponCodeExists = async (code) => {
    try {
      const couponsQuery = query(
        collection(db, 'coupons'),
        where('code', '==', code)
      );
      
      const couponsSnapshot = await getDocs(couponsQuery);
      
      return !couponsSnapshot.empty;
    } catch (error) {
      console.error('Error checking coupon code:', error);
      throw error;
    }
  };
  
  /**
   * Gets all coupons
   * @returns {Promise<Array>} - Array of coupon objects
   */
  export const getAllCoupons = async () => {
    try {
      const couponsQuery = query(
        collection(db, 'coupons'),
        orderBy('createdAt', 'desc')
      );
      
      const couponsSnapshot = await getDocs(couponsQuery);
      
      return couponsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting coupons:', error);
      throw error;
    }
  };
  
  /**
   * Gets active coupons
   * @returns {Promise<Array>} - Array of active coupon objects
   */
  export const getActiveCoupons = async () => {
    try {
      const now = Timestamp.now();
      
      const couponsQuery = query(
        collection(db, 'coupons'),
        where('active', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now)
      );
      
      const couponsSnapshot = await getDocs(couponsQuery);
      
      return couponsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active coupons:', error);
      throw error;
    }
  };
  
  /**
   * Gets a single coupon by ID
   * @param {string} couponId - Coupon ID
   * @returns {Promise<Object>} - Coupon object
   */
  export const getCouponById = async (couponId) => {
    try {
      const couponDoc = await getDoc(doc(db, 'coupons', couponId));
      
      if (!couponDoc.exists()) {
        throw new Error('Coupon not found');
      }
      
      return {
        id: couponDoc.id,
        ...couponDoc.data()
      };
    } catch (error) {
      console.error('Error getting coupon:', error);
      throw error;
    }
  };
  
  /**
   * Updates a coupon
   * @param {string} couponId - Coupon ID
   * @param {Object} couponData - Updated coupon data
   * @returns {Promise<Object>} - Result object with success status and message
   */
  export const updateCoupon = async (couponId, couponData) => {
    try {
      // Check if coupon exists
      const couponDoc = await getDoc(doc(db, 'coupons', couponId));
      
      if (!couponDoc.exists()) {
        return {
          success: false,
          message: 'Coupon not found'
        };
      }
      
      // If code is being changed, check if the new code already exists
      if (couponData.code !== couponDoc.data().code) {
        const codeExists = await checkCouponCodeExists(couponData.code);
        
        if (codeExists) {
          return {
            success: false,
            message: 'A coupon with this code already exists'
          };
        }
      }
      
      // Convert date strings to Firestore timestamps
      const formattedData = {
        ...couponData,
        startDate: couponData.startDate instanceof Date ? 
          Timestamp.fromDate(couponData.startDate) : 
          Timestamp.fromDate(new Date(couponData.startDate)),
        endDate: couponData.endDate instanceof Date ? 
          Timestamp.fromDate(couponData.endDate) : 
          Timestamp.fromDate(new Date(couponData.endDate)),
        updatedAt: serverTimestamp()
      };
      
      // Update coupon in Firestore
      await updateDoc(doc(db, 'coupons', couponId), formattedData);
      
      return {
        success: true,
        message: 'Coupon updated successfully'
      };
    } catch (error) {
      console.error('Error updating coupon:', error);
      return {
        success: false,
        message: 'Failed to update coupon. Please try again.'
      };
    }
  };
  
  /**
   * Deletes a coupon
   * @param {string} couponId - Coupon ID
   * @returns {Promise<Object>} - Result object with success status and message
   */
  export const deleteCoupon = async (couponId) => {
    try {
      // Check if coupon exists
      const couponDoc = await getDoc(doc(db, 'coupons', couponId));
      
      if (!couponDoc.exists()) {
        return {
          success: false,
          message: 'Coupon not found'
        };
      }
      
      // Delete coupon from Firestore
      await deleteDoc(doc(db, 'coupons', couponId));
      
      return {
        success: true,
        message: 'Coupon deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting coupon:', error);
      return {
        success: false,
        message: 'Failed to delete coupon. Please try again.'
      };
    }
  };
  
  /**
   * Toggles coupon active status
   * @param {string} couponId - Coupon ID
   * @returns {Promise<Object>} - Result object with success status and message
   */
  export const toggleCouponStatus = async (couponId) => {
    try {
      // Get current coupon data
      const couponDoc = await getDoc(doc(db, 'coupons', couponId));
      
      if (!couponDoc.exists()) {
        return {
          success: false,
          message: 'Coupon not found'
        };
      }
      
      const currentStatus = couponDoc.data().active;
      
      // Toggle active status
      await updateDoc(doc(db, 'coupons', couponId), {
        active: !currentStatus,
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        message: `Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      return {
        success: false,
        message: 'Failed to update coupon status. Please try again.'
      };
    }
  };
  
  /**
   * Validates a coupon code
   * @param {string} code - Coupon code
   * @param {number} orderAmount - Order amount
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Validation result
   */
  export const validateCoupon = async (code, orderAmount, userId) => {
    try {
      // Find coupon with the given code
      const couponsQuery = query(
        collection(db, 'coupons'),
        where('code', '==', code)
      );
      
      const couponsSnapshot = await getDocs(couponsQuery);
      
      if (couponsSnapshot.empty) {
        return {
          valid: false,
          message: 'Invalid coupon code'
        };
      }
      
      const couponDoc = couponsSnapshot.docs[0];
      const coupon = {
        id: couponDoc.id,
        ...couponDoc.data()
      };
      
      // Check if coupon is active
      if (!coupon.active) {
        return {
          valid: false,
          message: 'This coupon is not active'
        };
      }
      
      // Check expiration dates
      const now = new Date();
      const startDate = coupon.startDate.toDate();
      const endDate = coupon.endDate.toDate();
      
      if (now < startDate) {
        return {
          valid: false,
          message: `This coupon is valid from ${startDate.toLocaleDateString()}`
        };
      }
      
      if (now > endDate) {
        return {
          valid: false,
          message: 'This coupon has expired'
        };
      }
      
      // Check minimum order amount
      if (orderAmount < coupon.minOrder) {
        return {
          valid: false,
          message: `Minimum order amount of ${new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
          }).format(coupon.minOrder)} required`
        };
      }
      
      // Check usage limits (if applicable)
      if (coupon.usageLimit > 0) {
        // Get total coupon usage
        const usageQuery = query(
          collection(db, 'orders'),
          where('couponId', '==', coupon.id)
        );
        
        const usageSnapshot = await getDocs(usageQuery);
        const totalUsage = usageSnapshot.size;
        
        if (totalUsage >= coupon.usageLimit) {
          return {
            valid: false,
            message: 'This coupon has reached its usage limit'
          };
        }
      }
      
      // Check per user limit (if applicable)
      if (userId && coupon.perUserLimit > 0) {
        const userUsageQuery = query(
          collection(db, 'orders'),
          where('couponId', '==', coupon.id),
          where('userId', '==', userId)
        );
        
        const userUsageSnapshot = await getDocs(userUsageQuery);
        const userUsage = userUsageSnapshot.size;
        
        if (userUsage >= coupon.perUserLimit) {
          return {
            valid: false,
            message: `You've already used this coupon ${coupon.perUserLimit} time(s)`
          };
        }
      }
      
      // Calculate discount
      let discountAmount = 0;
      
      if (coupon.discountType === 'percentage') {
        discountAmount = (orderAmount * coupon.discount) / 100;
        
        // Apply maximum discount limit if set
        if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        // Fixed amount discount
        discountAmount = coupon.discount;
        
        // Don't allow discount to exceed order amount
        if (discountAmount > orderAmount) {
          discountAmount = orderAmount;
        }
      }
      
      return {
        valid: true,
        coupon,
        discountAmount,
        message: 'Coupon applied successfully'
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        message: 'Failed to validate coupon. Please try again.'
      };
    }
  };
  
  export default {
    createCoupon,
    getAllCoupons,
    getActiveCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    checkCouponCodeExists
  };