import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../../../services/orderService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import './Order.css';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await getOrderById(orderId);
                setOrder(response.data);
            } catch (err) {
                console.error("Failed to fetch order details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                const res = await cancelOrder(orderId);
                setOrder(res.data);
            } catch (err) {
                console.error("Failed to cancel order:", err);
                alert("Failed to cancel the order.");
            }
        }
    };

    if (loading) return <div className="loading-state">Loading order details...</div>;
    if (!order) return <div className="loading-state">Order not found.</div>;

    const canCancel = ['PENDING', 'READY'].includes(order.orderStatus);

    return (
        <div className="order-page-container">
            <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Order #{order.orderNumber}</h2>
                    <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}>
                        <ArrowBackIcon fontSize="small" style={{ marginRight: '5px' }} /> Back
                    </button>
                    {canCancel && (
                        <button className="btn btn-cancel" onClick={handleCancel} style={{ marginLeft: '10px' }}>
                            <CancelIcon fontSize="small" style={{ marginRight: '5px' }} /> Cancel Order
                        </button>
                    )}
                </div>
            </div>

            <div className="order-details-grid">
                <div className="order-info-card">
                    <h3>Summary</h3>
                    <p><strong>Status:</strong> <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></p>
                    <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                    <p><strong>Subtotal:</strong> ${order.subTotal.toFixed(2)}</p>
                    <p><strong>Pickup Fee:</strong> ${order.pickupFee.toFixed(2)}</p>
                </div>

                <div className="order-info-card">
                    <h3>Customer details</h3>
                    <p><strong>Name:</strong> {order.ownerFullName}</p>
                    <p><strong>Email:</strong> {order.ownerEmail}</p>
                    <p><strong>Contact:</strong> {order.contactNumber}</p>
                    <p><strong>Pickup Date:</strong> {order.pickupDate}</p>
                </div>
            </div>

            <div className="order-items-section mt-4">
                <h3>Order Items</h3>
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems && order.orderItems.map(item => (
                            <tr key={item.orderItemId}>
                                <td>{item.productName}</td>
                                <td>${item.productPrice.toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td>${item.lineTotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderDetails;
