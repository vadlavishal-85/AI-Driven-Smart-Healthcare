import { getToken } from './tokenService';

// Production deployment supplies the API origin. Local Vite development uses
// the backend's default port unless an explicit API origin is configured.
const configuredApiOrigin = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:8000' : '');
export const API_BASE_URL = configuredApiOrigin.replace(/\/+$/, '');

/**
 * Centralized API client utilizing native fetch.
 * Handles base URL configuration, Bearer token injection, and friendly error formatting.
 *
 * @param {string} endpoint - API route (e.g. "/auth/login")
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<any>}
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});

  // Default to application/json if sending a JSON body and not already specified
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Bearer Authorization header if token exists and not explicitly passed
  if (!headers.has('Authorization')) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    // Network failure, CORS blockage, or offline server
    const err = new Error('Unable to connect to the healthcare server. Please try again.');
    err.status = 0;
    err.isNetworkError = true;
    throw err;
  }

  // Attempt to parse JSON response body
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let message = 'An unexpected healthcare system error occurred.';

    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        // FastAPI validation errors (422)
        message = data.detail.map((d) => d.msg || d.message).join(', ');
      } else if (data.message) {
        message = data.message;
      }
    }

    // Friendly mapping for standard error statuses
    if (response.status === 401) {
      if (!message || message.toLowerCase().includes('credentials') || message.toLowerCase().includes('unauthorized')) {
        message = 'Invalid email or password.';
      }
    } else if (response.status === 403) {
      if (message.toLowerCase().includes('deactivated') || message.toLowerCase().includes('inactive')) {
        message = 'Your account is inactive.';
      }
    } else if (response.status === 409) {
      if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('conflict')) {
        message = 'An account with this email already exists.';
      }
    } else if (response.status === 503) {
      message = 'Healthcare database is unavailable. Please try again later.';
    } else if (response.status >= 500) {
      message = 'Healthcare server error. Please try again later.';
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiFetch;
