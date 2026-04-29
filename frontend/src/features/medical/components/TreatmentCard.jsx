import React from 'react';

const TreatmentCard = ({ treatment, isDoctor, onEdit, onDelete }) => {
    const formattedDate = new Date(treatment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const day = new Date(treatment.date).getDate();
    const month = new Date(treatment.date).toLocaleDateString('en-GB', { month: 'short' });

    return (
        <div className="update-item">
            <div className="update-date">
                <span>{day}</span>
                <small>{month}</small>
            </div>
            <div className="update-detail">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong>{treatment.diagnosis || 'Clinical Consultation'}</strong>
                    {isDoctor && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="staff-view-btn" onClick={() => onEdit(treatment.id)} style={{ padding: '4px 12px', fontSize: '0.7rem' }}>
                                Modify Record
                            </button>
                            <button className="staff-view-btn" onClick={() => onDelete(treatment.id)} style={{ padding: '4px 12px', fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
                <p>{treatment.notes || 'No treatment notes recorded for this session.'}</p>
                
                {treatment.observation && (
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-primary-dark)', background: 'rgba(20,27,61,0.03)', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)' }}>
                        <strong>Vitals & Observation:</strong> {treatment.observation}
                    </div>
                )}

                <div className="update-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💊</span>
                        <strong>Prescription:</strong> {treatment.prescription || 'None'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⚕️</span>
                        <span>Dr. {treatment.doctorName} (ID: {treatment.doctorId})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreatmentCard;
