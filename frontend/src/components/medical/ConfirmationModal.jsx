import React from 'react';

const ConfirmationModal = ({ isOpen, title, message, onDone, actionType = 'add' }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-backdrop" role="dialog" aria-modal="true">
      <div className="confirmation-box">
        <div className="confirmation-icon-container">
          <div className="confirmation-icon">✓</div>
        </div>
        <h2 className="confirmation-title">{title}</h2>
        <p className="confirmation-message">{message}</p>
        <button className="btn btn-done" onClick={onDone}>Done</button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
