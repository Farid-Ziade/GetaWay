import { auth } from './firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Adds the current user's Firebase ID token to every request.
 * All calls to the backend go through this helper — never raw fetch from pages.
 */
async function apiFetch(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated.');

  const token = await user.getIdToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed. Please try again.');
  }

  return data;
}

export async function generatePlan(payload) {
  return apiFetch('/api/planner/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchNearbyPlaces(lat, lng, radius = 5000) {
  return apiFetch(`/api/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
}
