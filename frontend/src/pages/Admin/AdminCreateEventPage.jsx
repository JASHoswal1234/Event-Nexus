import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import { createEvent, updateEvent, getEventById } from "../../services/eventsApi";

const AdminCreateEventPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);
  const [loading, setLoading] = useState(isEditMode);
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
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const event = await getEventById(eventId);
          setFormData({
            title: event.title || '',
            description: event.description || '',
            date: event.date ? event.date.split('T')[0] : '',
            mode: event.mode || 'online',
            venue: event.venue || '',
            capacity: event.capacity || '',
            registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
            isTeamEvent: event.isTeamEvent || false,
            minTeamSize: event.minTeamSize || '',
            maxTeamSize: event.maxTeamSize || ''
          });
        } catch (error) {
          console.error('Failed to fetch event:', error);
          showToast('Failed to load event. Please try again.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [eventId, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditMode) {
        await updateEvent(eventId, formData);
        showToast('Event updated successfully', 'success');
      } else {
        await createEvent(formData);
        showToast('Event created successfully', 'success');
      }
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (error) {
      console.error('Submit failed:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`;
      showToast(errorMessage, 'error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="large" />
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Event' : 'Create Event'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update event details' : 'Add a new event to the platform'}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="title"
              label="Title"
              type="text"
              placeholder="Event title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={submitting}
              required
            />

            <Input
              name="date"
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              disabled={submitting}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value }))}
                disabled={submitting}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <Input
              name="venue"
              label="Venue"
              type="text"
              placeholder="Event venue"
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              disabled={submitting}
            />

            <Input
              name="capacity"
              label="Capacity"
              type="number"
              placeholder="Maximum capacity"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              disabled={submitting}
            />

            <Input
              name="registrationDeadline"
              label="Registration Deadline"
              type="date"
              value={formData.registrationDeadline}
              onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              placeholder="Event description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={submitting}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isTeamEvent"
                checked={formData.isTeamEvent}
                onChange={(e) => setFormData(prev => ({ ...prev, isTeamEvent: e.target.checked }))}
                disabled={submitting}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Team Event
              </label>
            </div>

            {formData.isTeamEvent && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="minTeamSize"
                  label="Min Team Size"
                  type="number"
                  placeholder="Minimum team size"
                  value={formData.minTeamSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, minTeamSize: e.target.value }))}
                  disabled={submitting}
                />
                <Input
                  name="maxTeamSize"
                  label="Max Team Size"
                  type="number"
                  placeholder="Maximum team size"
                  value={formData.maxTeamSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxTeamSize: e.target.value }))}
                  disabled={submitting}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
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
              {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminCreateEventPage;
