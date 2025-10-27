import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingHome from "./pages/LandingHome";
import GuestChat from "./pages/GuestChat";
import LoginPage from "./pages/LoginPage";
import Logout from "./pages/Logout";
// import Login from "./pages/Login";
 import RegisterPage from "./pages/RegisterPage";
// import Dashboard from "./pages/Dashboard";
// import Laws from "./pages/Laws";
// import OCR from "./pages/OCR";
// import Chat from "./pages/Chat";
// import Report from "./pages/Report";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<LandingHome />} />
        <Route path="/guest-chat" element={<GuestChat />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
        {/* Auth
        <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

        {/* Main features */}
        {/* <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/laws" element={<Laws />} />
        <Route path="/ocr" element={<OCR />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/report" element={<Report />} /> */}

        {/* Fallback */}
        <Route path="*" element={<NotFound />} /> 
      </Routes>
    </Router>
  );
}

export default App;
