import React from 'react';

const statusConfig = {
  PAID: { color: '#10b981', bg: '#d1fae5', label: 'Paid' },
  PENDING: { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
  VERIFIED: { color: '#0ea5e9', bg: '#e0f2fe', label: 'Verified' },
  FAILED: { color: '#ef4444', bg: '#fee2e2', label: 'Failed' },
  AWAITING_INVOICE: { color: '#6b7280', bg: '#f3f4f6', label: 'Awaiting Invoice' }
};

export default function InvoiceStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  
  return (
    <span 
      className="invoice-status-badge" 
      style={{ 
        color: config.color, 
        backgroundColor: config.bg,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
      }}
    >
      {config.label}
    </span>
  );
}
