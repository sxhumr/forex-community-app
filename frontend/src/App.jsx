import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/register";
import VerifyOtp from "./pages/verifyOTP";
import Login from "./pages/login";
import Home from "./pages/home";

// Simple auth check
const isAuthenticated = () => {
  return !!localStorage.getItem("token") ;
};
//
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Register />} />


        {/* Public routes */}
        <Route path="/" element={<Register />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />

        {/* Protected route */}
        <Route
          path="/home"
          element={
            isAuthenticated() ? <Home /> : <Navigate to="/login" />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
