import React from 'react';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const ProductCard = ({ product, onClick }) => {
  const formattedPrice = `Rs. ${product.price?.toLocaleString('en-LK') || '0.00'}`;

  // Helper to determine emoji based on category or name
  const getPlaceholderEmoji = () => {
    const name = product.name?.toLowerCase() || '';
    if (name.includes('cat')) return '🐈';
    if (name.includes('dog')) return '🐕';
    if (name.includes('toy')) return '🧸';
    return '🐾';
  };

  return (
    <article className="product-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View ${product.name}`}
    >
      {/* Image */}
      <div className="product-card-img-wrap">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="product-card-img" 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="product-card-img-placeholder" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
          <span>{getPlaceholderEmoji()}</span>
        </div>
        {product.category && (
          <span className={`product-card-category-badge badge-${product.category.toLowerCase().replace(/\s+/g, '-')}`}>
            {product.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="product-card-body">
        <p className="product-card-brand">{product.brand}</p>
        <h3 className="product-card-name">{product.name}</h3>
        {product.variants && <p className="product-card-variant">{product.variants}</p>}
        <p className="product-card-description" style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginTop: '4px' }}>
          {product.description}
        </p>

        <div className="product-card-footer">
          <span className="product-card-price">{formattedPrice}</span>
          <button
            className="product-card-cart-icon-btn"
            onClick={(e) => { e.stopPropagation(); /* cart logic later */ }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCartOutlinedIcon style={{ fontSize: '20px' }} />
          </button>
        </div>

        {/* Stock info */}
        <div className="product-card-stock">
          <span className={`stock-dot ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
          <span className="stock-text">
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
