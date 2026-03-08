import apiClient from "./apiClient";

// Normalize MongoDB _id → id
const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    id: user._id || user.id,
  };
};

export const loginUser = async (data) => {
  const res = await apiClient.post("/auth/login", data);

  const user = normalizeUser(res.data?.user);

  return {
    ...res.data,
    user,
  };
};

export const registerUser = async (data) => {
  const res = await apiClient.post("/auth/register", data);

  const user = normalizeUser(res.data?.user);

  return {
    ...res.data,
    user,
  };
};

// Backend doesn't have /auth/me or /auth/logout endpoints
// Auth state is managed client-side via JWT tokens