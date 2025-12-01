import { io } from 'socket.io-client';

const URL = 'http://localhost:3001';

// Hàm tạo kết nối socket
export const createSocketConnection = () => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  
  const socket = io(URL, {
    autoConnect: true,
    auth: {
      token: token
    }
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
};