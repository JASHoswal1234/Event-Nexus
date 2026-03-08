import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Toast from "../../components/common/Toast";
import { getAllEvents } from "../../services/eventsApi";
import { registerForEvent } from "../../services/registrationsApi";

const ParticipantEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [registeringEvents, setRegisteringEvents] = useState(new Set());

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
        
        // Check if it's an auth error
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
          if (errorMessage.toLowerCase().includes('no token')) {
            showToast('Please log in to view events', 'error');
          } else {
            showToast('Session expired. Please log in again.', 'error');
          }
        } else {
          showToast('Failed to load events. Please try again later.', 'error');
        }
        
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getModeBadge = (mode) => {
    const variants = {
      online: 'info',
      offline: 'success',
      hybrid: 'warning'
    };
    return <Badge variant={variants[mode] || 'default'}>{mode}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRegister = async (eventId) => {
    // Prevent multiple simultaneous registrations
    if (registeringEvents.has(eventId) || registeredEvents.has(eventId)) {
      return;
    }

    // Add to registering state
    setRegisteringEvents(prev => new Set(prev).add(eventId));

    try {
      await registerForEvent(eventId);
      
      // Update registered events state
      setRegisteredEvents(prev => new Set(prev).add(eventId));
      
      // Remove from registering state
      setRegisteringEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      
      showToast('Successfully registered for event!', 'success');
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Remove from registering state
      setRegisteringEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const isRegistered = (eventId) => registeredEvents.has(eventId);
  const isRegistering = (eventId) => registeringEvents.has(eventId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="large" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div>
        <Toast 
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Events</h1>
          <p className="text-gray-600 mb-8">Discover and register for exciting events</p>
          <EmptyState
            title="No Events Available"
            description="There are no events at the moment. Check back later or make sure you're logged in to view events."
          />
        </div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Events</h1>
        <p className="text-gray-600">Discover and register for exciting events happening near you</p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!Array.isArray(events) ? (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500">Loading events...</div>
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No Events Available"
            description="There are no events at the moment. Check back later!"
          />
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  {getModeBadge(event.mode)}
                </div>
                
                {event.description && (
                  <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {event.venue}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {event.capacity} participants
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3">
                  <Button 
                    type="button"
                    onClick={() => navigate(`/participant/events/${event.id}`)}
                  >
                    View Details
                  </Button>
                  
                  {isRegistered(event.id) ? (
                    <Button variant="outline" disabled>
                      Registered
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleRegister(event.id)}
                      disabled={isRegistering(event.id)}
                    >
                      {isRegistering(event.id) ? 'Registering...' : 'Register'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantEventsPage;
