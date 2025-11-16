import api from "./api"; // your axios instance

// Signup wrapper
export const signupUser = async (userData) => {
  try {
    const res = await api.post("/auth/signup", userData);
    return res.data; // only return the data, not full response
  } catch (err) {
    // Re-throw error so component can catch it
    throw err.response?.data || { detail: "Signup failed" };
  }
};