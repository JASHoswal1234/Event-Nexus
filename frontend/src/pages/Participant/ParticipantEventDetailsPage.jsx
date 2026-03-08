import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Modal from '../../components/common/Modal';
import apiClient from '../../services/apiClient';
import { getEventById } from '../../services/eventsApi';
import { registerForEvent, cancelRegistration } from '../../services/registrationsApi';
import { getEventTeam, createTeam, joinTeam } from '../../services/teamsApi';
import { useAuth } from '../../hooks/useAuth';

const ParticipantEventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  
  // Participant profile
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [participantProfile, setParticipantProfile] = useState({
    name: user?.name || '',
    skills: [],
    role: '',
    experience: '',
    interests: [],
    preferredTeamSize: 4
  });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  
  // Team modals
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', joinCode: '' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const eventData = await getEventById(eventId);
      setEvent(eventData);
      
      // Check if user is registered from localStorage
      const storedRegistrations = localStorage.getItem('registeredEvents');
      if (storedRegistrations) {
        try {
          const registeredIds = JSON.parse(storedRegistrations);
          const isUserRegistered = registeredIds.includes(eventId) || registeredIds.includes(eventData._id);
          setIsRegistered(isUserRegistered);
        } catch (e) {
          console.error('Failed to parse stored registrations:', e);
          setIsRegistered(false);
        }
      } else {
        setIsRegistered(false);
      }
      
      // If event requires teams, check if user has a team
      if (eventData.isTeamEvent) {
        await fetchTeamInfo();
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      showToast('Failed to load event details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamInfo = async () => {
    try {
      const teamData = await getEventTeam(eventId);
      setTeam(teamData);
    } catch (error) {
      // No team found - that's okay
      setTeam(null);
    }
  };

  const handleRegister = async () => {
    try {
      setSubmitting(true);
      await registerForEvent(eventId);
      showToast('Successfully registered for event!', 'success');
      setIsRegistered(true);
      
      // Update localStorage
      const storedRegistrations = localStorage.getItem('registeredEvents');
      let registeredIds = [];
      if (storedRegistrations) {
        try {
          registeredIds = JSON.parse(storedRegistrations);
        } catch (e) {
          registeredIds = [];
        }
      }
      if (!registeredIds.includes(eventId)) {
        registeredIds.push(eventId);
        localStorage.setItem('registeredEvents', JSON.stringify(registeredIds));
      }
      
      // If team event, fetch team info
      if (event.isTeamEvent) {
        await fetchTeamInfo();
      }
    } catch (error) {
      console.error('Registration failed:', error);
      showToast(error.response?.data?.message || 'Failed to register', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) {
      return;
    }
    
    try {
      setSubmitting(true);
      await cancelRegistration(eventId);
      showToast('Registration cancelled', 'success');
      setIsRegistered(false);
      setTeam(null);
      
      // Update localStorage
      const storedRegistrations = localStorage.getItem('registeredEvents');
      if (storedRegistrations) {
        try {
          let registeredIds = JSON.parse(storedRegistrations);
          registeredIds = registeredIds.filter(id => id !== eventId && id !== event._id);
          localStorage.setItem('registeredEvents', JSON.stringify(registeredIds));
        } catch (e) {
          console.error('Failed to update localStorage:', e);
        }
      }
    } catch (error) {
      console.error('Failed to cancel:', error);
      showToast('Failed to cancel registration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    if (!teamForm.name.trim()) {
      showToast('Please enter a team name', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      const newTeam = await createTeam(eventId, teamForm.name);
      setTeam(newTeam);
      setShowCreateTeamModal(false);
      setTeamForm({ name: '', joinCode: '' });
      showToast('Team created successfully!', 'success');
    } catch (error) {
      console.error('Failed to create team:', error);
      showToast(error.response?.data?.message || 'Failed to create team', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    
    if (!teamForm.joinCode.trim()) {
      showToast('Please enter a join code', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      const joinedTeam = await joinTeam(teamForm.joinCode);
      setTeam(joinedTeam);
      setShowJoinTeamModal(false);
      setTeamForm({ name: '', joinCode: '' });
      showToast('Successfully joined team!', 'success');
    } catch (error) {
      console.error('Failed to join team:', error);
      showToast(error.response?.data?.message || 'Failed to join team', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !participantProfile.skills.includes(skillInput.trim())) {
      setParticipantProfile({
        ...participantProfile,
        skills: [...participantProfile.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setParticipantProfile({
      ...participantProfile,
      skills: participantProfile.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !participantProfile.interests.includes(interestInput.trim())) {
      setParticipantProfile({
        ...participantProfile,
        interests: [...participantProfile.interests, interestInput.trim()]
      });
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setParticipantProfile({
      ...participantProfile,
      interests: participantProfile.interests.filter(interest => interest !== interestToRemove)
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Backend doesn't have /profiles endpoint
      // Save to localStorage only
      localStorage.setItem(`participant_profile_${eventId}`, JSON.stringify(participantProfile));
      
      showToast('Profile saved successfully!', 'success');
      setShowProfileModal(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      showToast('Failed to save profile. Please try again.', 'error');
    }
  };

  const loadProfile = async () => {
    // Backend doesn't have /profiles endpoint
    // Load from localStorage only
    const savedProfile = localStorage.getItem(`participant_profile_${eventId}`);
    if (savedProfile) {
      setParticipantProfile(JSON.parse(savedProfile));
    }
  };

  useEffect(() => {
    loadProfile();
  }, [eventId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Event not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Event Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className={`px-2 py-1 rounded ${event.mode === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {event.mode}
            </span>
            {event.isTeamEvent && (
              <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">
                Team Event
              </span>
            )}
          </div>
        </div>
        <Button type="button" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* Event Details */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Description:</span>
            <p className="text-gray-600 mt-1">{event.description}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Date:</span>
            <p className="text-gray-600">{formatDate(event.date)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Location:</span>
            <p className="text-gray-600">{event.location}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Capacity:</span>
            <p className="text-gray-600">{event.capacity} participants</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Registration Deadline:</span>
            <p className="text-gray-600">{formatDate(event.registrationDeadline)}</p>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          {!isRegistered ? (
            <Button type="button" onClick={handleRegister} disabled={submitting}>
              {submitting ? 'Registering...' : 'Register for Event'}
            </Button>
          ) : (
            <Button type="button" onClick={handleCancelRegistration} disabled={submitting}>
              Cancel Registration
            </Button>
          )}
        </div>
      </Card>

      {/* Team Section - Only show if team event and user is registered */}
      {event.isTeamEvent && (
        <>
          {/* Participant Profile Section */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
              <Button type="button" onClick={() => setShowProfileModal(true)}>
                Edit Profile
              </Button>
            </div>
            
            {participantProfile.name || participantProfile.skills.length > 0 ? (
              <div className="space-y-3">
                {participantProfile.name && (
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">{participantProfile.name}</p>
                  </div>
                )}
                {participantProfile.role && (
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>
                    <p className="text-gray-900">{participantProfile.role}</p>
                  </div>
                )}
                {participantProfile.experience && (
                  <div>
                    <span className="font-medium text-gray-700">Experience:</span>
                    <p className="text-gray-900">{participantProfile.experience}</p>
                  </div>
                )}
                {participantProfile.skills.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {participantProfile.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {participantProfile.interests.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Interests:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {participantProfile.interests.map((interest, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {participantProfile.preferredTeamSize && (
                  <div>
                    <span className="font-medium text-gray-700">Preferred Team Size:</span>
                    <p className="text-gray-900">{participantProfile.preferredTeamSize} members</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Complete your profile to help others find you for team formation.</p>
            )}
          </Card>

          {isRegistered && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Management</h2>
              
              {!team ? (
                <div className="space-y-4">
                  <p className="text-gray-600">You need to join or create a team for this event.</p>
                  
                  {/* Find Teammates Button */}
                  <Button 
                    type="button" 
                    onClick={() => navigate(`/participant/find-teammates/${eventId}`)}
                    className="w-full mb-3"
                  >
                    🔍 Find Compatible Teammates
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button type="button" onClick={() => setShowCreateTeamModal(true)}>
                      Create Team
                    </Button>
                    <Button type="button" onClick={() => setShowJoinTeamModal(true)}>
                      Join Team
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Team Name:</span>
                    <p className="text-gray-900 text-lg">{team.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Join Code:</span>
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded ml-2">
                      {team.joinCode}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Members:</span>
                    <ul className="mt-2 space-y-2">
                      {team.members?.map((member, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="text-gray-900">{member.name || member.email}</span>
                          {member.id === team.owner && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Owner</span>
                          )}
                          {member.id === user?.id && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={showCreateTeamModal}
        onClose={() => setShowCreateTeamModal(false)}
        title="Create Team"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter team name"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" onClick={() => setShowCreateTeamModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Team Modal */}
      <Modal
        isOpen={showJoinTeamModal}
        onClose={() => setShowJoinTeamModal(false)}
        title="Join Team"
      >
        <form onSubmit={handleJoinTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Join Code
            </label>
            <input
              type="text"
              value={teamForm.joinCode}
              onChange={(e) => setTeamForm({ ...teamForm, joinCode: e.target.value })}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter team join code"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" onClick={() => setShowJoinTeamModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Joining...' : 'Join Team'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Edit Your Profile"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={participantProfile.name}
              onChange={(e) => setParticipantProfile({ ...participantProfile, name: e.target.value })}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={participantProfile.role}
              onChange={(e) => setParticipantProfile({ ...participantProfile, role: e.target.value })}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a role</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={participantProfile.experience}
              onChange={(e) => setParticipantProfile({ ...participantProfile, experience: e.target.value })}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select experience level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a skill (e.g., Python, React)"
              />
              <Button type="button" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {participantProfile.skills.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm flex items-center">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add an interest (e.g., AI, Healthcare)"
              />
              <Button type="button" onClick={handleAddInterest}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {participantProfile.interests.map((interest, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm flex items-center">
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Team Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Team Size
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={participantProfile.preferredTeamSize}
              onChange={(e) => setParticipantProfile({ ...participantProfile, preferredTeamSize: parseInt(e.target.value) })}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" onClick={() => setShowProfileModal(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSaveProfile}>
            Save Profile
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ParticipantEventDetailsPage;
