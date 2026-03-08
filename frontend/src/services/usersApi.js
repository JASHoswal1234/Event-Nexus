import apiClient from "./apiClient";

// Normalize MongoDB _id → id
const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    id: user._id || user.id,
  };
};

export const getAllParticipants = async () => {
  const res = await apiClient.get("/users/participants");

  const participants = res.data?.participants?.map(normalizeUser) || [];

  return {
    ...res.data,
    participants,
  };
};
