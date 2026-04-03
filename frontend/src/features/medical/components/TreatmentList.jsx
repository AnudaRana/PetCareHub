import React from 'react';
import TreatmentCard from './TreatmentCard';

const TreatmentList = ({ treatments, isDoctor, onEdit }) => (
  <div className="popup-panel">
    {treatments.map((t) => (
      <TreatmentCard key={t.id} treatment={t} isDoctor={isDoctor} onEdit={onEdit} />
    ))}
    {treatments.length === 0 && (
      <div className="empty-medical-state">
        <span className="empty-medical-icon">📂</span>
        <p>No treatments found for this pet.</p>
      </div>
    )}
  </div>
);

export default TreatmentList;
