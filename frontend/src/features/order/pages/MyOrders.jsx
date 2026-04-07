import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOwnerOrders } from '../../../services/orderService';
import { useAuth } from '../../auth/contexts/AuthContext';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './Order.css';

const MyOrders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.userId) return;

        const fetchOrders = async () => {
            try {
                const response = await getOwnerOrders(user.userId);
                setOrders(response.data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (loading) return <div className="loading-state">Loading your orders...</div>;

    return (
        <div className="order-page-container">
            <div className="order-header">
                <h2><FormatListBulletedIcon /> My Orders</h2>
                <p>View and manage your purchases</p>
            </div>

            <div className="order-table-container">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Order No</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <tr key={order.orderId}>
                                    <td>{order.orderNumber}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>${order.total.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-dark-blue action-btn"
                                            onClick={() => navigate(`/dashboard/order-details/${order.orderId}`)}
                                        >
                                            <VisibilityIcon fontSize="small" style={{ marginRight: '5px' }} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyOrders;
