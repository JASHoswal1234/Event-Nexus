import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Toast from "../../components/common/Toast";
import Modal from "../../components/common/Modal";
import AdminEventTable from "../../components/events/AdminEventTable";
import { getAllEvents, deleteEvent } from "../../services/eventsApi";

const AdminEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, event: null });
  const [deleting, setDeleting] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await getAllEvents();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        showToast('Failed to load events. Please try again later.', 'error');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const openDeleteModal = (event) => {
    setDeleteModal({ isOpen: true, event });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, event: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.event) return;

    setDeleting(true);
    try {
      await deleteEvent(deleteModal.event.id);
      showToast('Event deleted successfully', 'success');
      setEvents(prev => Array.isArray(prev) ? prev.filter(e => e.id !== deleteModal.event.id) : []);
      closeDeleteModal();
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete event';
      showToast(errorMessage, 'error');
    } finally {
      setDeleting(false);
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Events</h1>
          <p className="text-gray-600">Create, edit and manage all platform events</p>
        </div>
        <Button 
          type="button" 
          onClick={() => navigate('/admin/events/create')}
        >
          Create Event
        </Button>
      </div>

      {/* Events Table or Empty State */}
      {events.length === 0 ? (
        <EmptyState
          title="No events created yet"
          description="Start by creating your first event to get started"
        >
          <Button 
            type="button" 
            onClick={() => navigate('/admin/events/create')}
          >
            Create First Event
          </Button>
        </EmptyState>
      ) : (
        <AdminEventTable 
          events={events} 
          onDelete={openDeleteModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteModal.isOpen} 
        onClose={closeDeleteModal}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Event</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{deleteModal.event?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Button 
            type="button"
            variant="outline"
            onClick={closeDeleteModal}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Event'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminEventsPage;
