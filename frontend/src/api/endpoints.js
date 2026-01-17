// here we put all the backend endpoints/routes

export const ENDPOINTS = {
  // Auth endpoints
  SIGNUP: "/auth/signup",
  LOGIN: "/auth/login",

  // OPM endpoints
  GENERATE_CODE: "/opm/generate-code",
  REFINE_CODE: "/opm/refine-code",

  // Projects endpoints
  GET_USER_PROJECTS: "/projects",
  GET_PROJECT_BY_ID: (generationId) => `/projects/${generationId}`,
  DOWNLOAD_PROJECT_PDF: (generationId) => `/projects/${generationId}/pdf`,
  DOWNLOAD_PROJECT_CODE: (generationId) => `/projects/${generationId}/code`,
  DELETE_PROJECT: (generationId) => `/projects/${generationId}`,
  GET_PROJECT_STATS: (generationId) => `/projects/${generationId}/stats`
};
