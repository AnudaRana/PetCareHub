import React, { useState, useEffect } from 'react';
import { getAllFeedbacks, getFeedbackById } from '../../../services/feedbackApi';
import StarRating from '../components/StarRating';
import '../styles/FeedbackManagement.css';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

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
        setReplyText('');
        setSuccessMsg('');
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

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setSubmittingReply(true);
            const { addStaffReply } = await import('../../../services/feedbackApi');
            const updated = await addStaffReply(selectedFeedback.id, replyText.trim());
            setSelectedFeedback(updated);
            setSuccessMsg('Reply added successfully!');
            fetchFeedbacks(); // Refresh list
        } catch (err) {
            console.error('Failed to add reply', err);
        } finally {
            setSubmittingReply(false);
        }
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
                                <StarRating rating={feedback.rating} showText={true} />
                                <span className="feedback-date">
                                    {new Date(feedback.createdDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="feedback-comment card-comment">
                                {feedback.comment ? `"${feedback.comment}"` : <i>No comment provided</i>}
                            </div>
                            
                            {feedback.comment && feedback.comment.length > 100 && (
                                <button 
                                    className="read-more-link" 
                                    onClick={() => handleFeedbackClick(feedback.id)}
                                >
                                    Read More
                                </button>
                            )}

                            <div className="feedback-details list-details">
                                {feedback.feedbackType === 'APPOINTMENT' ? (
                                    <p><strong>Appointment:</strong> {feedback.appointmentType} with {feedback.appointmentDoctor}</p>
                                ) : feedback.feedbackType === 'PRODUCT' ? (
                                    <p><strong>Product:</strong> {feedback.productName || 'Pet Product'}</p>
                                ) : (
                                    <p><strong>General Review</strong></p>
                                )}
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
                            {selectedFeedback.isVerified && <span className="verified-pill ml-2">Verified</span>}
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
                            
                            <div className="mt-3">
                                {selectedFeedback.feedbackType === 'APPOINTMENT' ? (
                                    <>
                                        <h4>Appointment Details</h4>
                                        <p><strong>Type:</strong> {selectedFeedback.appointmentType}</p>
                                        <p><strong>Doctor:</strong> {selectedFeedback.appointmentDoctor}</p>
                                        <p><strong>Scheduled Date:</strong> {selectedFeedback.appointmentDate}</p>
                                    </>
                                ) : selectedFeedback.feedbackType === 'PRODUCT' ? (
                                    <>
                                        <h4>Product Details</h4>
                                        <p><strong>Product Name:</strong> {selectedFeedback.productName || 'N/A'}</p>
                                        <p><strong>Product ID:</strong> {selectedFeedback.productId}</p>
                                    </>
                                ) : (
                                    <>
                                        <h4>General Feedback</h4>
                                        <p>Overall clinic experience</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="modal-reply-section mt-4">
                            <h4>{selectedFeedback.staffReply ? 'Staff Reply' : 'Add Reply'}</h4>
                            {selectedFeedback.staffReply ? (
                                <p className="staff-reply-box">{selectedFeedback.staffReply}</p>
                            ) : (
                                <form onSubmit={handleReplySubmit}>
                                    <textarea 
                                        className="feedback-form__textarea w-full"
                                        placeholder="Type your response here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        rows="3"
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-teal mt-2"
                                        disabled={submittingReply}
                                    >
                                        {submittingReply ? 'Sending...' : 'Send Reply'}
                                    </button>
                                    {successMsg && <span className="ml-3 text-green-600 font-semibold">{successMsg}</span>}
                                </form>
                            )}
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
