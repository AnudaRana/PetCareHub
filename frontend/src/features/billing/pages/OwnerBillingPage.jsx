import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingService } from '../services/billingService';
import OwnerOrdersTable from '../components/OwnerOrdersTable';
import OwnerAppointmentsTable from '../components/OwnerAppointmentsTable';
import { useAuth } from '../../auth/contexts/AuthContext';
import axios from 'axios';
import '../styles/OwnerBilling.css';

export default function OwnerBillingPage() {
  const { user } = useAuth();
  const userId = user?.userId;
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchBillingData();
    }
  }, [userId]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const ordersData = await billingService.getBillingOrders();
      setOrders(ordersData);

      // Fetch appointments
      let apptsData = [];
      try {
        const res = await axios.get(`/api/appointments/user/${userId}`);
        apptsData = Array.isArray(res.data) ? res.data : [];
        
        // Also fetch vaccinations if possible
        const { getUpcomingVaccinationsByOwner } = await import("../../../services/vaccinationApi");
        const vacRes = await getUpcomingVaccinationsByOwner(userId);
        const vacs = Array.isArray(vacRes) ? vacRes : (Array.isArray(vacRes?.data) ? vacRes.data : []);
        const mappedVacs = vacs.map(v => ({
           id: `vac-${v.id}`,
           pet: { name: v.petName, species: v.petSpecies, petId: v.petId },
           petName: v.petName,
           appointmentType: "Vaccination: " + v.vaccinationName,
           doctor: v.doctorName || "Staff",
           date: v.dueDate,
           timeSlot: "Pending",
           status: new Date(v.dueDate) < new Date() ? "OVERDUE" : "UPCOMING",
           paid: true,
           paymentStatus: "PAID"
        }));
        apptsData = [...apptsData, ...mappedVacs];
      } catch (apptErr) {
        console.error('Failed to fetch appointments:', apptErr);
      }
      
      // Sort appointments by date descending
      apptsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAppointments(apptsData);

      setError('');
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
      setError('Failed to load billing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (order) => {
    navigate(`/dashboard/billing/invoice/${order.orderId}`);
  };

  if (loading) {
    return <div className="loading-state">Loading billing information...</div>;
  }

  return (
    <div className="owner-billing-page">
      <div className="billing-header">
        <h2>Billing</h2>
        <p>View your orders, invoices, and payment details</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="billing-section">
        <h3>Your Orders</h3>
        <p>Track your orders and view invoices</p>
        <OwnerOrdersTable 
          orders={orders}
          onViewInvoice={handleViewInvoice}
        />
      </div>

      <div className="billing-section" style={{ marginTop: '3rem' }}>
        <h3>Your Appointments</h3>
        <p>Track your appointment and vaccination billing status</p>
        <OwnerAppointmentsTable 
          appointments={appointments}
        />
      </div>
    </div>
  );
}
