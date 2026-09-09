/* =========================================================
   API CONFIGURATION
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
   AUTHENTICATED REQUEST HELPER
========================================================= */

async function apiRequest(
  endpoint,
  options = {}
) {

  const token =
    getAuthToken();


  if (!token) {

    window.dispatchEvent(
      new Event('auth-expired')
    );

    throw new Error(
      'Authentication required'
    );
  }


  const headers = {

    Accept:
      'application/json',

    Authorization:
      `Bearer ${token}`,

    ...options.headers
  };


  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers
      }
    );


  let data;


  try {

    data =
      await response.json();

  } catch {

    throw new Error(
      `Invalid response received from API. HTTP ${response.status}`
    );
  }


  /* =======================================================
     SESSION INVALID / EXPIRED
  ======================================================= */

  if (response.status === 401) {

    sessionStorage.removeItem(
      'authToken'
    );


    window.dispatchEvent(
      new Event('auth-expired')
    );


    throw new Error(
      data?.message ||
      'Your session has expired.'
    );
  }


  if (!response.ok) {

    throw new Error(
      data?.message ||
      data?.error ||
      `API request failed. HTTP ${response.status}`
    );
  }


  return data;
}


/* =========================================================
   SUBMIT QUESTION REQUEST

   USER  ✅
   ADMIN ✅
========================================================= */

export async function submitQuestionRequest({
  topic,
  question,
  notes
}) {

  return apiRequest(
    '/api/question-requests',
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json'
      },

      body:
        JSON.stringify({
          topic,
          question,
          notes
        })
    }
  );
}


/* =========================================================
   GET ALL QUESTION REQUESTS

   ADMIN ONLY
========================================================= */

export async function getQuestionRequests() {

  return apiRequest(
    '/api/question-requests/admin',
    {
      method: 'GET'
    }
  );
}


/* =========================================================
   UPDATE REQUEST STATUS

   ADMIN ONLY
========================================================= */

export async function updateQuestionRequestStatus(
  requestId,
  status
) {

  if (!requestId) {

    throw new Error(
      'Question request ID is required'
    );
  }


  return apiRequest(
    `/api/question-requests/admin/${requestId}`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type':
          'application/json'
      },

      body:
        JSON.stringify({
          status
        })
    }
  );
}