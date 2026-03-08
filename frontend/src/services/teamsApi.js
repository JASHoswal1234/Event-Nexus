import apiClient from "./apiClient";

// Normalize MongoDB _id → id
const normalizeTeam = (team) => {
  if (!team) return null;

  return {
    ...team,
    id: team._id || team.id,
  };
};

const normalizeTeams = (teams) => {
  if (!Array.isArray(teams)) return [];
  return teams.map(normalizeTeam);
};

export const createTeam = async (eventId, name) => {
  const res = await apiClient.post("/teams", { eventId, name });

  const team = res.data?.team || res.data;

  return normalizeTeam(team);
};

export const joinTeam = async (joinCode) => {
  const res = await apiClient.post("/teams/join", { joinCode });

  const team = res.data?.team || res.data;

  return normalizeTeam(team);
};

export const getEventTeams = async (eventId) => {
  const res = await apiClient.get(`/teams/${eventId}`);

  const teams = res.data?.teams || [];

  return normalizeTeams(teams);
};


export const getEventTeam = async (eventId) => {
  // Get the user's team for a specific event
  const res = await apiClient.get(`/teams/event/${eventId}`);
  const team = res.data?.team || res.data;
  return normalizeTeam(team);
};
