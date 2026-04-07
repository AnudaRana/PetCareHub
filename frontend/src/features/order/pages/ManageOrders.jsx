import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../../../services/orderService';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './Order.css';

const ManageOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await getAllOrders();
            setOrders(response.data);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.orderId === orderId ? res.data : o));
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="loading-state">Loading all orders...</div>;

    return (
        <div className="order-page-container">
            <div className="order-header">
                <h2><ManageAccountsIcon /> Manage Orders</h2>
                <p>View and update statuses for all store orders</p>
            </div>

            <div className="order-table-container">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Order No</th>
                            <th>Customer</th>
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
                                    <td>{order.ownerFullName}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>${order.total.toFixed(2)}</td>
                                    <td>
                                        <select 
                                            value={order.orderStatus} 
                                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                            className={`status-select ${order.orderStatus.toLowerCase()}`}
                                            disabled={order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED'}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="READY">READY</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
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
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
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

export default ManageOrders;
