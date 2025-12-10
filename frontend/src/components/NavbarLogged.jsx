import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { createSocketConnection } from '../lib/socket';
// Navbar logged-in: sticky top, shadow, dropdowns via group-hover
export default function NavbarLogged() {
  const { pathname } = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNoti, setShowNoti] = useState(false);
  const [socket, setSocket] = useState(null);
  const isActive = (path) => pathname === path;

  // Kết nối socket lắng nghe thông báo
  useEffect(() => {
    const newSocket = createSocketConnection();
    setSocket(newSocket);

    newSocket.on('NOTIFICATION', (data) => {
       const audio = new Audio('/src/assets/sound/notification-admin.mp3');
       audio.play().catch(e => console.log('Audio play blocked'));

      setNotifications(prev => [data, ...prev]);
    });

    return () => newSocket.disconnect();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRead = () => {
    setShowNoti(!showNoti);
    if (!showNoti) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  // Class presets
  const triggerCls = 'text-[15px] text-gray-700 hover:text-gray-900';
  const menuCls = 'absolute left-1/2 -translate-x-1/2 top-12 opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-opacity';
  const cardCls = 'relative bg-white border border-gray-200 rounded-xl shadow-lg min-w-[220px]';

  return (
  <header className="bg-white border-b shadow-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">

      {/* Left: logo + brand */}
      <Link to="/home" className="flex items-center gap-3 select-none">
        <img src={logoImg} alt="LaboSupport" className="h-8 w-auto" />
      </Link>

      {/* Center: nav */}
      <nav className="flex items-center gap-10 text-[15px]">
        <Link
          to="/home"
          className={`hover:text-gray-900 ${isActive('/home') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
        >
          Trang chủ
        </Link>

        {/* Trợ lý AI */}
        <div className="relative group">
          <button className={triggerCls} type="button">Trợ lý AI</button>
          <div className="absolute left-1/2 -translate-x-1/2 top-12 w-36 h-3 z-40"></div>
          <div className={menuCls} style={{ zIndex: 60 }}>
            <div className={cardCls}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"></div>
              <ul className="p-2 text-sm text-gray-800 space-y-1">
                <li>
                  <Link to="/contract-analysis" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                    Phân tích hợp đồng
                  </Link>
                </li>
                <li>
                  <Link to="/user-chat" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                    Chat với AI
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Công cụ */}
        <div className="relative group">
          <button className={triggerCls} type="button">Công cụ</button>
          <div className="absolute left-1/2 -translate-x-1/2 top-12 w-36 h-3 z-40"></div>
          <div className={menuCls} style={{ zIndex: 60 }}>
            <div className={cardCls}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"></div>
              <ul className="p-2 text-sm text-gray-800 space-y-1">
                <li>
                  <Link to="/salary" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                    Tính lương gross - net
                  </Link>
                </li>
                <li>
                  <Link to="/salary?calc=bhxh" className="block rounded-lg px-3 py-2 hover:bg-gray-50">
                    Tính bảo hiểm xã hội
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <a href="/#about" className="text-gray-700 hover:text-gray-900">Giới thiệu</a>
      </nav>

      {/* Right Side: Notification + Avatar */}
      <div className="flex items-center gap-4">

        {/* --- NOTIFICATION BELL --- */}
        <div className="relative">
          <button
            onClick={handleRead}
            className="relative p-2 text-gray-600 hover:text-blue-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11
                   a6.002 6.002 0 00-4-5.659V5
                   a2 2 0 10-4 0v.341
                   C7.67 6.165 6 8.388 6 11v3.159
                   c0 .538-.214 1.055-.595 1.436L4 17h5
                   m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>

          {/* Dropdown Thông báo */}
          {showNoti && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b font-semibold text-gray-700">Thông báo</div>

              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">Chưa có thông báo nào</div>
              ) : (
                <ul>
                  {notifications.map((notif, idx) => (
                    <li key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <Link to={notif.link || '#'} className="block p-3">
                        <div className="text-sm font-medium text-gray-800">{notif.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* --- AVATAR DROPDOWN --- */}
        <div className="relative group">
          <button
            className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            type="button"
          >
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 top-12 w-32 h-3 z-40"></div>

          <div className={menuCls} style={{ zIndex: 60 }}>
            <div className={cardCls}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45"></div>
              <ul className="p-2 text-sm text-gray-800 space-y-1">
                <li><Link to="/profile" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Thông tin cá nhân</Link></li>
                <li><Link to="/home" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Tổng quan</Link></li>
                <li><Link to="/report" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Báo cáo & Góp ý</Link></li>
                <li><a href="#" className="block rounded-lg px-3 py-2 hover:bg-gray-50">Cài đặt</a></li>
                <li>
                  <Link to="/logout" className="block rounded-lg px-3 py-2 hover:bg-gray-50 flex items-center justify-between">
                    <span>Đăng xuất</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
                      />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  </header>
);
}
