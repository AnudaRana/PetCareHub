import React, { useState } from 'react';
import InvoiceStatusBadge from './InvoiceStatusBadge';

function AppointmentReceiptModal({ appointment, onClose }) {
  const petName = appointment.pet?.name || appointment.petName || 'N/A';
  const petSpecies = appointment.pet?.species || appointment.petSpecies || '';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '12px', padding: '2rem',
          maxWidth: '480px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Appointment Receipt</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Payment Confirmation</p>
          </div>
          <span style={{ fontSize: '1.8rem' }}>🧾</span>
        </div>

        {/* Paid badge */}
        <div style={{
          background: '#dcfce7', color: '#166534', borderRadius: '20px',
          padding: '6px 16px', display: 'inline-block', fontSize: '0.85rem',
          fontWeight: '600', marginBottom: '1.5rem',
        }}>
          ✓ PAID
        </div>

        {/* Details */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          {[
            ['Pet', `${petName}${petSpecies ? ` (${petSpecies})` : ''}`],
            ['Appointment Type', appointment.appointmentType || '—'],
            ['Doctor', appointment.doctor || '—'],
            ['Date', appointment.date || '—'],
            ['Time', appointment.timeSlot || '—'],
            ['Notes', appointment.notes || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{label}</span>
              <span style={{ color: '#111827', fontSize: '0.9rem', fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
            </div>
          ))}

          {/* Amount */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', padding: '12px 0',
            marginTop: '8px', borderTop: '2px solid #e5e7eb',
          }}>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>Amount Paid</span>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: '#059669' }}>
              LKR {appointment.price ? Number(appointment.price).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem', width: '100%', padding: '10px',
            background: '#0d9488', color: '#fff', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function OwnerAppointmentsTable({ appointments }) {
  const [selectedAppt, setSelectedAppt] = useState(null);

  if (!appointments || appointments.length === 0) {
    return (
      <div className="billing-empty-state">
        <p>No appointment records found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="billing-table-wrapper" style={{ marginTop: '2rem' }}>
        <table className="billing-table">
          <thead>
            <tr>
              <th>Pet</th>
              <th>Type</th>
              <th>Date &amp; Time</th>
              <th>Doctor</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => {
              const petName = appt.pet?.name || appt.petName || 'N/A';
              const status = (appt.status || '').replace('_', ' ');
              const date = appt.date || '—';
              const time = appt.timeSlot || appt.time || '—';
              const doctor = appt.doctor || '—';

              let paymentStatus = (appt.paymentStatus || '').toUpperCase();
              if (appt.paid === true && paymentStatus !== 'PAID') paymentStatus = 'PAID';
              if (!paymentStatus && appt.paid === false) paymentStatus = 'UNPAID';

              const isPaid = paymentStatus === 'PAID';

              return (
                <tr key={appt.id || appt.appointmentId || Math.random()}>
                  <td>{petName}</td>
                  <td>{appt.appointmentType || '—'}</td>
                  <td>{date} {time !== '—' ? `at ${time}` : ''}</td>
                  <td>{doctor}</td>
                  <td>
                    <span className={`order-status-${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <InvoiceStatusBadge status={paymentStatus} />
                  </td>
                  <td>
                    {isPaid ? (
                      <span
                        className="invoice-card-payment"
                        style={{ color: '#059669', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setSelectedAppt(appt)}
                        title="View Receipt"
                      >
                        ✓ Card Payment
                      </span>
                    ) : (
                      <span className="invoice-not-available" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                        {paymentStatus === 'PENDING' || paymentStatus === 'AWAITING_PAYMENT' ? 'Awaiting Payment' : 'Awaiting Invoice'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedAppt && (
        <AppointmentReceiptModal
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      )}
    </>
  );
}
