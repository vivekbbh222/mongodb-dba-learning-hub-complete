const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function createRecord(name, message) {
  const response = await fetch(`${API_BASE_URL}/api/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      message,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create record');
  }

  return data;
}

export async function getRecords() {
  const response = await fetch(`${API_BASE_URL}/api/records`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch records');
  }

  return data;
}

export async function updateRecord(id, name, message) {
  const response = await fetch(`${API_BASE_URL}/api/records/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      message,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update record');
  }

  return data;
}

export async function deleteRecord(id) {
  const response = await fetch(`${API_BASE_URL}/api/records/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete record');
  }

  return data;
}