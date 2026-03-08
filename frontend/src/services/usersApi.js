import apiClient from "./apiClient";

// Normalize MongoDB _id → id
const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    id: user._id || user.id,
  };
};

const normalizeUsers = (users) => {
  if (!Array.isArray(users)) return [];
  return users.map(normalizeUser);
};

export const getAllParticipants = async () => {
  const res = await apiClient.get('/users/participants');
  
  const participants = res.data?.participants || [];
  
  return {
    success: res.data?.success,
    count: res.data?.count || 0,
    participants: normalizeUsers(participants)
  };
};

export const getAllUsers = async () => {
  const res = await apiClient.get('/users');
  
  const users = res.data?.users || [];
  
  return {
    success: res.data?.success,
    count: res.data?.count || 0,
    users: normalizeUsers(users)
  };
};
