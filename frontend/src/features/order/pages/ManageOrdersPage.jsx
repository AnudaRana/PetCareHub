import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/contexts/AuthContext';
import OrderDetailsCard from '../components/OrderDetailsModal';
import '../Order.css';

const ManageOrdersPage = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/shop/orders/all', {
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
        if (token) fetchOrders();
    }, [token]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`/api/shop/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Status updated successfully.");
            fetchOrders();
        } catch (error) {
            alert("Failed to update status.");
            console.error(error);
        }
    };

    const getStatusClass = (status) => {
        return `order-status-pill status-${(status || '').toLowerCase()}`;
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const availableStatuses = ["PLACED", "READY", "COMPLETED"];

    return (
        <div className="order-page-container animate-fade-up">
            {toastMessage && <div className="order-toast">{toastMessage}</div>}

            {selectedOrder ? (
                <OrderDetailsCard 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                    onRefresh={fetchOrders}
                    role="STAFF"
                    onToast={showToast}
                />
            ) : (
                <>
                    <h2>Manage Orders</h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>
                        Update order statuses and manage fulfillment.
                    </p>

                    {loading ? (
                        <p>Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <p>No orders found.</p>
                    ) : (
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>Order No.</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.orderId}>
                                        <td>{order.orderNumber}</td>
                                        <td>{order.ownerFullName}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {order.orderStatus === 'CANCELLED' ? (
                                                <span className="order-status-pill status-cancelled">CANCELLED</span>
                                            ) : (
                                                <div className="order-status-selector-wrapper">
                                                    <span className={getStatusClass(order.orderStatus)}>
                                                        {order.orderStatus}
                                                    </span>
                                                    <select 
                                                        className="order-status-select-overlay"
                                                        value={order.orderStatus}
                                                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                                    >
                                                        {availableStatuses.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
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

export default ManageOrdersPage;
