import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Toast from "../../components/common/Toast";
import Modal from "../../components/common/Modal";
import InputField from "../../components/forms/InputField";
import MyEventCard from "../../components/events/MyEventCard";
import { getAllEvents } from "../../services/eventsApi";
import { createTeam, joinTeam } from "../../services/teamsApi";

const ParticipantMyEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  
  // Create Team Modal
  const [createTeamModal, setCreateTeamModal] = useState({ isOpen: false, event: null });
  const [teamName, setTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  
  // Join Team Modal
  const [joinTeamModal, setJoinTeamModal] = useState({ isOpen: false, event: null });
  const [joinCode, setJoinCode] = useState('');
  const [joiningTeam, setJoiningTeam] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const fetchMyEvents = async () => {
    try {
      // Get registered event IDs from localStorage
      const storedRegistrations = localStorage.getItem('registeredEvents');
      if (!storedRegistrations) {
        setEvents([]);
        setLoading(false);
        return;
      }

      let registeredIds = [];
      try {
        registeredIds = JSON.parse(storedRegistrations);
      } catch (e) {
        console.error('Failed to parse stored registrations:', e);
        setEvents([]);
        setLoading(false);
        return;
      }

      if (registeredIds.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      // Fetch all events and filter by registered IDs
      const allEvents = await getAllEvents();
      const myRegisteredEvents = allEvents.filter(event => 
        registeredIds.includes(event.id) || registeredIds.includes(event._id)
      );
      
      setEvents(Array.isArray(myRegisteredEvents) ? myRegisteredEvents : []);
    } catch (error) {
      console.error('Failed to fetch my events:', error);
      showToast('Failed to load your events. Please try again later.', 'error');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Create Team Handlers
  const openCreateTeamModal = (event) => {
    setCreateTeamModal({ isOpen: true, event });
    setTeamName('');
  };

  const closeCreateTeamModal = () => {
    setCreateTeamModal({ isOpen: false, event: null });
    setTeamName('');
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      showToast('Please enter a team name', 'error');
      return;
    }

    setCreatingTeam(true);
    try {
      await createTeam(createTeamModal.event.id, teamName);
      showToast('Team created successfully', 'success');
      closeCreateTeamModal();
      // Refresh events to show updated team status
      await fetchMyEvents();
    } catch (error) {
      console.error('Failed to create team:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create team';
      showToast(errorMessage, 'error');
    } finally {
      setCreatingTeam(false);
    }
  };

  // Join Team Handlers
  const openJoinTeamModal = (event) => {
    setJoinTeamModal({ isOpen: true, event });
    setJoinCode('');
  };

  const closeJoinTeamModal = () => {
    setJoinTeamModal({ isOpen: false, event: null });
    setJoinCode('');
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      showToast('Please enter a join code', 'error');
      return;
    }

    setJoiningTeam(true);
    try {
      await joinTeam(joinCode);
      showToast('Successfully joined team', 'success');
      closeJoinTeamModal();
      // Refresh events to show updated team status
      await fetchMyEvents();
    } catch (error) {
      console.error('Failed to join team:', error);
      const errorMessage = error.response?.data?.message || 'Failed to join team';
      showToast(errorMessage, 'error');
    } finally {
      setJoiningTeam(false);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
        <p className="text-gray-600">Events you have registered for</p>
      </div>

      {/* Events Grid or Empty State */}
      {events.length === 0 ? (
        <EmptyState
          title="You have not registered for any events yet."
          description="Start exploring events and register for ones that interest you!"
        >
          <Button 
            type="button" 
            onClick={() => navigate('/participant/events')}
          >
            Browse Events
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <MyEventCard
              key={event.id}
              event={event}
              onCreateTeam={openCreateTeamModal}
              onJoinTeam={openJoinTeamModal}
            />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal 
        isOpen={createTeamModal.isOpen} 
        onClose={closeCreateTeamModal}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create Team</h2>
        <p className="text-gray-600 mb-4">
          Create a team for "{createTeamModal.event?.title}"
        </p>
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <InputField
            label="Team Name"
            name="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            required
            disabled={creatingTeam}
          />
          <div className="flex justify-end space-x-4">
            <Button 
              type="button"
              variant="outline"
              onClick={closeCreateTeamModal}
              disabled={creatingTeam}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={creatingTeam}
            >
              {creatingTeam ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Team Modal */}
      <Modal 
        isOpen={joinTeamModal.isOpen} 
        onClose={closeJoinTeamModal}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Join Team</h2>
        <p className="text-gray-600 mb-4">
          Enter the team code to join a team for "{joinTeamModal.event?.title}"
        </p>
        <form onSubmit={handleJoinTeam} className="space-y-4">
          <InputField
            label="Team Join Code"
            name="joinCode"
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-character code"
            required
            disabled={joiningTeam}
            helperText="Ask your team leader for the join code"
          />
          <div className="flex justify-end space-x-4">
            <Button 
              type="button"
              variant="outline"
              onClick={closeJoinTeamModal}
              disabled={joiningTeam}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={joiningTeam}
            >
              {joiningTeam ? 'Joining...' : 'Join Team'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ParticipantMyEventsPage;
