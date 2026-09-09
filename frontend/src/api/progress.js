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


async function progressRequest(
  endpoint,
  options = {}
) {
  const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
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
      `Progress request failed. HTTP ${response.status}`
    );
  }

  return data;
}


/* Get all completed questions */

export async function getProgress() {
  return progressRequest(
    '/api/progress'
  );
}


/* Get overall progress summary */

export async function getProgressSummary() {
  return progressRequest(
    '/api/progress/summary'
  );
}


/* Mark one question completed */

export async function markQuestionCompleted(
  questionId
) {
  return progressRequest(
    `/api/progress/${encodeURIComponent(questionId)}`,
    {
      method: 'PUT'
    }
  );
}


/* Remove completed status */

export async function unmarkQuestionCompleted(
  questionId
) {
  return progressRequest(
    `/api/progress/${encodeURIComponent(questionId)}`,
    {
      method: 'DELETE'
    }
  );
}