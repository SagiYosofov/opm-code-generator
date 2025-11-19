import api from "./api"; // our axios instance
import { ENDPOINTS } from "./endpoints";

// Signup
export const signupUser = async (userData) => {
  try {
    const res = await api.post(ENDPOINTS.SIGNUP, userData);
    return res.data; // only return the data, not full response
  } catch (err) {
    // Re-throw error so component can catch it
    throw err.response?.data || { detail: "Signup failed" };
  }
};

// Login
export const loginUser = async (userData) => {
  try {
    const res = await api.post(ENDPOINTS.LOGIN, userData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Login failed" };
  }
};