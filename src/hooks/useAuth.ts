import { useState, useEffect } from 'react';
import { UserSummaryDTO, ActivePage } from '../types';
import { logout as apiLogout, initTokenManager, setOnAuthFailedCallback } from '../api';

export function useAuth(setActivePage: (page: ActivePage) => void) {
  const [currentUser, setCurrentUser] = useState<UserSummaryDTO | null>(() => {
    const stored = localStorage.getItem('currentUser');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Khởi động trình quản lý sinh mệnh Token ngầm
  useEffect(() => {
    setOnAuthFailedCallback(() => {
      console.warn('[Session] Session invalidated on background refresh. Logging out user.');
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setActivePage('login');
    });

    initTokenManager();
  }, [setActivePage]);

  const handleLoginSuccess = (user: UserSummaryDTO) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.warn('Could not log out from Spring Boot backend, clearing session locally:', err);
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return {
    currentUser,
    handleLoginSuccess,
    handleLogout,
  };
}
