import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Toast from "../../components/common/Toast";
import { createTeam, joinTeam, getEventTeams } from "../../services/teamsApi";

const ParticipantTeamPage = () => {
  const { eventId } = useParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [createTeamForm, setCreateTeamForm] = useState({ teamName: '' });
  const [joinTeamForm, setJoinTeamForm] = useState({ joinCode: '' });
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await getEventTeams(eventId);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        showToast('Failed to load teams. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchTeams();
    }
  }, [eventId]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!createTeamForm.teamName.trim()) {
      showToast('Please enter a team name', 'error');
      return;
    }

    setCreatingTeam(true);
    try {
      const result = await createTeam(eventId, createTeamForm.teamName);
      setTeams(prev => [...prev, result.team]);
      setCreateTeamForm({ teamName: '' });
      showToast('Team created successfully', 'success');
      
      if (result.joinCode) {
        showToast(`Team created! Join Code: ${result.joinCode}`, 'success');
      }
    } catch (error) {
      console.error('Create team failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create team';
      showToast(errorMessage, 'error');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinTeamForm.joinCode.trim()) {
      showToast('Please enter a join code', 'error');
      return;
    }

    setJoiningTeam(true);
    try {
      await joinTeam(joinTeamForm.joinCode);
      setJoinTeamForm({ joinCode: '' });
      showToast('Joined team successfully', 'success');
      
      const teamsData = await getEventTeams(eventId);
      setTeams(teamsData);
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
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
        <p className="text-gray-600">Create a new team or join an existing one</p>
      </div>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Team</h2>
        <form onSubmit={handleCreateTeam} className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <Input
            name="teamName"
            type="text"
            placeholder="Team Name"
            value={createTeamForm.teamName}
            onChange={(e) => setCreateTeamForm(prev => ({ ...prev, teamName: e.target.value }))}
            disabled={creatingTeam}
          />
          <Button 
            type="submit" 
            disabled={creatingTeam}
          >
            {creatingTeam ? 'Creating...' : 'Create Team'}
          </Button>
        </form>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Join Team</h2>
        <form onSubmit={handleJoinTeam} className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <Input
            name="joinCode"
            type="text"
            placeholder="Enter Join Code"
            value={joinTeamForm.joinCode}
            onChange={(e) => setJoinTeamForm(prev => ({ ...prev, joinCode: e.target.value }))}
            disabled={joiningTeam}
          />
          <Button 
            type="submit" 
            disabled={joiningTeam}
          >
            {joiningTeam ? 'Joining...' : 'Join Team'}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Teams</h2>
        {teams.length === 0 ? (
          <EmptyState
            title="No teams created yet."
            description="Be the first to create a team for this event!"
          />
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
    </div>
  );
};

export default ParticipantTeamPage;
