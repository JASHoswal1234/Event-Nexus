import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../hooks/useAuth';
import { getMyEvents } from '../../services/eventsApi';

const ParticipantProfilePage = () => {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [eventHistory, setEventHistory] = useState([]);

  // Basic Information
  const [basicInfo, setBasicInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: ''
  });

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    portfolio: '',
    twitter: ''
  });

  // Settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    eventReminders: true,
    teamInvites: true
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    loadProfile();
    loadEventHistory();
  }, []);

  const loadProfile = () => {
    const savedProfile = localStorage.getItem(`user_profile_${user?.id}`);
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setBasicInfo(profile.basicInfo || basicInfo);
      setSocialLinks(profile.socialLinks || socialLinks);
      setSettings(profile.settings || settings);
    }
  };

  const loadEventHistory = async () => {
    try {
      const events = await getMyEvents();
      setEventHistory(events || []);
    } catch (error) {
      console.error('Failed to load event history:', error);
    }
  };

  const handleSaveBasicInfo = () => {
    setLoading(true);
    try {
      const profile = {
        basicInfo,
        socialLinks,
        settings
      };
      localStorage.setItem(`user_profile_${user?.id}`, JSON.stringify(profile));
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSocialLinks = () => {
    setLoading(true);
    try {
      const profile = {
        basicInfo,
        socialLinks,
        settings
      };
      localStorage.setItem(`user_profile_${user?.id}`, JSON.stringify(profile));
      showToast('Social links updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update social links', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    setLoading(true);
    try {
      const profile = {
        basicInfo,
        socialLinks,
        settings
      };
      localStorage.setItem(`user_profile_${user?.id}`, JSON.stringify(profile));
      showToast('Settings updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'social', label: 'Social Links' },
    { id: 'settings', label: 'Settings' },
    { id: 'history', label: 'Event History' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Name"
              name="name"
              type="text"
              value={basicInfo.name}
              onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
              placeholder="Your full name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={basicInfo.email}
              disabled
              helperText="Email cannot be changed"
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={basicInfo.phone}
              onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={basicInfo.bio}
                onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
                rows={4}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveBasicInfo} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Links</h2>
          <p className="text-gray-600 text-sm mb-6">Connect your social profiles (optional)</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub
              </label>
              <input
                type="url"
                value={socialLinks.github}
                onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                placeholder="https://github.com/username"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio Website
              </label>
              <input
                type="url"
                value={socialLinks.portfolio}
                onChange={(e) => setSocialLinks({ ...socialLinks, portfolio: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveSocialLinks} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive email updates about your events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Event Reminders</h3>
                <p className="text-sm text-gray-500">Get reminders before events start</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.eventReminders}
                  onChange={(e) => setSettings({ ...settings, eventReminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Team Invites</h3>
                <p className="text-sm text-gray-500">Receive notifications for team invitations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.teamInvites}
                  onChange={(e) => setSettings({ ...settings, teamInvites: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Event History Tab */}
      {activeTab === 'history' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Event History</h2>
          {eventHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No events registered yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {eventHistory.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{formatDate(event.date)}</p>
                      <p className="text-sm text-gray-500 mt-1">{event.venue}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      event.mode === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {event.mode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ParticipantProfilePage;
