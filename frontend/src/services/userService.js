import { apiFetch } from './api';

/**
 * Fetch authenticated user's profile from GET /users/me
 * @returns {Promise<Object>} Safe user profile object
 */
export async function getMyProfile() {
  return await apiFetch('/users/me', {
    method: 'GET',
  });
}

/**
 * Update authenticated user's profile fields (first_name, last_name, phone)
 * @param {Object} data
 * @param {string} [data.first_name]
 * @param {string} [data.last_name]
 * @param {string} [data.phone]
 * @returns {Promise<Object>} Updated safe user profile object
 */
export async function updateMyProfile(data) {
  const payload = {};
  if (data.first_name !== undefined) payload.first_name = data.first_name?.trim();
  if (data.last_name !== undefined) payload.last_name = data.last_name?.trim();
  if (data.phone !== undefined) payload.phone = data.phone?.trim() || null;

  return await apiFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Change authenticated user's account password
 * @param {Object} data
 * @param {string} data.current_password
 * @param {string} data.new_password
 * @returns {Promise<{ status: string, message: string }>}
 */
export async function changeMyPassword({ current_password, new_password }) {
  return await apiFetch('/users/me/change-password', {
    method: 'POST',
    body: JSON.stringify({
      current_password,
      new_password,
    }),
  });
}
