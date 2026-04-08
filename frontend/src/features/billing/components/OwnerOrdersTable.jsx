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
            <th>Action</th>
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
                {order.invoiceAvailable ? (
                  <span className="invoice-available">✓ {order.invoiceNumber}</span>
                ) : (
                  <span className="invoice-not-available">Not Generated</span>
                )}
              </td>
              <td>
                {order.invoiceAvailable ? (
                  <button 
                    className="btn-view-invoice"
                    onClick={() => onViewInvoice(order)}
                  >
                    View Invoice
                  </button>
                ) : (
                  <button 
                    className="btn-disabled"
                    disabled
                  >
                    Awaiting Invoice
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
