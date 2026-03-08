import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 
              className="text-xl font-bold text-blue-600 cursor-pointer"
              onClick={() => navigate('/')}
            >
              EventNexus
            </h1>
            
            {/* Navigation Links */}
            {user && (
              <div className="flex items-center space-x-1">
                {user.role === 'admin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/dashboard')}
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/events')}
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Events
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/users')}
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Participants
                    </button>
                  </>
                )}
                {user.role === 'participant' && (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/participant/events')}
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Events
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/participant/my-events')}
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      My Events
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user.name || user.email}</span>
                </span>
                <Button type="button" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-x-2">
                <Button type="button" onClick={() => navigate('/login')}>Login</Button>
                <Button type="button" variant="outline" onClick={() => navigate('/register')}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
