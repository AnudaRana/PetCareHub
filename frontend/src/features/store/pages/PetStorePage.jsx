import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import ProductFormCard from '../components/ProductFormCard';
import productService from '../../../services/productService';
import { cartService } from '../../cart/services/cartService';
import { useAuth } from '../../auth/contexts/AuthContext';
import './PetStore.css';
import logo from '../../../assets/logo-b.png';

import AppsIcon from '@mui/icons-material/Apps';
import PetsIcon from '@mui/icons-material/Pets';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MedicationLiquidIcon from '@mui/icons-material/MedicationLiquid';
import BrushIcon from '@mui/icons-material/Brush';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SearchIcon from '@mui/icons-material/Search';

const PetStorePage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const userId = useMemo(() => {
    if (user?.userId) return Number(user.userId);
    const stored = localStorage.getItem('userId');
    return stored ? Number(stored) : null;
  }, [user?.userId]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [cartCount, setCartCount] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  const { hasRole } = useAuth();
  const isAdminNonVetOrStaff = (hasRole('ADMIN') && !hasRole('VET')) || hasRole('STAFF');

  const categories = [
    { name: 'All Products' },
    { name: 'Dog Food', id: 'dog' },
    { name: 'Cat Food', id: 'cat' },
    { name: 'Accessories', id: 'accessories' },
    { name: 'Healthcare', id: 'health' },
    { name: 'Grooming', id: 'grooming' },
    { name: 'Supplements', id: 'supplements' }
  ].map((category) => ({
    ...category,
    icon:
      category.name === 'All Products' ? <AppsIcon style={{ fontSize: '18px' }} /> :
        category.name.includes('Food') ? <PetsIcon style={{ fontSize: '18px' }} /> :
          category.name === 'Accessories' ? <LocalMallIcon style={{ fontSize: '18px' }} /> :
            category.name === 'Healthcare' ? <MedicalServicesIcon style={{ fontSize: '18px' }} /> :
              category.name === 'Grooming' ? <BrushIcon style={{ fontSize: '18px' }} /> :
                <MedicationLiquidIcon style={{ fontSize: '18px' }} />
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (activeCategory !== 'All Products') {
      setSearchTerm('');
    }
    fetchProducts();
  }, [activeCategory]);

  useEffect(() => {
    if (!userId || !token) {
      setCartCount(0);
      return;
    }

    const loadCartCount = async () => {
      try {
        const cart = await cartService.getCart(userId);
        const count = (cart.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(count);
      } catch (err) {
        console.error('Failed to load cart count:', err);
      }
    };

    loadCartCount();
  }, [token, userId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let response;

      if (searchTerm.trim()) {
        response = await productService.searchProducts(searchTerm.trim());
      } else if (activeCategory !== 'All Products') {
        const catObj = categories.find((c) => c.name === activeCategory);
        response = await productService.getProductsByCategory(catObj.id);
      } else {
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

  const handleCardClick = (product) => setSelectedProductId(product.productId);
  const handleCloseDetail = () => setSelectedProductId(null);

  const handleAddToCart = async (product) => {
    if (!token || !userId) {
      toast.info('Please log in to add products to your cart.');
      navigate('/login');
      return;
    }

    if (!product?.productId) {
      console.error('Invalid product data:', product);
      toast.error('Could not add product: Missing ID');
      return;
    }

    try {
      const updatedCart = await cartService.addItem(userId, product.productId, 1);
      const items = updatedCart.items || [];
      const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(count);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      const msg = err?.response?.data?.message || 'Failed to add the product to cart.';
      toast.error(msg);
    }
  };

  const selectedProduct = selectedProductId
    ? products.find((p) => p.productId === selectedProductId)
    : null;

  return (
    <div className="store-page">
      <header className="store-topbar">
        <div className="store-topbar-inner">
          <div className="store-brand" onClick={() => navigate('/dashboard')}>
            <img src={logo} alt="PetCareHub Logo" className="store-logo" />
            <div className="store-brand-text">
              <span className="store-brand-name">PetCare Hub</span>
              <span className="store-brand-tag">PREMIUM STORE</span>
            </div>
          </div>

          <div className="store-search-wrapper">
            <SearchIcon className="store-search-icon" />
            <input
              type="text"
              className="store-search-input"
              placeholder="Search products, treats, accessories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="store-actions">
            <button
              className="store-action-btn store-cart-btn"
              onClick={() => navigate('/cart')}
              id="store-cart-btn"
            >
              <div className="cart-icon-wrapper">
                <ShoppingCartOutlinedIcon style={{ fontSize: '22px' }} />
                {cartCount > 0 && (
                  <span className="store-cart-badge animate-pop">{cartCount}</span>
                )}
              </div>

            </button>
            <button
              className="store-dashboard-btn"
              title={token ? "Go to Dashboard" : "Go Home"}
              onClick={() => navigate(token ? "/dashboard" : "/")}
            >
              <span>{token ? 'Go to Dashboard' : 'Go Home'}</span>
            </button>

            {isAdminNonVetOrStaff && (
              <button
                className="btn btn-teal"
                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                onClick={() => setShowAddForm(true)}
              >
                + Add Product
              </button>
            )}
          </div>
        </div>
      </header>

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
                  onQuickAdd={handleAddToCart}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={handleCloseDetail} onAddToCart={handleAddToCart} />
      )}

      {showAddForm && (
        <div className="store-main animate-fade-up" style={{ padding: '40px 10%' }}>
          <ProductFormCard
            onClose={() => setShowAddForm(false)}
            onRefresh={fetchProducts}
            onToast={(msg) => toast.success(msg)}
          />
        </div>
      )}
    </div>
  );
};

export default PetStorePage;
