import React from 'react';

const MedicalModal = ({ title, isOpen, onClose, onSave, children, disabled }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="modal-fields">{children}</div>
        <div className="modal-actions">
          <button className="btn btn-white" onClick={onClose}>Cancel</button>
          <button className="btn btn-teal" onClick={onSave} disabled={disabled}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default MedicalModal;
