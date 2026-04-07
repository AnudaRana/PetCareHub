import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import productService from '../../../services/productService';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PetStore.css';
import logo from '../../../assets/logo-weyes.png'

import AppsIcon from '@mui/icons-material/Apps';
import PetsIcon from '@mui/icons-material/Pets';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MedicationLiquidIcon from '@mui/icons-material/MedicationLiquid';
import BrushIcon from '@mui/icons-material/Brush';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SearchIcon from '@mui/icons-material/Search';


const PetStorePage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Products');

  // Categorical Navigation with IDs for filtering
  const categories = [
    { name: 'All Products', icon: <AppsIcon style={{ fontSize: '18px' }} /> },
    { name: 'Dog Food', id: 'dog', icon: <PetsIcon style={{ fontSize: '18px' }} /> },
    { name: 'Cat Food', id: 'cat', icon: <PetsIcon style={{ fontSize: '18px' }} /> },
    { name: 'Accessories', id: 'accessories', icon: <LocalMallIcon style={{ fontSize: '18px' }} /> },
    { name: 'Healthcare', id: 'health', icon: <MedicalServicesIcon style={{ fontSize: '18px' }} /> },
    { name: 'Grooming', id: 'grooming', icon: <BrushIcon style={{ fontSize: '18px' }} /> },
    { name: 'Supplements', id: 'supplements', icon: <MedicationLiquidIcon style={{ fontSize: '18px' }} /> }
  ];

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Category change effect
  useEffect(() => {
    // Reset search when changing category for a cleaner experience
    if (activeCategory !== 'All Products') {
      setSearchTerm('');
    }
    fetchProducts();
  }, [activeCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let response;
      
      if (searchTerm.trim()) {
        // 1. Search takes priority
        response = await productService.searchProducts(searchTerm.trim());
      } else if (activeCategory !== 'All Products') {
        // 2. Category fallback
        const catObj = categories.find(c => c.name === activeCategory);
        response = await productService.getProductsByCategory(catObj.id);
      } else {
        // 3. Default: All Products
        response = await productService.getAllProducts();
      }

      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Wait a moment, we are fetching the latest products for you...');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (product) => {
    setSelectedProductId(product.productId);
  };

  const handleCloseDetail = () => setSelectedProductId(null);

  const selectedProduct = selectedProductId
    ? products.find((p) => p.productId === selectedProductId)
    : null;

  return (
    <div className="store-page">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <header className="store-topbar">
        <div className="store-topbar-inner">
          <div className="store-brand">
            <img src={logo} alt="PetCareHub Logo" className="store-logo" />
            {/*<span className="store-brand-name">Pet Store</span>*/}
          </div>

          <div className="store-topbar-spacer" />

          {/* Search Bar */}
          <div className="store-search-wrapper">
            <SearchIcon className="store-search-icon" />
            <input 
              type="text" 
              className="store-search-input" 
              placeholder="Search products or brands..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Cart button*/}
          <div className="store-actions">
            <button id="store-cart-btn" className="store-action-btn store-cart-btn" title="Cart (coming soon)">
              <ShoppingCartOutlinedIcon />
              <span className="store-cart-badge">0</span>
            </button>
            <button 
              className="store-action-btn store-cart-btn" 
              title={token ? "Go to Dashboard" : "Go Home"}
              onClick={() => navigate(token ? "/dashboard" : "/")}
            >
              {token ? <DashboardIcon /> : <HomeOutlinedIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Category Filter  ─────────────────────────────── */}
      <nav className="store-categories">
        <div className="store-categories-inner">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`store-cat-pill ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.name)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Product Grid ─────────────────────────────────────────────── */}
      <main className="store-main">
        {loading ? (
          <div className="store-loading">
            <p>Fetching premium pet products...</p>
          </div>
        ) : error ? (
          <div className="store-error">
            <p>{error}</p>
            <button className="btn btn-teal" onClick={fetchProducts}>Try Again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="store-empty">
            <span>🦴</span>
            <h3>No products found</h3>
            <p>We couldn't find anything matching your search. Try another keyword!</p>
          </div>
        ) : (
          <>
            <p className="store-result-count">
              Showing <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''} 
              {searchTerm && ` for "${searchTerm}"`}
              {activeCategory !== 'All Products' && !searchTerm && ` in ${activeCategory}`}
            </p>
            <div className="store-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onClick={() => handleCardClick(product)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Product Detail Modal ─────────────────────────────────────── */}
      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={handleCloseDetail} />
      )}
    </div>
  );
};

export default PetStorePage;
