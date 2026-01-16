import api from "./api"; // our axios instance
import { ENDPOINTS } from "./endpoints";

/**
 * Get all projects for a specific user
 * @param {string} userEmail - The email of the logged-in user
 * @returns {Promise} Array of user projects
 */
export const getUserProjects = async (userEmail) => {
  try {
    const res = await api.get(ENDPOINTS.GET_USER_PROJECTS, {
      params: { user_email: userEmail }  // Query parameter
    });
    return res.data; // Backend returns array directly
  } catch (err) {
    throw err.response?.data || { detail: "Failed to fetch projects" };
  }
};


/**
 * Get a specific project by generation_id
 * @param {string} generationId - The unique generation ID
 * @returns {Promise} Project details
 */
export const getProjectById = async (generationId) => {
  try {
    const res = await api.get(ENDPOINTS.GET_PROJECT_BY_ID(generationId));
    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Failed to fetch project" };
  }
};


/**
 * Download the PDF diagram for a specific project
 * @param {string} generationId - The unique generation ID
 * @param {string} filename - Original PDF filename
 */
export const downloadDiagram = async (generationId, filename) => {
  try {
    const res = await api.get(ENDPOINTS.DOWNLOAD_PROJECT_PDF(generationId), {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (err) {
    throw err.response?.data || { detail: "Failed to download diagram" };
  }
};


/**
 * Download the generated code for a specific project
 * @param {string} generationId - The unique generation ID
 * @param {string} filename - Generated code filename
 */
export const downloadCode = async (generationId, filename) => {
  try {
    const res = await api.get(ENDPOINTS.DOWNLOAD_PROJECT_CODE(generationId), {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (err) {
    throw err.response?.data || { detail: "Failed to download code" };
  }
};


/**
 * Delete a specific project
 * @param {string} generationId - The unique generation ID
 * @param {string} userEmail - Email of the user (for authorization)
 * @returns {Promise} Deletion confirmation
 */
export const deleteProject = async (generationId, userEmail) => {
  try {
    const res = await api.delete(ENDPOINTS.DELETE_PROJECT(generationId), {
      params: { user_email: userEmail }  // Query parameter for authorization
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Failed to delete project" };
  }
};


/**
 * Get statistics for a specific project
 * @param {string} generationId - The unique generation ID
 * @returns {Promise} Project statistics
 */
export const getProjectStats = async (generationId) => {
  try {
    const res = await api.get(ENDPOINTS.GET_PROJECT_STATS(generationId));
    return res.data;
  } catch (err) {
    throw err.response?.data || { detail: "Failed to fetch project stats" };
  }
};