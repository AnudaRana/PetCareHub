import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPublicFeedbacks } from '../../../services/feedbackApi';
import { useAuth } from '../../auth/contexts/AuthContext';
import AddFeedbackForm from '../components/AddFeedbackForm';
import StarRating from '../components/StarRating';
import FeedbackDetailModal from '../components/FeedbackDetailModal';
import '../styles/ReviewsPage.css';
import VerifiedIcon from '@mui/icons-material/Verified';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import logo from '../../../assets/logo-b.png';

const ReviewsPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const userId = user?.userId ? Number(user.userId) : (localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    useEffect(() => {
        if (!loading && location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-review');
                    setTimeout(() => element.classList.remove('highlight-review'), 3000);
                }, 100);
            }
        }
    }, [loading, location.hash]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const data = await getPublicFeedbacks();
            setFeedbacks(data);
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reviews-page-wrapper">
            <header className="reviews-topbar">
                <div className="reviews-topbar-left">
                    <div className="reviews-logo-section">
                        <div className="reviews-logo" onClick={() => navigate('/dashboard')}>
                            <img src={logo} alt="PetCareHub Logo" className="reviews-logo-img" />
                            <div className="reviews-brand-text">
                                <span className="reviews-brand-name">PetCare Hub</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="reviews-topbar-actions">
                    <button 
                        className="reviews-home-btn"
                        title="Go Home"
                        onClick={() => navigate('/')}
                    >
                        <HomeOutlinedIcon style={{ fontSize: '22px' }} />
                    </button>
                    <button className="reviews-dashboard-btn" onClick={() => navigate(token ? '/dashboard' : '/login')}>
                        {token ? 'Go to Dashboard' : 'Sign In'}
                    </button>
                </div>
            </header>

            <div className="reviews-page-content container">
                <div className="reviews-header-section">
                    <h1>What Our Clients Say</h1>
                    <p>Read honest reviews from our community of pet owners.</p>
                    
                    {token && (
                        <button 
                            className="btn btn-teal add-review-btn"
                            onClick={() => setShowAddForm(true)}
                        >
                            Add a Review
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="reviews-loading">
                        <p>Fetching latest testimonials...</p>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="reviews-empty">
                        <span>⭐</span>
                        <h3>No reviews found</h3>
                        <p>Be the first to share your experience!</p>
                    </div>
                ) : (
                    <>
                        <p className="store-result-count">
                            Showing <strong>{feedbacks.length}</strong> review{feedbacks.length !== 1 ? 's' : ''}
                        </p>
                        <div className="reviews-grid">
                            {feedbacks.map((review) => (
                                <div key={review.id} id={`feedback-${review.id}`} className="review-card-public">
                                    <div className="review-card-header-public">
                                        <div className="owner-info-public">
                                            <div className="owner-avatar">
                                                {review.ownerName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <span className="owner-name-public">{review.ownerName}</span>
                                                <span className="review-date-public">
                                                    {new Date(review.createdDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} showText={true} />
                                    </div>

                                    <div className="review-body-public">
                                        {review.isVerified && (
                                            <div className="verified-badge-public">
                                                <VerifiedIcon style={{ fontSize: '14px', marginRight: '4px' }} />
                                                Verified Feedback
                                            </div>
                                        )}
                                        <p className="review-comment-public">"{review.comment}"</p>
                                        
                                        {review.comment && review.comment.length > 150 && (
                                            <button 
                                                className="read-more-link" 
                                                onClick={() => setSelectedReview(review)}
                                            >
                                                Read More...
                                            </button>
                                        )}
                                        
                                        <div className="mt-2">
                                            {review.feedbackType === "PRODUCT" && (
                                                <div className="review-context-public">
                                                    Reviewed: <strong>{review.productName || 'Product'}</strong>
                                                </div>
                                            )}
                                            
                                            {review.feedbackType === "APPOINTMENT" && (
                                                <div className="review-context-public">
                                                    Service: <strong>{review.appointmentType}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {review.staffReply && (
                                        <div className="staff-reply-public">
                                            <div className="staff-reply-header">
                                                <strong>PetCare Hub Response:</strong>
                                            </div>
                                            <p className="staff-reply-preview">"{review.staffReply}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {showAddForm && (
                <AddFeedbackForm 
                    onClose={() => setShowAddForm(false)}
                    onSubmitSuccess={fetchFeedbacks}
                    ownerId={userId}
                    feedbackType="GENERAL"
                    isVerified={false}
                />
            )}

            {selectedReview && (
                <FeedbackDetailModal 
                    feedback={selectedReview} 
                    onClose={() => setSelectedReview(null)} 
                />
            )}
        </div>
    );
};

export default ReviewsPage;
