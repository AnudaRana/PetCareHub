import React, { useState, useEffect } from 'react';
import { getAllFeedbacks } from '../../../services/feedbackApi';
import '../styles/FeedbackManagement.css';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

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
                        <div key={feedback.id} className="feedback-card">
                            <div className="feedback-card-header">
                                {renderStars(feedback.rating)}
                                <span className="feedback-date">
                                    {new Date(feedback.createdDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="feedback-comment">
                                {feedback.comment ? `"${feedback.comment}"` : <i>No comment provided</i>}
                            </div>
                            <div className="feedback-details">
                                <p><strong>Owner:</strong> {feedback.ownerName}</p>
                                <p><strong>Appointment:</strong> {feedback.appointmentType} with {feedback.appointmentDoctor}</p>
                                <p><strong>Date:</strong> {feedback.appointmentDate}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackManagement;
