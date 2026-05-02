const BASE_URL = 'https://4597-66-253-168-123.ngrok-free.app';

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Register failed: ${res.status}`);
  return res.json();
}

export async function updateStatus(id, status, lat, lng) {
  const body = { id, status };
  if (lat != null) body.lat = lat;
  if (lng != null) body.lng = lng;
  const res = await fetch(`${BASE_URL}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Status update failed: ${res.status}`);
  return res.json();
}

export async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error(`Fetch users failed: ${res.status}`);
  return res.json().then(data => data.users ?? data);
}

export async function registerPushToken(id, token) {
  const res = await fetch(`${BASE_URL}/push-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, token }),
  });
  if (!res.ok) throw new Error(`Push token registration failed: ${res.status}`);
  return res.json();
}
