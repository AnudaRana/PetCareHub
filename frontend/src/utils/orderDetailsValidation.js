export function validateOrderDetails(values) {
  const errors = {};

  if (!values.fullName?.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!values.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.contactNumber?.trim()) {
    errors.contactNumber = "Contact number is required.";
  }

  if (!values.petId) {
    errors.petId = "Please select a pet.";
  }

  if (!values.pickupDate) {
    errors.pickupDate = "Pickup date is required.";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pickupDate = new Date(`${values.pickupDate}T00:00:00`);
    if (pickupDate < today) {
      errors.pickupDate = "Pickup date cannot be in the past.";
    }
  }

  if (values.notes && values.notes.length > 1000) {
    errors.notes = "Additional notes must be 1000 characters or less.";
  }

  return errors;
}
