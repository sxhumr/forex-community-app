import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load components to reduce initial bundle size
const Register = lazy(() => import("./pages/register"));
const VerifyOtp = lazy(() => import("./pages/verifyOTP"));
const Login = lazy(() => import("./pages/login"));
const Home = lazy(() => import("./pages/home"));

// A simple loading fallback
const Loading = () => <div className="loading-spinner">Loading...</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/verify" element={<VerifyOtp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}