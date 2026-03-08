import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import apiClient from '../../services/apiClient';

const FindTeammatesPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    fetchRecommendations();
  }, [eventId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/teams/recommendations/${eventId}`);
      setRecommendations(response.data.recommendations || []);
      
      if (response.data.message) {
        showToast(response.data.message, 'info');
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      showToast('Failed to load recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId, userName) => {
    // For now, just show a toast. In a real app, you'd send an invitation
    showToast(`Invitation sent to ${userName}!`, 'success');
    // TODO: Implement actual invitation system
  };

  const getCompatibilityColor = (score) => {
    if (score >= 10) return 'bg-green-100 text-green-800';
    if (score >= 5) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading recommendations...</div>
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

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Teammates</h1>
          <p className="text-gray-600">Discover compatible teammates based on your profile</p>
        </div>
        <Button type="button" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Recommendations</h3>
            <p className="mt-1 text-sm text-gray-500">
              Complete your profile to get teammate recommendations
            </p>
            <div className="mt-6">
              <Button type="button" onClick={() => navigate(`/participant/events/${eventId}`)}>
                Complete Profile
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.userId}>
              <div className="space-y-4">
                {/* Header with Name and Score */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recommendation.name}
                    </h3>
                    <p className="text-sm text-gray-600">{recommendation.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(recommendation.compatibilityScore)}`}>
                    {recommendation.compatibilityScore} pts
                  </span>
                </div>

                {/* Role and Experience */}
                <div className="grid grid-cols-2 gap-4">
                  {recommendation.role && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Role</span>
                      <p className="text-sm text-gray-900">{recommendation.role}</p>
                    </div>
                  )}
                  {recommendation.experience && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">Experience</span>
                      <p className="text-sm text-gray-900">{recommendation.experience}</p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {recommendation.skills.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 block mb-2">Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            recommendation.sharedSkills?.includes(skill)
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {skill}
                          {recommendation.sharedSkills?.includes(skill) && ' ✓'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {recommendation.interests.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 block mb-2">Interests</span>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.interests.map((interest, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            recommendation.sharedInterests?.includes(interest)
                              ? 'bg-green-100 text-green-800 font-medium'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {interest}
                          {recommendation.sharedInterests?.includes(interest) && ' ✓'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferred Team Size */}
                {recommendation.preferredTeamSize && (
                  <div className="text-sm text-gray-600">
                    Prefers teams of {recommendation.preferredTeamSize} members
                  </div>
                )}

                {/* Invite Button */}
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => handleInvite(recommendation.userId, recommendation.name)}
                >
                  Send Invitation
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindTeammatesPage;
