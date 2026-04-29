import React from 'react';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const ProductCard = ({ product, onClick, onQuickAdd }) => {
  const formattedPrice = `Rs. ${product.price?.toLocaleString('en-LK') || '0.00'}`;

  const getPlaceholderEmoji = () => {
    const name = product.name?.toLowerCase() || '';
    if (name.includes('cat')) return '🐈';
    if (name.includes('dog')) return '🐕';
    if (name.includes('toy')) return '🧸';
    return '🐾';
  };

  const getCategoryTheme = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('cat')) return { color: '#e0bbe4', glow: 'rgba(224, 187, 228, 0.8)' }; // Pastel Purple
    if (cat.includes('dog')) return { color: '#b5ead7', glow: 'rgba(181, 234, 215, 0.8)' }; // Pastel Green/Blue
    if (cat.includes('grooming') || cat.includes('health')) return { color: '#ffb3ba', glow: 'rgba(255, 179, 186, 0.8)' }; // Pastel Pink
    return { color: '#ffdfba', glow: 'rgba(255, 223, 186, 0.8)' }; // Pastel Orange/Yellow
  };

  const theme = getCategoryTheme(product.category);


  return (
    <article
      className="product-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="product-card-img-wrap">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-card-img"
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
          <span
            className="product-card-category-badge"
            style={{
              borderColor: theme.color,
              boxShadow: `0 0 10px ${theme.glow}, inset 0 0 5px ${theme.glow}`
            }}
          >
            {product.category}
          </span>
        )}
      </div>

      <div className="product-card-body">
        <p className="product-card-brand">{product.brand || 'Premium Selection'}</p>
        <h3 className="product-card-name">{product.name}</h3>

        <div className="product-card-footer">
          <span className="product-card-price">{formattedPrice}</span>
          <button
            className="product-card-cart-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd?.(product);
            }}
            aria-label="Quick Add"
            disabled={product.availableStockQuantity <= 0}
          >
            <ShoppingCartOutlinedIcon style={{ fontSize: '20px' }} />
          </button>
        </div>

        <div className="product-card-stock">
          <span className={`stock-dot ${product.availableStockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
          <span>{product.availableStockQuantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
