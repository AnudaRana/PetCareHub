import React from 'react';

const VaccinationCard = ({ vaccination }) => {
    const formattedDate = new Date(vaccination.vaccinationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const day = new Date(vaccination.vaccinationDate).getDate();
    const month = new Date(vaccination.vaccinationDate).toLocaleDateString('en-GB', { month: 'short' });

    return (
        <div className="update-item">
            <div className="update-date">
                <span>{day}</span>
                <small>{month}</small>
            </div>
            <div className="update-detail">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong>{vaccination.vaccinationName || 'Vaccination Record'}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{formattedDate}</span>
                </div>
                <p>{vaccination.description || 'No vaccination notes recorded.'}</p>
                <div style={{ marginTop: '8px', fontSize: '0.95rem', color: 'var(--color-primary-dark)' }}>
                    <div><strong>Dose:</strong> {vaccination.dose || 'N/A'}</div>
                    <div><strong>Doctor:</strong> Dr. {vaccination.doctorName} (ID: {vaccination.doctorId})</div>
                </div>
            </div>
        </div>
    );
};

export default VaccinationCard;
