// src/services/reviewService.js
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    orderBy, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  /**
   * Get all reviews for a specific product
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} - Array of review objects
   */
  export const getProductReviews = async (productId) => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return reviews;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  };
  
  /**
   * Check if the user has purchased the product
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} - True if the user has purchased the product
   */
  export const hasUserPurchasedProduct = async (userId, productId) => {
    try {
      // Query orders to find if the user has purchased this product
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        where('status', '==', 'Delivered')
      );
      
      const snapshot = await getDocs(ordersQuery);
      
      // Check if any of the delivered orders contain the product
      for (const orderDoc of snapshot.docs) {
        const order = orderDoc.data();
        
        // Check if the order items include the product
        if (order.items && Array.isArray(order.items)) {
          const productFound = order.items.some(item => item.id === productId);
          if (productFound) return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking purchase history:', error);
      return false;
    }
  };
  
  /**
   * Check if the user has already reviewed the product
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<{hasReviewed: boolean, reviewId: string|null, reviewData: object|null}>}
   */
  export const hasUserReviewedProduct = async (userId, productId) => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        where('productId', '==', productId)
      );
      
      const snapshot = await getDocs(reviewsQuery);
      
      if (snapshot.empty) {
        return { hasReviewed: false, reviewId: null, reviewData: null };
      }
      
      const reviewDoc = snapshot.docs[0];
      return { 
        hasReviewed: true, 
        reviewId: reviewDoc.id, 
        reviewData: reviewDoc.data() 
      };
    } catch (error) {
      console.error('Error checking if user has reviewed:', error);
      return { hasReviewed: false, reviewId: null, reviewData: null };
    }
  };
  
  /**
   * Add a new review
   * @param {object} reviewData - Review data object
   * @returns {Promise<{success: boolean, id: string|null, error: string|null}>}
   */
  export const addReview = async (reviewData) => {
    try {
      // First check if the user has already reviewed this product
      const { hasReviewed } = await hasUserReviewedProduct(reviewData.userId, reviewData.productId);
      
      if (hasReviewed) {
        return { 
          success: false, 
          id: null, 
          error: 'You have already reviewed this product' 
        };
      }
      
      // Add timestamp to review data
      const reviewWithTimestamp = {
        ...reviewData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add the review to Firestore
      const docRef = await addDoc(collection(db, 'reviews'), reviewWithTimestamp);
      
      return { success: true, id: docRef.id, error: null };
    } catch (error) {
      console.error('Error adding review:', error);
      return { success: false, id: null, error: error.message };
    }
  };
  
  /**
   * Update an existing review
   * @param {string} reviewId - Review ID
   * @param {object} reviewData - Updated review data
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  export const updateReview = async (reviewId, reviewData, userId) => {
    try {
      // First get the review to verify ownership
      const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
      
      if (!reviewDoc.exists()) {
        return { success: false, error: 'Review not found' };
      }
      
      const review = reviewDoc.data();
      
      // Verify that the user owns this review
      if (review.userId !== userId) {
        return { success: false, error: 'You can only edit your own reviews' };
      }
      
      // Update the review
      await updateDoc(doc(db, 'reviews', reviewId), {
        ...reviewData,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating review:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Delete a review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  export const deleteReview = async (reviewId, userId) => {
    try {
      // First get the review to verify ownership
      const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
      
      if (!reviewDoc.exists()) {
        return { success: false, error: 'Review not found' };
      }
      
      const review = reviewDoc.data();
      
      // Verify that the user owns this review
      if (review.userId !== userId) {
        return { success: false, error: 'You can only delete your own reviews' };
      }
      
      // Delete the review
      await deleteDoc(doc(db, 'reviews', reviewId));
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Calculate average rating for a product
   * @param {string} productId - Product ID
   * @returns {Promise<{averageRating: number, totalReviews: number}>}
   */
  export const calculateProductRating = async (productId) => {
    try {
      const reviews = await getProductReviews(productId);
      
      if (reviews.length === 0) {
        return { averageRating: 0, totalReviews: 0 };
      }
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      return { 
        averageRating: parseFloat(averageRating.toFixed(1)), 
        totalReviews: reviews.length 
      };
    } catch (error) {
      console.error('Error calculating product rating:', error);
      return { averageRating: 0, totalReviews: 0 };
    }
  };
  
  /**
   * Get rating distribution for a product (how many 5-star, 4-star, etc.)
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} - Array of rating distribution objects
   */
  export const getRatingDistribution = async (productId) => {
    try {
      const reviews = await getProductReviews(productId);
      
      if (reviews.length === 0) {
        return [
          { rating: 5, count: 0, percentage: 0 },
          { rating: 4, count: 0, percentage: 0 },
          { rating: 3, count: 0, percentage: 0 },
          { rating: 2, count: 0, percentage: 0 },
          { rating: 1, count: 0, percentage: 0 }
        ];
      }
      
      // Count occurrences of each rating
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      reviews.forEach(review => {
        const rating = Math.floor(review.rating);
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating]++;
        }
      });
      
      // Calculate percentages
      const distribution = Object.entries(ratingCounts).map(([rating, count]) => {
        const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
        return {
          rating: parseInt(rating),
          count,
          percentage
        };
      });
      
      // Sort by rating (highest first)
      return distribution.sort((a, b) => b.rating - a.rating);
    } catch (error) {
      console.error('Error getting rating distribution:', error);
      return [];
    }
  };