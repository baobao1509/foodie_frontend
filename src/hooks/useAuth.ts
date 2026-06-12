import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSummaryDTO } from '../types';
import { logout as apiLogout, initTokenManager, setOnAuthFailedCallback } from '../api';

export function useAuth() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserSummaryDTO | null>(() => {
    const stored = localStorage.getItem('currentUser');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Khởi động trình quản lý Token ngầm
  useEffect(() => {
    setOnAuthFailedCallback(() => {
      console.warn('[Session] Session invalidated on background refresh. Logging out user.');
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      navigate('/login');
    });

    initTokenManager();
  }, [navigate]);

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
