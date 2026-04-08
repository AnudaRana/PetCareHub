import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import productService from '../../../services/productService';

const ProductDetail = ({ product: initialProduct, onClose, onAddToCart }) => {
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

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
                <span className={`stock-dot ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
                <span className="stock-text">{product.stockQuantity > 0 ? `${product.stockQuantity} Left` : 'Sold Out'}</span>
              </div>
            </div>

            <div className="product-detail-actions">
              <button
                className="btn btn-dark-blue product-detail-add-btn"
                style={{ width: '100%', height: '56px', fontSize: '1rem' }}
                disabled={product.stockQuantity <= 0}
                onClick={() => onAddToCart?.(product)}
              >
                <ShoppingCartOutlinedIcon style={{ fontSize: '20px', marginRight: '10px' }} />
                {product.stockQuantity > 0 ? 'Add to Cart' : 'Temporarily Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
