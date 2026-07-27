import axios from "axios";

// Create Axios instance
export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

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

  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response.data;
};

// ----------------------
// Get Current User
// ----------------------
export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

// ----------------------
// Logout
// ----------------------
export const logoutUser = () => {
  localStorage.removeItem("token");
};

// ----------------------
// Get Token
// ----------------------
export const getToken = () => {
  return localStorage.getItem("token");
};