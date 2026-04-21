import React from 'react';

const VaccinationCard = ({ vaccination, isDoctor, onEdit }) => {
    const formattedDate = new Date(vaccination.vaccinationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const day = new Date(vaccination.vaccinationDate).getDate();
    const month = new Date(vaccination.vaccinationDate).toLocaleDateString('en-GB', { month: 'short' });

    return (
        <div className="update-item">
            <div className="update-date">
                <span>{day}</span>
                <small>{month}</small>
            </div>
            <div className="update-detail" style={{ width: '100%', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong>{vaccination.vaccinationName || 'Vaccination Record'}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{formattedDate}</span>
                        {isDoctor && (
                            <button className="staff-view-btn" onClick={() => onEdit(vaccination.id)} style={{ padding: '4px 12px', fontSize: '0.7rem' }}>
                                Modify Record
                            </button>
                        )}
                    </div>
                </div>
                <p>{vaccination.description || 'No vaccination notes recorded.'}</p>
                <div style={{ marginTop: '8px', fontSize: '0.95rem', color: 'var(--color-primary-dark)' }}>
                    <div><strong>Dose:</strong> {vaccination.dose || 'N/A'}</div>
                    {vaccination.dueDate && (
                        <div><strong>Next Due Date:</strong> {new Date(vaccination.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    )}
                    <div><strong>Doctor:</strong> Dr. {vaccination.doctorName} (ID: {vaccination.doctorId})</div>
                </div>
            </div>
        </div>
    );
};

export default VaccinationCard;
