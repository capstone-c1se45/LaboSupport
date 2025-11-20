import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';

// Navbar logged-in: sticky top, shadow, dropdowns via group-hover
export default function NavbarLogged() {
  const { pathname } = useLocation();
  const isActive = (path) => pathname === path;

  // Class presets
  const triggerCls = 'text-[15px] text-gray-700 hover:text-gray-900';
  const menuCls = 'absolute left-1/2 -translate-x-1/2 top-12 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-opacity';
  const cardCls = 'relative bg-white border border-gray-200 rounded-xl shadow-lg min-w-[220px]';

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50 ">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        {/* Left: logo + brand */}
        <Link to="/home" className="flex items-center gap-3 select-none">
          <img src={logoImg} alt="LaboSupport" className="h-8 w-auto" />
          <div className="leading-4 hidden sm:block">
            <div className="text-[15px] font-semibold text-gray-800">LaboSupport</div>
            <div className="text-[11px] text-gray-500">Hỗ trợ người lao động</div>
          </div>
        </Link>

        {/* Center: nav */}
        <nav className="flex items-center gap-10 text-[15px]">
          <Link to="/home" className={`hover:text-gray-900 ${isActive('/home') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>Trang chủ</Link>

          {/* Trợ lý AI */}
          <div className="relative group">
            <button className={triggerCls} type="button">Trợ lý AI</button>
            {/* Hover buffer to bridge gap between trigger and menu */}
            <div className="absolute left-1/2 -translate-x-1/2 top-12 w-36 h-3 z-40"></div>
            <div className={menuCls} style={{ zIndex: 60 }}>
              <div className={cardCls}>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"></div>
                <ul className="p-2 text-sm text-gray-800 space-y-1">
                  <li>
                    <Link to="/contract-analysis" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Phân tích hợp đồng</Link>
                  </li>
                  <li>
                    <Link to="/user-chat" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Chat với AI</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Công cụ */}
          <div className="relative group">
            <button className={triggerCls} type="button">Công cụ</button>
            {/* Hover buffer to bridge gap between trigger and menu */}
            <div className="absolute left-1/2 -translate-x-1/2 top-12 w-36 h-3 z-40"></div>
            <div className={menuCls} style={{ zIndex: 60 }}>
              <div className={cardCls}>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"></div>
                <ul className="p-2 text-sm text-gray-800 space-y-1">
                  <li>
                    <Link to="/salary" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Tính lương gross - net</Link>
                  </li>
                  <li>
                    <Link to="/salary?calc=bhxh" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Tính bảo hiểm xã hội</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <a href="/#about" className="text-gray-700 hover:text-gray-900">Giới thiệu</a>
        </nav>

        {/* Right: Avatar dropdown */}
        <div className="relative group">
          <button className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-50" type="button">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
          </button>
          {/* Hover buffer to bridge gap between trigger and menu */}
          <div className="absolute left-1/2 -translate-x-1/2 top-12 w-32 h-3 z-40"></div>
          <div className={menuCls} style={{ zIndex: 60 }}>
            <div className={cardCls}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"></div>
              <ul className="p-2 text-sm text-gray-800 space-y-1">
                <li><Link to="/profile" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Thông tin cá nhân</Link></li>
                <li><Link to="/home" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Tổng quan</Link></li>
                <li><a href="#" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Cài đặt</a></li>
                <li>
                  <Link to="/logout" className="block rounded-lg px-3 py-2 hover:bg-gray-50 flex items-center justify-between">
                    <span>Đăng xuất</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
