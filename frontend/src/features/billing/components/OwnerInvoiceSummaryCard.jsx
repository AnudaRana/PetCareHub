import React from 'react';
import { format } from 'date-fns';
import InvoiceStatusBadge from './InvoiceStatusBadge';

export default function OwnerInvoiceSummaryCard({ invoice }) {
  if (!invoice) return null;

  return (
    <div className="invoice-summary-card">
      <div className="invoice-summary-header">
        <h3>Invoice Summary</h3>
        <InvoiceStatusBadge status={invoice.paymentStatus} />
      </div>
      
      <div className="invoice-summary-grid">
        <div className="summary-item">
          <label>Invoice Number</label>
          <value>{invoice.invoiceNumber}</value>
        </div>
        <div className="summary-item">
          <label>Order Number</label>
          <value>{invoice.orderNumber}</value>
        </div>
        <div className="summary-item">
          <label>Pet Name</label>
          <value>{invoice.petName}</value>
        </div>
        <div className="summary-item">
          <label>Pickup Date</label>
          <value>{invoice.pickupDate ? format(new Date(invoice.pickupDate), 'MMM dd, yyyy') : '—'}</value>
        </div>
        <div className="summary-item">
          <label>Payment Method</label>
          <value>{invoice.paymentMethod ? invoice.paymentMethod.replace(/_/g, ' ') : '—'}</value>
        </div>
        <div className="summary-item">
          <label>Created Date</label>
          <value>{invoice.createdAt ? format(new Date(invoice.createdAt), 'MMM dd, yyyy HH:mm') : '—'}</value>
        </div>
      </div>
      
      {invoice.notes && (
        <div className="invoice-notes">
          <label>Notes</label>
          <p>{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
