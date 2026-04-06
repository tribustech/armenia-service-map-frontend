'use client';

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, login as loginApi, logout as logoutApi, type UserProfile, type LoginRequest } from '../api/auth';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem('accessToken'));
    setHasHydrated(true);
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: getProfile,
    enabled: hasToken,
    retry: false,
  });

  const login = useCallback(async (data: LoginRequest) => {
    await loginApi(data);
    setHasToken(true);
    const profile = await queryClient.fetchQuery({
      queryKey: ['auth', 'profile'],
      queryFn: getProfile,
    });
    return profile;
  }, [queryClient]);

  const logout = useCallback(async () => {
    await logoutApi();
    setHasToken(false);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: !hasHydrated || (hasToken && isLoading),
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
