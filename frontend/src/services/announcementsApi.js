import apiClient from "./apiClient";

// Normalize MongoDB _id → id
const normalizeAnnouncement = (announcement) => {
  if (!announcement) return null;

  return {
    ...announcement,
    id: announcement._id || announcement.id,
  };
};

const normalizeAnnouncements = (announcements) => {
  if (!Array.isArray(announcements)) return [];
  return announcements.map(normalizeAnnouncement);
};

export const announcementsApi = {
  // Get announcements for an event
  getEventAnnouncements: async (eventId) => {
    const res = await apiClient.get(`/announcements/event/${eventId}`);

    const announcements = res.data?.announcements || [];

    return normalizeAnnouncements(announcements);
  },

  // Create announcement
  createAnnouncement: async (announcementData) => {
    const res = await apiClient.post("/announcements", announcementData);

    const announcement = res.data?.announcement || res.data;

    return normalizeAnnouncement(announcement);
  },

  // Delete announcement
  deleteAnnouncement: async (announcementId) => {
    const res = await apiClient.delete(`/announcements/${announcementId}`);

    return res.data;
  },
};

export default announcementsApi;