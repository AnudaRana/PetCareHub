import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const ProductDetail = ({ group, onClose }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const selected = group.variants[selectedVariantIndex];

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="product-detail-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="product-detail-layout">
          {/* Left: Image */}
          <div className="product-detail-img-col">
            {selected.image ? (
              <img
                src={selected.image}
                alt={`${group.name} – ${selected.label}`}
                className="product-detail-img"
              />
            ) : (
              <div className="product-detail-img-placeholder">
                <span>{group.pet === 'cat' ? '🐈' : '🐕'}</span>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="product-detail-info-col">
            <p className="product-detail-brand">{group.brand}</p>
            <h2 className="product-detail-name">{group.name}</h2>
            <p className="product-detail-category">{group.categoryLabel}</p>

            <p className="product-detail-description">{group.description}</p>

            {/* Variant selector */}
            {group.variants.length > 1 && (
              <div className="product-detail-variants">
                <p className="product-detail-variants-label">Choose a variant:</p>
                <div className="product-detail-variants-list">
                  {group.variants.map((v, i) => (
                    <button
                      key={v.id}
                      className={`product-detail-variant-btn${i === selectedVariantIndex ? ' selected' : ''}`}
                      onClick={() => setSelectedVariantIndex(i)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Stock row */}
            <div className="product-detail-price-row">
              <span className="product-detail-price">
                Rs. {selected.price.toLocaleString('en-LK')}
              </span>
              <div className="product-detail-stock">
                <span className={`stock-dot ${selected.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
                <span className="stock-text">{selected.stock} in stock</span>
              </div>
            </div>

            {/* Actions */}
            <div className="product-detail-actions">
              <button className="btn btn-teal product-detail-add-btn">
                <ShoppingCartOutlinedIcon style={{ fontSize: '18px', marginRight: '8px' }} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
