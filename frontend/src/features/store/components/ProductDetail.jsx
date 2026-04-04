import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import productService from '../../../services/productService';

const ProductDetail = ({ product: initialProduct, onClose }) => {
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  if (!product) return null;

  const handleVariantSwitch = async (id) => {
    setLoading(true);
    try {
      const data = await productService.getProductById(id);
      setProduct(data);
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
        {/* Close button */}
        <button className="product-detail-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="product-detail-layout">
          {/* Left: Image */}
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

          {/* Right: Info */}
          <div className="product-detail-info-col">
            {product.brand && <p className="product-detail-brand">{product.brand}</p>}
            <h2 className="product-detail-name">{product.name}</h2>
            
            {/* Variants Selector (Size/Flavor) */}
            {product.relatedVariants && product.relatedVariants.length > 0 && (
              <div className="product-variants-selector">
                <p className="selector-label">Available Options:</p>
                <div className="variant-options">
                  <button className="variant-btn active">
                    {product.variants || 'Standard'}
                  </button>
                  {product.relatedVariants.map(variant => (
                    <button 
                      key={variant.productId} 
                      className="variant-btn"
                      onClick={() => handleVariantSwitch(variant.productId)}
                    >
                      {variant.variants || 'Other'}
                    </button>
                  ))}
                </div>
              </div>
            )}


            <div className="product-detail-description-section">
              <p className="product-detail-description">{product.description}</p>
            </div>

            {/* Price & Stock row */}
            <div className="product-detail-price-row">
              <span className="product-detail-price">
                {formattedPrice}
              </span>
              <div className="product-detail-stock">
                <span className={`stock-dot ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
                <span className="stock-text">
                  {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="product-detail-actions">
              <button className="btn btn-teal product-detail-add-btn" disabled={product.stockQuantity <= 0}>
                <ShoppingCartOutlinedIcon style={{ fontSize: '18px', marginRight: '8px' }} />
                {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
