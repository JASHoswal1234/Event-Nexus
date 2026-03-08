import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Toast from "../../components/common/Toast";
import TeamForm from "../../components/teams/TeamForm";
import TeamMembersList from "../../components/teams/TeamMembersList";
import { createTeam, joinTeam, getEventTeams } from "../../services/teamsApi";
import { getEventById } from "../../services/eventsApi";
import { useAuth } from "../../hooks/useAuth";

const TeamPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [activeTab, setActiveTab] = useState('create');

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const fetchData = async () => {
    try {
      // Fetch event details
      const eventData = await getEventById(eventId);
      setEvent(eventData);

      // Fetch all teams for this event
      const teamsData = await getEventTeams(eventId);
      setAllTeams(Array.isArray(teamsData) ? teamsData : []);

      // Find user's team
      const myTeam = teamsData.find(team => 
        team.members?.some(member => {
          const memberId = member._id || member.id || member;
          return memberId === user?.id || memberId === user?._id;
        })
      );
      setUserTeam(myTeam || null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Failed to load team information', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId && user) {
      fetchData();
    }
  }, [eventId, user]);

  const handleCreateTeam = async (teamName) => {
    setCreatingTeam(true);
    try {
      const result = await createTeam(eventId, teamName);
      showToast('Team created successfully!', 'success');
      
      // Show join code in toast
      if (result.joinCode) {
        setTimeout(() => {
          showToast(`Your team join code is: ${result.joinCode}`, 'info');
        }, 2000);
      }

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Create team failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create team';
      showToast(errorMessage, 'error');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (joinCode) => {
    setJoiningTeam(true);
    try {
      await joinTeam(joinCode);
      showToast('Successfully joined team!', 'success');
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Join team failed:', error);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
            <p className="text-gray-600">
              {event?.title || 'Event'} - {userTeam ? 'Your Team' : 'Create or Join a Team'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/participant/my-events')}
          >
            Back to My Events
          </Button>
        </div>
      </div>

      {/* User's Team or Team Forms */}
      {userTeam ? (
        <div className="space-y-6">
          {/* User's Team Details */}
          <TeamMembersList 
            team={userTeam} 
            currentUserId={user?.id || user?._id}
          />

          {/* Other Teams (Optional) */}
          {allTeams.length > 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Other Teams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTeams
                  .filter(team => team.id !== userTeam.id)
                  .map(team => (
                    <div 
                      key={team.id}
                      className="p-4 border border-gray-200 rounded-lg bg-white"
                    >
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {team.members?.length || 0} members
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Team
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('join')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'join'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Join Team
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="max-w-2xl">
            {activeTab === 'create' ? (
              <TeamForm
                type="create"
                onSubmit={handleCreateTeam}
                loading={creatingTeam}
              />
            ) : (
              <TeamForm
                type="join"
                onSubmit={handleJoinTeam}
                loading={joiningTeam}
              />
            )}
          </div>

          {/* Existing Teams List */}
          {allTeams.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Existing Teams ({allTeams.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTeams.map(team => (
                  <div 
                    key={team.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {team.members?.length || 0} members
                      {team.capacity && ` / ${team.capacity}`}
                    </p>
                    {team.members?.length >= team.capacity && (
                      <span className="inline-block mt-2 text-xs text-orange-600">
                        Full
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
