
import React, { useState } from 'react';
import { updatePet } from '../../../../services/petService';
import '../../../../styles/AddPetForm.css'; 

const EditPetForm = ({ pet, onClose, onUpdateSuccess, userId }) => {
    const [form, setForm] = useState({
        name: pet.name || '',
        species: pet.species || '',
        breed: pet.breed || '',
        gender: pet.gender || '',
        dateOfBirth: pet.dateOfBirth || '',
        weight: pet.weight || '',
        knownIllnesses: pet.knownIllnesses || '',
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);

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
            data.append('ownerId', userId);
            data.append('name', form.name.trim());
            data.append('species', form.species.trim());
            if (form.breed) data.append('breed', form.breed.trim());
            if (form.gender) data.append('gender', form.gender);
            data.append('dateOfBirth', form.dateOfBirth);
            if (form.weight) data.append('weight', form.weight);
            if (form.knownIllnesses) data.append('knownIllnesses', form.knownIllnesses.trim());
            if (image) data.append('image', image);

            const response = await updatePet(pet.petId, data);

            if (response.success) {
                setAlert({ type: 'success', message: '🎉 Pet profile updated successfully!' });
                setTimeout(() => {
                    if (onUpdateSuccess) onUpdateSuccess();
                    onClose();
                }, 1200);
            } else {
                setAlert({ type: 'error', message: response.message || 'Failed to update pet profile.' });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setAlert({ type: 'error', message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pet-detail-overlay">
            <div className="pet-detail-panel" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
                <div className="modal-header" style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>✏️ Edit {pet.name}'s Profile</h2>
                    <button className="pet-detail-back-btn" onClick={onClose} aria-label="Close" style={{ position: 'static' }}>✕</button>
                </div>

                <form className="pet-form" onSubmit={handleSubmit} noValidate>
                    {alert && (
                        <div className={`form-alert ${alert.type}`} style={{ marginBottom: '16px' }}>
                            {alert.message}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="edit-pet-name">
                                Pet Name <span className="required">*</span>
                            </label>
                            <input
                                id="edit-pet-name"
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Buddy"
                            />
                            {errors.name && <span className="form-error-msg">⚠ {errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="edit-pet-species">
                                Species <span className="required">*</span>
                            </label>
                            <input
                                id="edit-pet-species"
                                className={`form-input ${errors.species ? 'error' : ''}`}
                                type="text"
                                name="species"
                                value={form.species}
                                onChange={handleChange}
                                placeholder="e.g. Dog"
                            />
                            {errors.species && <span className="form-error-msg">⚠ {errors.species}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="edit-pet-breed">Breed</label>
                            <input
                                id="edit-pet-breed"
                                className="form-input"
                                type="text"
                                name="breed"
                                value={form.breed}
                                onChange={handleChange}
                                placeholder="e.g. Labrador"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="edit-pet-gender">Gender</label>
                            <select
                                id="edit-pet-gender"
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
                            <label className="form-label" htmlFor="edit-pet-dob">
                                Date of Birth <span className="required">*</span>
                            </label>
                            <input
                                id="edit-pet-dob"
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
                            <label className="form-label" htmlFor="edit-pet-weight">Weight (kg)</label>
                            <input
                                id="edit-pet-weight"
                                className="form-input"
                                type="number"
                                name="weight"
                                value={form.weight}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="edit-pet-illnesses">Known Illnesses / Conditions</label>
                        <textarea
                            id="edit-pet-illnesses"
                            className="form-textarea"
                            name="knownIllnesses"
                            value={form.knownIllnesses}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Update Pet Photo (Optional)</label>
                        <div className="image-upload-area">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                id="edit-pet-image"
                            />
                            <span className="image-upload-icon">📷</span>
                            <p className="image-upload-text"><strong>Click to change</strong></p>
                        </div>
                        {preview && (
                            <div className="image-preview">
                                <img src={preview} alt="Preview" />
                                <span className="image-preview-name">{image?.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="form-actions" style={{ marginTop: '32px' }}>
                        <button type="button" className="btn btn-cancel" onClick={onClose} style={{ padding: '12px 28px' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-teal" disabled={submitting} style={{ padding: '12px 28px' }}>
                            {submitting ? '⏳ Updating...' : '✓ Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPetForm;
