/* =========================================================
   API CONFIGURATION

   Development:
   http://localhost:3000

   Production:
   VITE_API_BASE_URL is supplied by Vercel.
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000';


/* =========================================================
   AUTH TOKEN
========================================================= */

function getAuthToken() {
  return sessionStorage.getItem(
    'authToken'
  );
}


/* =========================================================
   AUTH EXPIRED
========================================================= */

function handleAuthenticationFailure() {

  sessionStorage.removeItem(
    'authToken'
  );

  window.dispatchEvent(
    new Event('auth-expired')
  );
}


/* =========================================================
   API REQUEST HELPER
========================================================= */

async function apiRequest(endpoint) {

  const token = getAuthToken();

  const headers = {
    Accept: 'application/json',
  };


  /*
   * Every questions API request is protected.
   * Send the current login session token.
   */

  if (token) {

    headers.Authorization =
      `Bearer ${token}`;
  }


  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'GET',
      headers,
    }
  );


  let data;

  try {

    data = await response.json();

  } catch {

    throw new Error(
      `Invalid response received from API. HTTP ${response.status}`
    );
  }


  /*
   * Session missing, invalid or expired.
   */

  if (response.status === 401) {

    handleAuthenticationFailure();

    throw new Error(
      data?.message ||
      'Your session has expired. Please login again.'
    );
  }


  if (!response.ok) {

    throw new Error(
      data?.error ||
      data?.message ||
      `API request failed. HTTP ${response.status}`
    );
  }


  return data;
}


/* =========================================================
   GET ALL QUESTIONS

   GET /api/questions
========================================================= */

export async function getQuestions() {

  return apiRequest(
    '/api/questions'
  );
}


/* =========================================================
   GET QUESTIONS FOR ONE TOPIC

   GET /api/questions/:category
========================================================= */

export async function getQuestionsByCategory(
  category
) {

  if (!category) {

    throw new Error(
      'Question category is required.'
    );
  }


  const encodedCategory =
    encodeURIComponent(category);


  return apiRequest(
    `/api/questions/${encodedCategory}`
  );
}


/* =========================================================
   EXPOSE BASE URL FOR DEBUGGING
========================================================= */

export function getApiBaseUrl() {

  return API_BASE_URL;
}