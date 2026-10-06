/**
 * Token Storage Service for SmartHealthcare Ecosystem
 * Manages JWT access token lifecycle across session and persistent storage.
 */

const TOKEN_KEY = 'smarthealthcare_access_token';

/**
 * Retrieve the current JWT access token from localStorage.
 * @returns {string|null}
 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist the JWT access token in localStorage.
 * @param {string} token
 */
export function setToken(token, { persistent = false } = {}) {
  try {
    removeToken();
    if (token) {
      const storage = persistent ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Graceful fallback for restricted environments
  }
}

/**
 * Remove the JWT access token from localStorage.
 */
export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Graceful fallback
  }
}
