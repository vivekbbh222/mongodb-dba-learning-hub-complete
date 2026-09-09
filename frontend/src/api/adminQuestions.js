const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000';


function getAuthHeaders() {
  const token =
    sessionStorage.getItem('authToken');

  return token
    ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    : {
        'Content-Type': 'application/json',
      };
}


async function parseResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    window.dispatchEvent(
      new Event('auth-expired')
    );
  }

  if (!response.ok) {
    const validationErrors =
      Array.isArray(data?.errors)
        ? ` ${data.errors.join(', ')}`
        : '';

    throw new Error(
      `${
        data?.message ||
        data?.error ||
        'Admin question request failed.'
      }${validationErrors}`
    );
  }

  return data;
}


export async function getAdminQuestions() {
  const response = await fetch(
    `${API_BASE_URL}/api/questions/admin/all`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return parseResponse(response);
}


export async function createAdminQuestion(question) {
  const response = await fetch(
    `${API_BASE_URL}/api/questions/admin`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(question),
    }
  );

  return parseResponse(response);
}


export async function updateAdminQuestion(
  questionId,
  question
) {
  const response = await fetch(
    `${API_BASE_URL}/api/questions/admin/${encodeURIComponent(questionId)}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(question),
    }
  );

  return parseResponse(response);
}


export async function updateAdminQuestionStatus(
  questionId,
  active
) {
  const response = await fetch(
    `${API_BASE_URL}/api/questions/admin/${encodeURIComponent(questionId)}/status`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ active }),
    }
  );

  return parseResponse(response);
}


export async function deleteAdminQuestion(
  questionId
) {
  const response = await fetch(
    `${API_BASE_URL}/api/questions/admin/${encodeURIComponent(questionId)}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  return parseResponse(response);
}


export async function deleteAdminTopic(
  topicId,
  confirmation
) {
  const response = await fetch(
    `${API_BASE_URL}/api/questions/admin/topic/${encodeURIComponent(topicId)}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        confirmation,
      }),
    }
  );

  return parseResponse(response);
}