import { useEffect } from 'react';
import { logout } from '../lib/api-client';

export default function Logout() {
  useEffect(() => {
    logout();
    setTimeout(() => {
      window.location.href = '/';
    }, 50);
  }, []);

  return null;
}

