import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import '../Order.css';

const OrderDetailsCard = ({ order, onClose, onRefresh, role, onToast }) => {
    const { user, token } = useAuth();
    const [details, setDetails] = useState(null);
    const [cancellationContext, setCancellationContext] = useState(null);
    const [showCancelForm, setShowCancelForm] = useState(false);
    
    const [cancelReason, setCancelReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState(null);

    const getStatusClass = (status) => {
        return `order-status-pill status-${(status || '').toLowerCase()}`;
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`/api/shop/orders/${order.orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDetails(res.data.order);
                if (res.data.cancellationReason) {
                    setCancellationContext({
                        reason: res.data.cancellationReason,
                        by: res.data.cancelledBy
                    });
                }
            } catch (err) {
                console.error("Failed to fetch specific details", err);
            }
        };
        fetchDetails();
    }, [order.orderId, token]);

    useEffect(() => {
        if (details?.paymentReceiptFileName && token) {
            const fetchReceipt = async () => {
                try {
                    const response = await axios.get(`/api/shop/orders/${details.orderId}/receipt`, {
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: 'blob'
                    });
                    const url = URL.createObjectURL(response.data);
                    setReceiptUrl(url);
                } catch (error) {
                    console.error("Error fetching receipt blob:", error);
                }
            };
            fetchReceipt();
        }
        
        return () => {
            if (receiptUrl) URL.revokeObjectURL(receiptUrl);
        }
    }, [details?.orderId, details?.paymentReceiptFileName, token]);

    const commonReasons = role === 'OWNER' 
        ? ["", "Found a better price", "Changed my mind", "Ordered by mistake", "Other"]
        : ["", "Out of stock", "Area unserviceable", "Suspected fraud", "Other"];

    const handleCancelSubmit = async () => {
        if (!cancelReason) return alert("Please select a reason");
        if (cancelReason === 'Other' && !otherReason.trim()) return alert("Please type your reason");

        const finalReason = cancelReason === 'Other' ? otherReason : cancelReason;

        try {
            setCancelling(true);
            await axios.put(`/api/shop/orders/${order.orderId}/cancel`, {
                reason: finalReason,
                roles: user?.roles?.join(',') || '',
                userId: user?.userId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            onToast ? onToast(`Order ${order.orderNumber} Cancelled Successfully!`) : alert('Cancelled Successfully');
            onRefresh();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Cancellation failed");
        } finally {
            setCancelling(false);
        }
    };

    const handleVerifyPayment = async () => {
        try {
            setVerifying(true);
            await axios.put(`/api/shop/orders/${order.orderId}/verify-payment`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onToast?.(`Payment for ${order.orderNumber} verified!`);
            onRefresh();
            onClose();
        } catch (err) {
            alert("Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    if (!details) return (
        <div className="order-details-card" style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-light)' }}>Loading order documentation...</p>
        </div>
    );

    const isCancelled = details.orderStatus === 'CANCELLED';

    return (
        <div className="order-details-card animate-fade-up">
            <div className="back-link" onClick={onClose}>
                <span>←</span> Back to Order List
            </div>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>
                    <span style={{ opacity: 0.5, fontWeight: 500 }}>Summary for</span> {details.orderNumber}
                </h2>
                <span className={getStatusClass(details.orderStatus)} style={{ fontSize: '0.9rem', padding: '8px 20px' }}>
                    {details.orderStatus}
                </span>
            </header>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                <div className="modal-section" style={{ margin: 0 }}>
                    <h4>Order Information</h4>
                    <p style={{ margin: '0 0 8px' }}>Placement Date: <strong>{new Date(details.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</strong></p>
                    <p style={{ margin: '0 0 8px' }}>Scheduled Pickup: <strong>{new Date(details.pickupDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong></p>
                    <p style={{ margin: 0 }}>Payment Method: <strong style={{ textTransform: 'capitalize' }}>{details.paymentMethod?.toLowerCase().replace(/_/g, ' ')}</strong></p>
                </div>
                <div className="modal-section" style={{ margin: 0 }}>
                    <h4>Customer Profile</h4>
                    <p style={{ margin: '0 0 4px', fontSize: '1rem' }}><strong>{details.ownerFullName}</strong></p>
                    <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>{details.ownerEmail}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)' }}>{details.contactNumber}</p>
                </div>
            </div>

            <div className="modal-section" style={{ background: '#fdfdfd', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                <h4>Line Items</h4>
                <table className="order-items-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th style={{ textAlign: 'right' }}>Unit Price</th>
                            <th style={{ textAlign: 'center' }}>Qty</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.items?.map(it => (
                            <tr key={it.orderItemId}>
                                <td style={{ fontWeight: 600 }}>{it.productName}</td>
                                <td style={{ textAlign: 'right' }}>LKR {it.productPrice.toFixed(2)}</td>
                                <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                                <td style={{ textAlign: 'right', fontWeight: 700 }}>LKR {it.lineTotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="order-summary-row" style={{ marginTop: '24px' }}>
                    <div style={{ minWidth: '140px' }}>
                        <p className="order-summary-label">Subtotal</p>
                        <p className="order-summary-value" style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>LKR {details.subTotal.toFixed(2)}</p>
                    </div>
                    <div style={{ minWidth: '140px' }}>
                        <p className="order-summary-label">Pickup Charge</p>
                        <p className="order-summary-value" style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>LKR {details.pickupFee.toFixed(2)}</p>
                    </div>
                    <div style={{ minWidth: '180px', background: 'rgba(0, 240, 255, 0.03)', padding: '12px 20px', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                        <p className="order-summary-label">Grand Total</p>
                        <p className="order-summary-value" style={{ fontSize: '1.2rem' }}>LKR {details.total.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {isCancelled && cancellationContext && (
                <div className="modal-section" style={{ background: 'rgba(255, 59, 48, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 59, 48, 0.1)', marginTop: '32px' }}>
                    <h4 style={{ color: 'var(--color-error)', borderBottomColor: 'rgba(255, 59, 48, 0.2)', marginBottom: '16px' }}>Cancellation Data</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 32px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Cancelled By</span>
                        <span style={{ fontWeight: 600 }}>{cancellationContext.by}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Reason Provided</span>
                        <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>{cancellationContext.reason}</span>
                    </div>
                </div>
            )}

            {details.additionalNotes && (
                <div className="modal-section" style={{ marginTop: '32px' }}>
                    <h4>Notes for Staff</h4>
                    <p style={{ fontSize: '0.95rem', background: '#fcfcfc', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontStyle: 'italic', margin: 0 }}>
                        "{details.additionalNotes}"
                    </p>
                </div>
            )}

            {details.paymentReceiptFileName && (
                <div className="modal-section" style={{ marginTop: '32px' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🖼️</span> Payment Documentation
                    </h4>
                    <div className="receipt-viewer" style={{ 
                        background: '#f8fafc', 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: '1px dashed #cbd5e1',
                        textAlign: 'center'
                    }}>
                        {receiptUrl ? (
                            <img 
                                src={receiptUrl} 
                                alt="Payment Slip" 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '400px', 
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                }} 
                            />
                        ) : (
                            <div style={{ padding: '40px', color: 'var(--color-text-light)' }}>
                                <div className="spinner" style={{ margin: '0 auto 12px', width: '24px', height: '24px' }}></div>
                                <p>Authenticating & retrieving image...</p>
                            </div>
                        )}
                        <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                            File: {details.paymentReceiptFileName}
                        </p>
                    </div>
                </div>
            )}

            {!isCancelled && !showCancelForm && (
                 <div style={{ marginTop: '40px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {details.paymentStatus !== 'PAID' && (role === 'STAFF' || role === 'ADMIN') && (
                        <button 
                            className="btn btn-teal"
                            onClick={handleVerifyPayment}
                            disabled={verifying}
                            style={{ flex: 1, minWidth: '200px' }}
                        >
                            {verifying ? 'Verifying...' : '✅ Verify Payment Slip'}
                        </button>
                    )}
                    <button 
                        className="btn btn-cancel"
                        onClick={() => setShowCancelForm(true)}
                        style={{ flex: 1, minWidth: '200px' }}
                    >
                        ✕ Request Cancellation
                    </button>
                    <button className="btn btn-white" onClick={onClose} style={{ flex: 1, minWidth: '150px' }}>
                        Return to List
                    </button>
                 </div>
            )}

            {showCancelForm && (
                <div className="cancel-form-box animate-fade-up" style={{ marginTop: '32px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: 'var(--color-error)' }}>Order Revocation</h4>
                    <form className="premium-form" onSubmit={e => { e.preventDefault(); handleCancelSubmit(); }}>
                        <label>Why are you cancelling?
                            <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} required>
                                {commonReasons.map(r => <option key={r} value={r}>{r || '-- Select a Reason --'}</option>)}
                            </select>
                        </label>
                        
                        {cancelReason === 'Other' && (
                            <label>Description
                                <textarea 
                                    rows="3" 
                                    placeholder="Briefly explain the situation..."
                                    value={otherReason}
                                    onChange={e => setOtherReason(e.target.value)}
                                    required
                                />
                            </label>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button type="submit" className="btn btn-cancel" style={{ flex: 1.5 }} disabled={cancelling}>
                                {cancelling ? 'Updating...' : 'Confirm Cancellation'}
                            </button>
                            <button type="button" className="btn btn-white" style={{ flex: 1 }} onClick={() => setShowCancelForm(false)}>
                                Abort
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsCard;
