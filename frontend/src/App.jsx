import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/register";
import VerifyOtp from "./pages/verifyOTP";
import Login from "./pages/login";
import Home from "./pages/home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}