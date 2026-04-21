import React from 'react';
import VaccinationCard from './VaccinationCard';

const VaccinationList = ({ vaccinations, isDoctor, onEdit }) => (
  <div className="update-list animate-fade-up">
    {vaccinations.map((vaccination) => (
      <VaccinationCard key={vaccination.id} vaccination={vaccination} isDoctor={isDoctor} onEdit={onEdit} />
    ))}
    {vaccinations.length === 0 && (
      <div className="empty-state" style={{ padding: '40px 20px', border: '2px dashed rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <span className="empty-state-icon">💉</span>
        <h3>No vaccination history available</h3>
        <p>This patient does not have any vaccination records yet.</p>
      </div>
    )}
  </div>
);

export default VaccinationList;
