import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import OrderDetailsCard from '../components/OrderDetailsModal';
import '../Order.css';

const OwnerOrdersPage = () => {
    const { userId, token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const fetchOrders = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const res = await axios.get(`/api/shop/orders/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchOrders();
    }, [userId]);

    const getStatusClass = (status) => {
        return `order-status-pill status-${(status || '').toLowerCase()}`;
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    return (
        <div className="order-page-container animate-fade-up">
            {toastMessage && <div className="order-toast">{toastMessage}</div>}

            {selectedOrder ? (
                <OrderDetailsCard 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                    onRefresh={fetchOrders}
                    role="OWNER"
                    onToast={showToast}
                />
            ) : (
                <>
                    <h2>My Orders</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>
                        View and track your current and past orders.
                    </p>

                    {loading ? (
                        <p>Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <p>You have no orders yet.</p>
                    ) : (
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>Order No.</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.orderId}>
                                        <td>{order.orderNumber}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>LKR {order.total.toFixed(2)}</td>
                                        <td>
                                            <span className={getStatusClass(order.orderStatus)}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="order-action-btn"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                View
                                            </button>
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

export default OwnerOrdersPage;
