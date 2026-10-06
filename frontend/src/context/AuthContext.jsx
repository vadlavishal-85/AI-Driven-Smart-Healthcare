import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContextState';
import { getToken, setToken, removeToken } from '../services/tokenService';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // Initialize and restore authentication session on initial app load
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const storedToken = getToken();

      if (!storedToken) {
        if (isMounted) {
          setCurrentUser(null);
          setAccessToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const user = await getCurrentUser(storedToken);
        if (isMounted) {
          setCurrentUser(user);
          setAccessToken(storedToken);
        }
      } catch {
        // Token is invalid, expired, or rejected by server -> clean up
        removeToken();
        if (isMounted) {
          setCurrentUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Login user with credentials, persist JWT, and retrieve user identity.
   */
  const login = useCallback(async ({ email, password, rememberMe = false }) => {
    // 1. Authenticate and receive JWT
    const tokenData = await loginUser({ email, password });
    const token = tokenData.access_token;

    // 2. Persist token in localStorage
    setToken(token, { persistent: rememberMe });
    setAccessToken(token);

    // 3. Retrieve authenticated user details from /auth/me
    try {
      const user = await getCurrentUser(token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      // If fetching user profile fails, clean up token
      removeToken();
      setAccessToken(null);
      setCurrentUser(null);
      throw err;
    }
  }, []);

  /**
   * Register a new patient account with backend.
   */
  const register = useCallback(async (userData) => {
    return await registerUser(userData);
  }, []);

  /**
   * Clear JWT from storage and reset authentication state.
   */
  const logout = useCallback(() => {
    removeToken();
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

  /**
   * Update the currentUser in state after a successful profile edit.
   */
  const updateUser = useCallback((updatedUserData) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updatedUserData } : updatedUserData));
  }, []);

  /**
   * Helper to verify if the user possesses a specific role.
   * Authoritative role is derived strictly from backend /auth/me.
   */
  const hasRole = useCallback(
    (roleName) => {
      if (!currentUser || !currentUser.role) return false;
      return currentUser.role.toUpperCase() === roleName.toUpperCase();
    },
    [currentUser]
  );

  const value = {
    currentUser,
    accessToken,
    isAuthenticated: Boolean(currentUser && accessToken),
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAdmin: currentUser?.role === 'ADMIN',
    isDoctor: currentUser?.role === 'DOCTOR',
    isPatient: currentUser?.role === 'PATIENT',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
