import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingHome from "./pages/LandingHome";
import GuestChat from "./pages/GuestChat";
import HomeLogged from "./pages/HomeLogged";
import Profile from "./pages/Profile";
import LoginPage from "./pages/LoginPage";
import Logout from "./pages/Logout";
import SalaryTool from "./pages/SalaryTool";
// import Login from "./pages/Login";
 import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
// import Dashboard from "./pages/Dashboard";
// import Laws from "./pages/Laws";
// import OCR from "./pages/OCR";
// import Chat from "./pages/Chat";
// import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import UserChat from "./pages/UserChat";
import ContractAnalysis from "./pages/ContractAnalysis";
import React, { Suspense } from "react";
import { ProtectedAdmin } from "./components/ui/protected-admin";

const PageLoader = () => <div className="flex justify-center items-center h-screen">Đang tải...</div>;

const AdminLayout = React.lazy(() => import("./components/layouts/AdminLayout")); // Bạn cần tạo file này
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = React.lazy(() => import("./pages/admin/UserManagement"));


function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Home */}
        <Route path="/" element={<LandingHome />} />
        <Route path="/guest-chat" element={<GuestChat />} />
        <Route path="/user-chat" element={<UserChat />} />
        <Route path="/contract-analysis" element={<ContractAnalysis />} />
        <Route path="/home" element={<HomeLogged />} />
        <Route path="/salary" element={<SalaryTool />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedAdmin>
                <AdminLayout /> 
              </ProtectedAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />     
            <Route path="users" element={<AdminUsers />} />
          </Route>
        <Route path="*" element={<NotFound />} /> 
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
