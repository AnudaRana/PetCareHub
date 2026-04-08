import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingService } from '../services/billingService';
import OwnerOrdersTable from '../components/OwnerOrdersTable';
import '../styles/OwnerBilling.css';

export default function OwnerBillingPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const data = await billingService.getBillingOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
      setError('Failed to load billing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (order) => {
    navigate(`/dashboard/billing/invoice/${order.orderId}`);
  };

  if (loading) {
    return <div className="loading-state">Loading billing information...</div>;
  }

  return (
    <div className="owner-billing-page">
      <div className="billing-header">
        <h2>Billing</h2>
        <p>View your orders, invoices, and payment details</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="billing-section">
        <h3>Your Orders</h3>
        <p>Track your orders and view invoices</p>
        <OwnerOrdersTable 
          orders={orders}
          onViewInvoice={handleViewInvoice}
        />
      </div>
    </div>
  );
}
