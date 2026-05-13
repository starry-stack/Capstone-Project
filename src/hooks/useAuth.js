import { useCallback, useEffect, useState } from 'react';
import {
  authApi,
  clearStoredSession,
  getStoredSession,
  saveStoredSession,
} from '../services/backend';

export function useAuth() {
  const [token, setToken] = useState(() => getStoredSession()?.token || null);
  const [user, setUser] = useState(() => getStoredSession()?.user || null);
  const [loading, setLoading] = useState(Boolean(getStoredSession()?.token));
  const [error, setError] = useState(null);

  const persistSession = useCallback((session) => {
    saveStoredSession(session);
    setToken(session.token);
    setUser(session.user);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function refreshProfile() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authApi.getMe(token);
        if (!cancelled) {
          const session = { token, user: profile };
          saveStoredSession(session);
          setUser(profile);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          clearStoredSession();
          setToken(null);
          setUser(null);
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    refreshProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const session = await authApi.login(credentials);
      persistSession(session);
      return session;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const register = useCallback(async (details) => {
    setLoading(true);
    setError(null);

    try {
      const session = await authApi.register(details);
      persistSession(session);
      return session;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  };
}
