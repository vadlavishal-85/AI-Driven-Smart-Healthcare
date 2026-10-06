import { apiFetch } from './api';

/**
 * Register a new patient account via FastAPI backend.
 * Public registration is restricted to PATIENT role.
 *
 * @param {Object} data
 * @param {string} data.first_name
 * @param {string} data.last_name
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} [data.phone]
 * @param {string} [data.role='PATIENT']
 * @returns {Promise<Object>} Created user identity (UserResponse)
 */
export async function registerUser({ first_name, last_name, email, password, phone }) {
  const payload = {
    first_name: first_name?.trim(),
    last_name: last_name?.trim(),
    email: email?.trim().toLowerCase(),
    password,
    role: 'PATIENT', // Always force PATIENT for public self-registration
  };

  if (phone && phone.trim()) {
    payload.phone = phone.trim();
  }

  return await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Authenticate credentials via FastAPI backend and obtain JWT access token.
 *
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{ access_token: string, token_type: string }>}
 */
export async function loginUser({ email, password }) {
  return await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: email?.trim().toLowerCase(),
      password,
    }),
  });
}

/**
 * Fetch profile and verified role of currently authenticated user.
 *
 * @param {string} [token] - Optional explicit token, otherwise uses token from localStorage
 * @returns {Promise<Object>} Current user identity (UserResponse)
 */
export async function getCurrentUser(token) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return await apiFetch('/auth/me', {
    method: 'GET',
    headers,
  });
}
