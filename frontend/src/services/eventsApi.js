import apiClient from "./apiClient";

// Normalize MongoDB _id to id for frontend consistency
const normalizeEvent = (event) => {
  if (!event) return null;

  return {
    ...event,
    id: event._id || event.id,
    venue: event.location || event.venue, // Map location to venue for frontend
  };
};

const normalizeEvents = (events) => {
  if (!Array.isArray(events)) return [];
  return events.map(normalizeEvent);
};

export const getAllEvents = async () => {
  const res = await apiClient.get("/events");

  // backend response: { success, count, events }
  const events = res.data?.events || [];

  return normalizeEvents(events);
};

export const getEventById = async (id) => {
  const res = await apiClient.get(`/events/${id}`);

  const event = res.data?.event || res.data?.data || res.data;

  return normalizeEvent(event);
};

export const createEvent = async (data) => {
  const payload = {
    title: data.title,
    description: data.description,
    date: data.date,
    location: data.venue, // Map venue to location
    capacity: Number(data.capacity), // Ensure it's a number
    registrationDeadline: data.registrationDeadline,
    mode: data.mode === 'hybrid' ? 'online' : data.mode, // Backend only supports online/offline
  };

  console.log('Creating event with payload:', payload); // Debug log

  const res = await apiClient.post("/events", payload);

  const event = res.data?.event || res.data?.data || res.data;

  return normalizeEvent(event);
};

export const updateEvent = async (id, data) => {
  const payload = {
    title: data.title,
    description: data.description,
    date: data.date,
    location: data.venue || data.location, // Map venue to location
    capacity: parseInt(data.capacity),
    registrationDeadline: data.registrationDeadline,
    mode: data.mode === 'hybrid' ? 'online' : data.mode, // Backend only supports online/offline
  };

  const res = await apiClient.put(`/events/${id}`, payload);

  const event = res.data?.event || res.data?.data || res.data;

  return normalizeEvent(event);
};

export const deleteEvent = async (id) => {
  const res = await apiClient.delete(`/events/${id}`);
  return res.data;
};

export const getMyEvents = async () => {
  // Fetch user's registrations by querying all events and checking registration status
  // Since backend doesn't have a /me/registrations endpoint, we need to:
  // 1. Get all events
  // 2. For each event, check if user is registered
  // This is not optimal but works with current backend API
  
  try {
    const allEventsRes = await apiClient.get("/events");
    const allEvents = allEventsRes.data?.events || [];
    
    // Get user's registrations by checking each event
    // We'll need to make individual calls or use a different approach
    // For now, return empty array and let the registration check happen on the events page
    
    // Better approach: fetch registrations from localStorage or state management
    // But since we don't have that, we'll return all events and filter on the client
    return normalizeEvents(allEvents);
  } catch (error) {
    console.error('Failed to fetch my events:', error);
    return [];
  }
};

export const getDashboardStats = async () => {
  try {
    const res = await apiClient.get("/stats");
    
    const stats = res.data?.stats || {};
    
    return {
      totalEvents: stats.totalEvents || 0,
      totalRegistrations: stats.totalRegistrations || 0,
      totalTeams: stats.totalTeams || 0,
      totalCheckIns: stats.totalCheckIns || 0,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    // Fallback to basic stats if API fails
    const eventsRes = await apiClient.get("/events");
    const events = eventsRes.data?.events || [];
    
    return {
      totalEvents: events.length,
      totalRegistrations: 0,
      totalTeams: 0,
      totalCheckIns: 0,
    };
  }
};