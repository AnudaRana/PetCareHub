import React, { useState, useEffect } from 'react';
import { receiptService } from '../services/receiptService';
import InvoiceTable from '../components/InvoiceTable';
import '../styles/StaffReceipts.css';

export default function StaffReceiptsPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const invoicesData = await receiptService.getAllInvoices();
      setInvoices(invoicesData);
      setError('');
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError('Failed to load receipts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading receipts...</div>;
  }

  return (
    <div className="staff-receipts-page">
      <div className="receipts-header">
        <div>
          <h2>Receipts & Invoices</h2>
          <p>View all generated billing records and invoices.</p>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="receipts-section">
        <h3>Generated Invoices</h3>
        <p>All billing records</p>
        <InvoiceTable invoices={invoices} />
      </div>
    </div>
  );
}
