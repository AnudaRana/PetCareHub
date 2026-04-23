import React, { useState } from 'react';
import { submitFeedback } from '../../../services/feedbackApi';
import '../styles/AddFeedbackForm.css';

const AddFeedbackForm = ({ appointment, onClose, onSubmitSuccess, ownerId }) => {
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
        appointmentId: appointment.id,
        ownerId
      };

      await submitFeedback(feedbackData);
      onSubmitSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <div className="feedback-form">
        <div className="feedback-form__header">
          <h3>Add Feedback</h3>
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
          {/* Appointment Info */}
          <div className="feedback-form__appointment-info">
            <p><strong>Pet:</strong> {appointment.pet?.name || appointment.petName}</p>
            <p><strong>Type:</strong> {appointment.appointmentType}</p>
            <p><strong>Doctor:</strong> {appointment.doctor}</p>
            <p><strong>Date:</strong> {appointment.date}</p>
          </div>

          {/* Rating Section */}
          <div className="feedback-form__section">
            <label className="feedback-form__label">
              Rate Your Experience <span className="required">*</span>
            </label>
            <div className="feedback-form__stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-button ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </button>
              ))}
              {rating > 0 && <span className="rating-text">{rating} out of 5</span>}
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
