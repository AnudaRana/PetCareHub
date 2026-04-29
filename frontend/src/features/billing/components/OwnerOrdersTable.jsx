import React from 'react';
import { format } from 'date-fns';
import InvoiceStatusBadge from './InvoiceStatusBadge';

export default function OwnerOrdersTable({ orders, onViewInvoice }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="billing-empty-state">
        <p>No billing records found.</p>
      </div>
    );
  }

  return (
    <div className="billing-table-wrapper">
      <table className="billing-table">
        <thead>
          <tr>
            <th>Order No</th>
            <th>Pet</th>
            <th>Pickup Date</th>
            <th>Order Total</th>
            <th>Order Status</th>
            <th>Payment Status</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderNumber}</td>
              <td>{order.petName}</td>
              <td>{order.pickupDate ? format(new Date(order.pickupDate), 'MMM dd, yyyy') : '—'}</td>
              <td className="table-amount">Rs. {order.orderTotal?.toFixed(2)}</td>
              <td>
                <span className={`order-status-${order.orderStatus?.toLowerCase()}`}>
                  {order.orderStatus?.replace('_', ' ')}
                </span>
              </td>
              <td>
                <InvoiceStatusBadge status={order.paymentStatus} />
              </td>
              <td>
                {order.paymentMethod === 'CARD' ? (
                  order.paymentStatus === 'PAID' ? (
                    <span 
                      className="invoice-card-payment" 
                      style={{ color: '#059669', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => onViewInvoice(order)}
                      title="View Receipt"
                    >
                      ✓ Card Payment
                    </span>
                  ) : (
                    <span className="invoice-awaiting-payment" style={{ color: '#6366f1', fontStyle: 'italic' }}>
                      Awaiting Payment
                    </span>
                  )
                ) : order.invoiceAvailable ? (
                  <span 
                    className="invoice-number-link" 
                    onClick={() => onViewInvoice(order)}
                    style={{ 
                      cursor: 'pointer', 
                      color: 'var(--color-primary)', 
                      fontWeight: 'bold',
                      textDecoration: 'underline'
                    }}
                    title="View Invoice"
                  >
                    {order.invoiceNumber}
                  </span>
                ) : (
                  <span className="invoice-not-available" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                    Awaiting Invoice
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
