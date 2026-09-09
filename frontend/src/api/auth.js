/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000';


/* =========================================================
   LOGIN

   POST /api/auth/login
========================================================= */

export async function login(username, password) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },

      body: JSON.stringify({
        username,
        password,
      }),
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

  if (!response.ok) {
    throw new Error(
      data?.message ||
      'Login failed'
    );
  }

  return data;
}


/* =========================================================
   CHECK CURRENT SESSION

   GET /api/auth/session
========================================================= */

export async function getSession(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/session`,
    {
      method: 'GET',

      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
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

  if (!response.ok) {
    const error = new Error(
      data?.message ||
      'Session validation failed'
    );

    error.status = response.status;

    throw error;
  }

  return data;
}


/* =========================================================
   LOGOUT

   POST /api/auth/logout
========================================================= */

export async function logout(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/logout`,
    {
      method: 'POST',

      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
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

  if (!response.ok) {
    throw new Error(
      data?.message ||
      'Logout failed'
    );
  }

  return data;
}