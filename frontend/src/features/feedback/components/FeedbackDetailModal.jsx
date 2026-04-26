import React from 'react';
import StarRating from './StarRating';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';

const FeedbackDetailModal = ({ feedback, onClose }) => {
    if (!feedback) return null;

    return (
        <div className="feedback-modal-overlay" onClick={onClose}>
            <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>
                    <CloseIcon />
                </button>
                
                <h3 className="modal-title">Review Detail</h3>
                
                <div className="modal-header-section">
                    <StarRating rating={feedback.rating} showText={true} />
                    <div className="flex items-center gap-3">
                        <span className="modal-date">{new Date(feedback.createdDate).toLocaleDateString()}</span>
                        {feedback.isVerified && (
                            <span className="verified-pill">
                                <VerifiedIcon style={{ fontSize: '14px', marginRight: '4px' }} />
                                Verified
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="modal-section">
                    <h4>Comment</h4>
                    <p className="full-comment">
                        {feedback.comment ? `"${feedback.comment}"` : <i>No comment provided</i>}
                    </p>
                </div>

                <div className="modal-section grid-section">
                    <div className="owner-box">
                        <h4>Pet Owner</h4>
                        <p className="font-semibold">{feedback.ownerName}</p>
                    </div>
                    
                    <div className="context-box">
                        {feedback.feedbackType === 'APPOINTMENT' ? (
                            <>
                                <h4>Appointment Details</h4>
                                <p><strong>Service:</strong> {feedback.appointmentType}</p>
                                <p><strong>Doctor:</strong> {feedback.appointmentDoctor}</p>
                                <p><strong>Date:</strong> {feedback.appointmentDate}</p>
                            </>
                        ) : feedback.feedbackType === 'PRODUCT' ? (
                            <>
                                <h4>Product Details</h4>
                                <p><strong>Product:</strong> {feedback.productName || 'N/A'}</p>
                            </>
                        ) : (
                            <>
                                <h4>Feedback Type</h4>
                                <p>General Clinic Review</p>
                            </>
                        )}
                    </div>
                </div>

                {feedback.staffReply && (
                    <div className="modal-section reply-section">
                        <h4>PetCare Hub Response</h4>
                        <div className="staff-reply-box">
                            <p>"{feedback.staffReply}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackDetailModal;
