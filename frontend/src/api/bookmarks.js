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


async function bookmarkRequest(
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
      `Bookmark request failed. HTTP ${response.status}`
    );
  }


  return data;
}


/* =========================================================
   GET LOGGED-IN USER'S BOOKMARKS
========================================================= */

export async function getBookmarks() {
  return bookmarkRequest(
    '/api/bookmarks'
  );
}


/* =========================================================
   ADD BOOKMARK
========================================================= */

export async function addBookmark(
  questionId
) {
  if (!questionId) {
    throw new Error(
      'Question ID is required.'
    );
  }

  return bookmarkRequest(
    `/api/bookmarks/${encodeURIComponent(
      questionId
    )}`,
    {
      method: 'POST'
    }
  );
}


/* =========================================================
   REMOVE BOOKMARK
========================================================= */

export async function removeBookmark(
  questionId
) {
  if (!questionId) {
    throw new Error(
      'Question ID is required.'
    );
  }

  return bookmarkRequest(
    `/api/bookmarks/${encodeURIComponent(
      questionId
    )}`,
    {
      method: 'DELETE'
    }
  );
}