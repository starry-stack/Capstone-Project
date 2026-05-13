const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const SESSION_KEY = 'comic-ai-session';
const API_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `Request failed with ${response.status}`);
  }

  return payload.data;
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveStoredSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function resolveBackendFileUrl(filePointer) {
  if (!filePointer || filePointer.startsWith('data:')) {
    return filePointer;
  }

  return new URL(filePointer, API_ORIGIN).toString();
}

export const authApi = {
  register: ({ name, email, password }) =>
    request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }),

  login: ({ email, password }) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  getMe: (token) => request('/auth/me', { token }),
};

export const comicsApi = {
  getMine: (token) => request('/comics', { token }),

  getByOwnerUuid: (ownerUuid, token) =>
    request(`/comics/${encodeURIComponent(ownerUuid)}`, { token }),

  create: ({ imageUrls, captions, dialogues, name, description }, token) =>
    request('/comics', {
      method: 'POST',
      token,
      body: { imageUrls, captions, dialogues, name, description },
    }),
};

export const uploadsApi = {
  uploadComicImages: (imageDataUrls, token) =>
    request('/uploads/comic-images', {
      method: 'POST',
      token,
      body: { imageDataUrls },
    }),
};
