import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import InputField from "../../components/forms/InputField";
import SelectField from "../../components/forms/SelectField";
import TextAreaField from "../../components/forms/TextAreaField";
import { createEvent } from "../../services/eventsApi";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    mode: 'online',
    venue: '',
    capacity: '',
    registrationDeadline: '',
    isTeamEvent: false,
    minTeamSize: '',
    maxTeamSize: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      if (selectedDate < today) {
        newErrors.date = 'Date must be in the future';
      }
    }

    // Mode validation
    if (!formData.mode) {
      newErrors.mode = 'Mode is required';
    }

    // Venue/Link validation based on mode
    if (formData.mode === 'offline' && !formData.venue.trim()) {
      newErrors.venue = 'Venue is required for offline events';
    }
    if (formData.mode === 'online' && !formData.venue.trim()) {
      newErrors.venue = 'Meeting link is required for online events';
    }

    // Capacity validation
    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required';
    } else if (parseInt(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    // Registration deadline validation
    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required';
    } else {
      const deadlineDate = new Date(formData.registrationDeadline);
      const eventDate = new Date(formData.date);
      
      if (deadlineDate < today) {
        newErrors.registrationDeadline = 'Registration deadline must be in the future';
      } else if (deadlineDate > eventDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before event date';
      }
    }

    // Team event validation
    if (formData.isTeamEvent) {
      if (!formData.minTeamSize) {
        newErrors.minTeamSize = 'Minimum team size is required';
      } else if (parseInt(formData.minTeamSize) <= 0) {
        newErrors.minTeamSize = 'Minimum team size must be greater than 0';
      }

      if (!formData.maxTeamSize) {
        newErrors.maxTeamSize = 'Maximum team size is required';
      } else if (parseInt(formData.maxTeamSize) <= 0) {
        newErrors.maxTeamSize = 'Maximum team size must be greater than 0';
      } else if (parseInt(formData.maxTeamSize) < parseInt(formData.minTeamSize)) {
        newErrors.maxTeamSize = 'Maximum team size must be greater than or equal to minimum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Submitting form data:', formData); // Debug log
      await createEvent(formData);
      showToast('Event created successfully', 'success');
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (error) {
      console.error('Create failed:', error);
      console.error('Error response:', error.response?.data); // Debug log
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create event';
      const errorDetails = error.response?.data?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        // Show validation errors
        const errorMsg = errorDetails.map(e => `${e.field}: ${e.message}`).join(', ');
        showToast(errorMsg, 'error');
      } else {
        showToast(errorMessage, 'error');
      }
      setSubmitting(false);
    }
  };

  const modeOptions = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' }
  ];

  const getVenueLabel = () => {
    if (formData.mode === 'online') return 'Meeting Link';
    if (formData.mode === 'offline') return 'Venue';
    return 'Venue / Meeting Link';
  };

  const getVenuePlaceholder = () => {
    if (formData.mode === 'online') return 'https://meet.google.com/...';
    if (formData.mode === 'offline') return 'Enter venue address';
    return 'Enter venue or meeting link';
  };

  return (
    <div>
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h1>
        <p className="text-gray-600">Add a new event to the platform</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Event Title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                required
                disabled={submitting}
                error={errors.title}
              />

              <InputField
                label="Event Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={submitting}
                error={errors.date}
                helperText="Event date must be in the future"
              />

              <SelectField
                label="Event Mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                options={modeOptions}
                required
                disabled={submitting}
                error={errors.mode}
              />

              <InputField
                label={getVenueLabel()}
                name="venue"
                type="text"
                value={formData.venue}
                onChange={handleChange}
                placeholder={getVenuePlaceholder()}
                required
                disabled={submitting}
                error={errors.venue}
              />

              <InputField
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Maximum number of participants"
                required
                disabled={submitting}
                error={errors.capacity}
                min="1"
              />

              <InputField
                label="Registration Deadline"
                name="registrationDeadline"
                type="date"
                value={formData.registrationDeadline}
                onChange={handleChange}
                required
                disabled={submitting}
                error={errors.registrationDeadline}
                helperText="Must be before event date"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <TextAreaField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of the event"
              disabled={submitting}
              error={errors.description}
              rows={5}
            />
          </div>

          {/* Team Event Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isTeamEvent"
                  name="isTeamEvent"
                  checked={formData.isTeamEvent}
                  onChange={handleChange}
                  disabled={submitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isTeamEvent" className="ml-2 block text-sm text-gray-900">
                  This is a team event
                </label>
              </div>

              {formData.isTeamEvent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-blue-200">
                  <InputField
                    label="Minimum Team Size"
                    name="minTeamSize"
                    type="number"
                    value={formData.minTeamSize}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                    required={formData.isTeamEvent}
                    disabled={submitting}
                    error={errors.minTeamSize}
                    min="1"
                  />
                  <InputField
                    label="Maximum Team Size"
                    name="maxTeamSize"
                    type="number"
                    value={formData.maxTeamSize}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    required={formData.isTeamEvent}
                    disabled={submitting}
                    error={errors.maxTeamSize}
                    min="1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button 
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/events')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Creating Event...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateEventPage;
