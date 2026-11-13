import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './auth-context';
import {
  apiAuthGetSession,
  apiAuthLogin,
  apiAuthRegister,
  apiAuthLogout,
  apiAuthUpdateProfile,
  apiAuthChangePassword,
  apiAuthGoogle,
  apiAuthKakao
} from '../services/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'guest' | 'user' | 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const session = await apiAuthGetSession();
      if (session && session.isAuthenticated && session.user) {
        setUser(session.user);
        setRole(session.role || session.user.role || 'user');
        setIsAuthenticated(true);
        return session;
      } else {
        setUser(null);
        setRole('guest');
        setIsAuthenticated(false);
        return { isAuthenticated: false, user: null, role: 'guest' };
      }
    } catch {
      setUser(null);
      setRole('guest');
      setIsAuthenticated(false);
      return { isAuthenticated: false, user: null, role: 'guest' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    apiAuthGetSession()
      .then((session) => {
        if (!ignore) {
          if (session && session.isAuthenticated && session.user) {
            setUser(session.user);
            setRole(session.role || session.user.role || 'user');
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setRole('guest');
            setIsAuthenticated(false);
          }
        }
      })
      .catch(() => {
        if (!ignore) {
          setUser(null);
          setRole('guest');
          setIsAuthenticated(false);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    const data = await apiAuthLogin({ identifier, password });
    if (data?.user) {
      setUser(data.user);
      setRole(data.user.role || 'user');
      setIsAuthenticated(true);
    }
    return data;
  }, []);

  const register = useCallback(async ({ username, email, password, name }) => {
    const data = await apiAuthRegister({ username, email, password, name });
    if (data?.user) {
      setUser(data.user);
      setRole(data.user.role || 'user');
      setIsAuthenticated(true);
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiAuthLogout();
    } finally {
      setUser(null);
      setRole('guest');
      setIsAuthenticated(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const updatedUser = await apiAuthUpdateProfile(updates);
    if (updatedUser) {
      setUser(updatedUser);
      setRole(updatedUser.role || 'user');
    }
    return updatedUser;
  }, []);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    return await apiAuthChangePassword({ currentPassword, newPassword });
  }, []);

  const loginWithGoogle = useCallback(async (idToken, testProfile = null) => {
    const data = await apiAuthGoogle(idToken, testProfile);
    if (data?.user) {
      setUser(data.user);
      setRole(data.user.role || 'user');
      setIsAuthenticated(true);
    }
    return data;
  }, []);

  const loginWithKakao = useCallback(async ({ code, state, redirectUri, testProfile = null }) => {
    const data = await apiAuthKakao({ code, state, redirectUri, testProfile });
    if (data?.user) {
      setUser(data.user);
      setRole(data.user.role || 'user');
      setIsAuthenticated(true);
    }
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshSession,
      updateProfile,
      changePassword,
      loginWithGoogle,
      loginWithKakao
    }),
    [
      user,
      role,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshSession,
      updateProfile,
      changePassword,
      loginWithGoogle,
      loginWithKakao
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
