import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingHome from "./pages/LandingHome";
import GuestChat from "./pages/GuestChat";
import HomeLogged from "./pages/HomeLogged";
import Profile from "./pages/Profile";
import LoginPage from "./pages/LoginPage";
import Logout from "./pages/Logout";
import SalaryTool from "./pages/SalaryTool";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import UserChat from "./pages/UserChat";
import ContractAnalysis from "./pages/ContractAnalysis";
import React, { Suspense } from "react";
import { ProtectedAdmin } from "./components/ui/protected-admin";
import HandbookManagement from "./pages/admin/HandbookManagement";
import ReportPage from "./pages/ReportPage";
import ReportManagement from "./pages/admin/ReportManagement";

const PageLoader = () => <div className="flex justify-center items-center h-screen">Đang tải...</div>;

const AdminLayout = React.lazy(() => import("./components/layouts/AdminLayout"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = React.lazy(() => import("./pages/admin/UserManagement"));


function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingHome />} />
        <Route path="/guest-chat" element={<GuestChat />} />
        <Route path="/user-chat" element={<UserChat />} />
        <Route path="/contract-analysis" element={<ContractAnalysis />} />
        <Route path="/home" element={<HomeLogged />} />
        <Route path="/salary" element={<SalaryTool />} />
        <Route path="/report" element={<ReportPage />} />
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
            <Route path="handbooks" element={<HandbookManagement />} />
            <Route path="reports" element={<ReportManagement />} />
          </Route>
        <Route path="*" element={<NotFound />} /> 
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
