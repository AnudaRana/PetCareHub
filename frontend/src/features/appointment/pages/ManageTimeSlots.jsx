import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import {
  getMySlots,
  addSlot,
  updateSlot,
  deleteSlot,
} from '../../../services/timeSlotService';
import '../styles/ManageTimeSlots.css';

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */

/**
 * Convert a native <input type="time"> value ("HH:mm") to the display
 * format used throughout the app ("09:00 AM" / "02:30 PM").
 */
const toDisplayTime = (hhmm) => {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const modifier = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, '0')}:${m} ${modifier}`;
};

/**
 * Convert a display time ("09:00 AM") back to "HH:mm" for the time input.
 */
const toInputTime = (display) => {
  if (!display) return '';
  const [timePart, modifier] = display.trim().split(' ');
  let [h, m] = timePart.split(':');
  h = parseInt(h, 10);
  if (modifier === 'PM' && h !== 12) h += 12;
  if (modifier === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
};

/* ─────────────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────────────── */

/** Inline edit form shown inside a slot card */
const SlotEditForm = ({ slot, onSave, onCancel, saving }) => {
  const [timeValue, setTimeValue] = useState(toInputTime(slot.timeSlot));
  const [labelValue, setLabelValue] = useState(slot.label || '');

  const handleSave = () => {
    const display = toDisplayTime(timeValue);
    if (!display) return;
    onSave(slot.id, { timeSlot: display, label: labelValue });
  };

  return (
    <div className="mts-edit-form">
      <input
        id={`edit-time-${slot.id}`}
        type="time"
        value={timeValue}
        onChange={(e) => setTimeValue(e.target.value)}
        disabled={saving}
      />
      <input
        id={`edit-label-${slot.id}`}
        type="text"
        placeholder="Label (optional)"
        value={labelValue}
        onChange={(e) => setLabelValue(e.target.value)}
        disabled={saving}
      />
      <div className="mts-edit-actions">
        <button
          className="mts-btn-primary"
          onClick={handleSave}
          disabled={saving || !timeValue}
          type="button"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          className="mts-btn-ghost"
          onClick={onCancel}
          disabled={saving}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/** A single slot card */
const SlotCard = ({ slot, onEdit, onDelete, deletingId, editingId, onSave, onCancelEdit, savingId }) => {
  const isEditing  = editingId === slot.id;
  const isDeleting = deletingId === slot.id;
  const isSaving   = savingId === slot.id;

  return (
    <div className="mts-slot-card">
      {isEditing ? (
        <SlotEditForm
          slot={slot}
          onSave={onSave}
          onCancel={onCancelEdit}
          saving={isSaving}
        />
      ) : (
        <>
          <div className="mts-slot-time">
            <span className="mts-slot-time-icon">🕐</span>
            {slot.timeSlot}
          </div>
          {slot.label && (
            <div className="mts-slot-label">{slot.label}</div>
          )}
          <div className="mts-slot-actions">
            <button
              className="mts-btn-edit"
              onClick={() => onEdit(slot.id)}
              type="button"
              disabled={isDeleting}
            >
              Edit
            </button>
            <button
              className="mts-btn-danger"
              onClick={() => onDelete(slot.id)}
              type="button"
              disabled={isDeleting}
            >
              {isDeleting ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────── */

const ManageTimeSlots = () => {
  const { user } = useAuth();

  /* ── State ── */
  const [slots, setSlots]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // Add form
  const [newTime, setNewTime]       = useState('');
  const [newLabel, setNewLabel]     = useState('');
  const [adding, setAdding]         = useState(false);

  // Inline edit / delete tracking
  const [editingId, setEditingId]   = useState(null);
  const [savingId, setSavingId]     = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* ── Data fetching ── */
  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMySlots();
      setSlots(data || []);
    } catch (err) {
      setError('Failed to load your time slots. Please refresh.');
      console.error('ManageTimeSlots fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.userId) fetchSlots();
  }, [user, fetchSlots]);

  /* ── Flash helpers ── */
  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3500);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4500);
  };

  /* ── Handlers ── */
  const handleAdd = async () => {
    const display = toDisplayTime(newTime);
    if (!display) {
      showError('Please select a valid time.');
      return;
    }

    setAdding(true);
    setError('');
    try {
      const saved = await addSlot({ timeSlot: display, label: newLabel.trim() || undefined });
      setSlots((prev) => [...prev, saved]);
      setNewTime('');
      setNewLabel('');
      showSuccess(`Time slot ${saved.timeSlot} added successfully.`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add time slot.');
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSavingId(null);
  };

  const handleSaveEdit = async (id, payload) => {
    setSavingId(id);
    setError('');
    try {
      const updated = await updateSlot(id, payload);
      setSlots((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
      showSuccess(`Slot updated to ${updated.timeSlot}.`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update slot.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this time slot? Existing booked appointments are not affected.')) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteSlot(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
      showSuccess('Time slot removed.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete slot.');
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Render ── */
  return (
    <div className="mts-container animate-fade-up">
      {/* Header */}
      <div className="mts-header">
        <div>
          <h2>Manage Time Slots</h2>
          <p>Define the time slots during which patients can book appointments with you.</p>
        </div>
        {!loading && (
          <span className="mts-count-badge">
            {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
          </span>
        )}
      </div>

      {/* Flash messages */}
      {error   && <div className="mts-error"  role="alert">{error}</div>}
      {success && <div className="mts-success" role="status">{success}</div>}

      {/* Add slot form */}
      <div className="mts-add-card">
        <h3>➕ Add New Time Slot</h3>
        <div className="mts-add-form">
          <div className="mts-field">
            <label htmlFor="new-slot-time">Time *</label>
            <input
              id="new-slot-time"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              disabled={adding}
            />
          </div>
          <div className="mts-field">
            <label htmlFor="new-slot-label">Label (optional)</label>
            <input
              id="new-slot-label"
              type="text"
              placeholder="e.g. Morning Consultation"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              disabled={adding}
            />
          </div>
          <button
            className="mts-btn-primary"
            onClick={handleAdd}
            disabled={adding || !newTime}
            type="button"
          >
            {adding ? 'Adding…' : 'Add Slot'}
          </button>
        </div>
      </div>

      {/* Slots list */}
      <div className="mts-list-card">
        <h3>
          Your Available Slots
        </h3>

        {loading ? (
          <div className="mts-loading">
            <div className="spinner" />
            <p>Loading your time slots…</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="mts-empty">
            <div className="mts-empty-icon">🕐</div>
            <p>No time slots configured yet.<br />Add your first slot above so patients can book appointments.</p>
          </div>
        ) : (
          <div className="mts-slots-grid">
            {slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSave={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editingId={editingId}
                savingId={savingId}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTimeSlots;
