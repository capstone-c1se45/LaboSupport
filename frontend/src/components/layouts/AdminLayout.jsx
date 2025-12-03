import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

export default function AdminLayout() {
  const { pathname } = useLocation();

  const navItems = [
    { label: 'Tổng quan', path: '/admin' },
    { label: 'Quản lý người dùng', path: '/admin/users' },
    { label: 'Cài đặt Lao động', path: '/admin/handbooks' },
    { label: 'Báo cáo & Thống kê', path: '/admin/reports' },
  ];

  const getPageTitle = () => {
    if (pathname.startsWith('/admin/users')) return 'Quản lý người dùng';
    if (pathname.startsWith('/admin/handbooks')) return 'Cài đặt Lao động';
    if (pathname.startsWith('/admin/reports')) return 'Báo cáo & Thống kê';
    return 'Tổng quan Bảng điều khiển';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 px-5 flex items-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="LaboSupport"
              className="h-8 w-auto select-none"
              draggable={false}
            />
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-[14px]">
          {navItems.map((item) => {
            const active =
              item.path === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 text-xs text-gray-400">
          © {new Date().getFullYear()} LaboSupport
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
            <p className="text-xs text-gray-500">
              Bảng điều khiển dành cho quản trị viên hệ thống.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">
                Admin
              </div>
              <div className="text-xs text-gray-500">
                admin@labosupport.vn
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
              <span className="text-sm text-gray-600">A</span>
            </div>
            <Link
              to="/logout"
              className="text-xs text-red-600 hover:text-red-700"
            >
              Đăng xuất
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

