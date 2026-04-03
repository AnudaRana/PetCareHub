import React from 'react';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const ProductCard = ({ card, onClick }) => {
  const formattedPrice = `Rs. ${card.price.toLocaleString('en-LK')}`;

  return (
    <article className="product-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View ${card.cardName}`}
    >
      {/* Image */}
      <div className="product-card-img-wrap">
        {card.image ? (
          <img src={card.image} alt={card.cardName} className="product-card-img" />
        ) : (
          <div className="product-card-img-placeholder">
            <span>{card.pet === 'cat' ? '🐈' : '🐕'}</span>
          </div>
        )}
        <span className={`product-card-category-badge badge-${card.category}`}>
          {card.categoryLabel}
        </span>
      </div>

      {/* Info */}
      <div className="product-card-body">
        <p className="product-card-brand">{card.brand}</p>
        <h3 className="product-card-name">{card.shortName}</h3>
        <p className="product-card-variant">{card.variantLabel}</p>

        <div className="product-card-footer">
          <span className="product-card-price">{formattedPrice}</span>
          <button
            className="product-card-cart-icon-btn"
            onClick={(e) => { e.stopPropagation(); /* cart logic later */ }}
            aria-label={`Add ${card.cardName} to cart`}
          >
            <ShoppingCartOutlinedIcon style={{ fontSize: '20px' }} />
          </button>
        </div>

        {/* Stock info */}
        <div className="product-card-stock">
          <span className={`stock-dot ${card.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
          <span className="stock-text">{card.stock} in stock</span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
