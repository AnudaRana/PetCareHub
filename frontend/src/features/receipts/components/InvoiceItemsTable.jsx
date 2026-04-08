import React from 'react';

export default function InvoiceItemsTable({ items }) {
  if (!items || items.length === 0) {
    return <p>No items in this invoice.</p>;
  }

  return (
    <div className="receipts-table-wrapper">
      <table className="receipts-table">
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
              <td>
                <div>{item.productName}</div>
                <div className="table-subtext">Product ID: {item.productId}</div>
              </td>
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
