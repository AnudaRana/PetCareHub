
import React, { useState } from 'react';
import { registerPet } from '../../../../services/petService';
import '../../../../styles/AddPetForm.css';

const INITIAL_FORM = {
    name: '',
    species: '',
    breed: '',
    gender: '',
    dateOfBirth: '',
    weight: '',
    knownIllnesses: '',
};

const AddPetForm = ({ onClose, onSuccess, userId }) => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null); // { type: 'success'|'error', message }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Pet name is required';
        if (!form.species.trim()) newErrors.species = 'Species is required';
        if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        setAlert(null);

        try {
            const data = new FormData();
            data.append('ownerId', userId); // Pass the manual userId
            data.append('name', form.name.trim());
            data.append('species', form.species.trim());
            if (form.breed) data.append('breed', form.breed.trim());
            if (form.gender) data.append('gender', form.gender);
            data.append('dateOfBirth', form.dateOfBirth);
            if (form.weight) data.append('weight', form.weight);
            if (form.knownIllnesses) data.append('knownIllnesses', form.knownIllnesses.trim());
            if (image) data.append('image', image);

            const response = await registerPet(data);

            if (response.success) {
                setAlert({ type: 'success', message: '🎉 Pet registered successfully!' });
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1200);
            } else {
                setAlert({ type: 'error', message: response.message || 'Failed to register pet.' });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setAlert({ type: 'error', message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🐾 Register New Pet</h2>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <form className="pet-form" onSubmit={handleSubmit} noValidate>
                    {alert && (
                        <div className={`form-alert ${alert.type}`}>
                            {alert.message}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="pet-name">
                                Pet Name <span className="required">*</span>
                            </label>
                            <input
                                id="pet-name"
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Buddy"
                                autoComplete="off"
                            />
                            {errors.name && <span className="form-error-msg">⚠ {errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="pet-species">
                                Species <span className="required">*</span>
                            </label>
                            <input
                                id="pet-species"
                                className={`form-input ${errors.species ? 'error' : ''}`}
                                type="text"
                                name="species"
                                value={form.species}
                                onChange={handleChange}
                                placeholder="e.g. Dog, Cat, Bird"
                            />
                            {errors.species && <span className="form-error-msg">⚠ {errors.species}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="pet-breed">Breed</label>
                            <input
                                id="pet-breed"
                                className="form-input"
                                type="text"
                                name="breed"
                                value={form.breed}
                                onChange={handleChange}
                                placeholder="e.g. Labrador"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="pet-gender">Gender</label>
                            <select
                                id="pet-gender"
                                className="form-select"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="UNKNOWN">Unknown</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="pet-dob">
                                Date of Birth <span className="required">*</span>
                            </label>
                            <input
                                id="pet-dob"
                                className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                                type="date"
                                name="dateOfBirth"
                                value={form.dateOfBirth}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            {errors.dateOfBirth && <span className="form-error-msg">⚠ {errors.dateOfBirth}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="pet-weight">Weight (kg)</label>
                            <input
                                id="pet-weight"
                                className="form-input"
                                type="number"
                                name="weight"
                                value={form.weight}
                                onChange={handleChange}
                                placeholder="e.g. 12.5"
                                min="0"
                                step="0.1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="pet-illnesses">Known Illnesses / Conditions</label>
                        <textarea
                            id="pet-illnesses"
                            className="form-textarea"
                            name="knownIllnesses"
                            value={form.knownIllnesses}
                            onChange={handleChange}
                            placeholder="e.g. Allergies, Diabetes, None"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Pet Photo</label>
                        <div className="image-upload-area">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                id="pet-image-upload"
                            />
                            <span className="image-upload-icon">📷</span>
                            <p className="image-upload-text">
                                <strong>Click to upload</strong> or drag and drop<br />
                                <small>PNG, JPG, GIF up to 10MB</small>
                            </p>
                        </div>
                        {preview && (
                            <div className="image-preview">
                                <img src={preview} alt="Preview" />
                                <span className="image-preview-name">{image?.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={submitting}>
                            {submitting ? '⏳ Saving...' : '✓ Register Pet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPetForm;
