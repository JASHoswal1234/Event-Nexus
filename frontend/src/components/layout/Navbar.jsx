import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Users, LayoutDashboard, UserCircle, CalendarCheck, User, Menu, X } from 'lucide-react';
import Button from '../common/Button';
import { ExpandableTabs } from '../ui/ExpandableTabs';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const adminTabs = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Events", icon: Calendar },
    { title: "Participants", icon: Users },
  ];

  const participantTabs = [
    { title: "Events", icon: Calendar },
    { title: "My Events", icon: CalendarCheck },
    { title: "Profile", icon: User },
  ];

  const handleTabChange = (index) => {
    if (!user) return;

    if (user.role === 'admin') {
      const routes = ['/admin/dashboard', '/admin/events', '/admin/users'];
      navigate(routes[index]);
    } else if (user.role === 'participant') {
      const routes = ['/participant/events', '/participant/my-events', '/participant/profile'];
      navigate(routes[index]);
    }
    setIsMobileMenuOpen(false);
  };

  const handleMobileNavClick = (route) => {
    navigate(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 
              className="text-xl font-bold text-black cursor-pointer"
              onClick={() => navigate('/')}
            >
              EventNexus
            </h1>
            
            {/* Desktop Navigation Tabs */}
            {user && (
              <div className="hidden md:flex items-center">
                {user.role === 'admin' && (
                  <ExpandableTabs 
                    tabs={adminTabs} 
                    onChange={handleTabChange}
                    activeColor="text-black"
                  />
                )}
                {user.role === 'participant' && (
                  <ExpandableTabs 
                    tabs={participantTabs} 
                    onChange={handleTabChange}
                    activeColor="text-black"
                  />
                )}
              </div>
            )}
          </div>
          
          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 md:hidden transform transition-transform">
            <div className="flex flex-col h-full p-4">
              {/* Close button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="self-end p-2 rounded-md hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center mb-4"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>

              {/* User info */}
              {user && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Welcome,</p>
                  <p className="font-medium text-gray-900">{user.name || user.email}</p>
                </div>
              )}

              {/* Navigation Links */}
              {user && (
                <div className="flex-1 space-y-2">
                  {user.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handleMobileNavClick('/admin/dashboard')}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100 text-left min-h-[44px]"
                      >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleMobileNavClick('/admin/events')}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100 text-left min-h-[44px]"
                      >
                        <Calendar size={20} />
                        <span>Events</span>
                      </button>
                      <button
                        onClick={() => handleMobileNavClick('/admin/users')}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100 text-left min-h-[44px]"
                      >
                        <Users size={20} />
                        <span>Participants</span>
                      </button>
                    </>
                  )}
                  {user.role === 'participant' && (
                    <>
                      <button
                        onClick={() => handleMobileNavClick('/participant/events')}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100 text-left min-h-[44px]"
                      >
                        <Calendar size={20} />
                        <span>Events</span>
                      </button>
                      <button
                        onClick={() => handleMobileNavClick('/participant/my-events')}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100 text-left min-h-[44px]"
                      >
                        <CalendarCheck size={20} />
                        <span>My Events</span>
                      </button>
                      <button
                        onClick={() => handleMobileNavClick('/participant/profile')}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-100 text-left min-h-[44px]"
                      >
                        <User size={20} />
                        <span>Profile</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Logout / Auth buttons */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                {user ? (
                  <Button 
                    type="button" 
                    onClick={handleLogout}
                    className="w-full"
                  >
                    Logout
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      type="button" 
                      onClick={() => handleMobileNavClick('/login')}
                      className="w-full"
                    >
                      Login
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleMobileNavClick('/register')}
                      className="w-full"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
