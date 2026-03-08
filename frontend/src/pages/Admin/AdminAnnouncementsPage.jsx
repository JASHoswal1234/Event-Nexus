import React from 'react';
import Card from '../../components/common/Card';

const AdminAnnouncementsPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
        <p className="text-gray-600">Manage announcements across all events</p>
      </div>

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
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Announcements</h3>
          <p className="mt-1 text-sm text-gray-500">
            Send announcements from individual event pages
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              To send announcements, navigate to an event's detail page and use the Announcements tab.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminAnnouncementsPage;
