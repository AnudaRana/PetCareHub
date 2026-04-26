import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPublicFeedbacks } from '../../../../services/feedbackApi'
import './Testimonials.css'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarRating from '../../../feedback/components/StarRating';

const Testimonials = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const slider = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getPublicFeedbacks();
                // Cap at 10 reviews for the home page slider
                setFeedbacks(data.slice(0, 10)); 
            } catch (err) {
                console.error("Failed to fetch testimonials", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const itemsPerView = 2;
    const maxIndex = Math.max(0, feedbacks.length - itemsPerView);

    const slideForward = () => {
        if (currentIndex < maxIndex) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            // Move by one parent width (which contains itemsPerView items)
            // Each parent width is (100 / totalParentWidths) percent of the UL
            const totalParentWidths = Math.ceil(feedbacks.length / itemsPerView);
            slider.current.style.transform = `translateX(-${nextIndex * (100 / totalParentWidths / itemsPerView)}%)`;
        }
    }

    const slideBackward = () => {
        if (currentIndex > 0) {
            const nextIndex = currentIndex - 1;
            setCurrentIndex(nextIndex);
            const totalParentWidths = Math.ceil(feedbacks.length / itemsPerView);
            slider.current.style.transform = `translateX(-${nextIndex * (100 / totalParentWidths / itemsPerView)}%)`;
        }
    }

    if (loading) return <div className="testimonials-loading">Loading Testimonials...</div>;

    if (feedbacks.length === 0) {
        return (
            <div className="testimonials empty">
                
                <p className="no-reviews-msg">No reviews yet. Be the first to share your experience!</p>
                <div className="view-more-container">
                    <Link to="/reviews" className="view-more-link">
                        Write a Review <ArrowForwardIcon style={{ fontSize: '18px', marginLeft: '5px' }} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="testimonials">
            
            
            {feedbacks.length > 2 && (
                <>
                    <ArrowBackIcon className={`prev-btn ${currentIndex === 0 ? 'disabled' : ''}`} onClick={slideBackward} />
                    <ArrowForwardIcon className={`next-btn ${currentIndex >= maxIndex ? 'disabled' : ''}`} onClick={slideForward} />
                </>
            )}

            <div className="slider">
                <ul ref={slider} style={{ width: `${Math.ceil(feedbacks.length / 2) * 100}%` }}>
                    {feedbacks.map((review) => (
                        <li key={review.id} style={{ width: `${100 / (Math.ceil(feedbacks.length / 2) * 2)}%` }}>
                            <div className="slide">
                                <div className="user-info">
                                    <div className="user-avatar-mini">
                                        {review.ownerName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h3>{review.ownerName}</h3>
                                        <span>{new Date(review.createdDate).toLocaleDateString()}</span><br />
                                        {review.feedbackType === 'PRODUCT' && (
                                            <span className="review-context-tag">Product: {review.productName}</span>
                                        )}
                                        {review.feedbackType === 'APPOINTMENT' && (
                                            <span className="review-context-tag">Service: {review.appointmentType}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="rating">
                                    <StarRating rating={review.rating} showText={true} />
                                </div>
                                <p className="testimonial-comment">"{review.comment}"</p>
                                
                                {review.comment && review.comment.length > 120 && (
                                    <Link 
                                        className="testimonial-read-more" 
                                        to={`/reviews#feedback-${review.id}`}
                                    >
                                        Read More
                                    </Link>
                                )}

                                {review.staffReply && (
                                    <div className="testimonial-reply">
                                        <strong>Reply:</strong> <span className="reply-preview">{review.staffReply}</span>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="view-more-container">
                <Link to="/reviews" className="view-more-link">
                    View All Reviews <ArrowForwardIcon style={{ fontSize: '18px', marginLeft: '5px' }} />
                </Link>
            </div>
        </div>
    )
}

export default Testimonials;
