const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000';


function getAuthToken() {
  return sessionStorage.getItem('authToken');
}


function handleAuthenticationFailure() {
  sessionStorage.removeItem('authToken');

  window.dispatchEvent(
    new Event('auth-expired')
  );
}


async function searchRequest(endpoint) {
  const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'GET',

      headers: {
        Accept: 'application/json',

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`
            }
          : {})
      }
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


  if (response.status === 401) {
    handleAuthenticationFailure();

    throw new Error(
      data?.message ||
      'Your session has expired. Please login again.'
    );
  }


  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Search request failed. HTTP ${response.status}`
    );
  }


  return data;
}


/* =========================================================
   GLOBAL QUESTION SEARCH
========================================================= */

export async function searchQuestions({
  query = '',
  topic = '',
  difficulty = '',
  level = ''
} = {}) {

  const params =
    new URLSearchParams();


  if (query.trim()) {
    params.set(
      'q',
      query.trim()
    );
  }


  if (topic.trim()) {
    params.set(
      'topic',
      topic.trim()
    );
  }


  if (difficulty.trim()) {
    params.set(
      'difficulty',
      difficulty.trim()
    );
  }


  if (level.trim()) {
    params.set(
      'level',
      level.trim()
    );
  }


  const queryString =
    params.toString();


  if (!queryString) {
    throw new Error(
      'Enter a search term or select a filter.'
    );
  }


  return searchRequest(
    `/api/questions/search?${queryString}`
  );
}