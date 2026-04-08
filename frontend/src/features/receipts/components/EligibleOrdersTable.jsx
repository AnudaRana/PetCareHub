import React from 'react';
import { format } from 'date-fns';

export default function EligibleOrdersTable({ orders, onGenerateInvoice }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="receipts-empty-state">
        <p>No eligible orders available for invoicing.</p>
      </div>
    );
  }

  return (
    <div className="receipts-table-wrapper">
      <table className="receipts-table">
        <thead>
          <tr>
            <th>Order No</th>
            <th>Owner</th>
            <th>Pet</th>
            <th>Pickup Date</th>
            <th>Payment Method</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderNumber}</td>
              <td>
                <div>{order.ownerName}</div>
                <div className="table-subtext">{order.ownerEmail}</div>
              </td>
              <td>
                <div>{order.petName}</div>
                <div className="table-subtext">{order.petSpecies}</div>
              </td>
              <td>{order.pickupDate ? format(new Date(order.pickupDate), 'MMM dd, yyyy') : '—'}</td>
              <td>{order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : '—'}</td>
              <td className="table-amount">Rs. {order.total?.toFixed(2)}</td>
              <td>
                <button 
                  className="btn-generate-invoice"
                  onClick={() => onGenerateInvoice(order)}
                >
                  Generate Invoice
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
