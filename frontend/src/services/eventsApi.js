import apiClient from "./apiClient";

// Normalize MongoDB _id to id for frontend consistency
const normalizeEvent = (event) => {
  if (!event) return null;

  return {
    ...event,
    id: event._id || event.id,
    teamEvent:
      event.teamEvent !== undefined ? event.teamEvent : event.isTeamEvent,
    deadline: event.deadline || event.registrationDeadline,
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
    ...data,
    teamEvent:
      data.teamEvent !== undefined ? data.teamEvent : data.isTeamEvent,
    deadline: data.deadline || data.registrationDeadline,
  };

  delete payload.isTeamEvent;
  delete payload.registrationDeadline;

  const res = await apiClient.post("/events", payload);

  const event = res.data?.event || res.data?.data || res.data;

  return normalizeEvent(event);
};

export const updateEvent = async (id, data) => {
  const payload = {
    ...data,
    teamEvent:
      data.teamEvent !== undefined ? data.teamEvent : data.isTeamEvent,
    deadline: data.deadline || data.registrationDeadline,
  };

  delete payload.isTeamEvent;
  delete payload.registrationDeadline;

  const res = await apiClient.put(`/events/${id}`, payload);

  const event = res.data?.event || res.data?.data || res.data;

  return normalizeEvent(event);
};

export const deleteEvent = async (id) => {
  const res = await apiClient.delete(`/events/${id}`);
  return res.data;
};

export const getMyEvents = async () => {
  const res = await apiClient.get("/me/events");

  const events = res.data?.events || res.data?.data || [];

  return normalizeEvents(events);
};

export const getDashboardStats = async () => {
  const res = await apiClient.get("/events");

  const events = res.data?.events || [];

  return {
    totalEvents: events.length,
    totalRegistrations: 0,
    totalTeams: 0,
    todayCheckIns: 0,
  };
};