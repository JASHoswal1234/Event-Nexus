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

export const getCurrentUser = async () => {
  const res = await apiClient.get("/auth/me");

  return normalizeUser(res.data?.user || res.data);
};

export const logoutUser = async () => {
  const res = await apiClient.post("/auth/logout");

  return res.data;
};