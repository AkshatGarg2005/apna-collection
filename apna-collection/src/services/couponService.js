// src/services/couponService.js
import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Validates a coupon code
 * @param {string} code - Coupon code
 * @param {number} orderAmount - Order amount
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Validation result
 */
export const validateCoupon = async (code, orderAmount, userId = null) => {
  try {
    // Standardize coupon code (uppercase)
    const formattedCode = code.trim().toUpperCase();
    
    // Find coupon with the given code
    const couponsQuery = query(
      collection(db, 'coupons'),
      where('code', '==', formattedCode)
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
    
    // Handle both Timestamp objects and regular dates
    let startDate, endDate;
    
    if (coupon.startDate instanceof Timestamp || 
        (coupon.startDate && typeof coupon.startDate.toDate === 'function')) {
      startDate = coupon.startDate.toDate();
    } else {
      startDate = new Date(coupon.startDate);
    }
    
    if (coupon.endDate instanceof Timestamp || 
        (coupon.endDate && typeof coupon.endDate.toDate === 'function')) {
      endDate = coupon.endDate.toDate();
    } else {
      endDate = new Date(coupon.endDate);
    }
    
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
        message: `Minimum order amount of ₹${coupon.minOrder.toLocaleString()} required`
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
    
    // Check per user limit (if applicable and userId provided)
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
      discountAmount = Math.floor((orderAmount * coupon.discount) / 100);
      
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

/**
 * Get all available/active coupons for display
 * @returns {Promise<Array>} Array of active coupons
 */
export const getAvailableCoupons = async () => {
  try {
    const now = new Date();
    const nowTimestamp = Timestamp.fromDate(now);
    
    const couponsQuery = query(
      collection(db, 'coupons'),
      where('active', '==', true),
      where('startDate', '<=', nowTimestamp),
      where('endDate', '>=', nowTimestamp)
    );
    
    const couponsSnapshot = await getDocs(couponsQuery);
    
    return couponsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting available coupons:', error);
    return [];
  }
};

export default {
  validateCoupon,
  getAvailableCoupons
};