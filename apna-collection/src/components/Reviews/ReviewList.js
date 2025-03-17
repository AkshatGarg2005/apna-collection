// src/components/Reviews/ReviewList.js
import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaUserCircle, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AddReview from './AddReview';
import './ReviewList.css';

const ReviewList = ({ 
  reviews, 
  ratingDistribution, 
  averageRating, 
  productId, 
  productName, 
  onReviewChange, 
  canUserReview 
}) => {
  const { currentUser } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const handleWriteReview = () => {
    setEditingReview(null);
    setShowReviewForm(true);
  };
  
  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };
  
  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };
  
  const handleReviewAdded = () => {
    if (onReviewChange) {
      onReviewChange();
    }
  };
  
  // Find if the current user has written a review
  const userReview = currentUser ? 
    reviews.find(review => review.userId === currentUser.uid) : null;
  
  return (
    <div className="review-list-container">
      <div className="review-header">
        <div className="review-total">
          <div className="review-average">{averageRating}</div>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= Math.floor(averageRating) ? (
                  <FaStar />
                ) : star <= averageRating ? (
                  <FaStar className="half-star" />
                ) : (
                  <FaRegStar />
                )}
              </span>
            ))}
          </div>
          <div>Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
        </div>
        
        <div className="review-distribution">
          {ratingDistribution.map((dist) => (
            <div className="review-bar" key={dist.rating}>
              <div className="review-stars">{dist.rating} <FaStar /></div>
              <div className="review-progress">
                <div 
                  className="review-progress-fill" 
                  style={{ width: `${dist.percentage}%` }}
                ></div>
              </div>
              <div className="review-count">{dist.count}</div>
            </div>
          ))}
        </div>
        
        {currentUser && (
          <div className="review-button-container">
            {userReview ? (
              <button 
                className="edit-review-btn"
                onClick={() => handleEditReview(userReview)}
              >
                <FaEdit /> Edit Your Review
              </button>
            ) : canUserReview ? (
              <button 
                className="write-review-btn"
                onClick={handleWriteReview}
              >
                Write a Review
              </button>
            ) : (
              <div className="purchase-required-message">
                Purchase this product to write a review
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="review-form-overlay">
          <AddReview 
            productId={productId}
            productName={productName}
            onReviewAdded={handleReviewAdded}
            onClose={handleCloseReviewForm}
            isEdit={!!editingReview}
            existingReview={editingReview}
          />
        </div>
      )}
      
      <div className="review-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div className="review-item" key={review.id}>
              <div className="review-user">
                <div className="review-avatar">
                  {review.userPhotoURL ? (
                    <img src={review.userPhotoURL} alt={review.userName} />
                  ) : (
                    <FaUserCircle />
                  )}
                </div>
                <div className="review-user-info">
                  <div className="review-user-name">{review.userName}</div>
                  <div className="review-date">{formatDate(review.createdAt)}</div>
                </div>
                {currentUser && review.userId === currentUser.uid && (
                  <button 
                    className="edit-own-review-btn"
                    onClick={() => handleEditReview(review)}
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
              <div className="review-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= review.rating ? <FaStar /> : <FaRegStar />}
                  </span>
                ))}
              </div>
              <div className="review-text">{review.text}</div>
              
              {review.photos && review.photos.length > 0 && (
                <div className="review-photos">
                  {review.photos.map((photo, photoIndex) => (
                    <div className="review-photo" key={photoIndex}>
                      <img src={photo} alt="Customer Photo" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-reviews-message">
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;