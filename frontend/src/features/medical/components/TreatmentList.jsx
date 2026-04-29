import React from 'react';
import TreatmentCard from './TreatmentCard';

const TreatmentList = ({ treatments, isDoctor, onEdit, onDelete }) => (
  <div className="update-list animate-fade-up">
    {treatments.map((t) => (
      <TreatmentCard key={t.id} treatment={t} isDoctor={isDoctor} onEdit={onEdit} onDelete={onDelete} />
    ))}
    {treatments.length === 0 && (
      <div className="empty-state" style={{ padding: '40px 20px', border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <span className="empty-state-icon">📋</span>
        <h3>No medical session history found</h3>
        <p>This patient has no treatment or diagnosis records on file.</p>
      </div>
    )}
  </div>
);

export default TreatmentList;
