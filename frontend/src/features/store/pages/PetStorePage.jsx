import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import { ALL_VARIANT_CARDS, PRODUCT_GROUPS } from '../data/products';
import './PetStore.css';

import TuneIcon from '@mui/icons-material/Tune';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const PetStorePage = () => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleCardClick = (variantCard) => {
    setSelectedGroupId(variantCard.groupId);
  };

  const handleCloseDetail = () => setSelectedGroupId(null);

  const selectedGroup = selectedGroupId
    ? PRODUCT_GROUPS.find((g) => g.id === selectedGroupId)
    : null;

  return (
    <div className="store-page">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <header className="store-topbar">
        <div className="store-topbar-inner">
          <div className="store-brand">
            <span className="store-brand-emoji">🐾</span>
            <span className="store-brand-name">Pet Store</span>
          </div>

          <div className="store-topbar-spacer" />

          {/* Action buttons (placeholders) */}
          <div className="store-actions">
            <button id="store-filter-btn" className="store-action-btn" title="Filters (coming soon)" disabled>
              <TuneIcon />
              <span className="store-action-label">Filter</span>
            </button>
            <button id="store-cart-btn" className="store-action-btn store-cart-btn" title="Cart (coming soon)" disabled>
              <ShoppingCartOutlinedIcon />
              <span className="store-cart-badge">0</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Product Grid ─────────────────────────────────────────────── */}
      <main className="store-main">
        <p className="store-result-count">
          Showing <strong>{ALL_VARIANT_CARDS.length}</strong> product{ALL_VARIANT_CARDS.length !== 1 ? 's' : ''}
        </p>
        <div className="store-grid">
          {ALL_VARIANT_CARDS.map((card) => (
            <ProductCard
              key={card.variantId}
              card={card}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      </main>

      {/* ── Product Detail Modal ─────────────────────────────────────── */}
      {selectedGroup && (
        <ProductDetail group={selectedGroup} onClose={handleCloseDetail} />
      )}
    </div>
  );
};

export default PetStorePage;
