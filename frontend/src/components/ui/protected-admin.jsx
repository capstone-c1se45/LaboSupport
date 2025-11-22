import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api-client';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const ProtectedAdmin = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false); // Đủ quyền Admin
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Đã đăng nhập
  const location = useLocation();

  useEffect(() => {
    const verifyAdminAccess = async () => {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

      // 1. Kiểm tra Token tồn tại
      if (!token) {
        setIsLoading(false);
        return;
      }

      // 2. Kiểm tra Role từ Token (Client-side check)
      const payload = parseJwt(token);
      console.log("Decoded JWT payload:", payload);
      if (!payload || (payload.role !== 'admin' && payload.role_id !== '2')) {
        setIsAuthenticated(true); // Đã đăng nhập nhưng không phải admin
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // 3. Xác thực với Backend (Server-side check)
      try {
        await api.get('/users/me');
        setIsAuthenticated(true);
        setIsAuthorized(true);
      } catch (error) {
        console.error("Admin protection check failed:", error);
        setIsAuthenticated(false);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-sm font-medium text-gray-600">Đang xác thực quyền quản trị...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Tài khoản của bạn không có quyền quản trị để truy cập trang này. Vui lòng đăng nhập bằng tài khoản Admin.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/home" className="px-5 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition">
              Về trang chủ
            </a>
            <a href="/login" className="px-5 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md transition">
              Đổi tài khoản
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};