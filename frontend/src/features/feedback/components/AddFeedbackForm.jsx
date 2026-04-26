import React, { useState } from 'react';
import { submitFeedback } from '../../../services/feedbackApi';
import StarRating from './StarRating';
import '../styles/AddFeedbackForm.css';

const AddFeedbackForm = ({ 
  appointment = null, 
  product = null,
  onClose, 
  onSubmitSuccess, 
  ownerId,
  feedbackType = "APPOINTMENT",
  isVerified = false
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue) => {
    setHoveredRating(starValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const feedbackData = {
        rating,
        comment: comment.trim(),
        ownerId,
        feedbackType,
        isVerified,
        appointmentId: appointment?.id || null,
        productId: product?.productId || null
      };

      await submitFeedback(feedbackData);
      onSubmitSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (feedbackType === "PRODUCT") return `Review ${product?.name}`;
    if (feedbackType === "APPOINTMENT") return `Rate Appointment`;
    return "Add a Review";
  };

  return (
    <div className="feedback-form-container" onClick={onClose}>
      <div className="feedback-form" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-form__header">
          <h3>{getTitle()}</h3>
          <button
            type="button"
            className="feedback-form__close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form__body">
          {/* Context Info */}
          {feedbackType === "APPOINTMENT" && appointment && (
            <div className="feedback-form__appointment-info">
              <p><strong>Pet:</strong> {appointment.pet?.name || appointment.petName}</p>
              <p><strong>Type:</strong> {appointment.appointmentType}</p>
              <p><strong>Doctor:</strong> {appointment.doctor}</p>
              <p><strong>Date:</strong> {appointment.date}</p>
            </div>
          )}

          {feedbackType === "PRODUCT" && product && (
            <div className="feedback-form__appointment-info">
              <p><strong>Product:</strong> {product.name}</p>
              <p><strong>Category:</strong> {product.category}</p>
            </div>
          )}

          {/* Rating Section */}
          <div className="feedback-form__section">
            <label className="feedback-form__label">
              Rate Your Experience <span className="required">*</span>
              {isVerified && <span className="verified-pill-inline ml-2">Verified</span>}
            </label>
            <div className="rating-selector-group">
                <StarRating rating={rating} editable={false} showText={true} />
                <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="0.25" 
                    value={rating || 5} 
                    onChange={(e) => setRating(parseFloat(e.target.value))}
                    className="rating-slider"
                />
                <p className="slider-hint">Slide to adjust rating (supports quarter stars)</p>
            </div>
          </div>

          {/* Comment Section */}
          <div className="feedback-form__section">
            <label className="feedback-form__label">
              Comments
            </label>
            <textarea
              className="feedback-form__textarea"
              rows="5"
              placeholder="Share your experience... (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
            />
            <div className="feedback-form__char-count">
              {comment.length}/2000 characters
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="feedback-form__error">{error}</div>}

          {/* Buttons */}
          <div className="feedback-form__footer">
            <button
              type="button"
              className="btn btn-white"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-teal"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFeedbackForm;
