import React, { useState, useEffect } from 'react';
import { receiptService } from '../services/receiptService';
import EligibleOrdersTable from '../components/EligibleOrdersTable';
import InvoiceTable from '../components/InvoiceTable';
import GenerateInvoiceModal from '../components/GenerateInvoiceModal';
import '../styles/StaffReceipts.css';

export default function StaffReceiptsPage() {
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orders, invoicesData] = await Promise.all([
        receiptService.getEligibleOrders(),
        receiptService.getAllInvoices()
      ]);
      setEligibleOrders(orders);
      setInvoices(invoicesData);
      setError('');
    } catch (err) {
      console.error('Failed to fetch receipts data:', err);
      setError('Failed to load receipts data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedOrder) return;

    try {
      setIsProcessing(true);
      setError('');
      setSuccess('');
      
      console.log('Selected order:', selectedOrder);
      console.log('Order ID being sent:', selectedOrder.orderId);
      console.log('Order ID type:', typeof selectedOrder.orderId);
      
      await receiptService.generateInvoice(selectedOrder.orderId);
      
      setSuccess(`Invoice generated successfully for order ${selectedOrder.orderNumber}`);
      setSelectedOrder(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);
      if (err.response?.data) {
        console.error('Full error response:', JSON.stringify(err.response.data, null, 2));
      }
      setError(err.response?.data?.message || 'Failed to generate invoice. Please try again.');
    } finally {
      setIsProcessing(false);
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
          <p>Manage billing records and generate invoices for completed orders.</p>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div className="receipts-section">
        <h3>Eligible Orders</h3>
        <p>Orders that can be invoiced</p>
        <EligibleOrdersTable 
          orders={eligibleOrders}
          onGenerateInvoice={(order) => setSelectedOrder(order)}
        />
      </div>

      <div className="receipts-section">
        <h3>Generated Invoices</h3>
        <p>All billing records</p>
        <InvoiceTable invoices={invoices} />
      </div>

      {selectedOrder && (
        <GenerateInvoiceModal
          order={selectedOrder}
          onConfirm={handleGenerateInvoice}
          onCancel={() => setSelectedOrder(null)}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
