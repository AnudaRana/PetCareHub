import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import productService from '../../../services/productService';
import { getFeedbacksByProduct } from '../../../services/feedbackApi';
import { checkPurchase } from '../../../services/orderService';
import { useAuth } from '../../auth/contexts/AuthContext';
import AddFeedbackForm from '../../feedback/components/AddFeedbackForm';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';

const ProductDetail = ({ product: initialProduct, onClose, onAddToCart }) => {
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user } = useAuth();
  const userId = user?.userId ? Number(user.userId) : (localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null);

  useEffect(() => {
    setProduct(initialProduct);
    if (initialProduct?.productId) {
      fetchReviews(initialProduct.productId);
      if (userId) {
        checkPurchase(userId, initialProduct.productId).then(setHasPurchased).catch(() => setHasPurchased(false));
      }
    }
  }, [initialProduct, userId]);

  const fetchReviews = async (id) => {
    try {
      const data = await getFeedbacksByProduct(id);
      setReviews(data || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  if (!product) return null;

  const handleVariantSwitch = async (id) => {
    setLoading(true);
    try {
      const response = await productService.getProductById(id);
      setProduct(response.data);
    } catch (err) {
      console.error("Failed to fetch variant:", err);
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = `Rs. ${product.price?.toLocaleString('en-LK') || '0.00'}`;

  const getPlaceholderEmoji = () => {
    const name = product.name?.toLowerCase() || '';
    if (name.includes('cat')) return '🐈';
    if (name.includes('dog')) return '🐕';
    if (name.includes('toy')) return '🧸';
    return '🐾';
  };

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className={`product-detail-modal ${loading ? 'loading' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="product-detail-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="product-detail-layout">
          <div className="product-detail-img-col">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-detail-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.product-detail-img-placeholder').style.display = 'flex';
                }}
              />
            ) : null}
            <div className="product-detail-img-placeholder" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
              <span>{getPlaceholderEmoji()}</span>
            </div>
          </div>

          <div className="product-detail-info-col">
            <p className="product-detail-brand">{product.brand || 'PetCareHub Selection'}</p>
            <h2 className="product-detail-name">{product.name}</h2>

            <p className="product-detail-description">{product.description}</p>

            {product.relatedVariants && product.relatedVariants.length > 0 && (
              <div className="product-variants-selector" style={{ marginBottom: '24px' }}>
                <p className="selector-label">Available Sizes / Options:</p>
                <div className="variant-options">
                  <button className="variant-btn active">
                    {product.variants || 'Current'}
                  </button>
                  {product.relatedVariants.map(variant => (
                    <button
                      key={variant.productId}
                      className="variant-btn"
                      onClick={() => handleVariantSwitch(variant.productId)}
                    >
                      {variant.variants}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-detail-price-row">
              <span className="product-detail-price">{formattedPrice}</span>
              <div className="product-detail-stock">
                <span className={`stock-dot ${product.availableStockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
                <span className="stock-text">{product.availableStockQuantity > 0 ? `${product.availableStockQuantity} Left` : 'Sold Out'}</span>
              </div>
            </div>

            <div className="product-detail-actions">
              <button
                className="btn btn-dark-blue product-detail-add-btn"
                style={{ width: '100%', height: '56px', fontSize: '1rem' }}
                disabled={product.availableStockQuantity <= 0}
                onClick={() => onAddToCart?.(product)}
              >
                <ShoppingCartOutlinedIcon style={{ fontSize: '20px', marginRight: '10px' }} />
                {product.availableStockQuantity > 0 ? 'Add to Cart' : 'Temporarily Unavailable'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="product-reviews-section">
          <div className="reviews-header">
            <h3>Customer Reviews ({reviews.length})</h3>
            {hasPurchased && (
              <button className="btn btn-teal-outline" onClick={() => setShowReviewForm(true)}>
                Write a Review
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="no-reviews-text">No reviews for this product yet.</p>
          ) : (
            <div className="reviews-list-compact">
              {reviews.slice(0, 3).map(review => (
                <div key={review.id} className="review-item-compact">
                  <div className="review-item-header">
                    <div className="review-stars-mini">
                      {[1, 2, 3, 4, 5].map(s => (
                        <StarIcon key={s} style={{ fontSize: '14px', color: s <= review.rating ? '#fbbf24' : '#d1d5db' }} />
                      ))}
                    </div>
                    <span className="review-item-author">{review.ownerName}</span>
                    {review.isVerified && <VerifiedIcon style={{ fontSize: '14px', color: '#16a34a', marginLeft: '5px' }} titleAccess="Verified Purchase" />}
                  </div>
                  <p className="review-item-comment">"{review.comment}"</p>
                  {review.staffReply && (
                    <div className="review-item-reply">
                      <strong>Response:</strong> {review.staffReply}
                    </div>
                  )}
                </div>
              ))}
              {reviews.length > 3 && (
                <button className="view-all-reviews-btn" onClick={() => window.location.href='/reviews'}>
                  View all reviews
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showReviewForm && (
        <AddFeedbackForm 
          product={product}
          onClose={() => setShowReviewForm(false)}
          onSubmitSuccess={() => fetchReviews(product.productId)}
          ownerId={userId}
          feedbackType="PRODUCT"
          isVerified={true}
        />
      )}
    </div>
  );
};

export default ProductDetail;
