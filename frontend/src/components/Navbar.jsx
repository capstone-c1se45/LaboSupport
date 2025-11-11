import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `hover:text-gray-900 ${pathname === path ? 'text-blue-600 font-medium' : 'text-gray-700'}`;

  return (
    <header className="bg-white/90 backdrop-blur border-b sticky top-0 z-30">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 select-none">
          <img src={logoImg} alt="LaboSupport" className="h-8 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className={linkClass('/')}>Giới thiệu</Link>
          <Link to="/guest-chat" className={linkClass('/guest-chat')}>Trợ lý AI</Link>
          <a href="#features" className="text-gray-700 hover:text-gray-900">Tính năng</a>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/login" className="px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-700">Đăng nhập</Link>
          <Link to="/register" className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">Đăng ký</Link>
        </div>
      </div>
    </header>
  );
}

