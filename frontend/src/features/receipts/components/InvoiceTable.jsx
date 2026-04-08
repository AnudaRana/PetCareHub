import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function InvoiceTable({ invoices }) {
  const navigate = useNavigate();

  if (!invoices || invoices.length === 0) {
    return (
      <div className="receipts-empty-state">
        <p>No invoices generated yet.</p>
      </div>
    );
  }

  return (
    <div className="receipts-table-wrapper">
      <table className="receipts-table">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Order No</th>
            <th>Owner</th>
            <th>Total</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Generated At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.invoiceId}>
              <td className="table-bold">{invoice.invoiceNumber}</td>
              <td>{invoice.orderNumber}</td>
              <td>
                <div>{invoice.ownerName}</div>
                <div className="table-subtext">{invoice.ownerEmail}</div>
              </td>
              <td className="table-amount">Rs. {invoice.totalAmount?.toFixed(2)}</td>
              <td>{invoice.paymentMethod ? invoice.paymentMethod.replace(/_/g, ' ') : '—'}</td>
              <td>
                <span className={`status-badge status-${invoice.paymentStatus?.toLowerCase()}`}>
                  {invoice.paymentStatus}
                </span>
              </td>
              <td>{invoice.createdAt ? format(new Date(invoice.createdAt), 'MMM dd, yyyy HH:mm') : '—'}</td>
              <td>
                <button 
                  className="btn-view-invoice"
                  onClick={() => navigate(`/dashboard/receipts/${invoice.invoiceId}`)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
