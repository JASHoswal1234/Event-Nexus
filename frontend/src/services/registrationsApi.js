import apiClient from "./apiClient";

// Normalize MongoDB _id → id
const normalizeRegistration = (registration) => {
  if (!registration) return null;

  return {
    ...registration,
    id: registration._id || registration.id,
  };
};

const normalizeRegistrations = (registrations) => {
  if (!Array.isArray(registrations)) return [];
  return registrations.map(normalizeRegistration);
};

export const registerForEvent = async (eventId) => {
  const res = await apiClient.post(`/registrations/${eventId}`);
  const data = res.data.data || res.data;
  return normalizeRegistration(data.registration || data);
};

export const getEventRegistrations = async (eventId) => {
  const res = await apiClient.get(`/registrations/event/${eventId}`);
  const data = res.data.data || res.data;
  return normalizeRegistrations(data.registrations || data);
};

export const checkInAttendee = async (eventId, userId) => {
  const res = await apiClient.post(
    `/registrations/${eventId}/checkin`,
    { userId }
  );

  const registration = res.data?.registration || res.data;

  return normalizeRegistration(registration);
};


export const cancelRegistration = async (eventId) => {
  const res = await apiClient.delete(`/registrations/${eventId}`);
  return res.data;
};

export const getMyRegistrations = async () => {
  // Since backend doesn't have a dedicated endpoint for user's registrations,
  // we'll need to fetch all events and check registration status
  // This is a workaround until backend adds /api/registrations/me endpoint
  try {
    const eventsRes = await apiClient.get("/events");
    const allEvents = eventsRes.data?.events || [];
    
    // For each event, we need to check if user is registered
    // We can do this by attempting to register (which will fail if already registered)
    // Or by checking the event's registrations (admin only)
    // For now, return empty and rely on the events page to track state
    return [];
  } catch (error) {
    console.error('Failed to fetch registrations:', error);
    return [];
  }
};
