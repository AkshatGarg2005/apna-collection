// src/components/Reviews/AddReview.js
import React, { useState, useRef, useEffect } from 'react';
import { FaStar, FaRegStar, FaCamera, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { 
  addReview, 
  updateReview, 
  deleteReview, 
  hasUserReviewedProduct 
} from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import './AddReview.css';

const AddReview = ({ productId, productName, onReviewAdded, onClose, isEdit = false, existingReview = null }) => {
  const { currentUser, userProfile } = useAuth();
  const [rating, setRating] = useState(isEdit && existingReview ? existingReview.rating : 0);
  const [reviewText, setReviewText] = useState(isEdit && existingReview ? existingReview.text : '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [photos, setPhotos] = useState(isEdit && existingReview && existingReview.photos ? existingReview.photos : []);
  const [photoUploads, setPhotoUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  
  const handleRatingClick = (value) => {
    setRating(value);
  };
  
  const handleRatingHover = (value) => {
    setHoveredRating(value);
  };
  
  const handleRatingLeave = () => {
    setHoveredRating(0);
  };
  
  const handleTextChange = (e) => {
    setReviewText(e.target.value);
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Only allow up to 3 photos total
    if (photos.length + photoUploads.length + files.length > 3) {
      setError('You can upload a maximum of 3 photos');
      return;
    }
    
    // Create preview URLs for the selected files
    const newUploads = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPhotoUploads([...photoUploads, ...newUploads]);
    setError('');
  };
  
  const handleRemovePhoto = (index) => {
    const newUploads = [...photoUploads];
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newUploads[index].preview);
    
    newUploads.splice(index, 1);
    setPhotoUploads(newUploads);
  };
  
  const handleRemoveExistingPhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to leave a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (reviewText.trim() === '') {
      setError('Please write a review');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Process photo uploads - in a real implementation, you'd upload these to your storage
      // For this example, we'll just use the preview URLs as placeholders
      const photoUrls = photoUploads.map(upload => upload.preview);
      
      // Combine with existing photos in case of edit
      const allPhotos = [...photos, ...photoUrls];
      
      const reviewData = {
        userId: currentUser.uid,
        productId,
        rating,
        text: reviewText,
        photos: allPhotos,
        userName: userProfile?.displayName || currentUser.displayName || 'Anonymous User',
        userPhotoURL: userProfile?.photoURL || currentUser.photoURL || null
      };
      
      let result;
      
      if (isEdit && existingReview) {
        // Update existing review
        result = await updateReview(existingReview.id, reviewData, currentUser.uid);
      } else {
        // Add new review
        result = await addReview(reviewData);
      }
      
      if (result.success) {
        setSuccess(isEdit ? 'Review updated successfully!' : 'Review added successfully!');
        
        // Notify parent component
        if (onReviewAdded) {
          onReviewAdded();
        }
        
        // Close the form after a short delay
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('An error occurred while submitting your review');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await deleteReview(existingReview.id, currentUser.uid);
      
      if (result.success) {
        setSuccess('Review deleted successfully!');
        
        // Notify parent component
        if (onReviewAdded) {
          onReviewAdded();
        }
        
        // Close the form after a short delay
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('An error occurred while deleting your review');
    } finally {
      setLoading(false);
    }
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      photoUploads.forEach(upload => {
        URL.revokeObjectURL(upload.preview);
      });
    };
  }, [photoUploads]);
  
  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>{isEdit ? 'Edit Your Review' : `Write a Review for ${productName}`}</h3>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      {error && <div className="review-error-message">{error}</div>}
      {success && <div className="review-success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-selector">
          <p>Your Rating*</p>
          <div className="stars" onMouseLeave={handleRatingLeave}>
            {[1, 2, 3, 4, 5].map((value) => (
              <span 
                key={value} 
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => handleRatingHover(value)}
              >
                {value <= (hoveredRating || rating) ? <FaStar /> : <FaRegStar />}
              </span>
            ))}
          </div>
        </div>
        
        <div className="review-text-container">
          <label>Your Review*</label>
          <textarea 
            value={reviewText}
            onChange={handleTextChange}
            placeholder="Share your experience with this product..."
            rows="5"
            required
          />
        </div>
        
        <div className="photo-upload-container">
          <label>Add Photos (Optional)</label>
          <p className="photo-limit-info">Up to 3 photos</p>
          
          <div className="photos-preview">
            {/* Existing photos (in edit mode) */}
            {photos.map((photo, index) => (
              <div key={`existing-${index}`} className="photo-preview-item">
                <img src={photo} alt={`Review ${index + 1}`} />
                <button 
                  type="button" 
                  className="remove-photo-btn"
                  onClick={() => handleRemoveExistingPhoto(index)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            
            {/* New photo uploads */}
            {photoUploads.map((upload, index) => (
              <div key={`upload-${index}`} className="photo-preview-item">
                <img src={upload.preview} alt={`Upload ${index + 1}`} />
                <button 
                  type="button" 
                  className="remove-photo-btn"
                  onClick={() => handleRemovePhoto(index)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            
            {/* Upload button (only show if less than 3 photos) */}
            {photos.length + photoUploads.length < 3 && (
              <div className="photo-upload-button" onClick={() => fileInputRef.current.click()}>
                <FaCamera />
                <span>Add Photo</span>
              </div>
            )}
          </div>
          
          <input 
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="review-form-actions">
          {isEdit && existingReview && (
            <button 
              type="button" 
              className="delete-review-btn"
              onClick={handleDelete}
              disabled={loading}
            >
              <FaTrash /> Delete Review
            </button>
          )}
          
          <button 
            type="submit" 
            className="submit-review-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : isEdit ? <><FaEdit /> Update Review</> : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReview;