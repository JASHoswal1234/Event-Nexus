import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/events', label: 'Events' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/teams', label: 'Teams' },
    { path: '/admin/announcements', label: 'Announcements' },
    { path: '/admin/settings', label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-gray-800 min-h-screen">
      <div className="p-4">
        <h2 className="text-white text-lg font-semibold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
