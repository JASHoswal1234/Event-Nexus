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
  // Get all announcements
  getAllAnnouncements: async (filters = {}) => {
    const res = await apiClient.get("/announcements", { params: filters });

    const announcements = res.data?.announcements || [];

    return normalizeAnnouncements(announcements);
  },

  // Get announcement by ID
  getAnnouncementById: async (announcementId) => {
    const res = await apiClient.get(`/announcements/${announcementId}`);

    const announcement = res.data?.announcement || res.data;

    return normalizeAnnouncement(announcement);
  },

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

  // Update announcement
  updateAnnouncement: async (announcementId, announcementData) => {
    const res = await apiClient.put(
      `/announcements/${announcementId}`,
      announcementData
    );

    const announcement = res.data?.announcement || res.data;

    return normalizeAnnouncement(announcement);
  },

  // Delete announcement
  deleteAnnouncement: async (announcementId) => {
    const res = await apiClient.delete(`/announcements/${announcementId}`);

    return res.data;
  },

  // Mark as read
  markAsRead: async (announcementId) => {
    const res = await apiClient.post(`/announcements/${announcementId}/read`);

    return res.data;
  },

  // Unread count
  getUnreadCount: async () => {
    const res = await apiClient.get("/announcements/unread/count");

    return res.data?.count || 0;
  },
};

export default announcementsApi;