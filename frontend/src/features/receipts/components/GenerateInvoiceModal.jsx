import React from 'react';

export default function GenerateInvoiceModal({ order, onConfirm, onCancel, isProcessing }) {
  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Generate Invoice</h3>
          <button className="modal-close" onClick={onCancel} disabled={isProcessing}>×</button>
        </div>
        
        <div className="modal-body">
          <p>Are you sure you want to generate an invoice for this order?</p>
          
          <div className="invoice-preview-summary">
            <div className="summary-row">
              <span>Order Number:</span>
              <strong>{order.orderNumber}</strong>
            </div>
            <div className="summary-row">
              <span>Owner:</span>
              <strong>{order.ownerName}</strong>
            </div>
            <div className="summary-row">
              <span>Pet:</span>
              <strong>{order.petName}</strong>
            </div>
            <div className="summary-row">
              <span>Total Amount:</span>
              <strong className="amount-highlight">Rs. {order.total?.toFixed(2)}</strong>
            </div>
          </div>
          
          <p className="modal-warning">
            This action will create a billing record that cannot be undone.
          </p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn-modal-secondary"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            className="btn-modal-primary"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Generating...' : 'Generate Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
