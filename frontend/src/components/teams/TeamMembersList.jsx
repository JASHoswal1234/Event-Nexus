import React from 'react';
import Card from '../common/Card';

const TeamMembersList = ({ team, currentUserId }) => {
  if (!team) {
    return null;
  }

  const members = team.members || [];
  const isOwner = (memberId) => team.owner === memberId || team.createdBy === memberId;

  return (
    <Card>
      <div className="space-y-4">
        {/* Team Header */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>{members.length} {members.length === 1 ? 'Member' : 'Members'}</span>
            </div>
            {team.joinCode && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
                <span>Join Code: <span className="font-mono font-semibold">{team.joinCode}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Members List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Members</h3>
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No members yet</p>
              <p className="text-sm mt-1">Share the join code to invite team members</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member, index) => {
                const memberId = member._id || member.id || member;
                const memberEmail = member.email || member.user?.email || 'Unknown';
                const memberName = member.name || member.user?.name || memberEmail;
                const isTeamOwner = isOwner(memberId);
                const isCurrentUser = memberId === currentUserId;

                return (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        isTeamOwner ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Member Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {memberName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-blue-600">(You)</span>
                            )}
                          </p>
                          {isTeamOwner && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Owner
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{memberEmail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team Info Footer */}
        {team.capacity && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Team Capacity</span>
              <span className="font-medium text-gray-900">
                {members.length} / {team.capacity}
              </span>
            </div>
            {members.length >= team.capacity && (
              <p className="mt-2 text-sm text-orange-600">
                ⚠️ Team is at full capacity
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TeamMembersList;
