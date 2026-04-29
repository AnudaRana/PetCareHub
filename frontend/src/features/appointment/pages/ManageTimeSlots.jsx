import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import {
  getMySlots,
  addSlot,
  updateSlot,
} from '../../../services/timeSlotService';
import '../styles/ManageTimeSlots.css';

import { getDefaultTimeSlots } from '../../../services/appointmentManagementService';

/* ─────────────────────────────────────────────────────────────────────────
   Operations  : 9:00 AM – 12:00 PM  (1 hr / slot)
   Vaccinations: 12:00 PM – 1:00 PM  (15 min / slot)
───────────────────────────────────────────────────────────────────────── */

/** Categorise a slot by its label prefix */
const getCategory = (label = '') => {
  if (label.startsWith('Operation'))  return 'operation';
  if (label.startsWith('Vaccination')) return 'vaccination';
  return 'other';
};

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */

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

  const handleSave = () => {
    const display = toDisplayTime(timeValue);
    if (!display) return;
    onSave(slot.id, { timeSlot: display, label: slot.label });
  };

  return (
    <div className="mts-edit-form">
      <div className="mts-edit-form-label">Update time for "{slot.label}"</div>
      <input
        id={`edit-time-${slot.id}`}
        type="time"
        value={timeValue}
        onChange={(e) => setTimeValue(e.target.value)}
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
const SlotCard = ({ slot, category, onEdit, editingId, onSave, onCancelEdit, savingId }) => {
  const isEditing = editingId === slot.id;
  const isSaving  = savingId  === slot.id;

  return (
    <div className={`mts-slot-card mts-slot-card--${category}`}>
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
            <span className="mts-slot-time-icon">
              {category === 'operation' ? '🔪' : '💉'}
            </span>
            <span className="mts-slot-time-text">{slot.timeSlot}</span>
          </div>

          <div className="mts-slot-label">{slot.label}</div>

          <div className="mts-slot-duration-tag">
            {category === 'operation' ? '1 hr · Operation' : '15 min · Vaccination'}
          </div>

          <div className="mts-slot-actions">
            <button
              className="mts-btn-edit"
              onClick={() => onEdit(slot.id)}
              type="button"
            >
              ✏️ Edit Time
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Section component
───────────────────────────────────────────────────────────────────────── */

const SlotSection = ({ title, subtitle, icon, category, slots, editingId, savingId, onEdit, onSave, onCancelEdit }) => (
  <div className={`mts-section mts-section--${category}`}>
    <div className="mts-section-header">
      <div className="mts-section-icon">{icon}</div>
      <div>
        <h3 className="mts-section-title">{title}</h3>
        <p className="mts-section-subtitle">{subtitle}</p>
      </div>
      <span className="mts-section-badge">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
    </div>

    <div className="mts-slots-grid">
      {slots.map((slot) => (
        <SlotCard
          key={slot.id}
          slot={slot}
          category={category}
          onEdit={onEdit}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
          editingId={editingId}
          savingId={savingId}
        />
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────── */

const ManageTimeSlots = () => {
  const { user } = useAuth();

  /* ── State ── */
  const [slots, setSlots]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [seeding, setSeeding]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  
  const isSeedingRef = useRef(false);

  // Inline edit tracking
  const [editingId, setEditingId]   = useState(null);
  const [savingId, setSavingId]     = useState(null);

  /* ── Flash helpers ── */
  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3500);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4500);
  };

  /* ── Auto-seed default slots if vet has none ── */
  const seedDefaultSlots = useCallback(async () => {
    if (isSeedingRef.current) return;
    isSeedingRef.current = true;
    setSeeding(true);
    try {
      const defaultSlots = await getDefaultTimeSlots();
      const created = [];
      for (const def of defaultSlots) {
        try {
          const saved = await addSlot(def);
          created.push(saved);
        } catch {
          // If duplicate exists (e.g. from a partial earlier seed), skip silently
        }
      }
      setSlots(created);
      showSuccess('Your default time slots have been configured.');
    } catch (err) {
      showError('Failed to set up default time slots. Please refresh.');
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
      isSeedingRef.current = false;
    }
  }, []);

  /* ── Data fetching ── */
  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMySlots();
      if (!data || data.length === 0) {
        // No slots yet — auto-seed
        await seedDefaultSlots();
      } else {
        setSlots(data);
      }
    } catch (err) {
      showError('Failed to load your time slots. Please refresh.');
      console.error('ManageTimeSlots fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [seedDefaultSlots]);

  useEffect(() => {
    if (user?.userId) fetchSlots();
  }, [user, fetchSlots]);

  /* ── Handlers ── */
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

  /* ── Categorise slots ── */
  const operationSlots  = slots.filter((s) => getCategory(s.label) === 'operation');
  const vaccinationSlots = slots.filter((s) => getCategory(s.label) === 'vaccination');

  /* ── Render ── */
  return (
    <div className="mts-container animate-fade-up">
      {/* Page header */}
      <div className="mts-header">
        <div>
          <h2>Time Slot Schedule</h2>
          <p>Your fixed daily schedule. Click <strong>Edit Time</strong> on any slot to adjust it if needed.</p>
        </div>
        {!loading && !seeding && (
          <span className="mts-count-badge">{slots.length} / 7 slots</span>
        )}
      </div>

      {/* Flash messages */}
      {error   && <div className="mts-error"  role="alert">{error}</div>}
      {success && <div className="mts-success" role="status">{success}</div>}

      {/* Loading / seeding states */}
      {(loading || seeding) ? (
        <div className="mts-loading">
          <div className="spinner" />
          <p>{seeding ? 'Setting up your default time slots…' : 'Loading your schedule…'}</p>
        </div>
      ) : (
        <>
          {/* Operations section */}
          <SlotSection
            title="Operations"
            subtitle="9:00 AM – 12:00 PM · 1 hour per slot"
            icon="🔪"
            category="operation"
            slots={operationSlots}
            editingId={editingId}
            savingId={savingId}
            onEdit={handleEdit}
            onSave={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
          />

          {/* Vaccinations section */}
          <SlotSection
            title="Vaccinations"
            subtitle="12:00 PM – 1:00 PM · 15 minutes per slot"
            icon="💉"
            category="vaccination"
            slots={vaccinationSlots}
            editingId={editingId}
            savingId={savingId}
            onEdit={handleEdit}
            onSave={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
          />
        </>
      )}
    </div>
  );
};

export default ManageTimeSlots;
