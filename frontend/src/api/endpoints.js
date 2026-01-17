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
  GET_PDF_BY_ID: (generationId) => `/projects/${generationId}/pdf`,
  DELETE_PROJECT: (generationId) => `/projects/${generationId}`
};
