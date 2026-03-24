import React from 'react';

const MedicalModal = ({ title, isOpen, onClose, onSave, children, disabled }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h3>{title}</h3>
        <div className="modal-fields">{children}</div>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn btn-save" onClick={onSave} disabled={disabled}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default MedicalModal;
