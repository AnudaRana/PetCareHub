import React, { useState, useEffect } from 'react';
import { getAllFeedbacks, getFeedbackById } from '../../../services/feedbackApi';
import '../styles/FeedbackManagement.css';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleFeedbackClick = async (id) => {
        try {
            setLoadingDetails(true);
            const data = await getFeedbackById(id);
            setSelectedFeedback(data);
        } catch (err) {
            console.error('Failed to fetch feedback details', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closePopup = () => {
        setSelectedFeedback(null);
    };

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const data = await getAllFeedbacks();
            setFeedbacks(data);
        } catch (err) {
            setError('Failed to load feedbacks.');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="feedback-stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= rating ? 'star filled' : 'star'}>★</span>
                ))}
            </div>
        );
    };

    return (
        <div className="feedback-management-container">
            <div className="feedback-header">
                <h2>Feedback Management</h2>
                <p>Review customer satisfaction and comments.</p>
            </div>

            {loading ? (
                <div className="loading-state">Loading feedbacks...</div>
            ) : error ? (
                <div className="error-box">{error}</div>
            ) : feedbacks.length === 0 ? (
                <div className="empty-state">No feedback has been submitted yet.</div>
            ) : (
                <div className="feedback-list">
                    {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="feedback-card clickable" onClick={() => handleFeedbackClick(feedback.id)}>
                            <div className="feedback-card-header">
                                {renderStars(feedback.rating)}
                                <span className="feedback-date">
                                    {new Date(feedback.createdDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="feedback-details list-details">
                                <p><strong>Appointment:</strong> {feedback.appointmentType} with {feedback.appointmentDoctor}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Popup Modal */}
            {selectedFeedback && (
                <div className="feedback-modal-overlay" onClick={closePopup}>
                    <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={closePopup}>&times;</button>
                        <h3>Feedback Summary</h3>
                        
                        <div className="modal-header-section">
                            {renderStars(selectedFeedback.rating)}
                            <span className="modal-date">{new Date(selectedFeedback.createdDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="modal-comment-section">
                            <h4>Comment</h4>
                            <p className="feedback-comment full-comment">
                                {selectedFeedback.comment ? `"${selectedFeedback.comment}"` : <i>No comment provided</i>}
                            </p>
                        </div>

                        <div className="modal-details-section">
                            <h4>Pet Owner Information</h4>
                            <p><strong>Name:</strong> {selectedFeedback.ownerName}</p>
                            
                            <h4 className="mt-3">Appointment Details</h4>
                            <p><strong>Type:</strong> {selectedFeedback.appointmentType}</p>
                            <p><strong>Doctor:</strong> {selectedFeedback.appointmentDoctor}</p>
                            <p><strong>Scheduled Date:</strong> {selectedFeedback.appointmentDate}</p>
                        </div>
                    </div>
                </div>
            )}

            {loadingDetails && (
                <div className="feedback-modal-overlay">
                    <div className="loading-state modal-loading">Loading details...</div>
                </div>
            )}
        </div>
    );
};

export default FeedbackManagement;
