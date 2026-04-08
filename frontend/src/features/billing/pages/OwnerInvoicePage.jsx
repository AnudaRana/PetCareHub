import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billingService } from '../services/billingService';
import OwnerInvoiceSummaryCard from '../components/OwnerInvoiceSummaryCard';
import OwnerInvoiceItemsTable from '../components/OwnerInvoiceItemsTable';
import '../styles/OwnerBilling.css';

export default function OwnerInvoicePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoice();
  }, [orderId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await billingService.getInvoiceForOrder(orderId);
      setInvoice(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      setError('Failed to load invoice details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading invoice details...</div>;
  }

  if (error) {
    return (
      <div className="invoice-details-page">
        <div className="invoice-details-header">
          <button className="btn-back" onClick={() => navigate('/dashboard/billing')}>
            ← Back to Billing
          </button>
        </div>
        <div className="alert-error">{error}</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-details-page">
        <div className="invoice-details-header">
          <button className="btn-back" onClick={() => navigate('/dashboard/billing')}>
            ← Back to Billing
          </button>
        </div>
        <div className="billing-empty-state">Invoice not found.</div>
      </div>
    );
  }

  return (
    <div className="invoice-details-page">
      <div className="invoice-details-header">
        <button className="btn-back" onClick={() => navigate('/dashboard/billing')}>
          ← Back to Billing
        </button>
        <h2>Invoice Details</h2>
      </div>

      <OwnerInvoiceSummaryCard invoice={invoice} />
      
      <OwnerInvoiceItemsTable items={invoice.items} />
      
      <div className="invoice-totals-card">
        <h4>Payment Summary</h4>
        <div className="totals-row">
          <label>Subtotal</label>
          <value>Rs. {invoice.subtotalAmount?.toFixed(2)}</value>
        </div>
        {invoice.discountAmount > 0 && (
          <div className="totals-row">
            <label>Discount</label>
            <value>- Rs. {invoice.discountAmount?.toFixed(2)}</value>
          </div>
        )}
        {invoice.taxAmount > 0 && (
          <div className="totals-row">
            <label>Tax</label>
            <value>Rs. {invoice.taxAmount?.toFixed(2)}</value>
          </div>
        )}
        <div className="totals-row total">
          <label>Total</label>
          <value>Rs. {invoice.totalAmount?.toFixed(2)}</value>
        </div>
      </div>
    </div>
  );
}
