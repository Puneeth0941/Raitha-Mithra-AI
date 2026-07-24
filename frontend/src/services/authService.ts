import axios from "axios";

// Backend Base URL
export const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Configure global request interceptor to attach token to all axios calls
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------
// Register User
// ----------------------
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

// ----------------------
// Login User
// ----------------------
export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  const response = await API.post("/auth/login", userData);

  // Save JWT token
  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response.data;
};

// ----------------------
// Get Current User Profile
// ----------------------
export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  const response = await API.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ----------------------
// Logout
// ----------------------
export const logoutUser = () => {
  localStorage.removeItem("token");
};

// ----------------------
// Get Saved Token
// ----------------------
export const getToken = () => {
  return localStorage.getItem("token");
};