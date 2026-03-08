import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const MyEventCard = ({ event, onCreateTeam, onJoinTeam }) => {
  const navigate = useNavigate();

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

  const getTeamStatus = () => {
    if (!event.isTeamEvent && !event.teamEvent) {
      return null;
    }

    // Check if user has a team for this event
    if (event.userTeam || event.team) {
      return (
        <div className="flex items-center text-sm text-green-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Team: {event.userTeam?.name || event.team?.name || 'Assigned'}
        </div>
      );
    }

    return (
      <div className="flex items-center text-sm text-orange-600">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        No team assigned
      </div>
    );
  };

  const isTeamEvent = event.isTeamEvent || event.teamEvent;
  const hasTeam = event.userTeam || event.team;

  return (
    <Card className="h-full flex flex-col">
      <div className="flex-1 space-y-4">
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {event.title}
            </h3>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${getModeBadge(event.mode)}`}>
              {event.mode || 'N/A'}
            </span>
          </div>
          {event.description && (
            <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>

          {event.venue && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          )}

          {/* Team Status */}
          {isTeamEvent && (
            <div className="pt-2 border-t border-gray-200">
              {getTeamStatus()}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/participant/events/${event.id}`)}
        >
          View Event
        </Button>

        {/* Team Management Buttons */}
        {isTeamEvent && !hasTeam && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => onCreateTeam(event)}
            >
              Create Team
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onJoinTeam(event)}
            >
              Join Team
            </Button>
          </div>
        )}

        {isTeamEvent && hasTeam && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/participant/team/${event.id}`)}
          >
            View Team
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MyEventCard;
