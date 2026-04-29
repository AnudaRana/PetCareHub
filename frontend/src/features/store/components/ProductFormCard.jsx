import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import './ProductForm.css';

const ProductFormCard = ({ product, onClose, onRefresh, onToast }) => {
    const { token } = useAuth();
    const isEdit = !!product;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        category: '',
        imageUrl: '',
        brand: '',
        variants: '',
        colors: '',
        flavors: ''
    });

    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                stockQuantity: product.stockQuantity || '',
                category: product.category || '',
                imageUrl: product.imageUrl || '',
                brand: product.brand || '',
                variants: product.variants || '',
                colors: product.colors || '',
                flavors: product.flavors || ''
            });
            setImagePreview(`/api/products/${product.productId}/image`);
        }
    }, [product]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('stockQuantity', formData.stockQuantity);
            data.append('category', formData.category);
            data.append('imageUrl', formData.imageUrl);
            data.append('brand', formData.brand);
            data.append('variants', formData.variants);
            data.append('colors', formData.colors);
            data.append('flavors', formData.flavors);
            
            if (imageFile) {
                data.append('image', imageFile);
            }

            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (isEdit) {
                await axios.put(`/api/products/${product.productId}`, data, config);
                onToast?.("Product updated successfully!");
            } else {
                await axios.post('/api/products', data, config);
                onToast?.("Product added successfully!");
            }

            onRefresh();
            onClose();
        } catch (error) {
            console.error("Failed to save product:", error);
            alert(error.response?.data?.message || "Operation failed. Please check your data.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="product-form-card animate-fade-up">
            <div className="back-link" onClick={onClose}>
                <span>←</span> Back to Inventory
            </div>

            <header className="product-form-header">
                <h2>{isEdit ? 'Edit Premium Product' : 'Add New Pet Essential'}</h2>
                <p>Manage shop inventory with high-fidelity data entry.</p>
            </header>

            <form className="premium-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-section">
                        <h4>Core Details</h4>
                        <label>Product Name
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Premium Kibble 5kg"
                                required
                            />
                        </label>
                        <label>Category
                            <select name="category" value={formData.category} onChange={handleChange} required>
                                <option value="">-- Select Category --</option>
                                <optgroup label="Dog Food">
                                    <option value="dog-dry">Dog Dry Food</option>
                                    <option value="dog-wet">Dog Wet Food</option>
                                    <option value="dog-treats">Dog Treats</option>
                                </optgroup>
                                <optgroup label="Cat Food">
                                    <option value="cat-dry">Cat Dry Food</option>
                                    <option value="cat-wet">Cat Wet Food</option>
                                    <option value="cat-treats">Cat Treats</option>
                                </optgroup>
                                <optgroup label="Other Categories">
                                    <option value="accessories">Accessories</option>
                                    <option value="health">Healthcare</option>
                                    <option value="grooming">Grooming</option>
                                    <option value="supplements">Supplements</option>
                                </optgroup>
                            </select>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <label>Price (LKR)
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                />
                            </label>
                            <label>Stock Quantity
                                <input
                                    type="number"
                                    name="stockQuantity"
                                    value={formData.stockQuantity}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>
                        <div className="product-image-upload-section">
                            <label>Product Display Picture
                                <div className="image-upload-wrapper">
                                    <input
                                        type="file"
                                        id="product-image-input"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="product-image-input" className="image-drop-zone">
                                        {imagePreview ? (
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : (
                                            <div className="upload-placeholder">
                                                <span className="upload-icon">📸</span>
                                                <span>Click to upload image</span>
                                            </div>
                                        )}
                                        <div className="upload-error-fallback" style={{ display: 'none' }}>
                                            <span className="upload-icon">🖼️</span>
                                            <span>Image not found</span>
                                        </div>
                                    </label>
                                </div>
                            </label>
                            <label>Or use external URL (Legacy)
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4>Extended Attributes</h4>
                        <label>Brand
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="e.g. Pedigree"
                            />
                        </label>
                        <label>Weight / Variant
                            <input
                                type="text"
                                name="variants"
                                value={formData.variants}
                                onChange={handleChange}
                                placeholder="e.g. 5kg, Large"
                            />
                        </label>
                        <label>Flavors (Optional)
                            <input
                                type="text"
                                name="flavors"
                                value={formData.flavors}
                                onChange={handleChange}
                                placeholder="e.g. Chicken, Beef"
                            />
                        </label>
                        <label>Colors (Optional)
                            <input
                                type="text"
                                name="colors"
                                value={formData.colors}
                                onChange={handleChange}
                                placeholder="e.g. Red, Blue"
                            />
                        </label>
                    </div>
                </div>

                <label>Description
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Provide a detailed description for the customers..."
                    />
                </label>

                <div className="form-actions">
                    <button type="submit" className="btn btn-teal" disabled={saving}>
                        {saving ? 'Syncing...' : isEdit ? 'Update Product' : 'Register Product'}
                    </button>
                    <button type="button" className="btn btn-white" onClick={onClose}>
                        Discard
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormCard;
