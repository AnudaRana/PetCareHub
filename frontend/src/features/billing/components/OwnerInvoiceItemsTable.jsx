import React from 'react';

export default function OwnerInvoiceItemsTable({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="billing-empty-state">
        <p>No items in this invoice.</p>
      </div>
    );
  }

  return (
    <div className="invoice-items-table-wrapper">
      <h4>Invoice Items</h4>
      <table className="billing-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Unit Price</th>
            <th>Quantity</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.invoiceItemId}>
              <td>{item.productName}</td>
              <td className="table-amount">Rs. {item.unitPrice?.toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td className="table-amount">Rs. {item.lineTotal?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
