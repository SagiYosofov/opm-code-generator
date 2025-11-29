import api from "./api"; // our axios instance
import { ENDPOINTS } from "./endpoints";

/**
 * Upload OPM diagram and request code generation
 * @param {FormData} formData - Form data containing file and language
 * @returns {Promise} Response data with download URL or generated code info
 */
export const generateCode = async (formData) => {
  try {
    const res = await api.post(ENDPOINTS.GENERATE_CODE, formData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Failed to upload OPM diagram" };
  }
};
