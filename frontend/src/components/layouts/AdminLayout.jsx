import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-slate-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block py-2.5 px-4 rounded hover:bg-slate-700">Dashboard</Link>
          <Link to="/admin/users" className="block py-2.5 px-4 rounded hover:bg-slate-700">Quản lý User</Link>
          <Link to="/admin/handbooks" className="block py-2.5 px-4 rounded hover:bg-slate-700">Quản lý Luật </Link>
          <Link to="/admin/reports" className="block py-2.5 px-4 rounded hover:bg-slate-700">Báo cáo vi phạm</Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow flex items-center px-6 justify-between">
            <h2 className="font-semibold text-gray-700">Quản trị hệ thống</h2>
            <Link to="/logout" className="text-red-600 hover:underline text-sm">Đăng xuất</Link>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          
          <Outlet />
        </main>
      </div>
    </div>
  );
}