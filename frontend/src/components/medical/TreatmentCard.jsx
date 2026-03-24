import React from 'react';

const TreatmentCard = ({ treatment, isDoctor, onEdit }) => (
  <div className="update-item">
    <div className="update-date">{treatment.date}</div>
    <div className="update-detail">
      <div><strong>{treatment.diagnosis}</strong></div>
      <div>{treatment.notes}</div>
      <div>Prescription: {treatment.prescription}</div>
      <div>Observation: {treatment.observation}</div>
      <div>Doctor: {treatment.doctorName} ({treatment.doctorId})</div>
    </div>
    {isDoctor && <button className="btn btn-edit card-edit-btn" onClick={() => onEdit(treatment.id)}>Edit</button>}
  </div>
);

export default TreatmentCard;
