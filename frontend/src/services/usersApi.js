import apiClient from "./apiClient";

// Normalize MongoDB _id → id
const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    id: user._id || user.id,
  };
};

// Backend doesn't have /users/participants endpoint
// This file is kept for future implementation
export const getAllParticipants = async () => {
  console.warn('getAllParticipants: Backend endpoint not implemented');
  return { participants: [] };
};
