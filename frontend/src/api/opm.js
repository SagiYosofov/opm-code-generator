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

/**
 * Send fix instructions to refine previously generated code
 * @param {FormData} formData - Form data containing file, language, previous code, and fix instructions
 * @returns {Promise} Response data with refined code or error explanation
 */
export const refineCode = async (formData) => {
  try {
    const res = await api.put(ENDPOINTS.REFINE_CODE, formData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Failed to refine code" };
  }
};
