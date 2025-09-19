import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
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
        <Route path="/" element={<Home />} />

        {/* Auth
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
