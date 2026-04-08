import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import ProductFormCard from '../components/ProductFormCard';
import './PetStore.css';

const ManageShopPage = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/products');
            setProducts(res.data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

        try {
            await axios.delete(`/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`Product "${name}" deleted successfully.`);
            fetchProducts();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete product. It might be linked to existing orders.");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowAddForm(false);
    };

    const handleAddNew = () => {
        setSelectedProduct(null);
        setShowAddForm(true);
    };

    return (
        <div className="order-page-container animate-fade-up">
            {toastMessage && <div className="order-toast">{toastMessage}</div>}

            {showAddForm || selectedProduct ? (
                <ProductFormCard
                    product={selectedProduct}
                    onClose={() => {
                        setShowAddForm(false);
                        setSelectedProduct(null);
                    }}
                    onRefresh={fetchProducts}
                    onToast={showToast}
                />
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h2>Shop Inventory</h2>
                            <p style={{ color: 'var(--color-text-light)' }}>Manage products, stock levels, and pricing.</p>
                        </div>
                        <button className="btn btn-teal" onClick={handleAddNew}>
                            + Add New Product
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading inventory data...</p>
                    ) : (
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.productId}>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                                        <td>LKR {p.price.toFixed(2)}</td>
                                        <td>
                                            <span style={{
                                                color: p.stockQuantity < 10 ? 'var(--color-error)' : 'inherit',
                                                fontWeight: p.stockQuantity < 10 ? 700 : 400
                                            }}>
                                                {p.stockQuantity} units
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button 
                                                    className="order-action-btn"
                                                    onClick={() => setSelectedProduct(p)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="order-action-btn"
                                                    style={{ background: 'var(--color-error)', color: 'white', borderColor: 'var(--color-error)' }}
                                                    onClick={() => handleDelete(p.productId, p.name)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageShopPage;
