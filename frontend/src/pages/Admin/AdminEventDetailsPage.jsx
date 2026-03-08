import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import { getEventById } from "../../services/eventsApi";
import { getEventRegistrations } from "../../services/registrationsApi";
import { getEventTeams } from "../../services/teamsApi";
import apiClient from "../../services/apiClient";

const AdminEventDetailsPage = () => {
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState('details');
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: ''
  });
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
  const [checkingIn, setCheckingIn] = useState(new Set());

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch event details
        const eventData = await getEventById(eventId);
        setEvent(eventData);

        // Fetch attendees
        try {
          const attendeesData = await getEventRegistrations(eventId);
          setAttendees(Array.isArray(attendeesData) ? attendeesData : []);
        } catch (error) {
          console.error('Failed to fetch attendees:', error);
          setAttendees([]);
        }

        // Fetch teams
        try {
          const teamsData = await getEventTeams(eventId);
          setTeams(Array.isArray(teamsData) ? teamsData : []);
        } catch (error) {
          console.error('Failed to fetch teams:', error);
          setTeams([]);
        }

        // Initialize announcements as empty array
        setAnnouncements([]);

      } catch (error) {
        console.error('Failed to fetch event details:', error);
        showToast('Failed to load event details. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      showToast('Please fill in all announcement fields', 'error');
      return;
    }

    setSubmittingAnnouncement(true);
    
    try {
      // API call to create announcement
      const response = await apiClient.post('/announcements', {
        eventId,
        title: announcementForm.title,
        content: announcementForm.message // Backend expects 'content', not 'message'
      });
      
      const newAnnouncement = {
        id: response.data.announcement?.id || response.data.announcement?._id || Date.now(),
        title: announcementForm.title,
        message: announcementForm.message,
        createdAt: new Date().toISOString()
      };
      
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setAnnouncementForm({ title: '', message: '' });
      showToast('Announcement sent successfully', 'success');
    } catch (error) {
      console.error('Failed to send announcement:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to send announcement. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const handleCheckIn = async (attendee) => {
    // Prevent multiple simultaneous check-ins
    if (checkingIn.has(attendee.id)) {
      return;
    }

    // Add to checking in state
    setCheckingIn(prev => new Set(prev).add(attendee.id));

    try {
      // Backend expects: POST /registrations/:eventId/checkin with { userId }
      const userId = attendee.user?._id || attendee.user?.id || attendee.userId;
      
      if (!userId) {
        throw new Error('User ID not found in attendee data');
      }
      
      await apiClient.post(`/registrations/${eventId}/checkin`, { userId });
      
      // Update attendee status locally
      setAttendees(prev => Array.isArray(prev) ? prev.map(a => 
        a.id === attendee.id 
          ? { ...a, checkedIn: true, checkInTime: new Date().toISOString() }
          : a
      ) : []);
      
      showToast('Attendee checked in successfully', 'success');
    } catch (error) {
      console.error('Check-in failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to check in attendee';
      showToast(errorMessage, 'error');
    } finally {
      // Remove from checking in state
      setCheckingIn(prev => {
        const newSet = new Set(prev);
        newSet.delete(attendee.id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getModeBadge = (mode) => {
    const variants = {
      online: 'bg-blue-100 text-blue-800',
      offline: 'bg-green-100 text-green-800',
      hybrid: 'bg-yellow-100 text-yellow-800'
    };
    return variants[mode] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    const variants = {
      registered: 'bg-green-100 text-green-800',
      'checked-in': 'bg-green-600 text-white'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
        <p className="text-gray-600">The event you're looking for doesn't exist.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'attendees', label: 'Attendees' },
    { id: 'teams', label: 'Teams' },
    { id: 'announcements', label: 'Announcements' }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
        <p className="text-gray-600">Manage event details, attendees, teams and announcements</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Title</h3>
                  <p className="text-lg text-gray-900">{event.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-gray-900">{event.description || 'No description provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-gray-900">{formatDate(event.date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mode</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getModeBadge(event.mode)}`}>
                    {event.mode || 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Settings</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Venue</h3>
                  <p className="text-gray-900">{event.venue || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
                  <p className="text-gray-900">{event.capacity || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Registration Deadline</h3>
                  <p className="text-gray-900">{formatDate(event.registrationDeadline)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Team Event</h3>
                  <p className="text-gray-900">{event.isTeamEvent ? 'Yes' : 'No'}</p>
                </div>
                {event.isTeamEvent && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Min Team Size</h3>
                      <p className="text-gray-900">{event.minTeamSize || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Max Team Size</h3>
                      <p className="text-gray-900">{event.maxTeamSize || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Attendees Tab */}
        {activeTab === 'attendees' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Attendees ({attendees.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No attendees registered yet
                      </td>
                    </tr>
                  ) : (
                    attendees.map((attendee) => (
                      <tr key={attendee.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {attendee.user?.email || attendee.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {attendee.user?.email || attendee.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${attendee.checkedIn ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}>
                            {attendee.checkedIn ? 'Checked In' : 'Registered'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {attendee.checkedIn ? (
                            <Button 
                              type="button"
                              size="sm" 
                              disabled
                              className="bg-gray-100 text-gray-600 cursor-not-allowed"
                            >
                              ✓ Checked-in
                            </Button>
                          ) : (
                            <Button 
                              type="button"
                              size="sm"
                              onClick={() => handleCheckIn(attendee)}
                              disabled={checkingIn.has(attendee.id)}
                            >
                              {checkingIn.has(attendee.id) ? 'Checking in...' : 'Check-In'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Teams ({teams.length})</h2>
            {teams.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <p className="text-gray-500">No teams created for this event yet</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <Card key={team.id}>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                      <div className="text-sm text-gray-600">
                        {team.members ? `${team.members.length} Members` : '0 Members'}
                      </div>
                      {team.joinCode && (
                        <div className="text-xs text-gray-500">
                          Join Code: {team.joinCode}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {/* Send Announcement Form */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Announcement</h2>
              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Input
                    name="title"
                    type="text"
                    placeholder="Announcement title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                    disabled={submittingAnnouncement}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Announcement message"
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                    disabled={submittingAnnouncement}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={submittingAnnouncement}
                >
                  {submittingAnnouncement ? 'Sending...' : 'Send Announcement'}
                </Button>
              </form>
            </Card>

            {/* Announcements List */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Previous Announcements</h2>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No announcements sent yet</p>
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                      <p className="text-gray-600 mt-1">{announcement.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(announcement.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventDetailsPage;
